import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLevel } from "@/lib/utils";
import { auth } from "@/lib/auth/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await params;
    const body = await request.json();
    const { ruleId, scoreChange } = body;
    const teacherId = session.user.id;

    if (!groupId || !ruleId || typeof scoreChange !== "number") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get group with students and their pets, plus class info
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        students: {
          include: { pet: true }
        },
        class: true
      }
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (group.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (group.students.length === 0) {
      return NextResponse.json({ error: "Group has no students" }, { status: 400 });
    }
    
    let dailyLimit = group.class.dailyScoreLimit ?? 20;
    const thresholdsStr = group.class.levelThresholds || "5,10,15,20,30,40,50,60,75,90";

    let successCount = 0;
    let skippedCount = 0;
    let anyLevelUp = false;
    let totalScoreChange = 0;

    // Process each student in the group in a transaction
    await prisma.$transaction(async (tx) => {
      for (const student of group.students) {
        // Skip students whose pet is dead
        if (student.pet && student.pet.isDead) {
          skippedCount++;
          continue;
        }
        
        let finalScoreChange = scoreChange;

        // 健康值特权：健康值≥80，当日单次加分可额外上浮1点（不突破单日20分上限）
        let hasBonus = false;
        if (scoreChange > 0 && student.pet && student.pet.health >= 80 && !student.pet.isDead) {
          finalScoreChange += 1;
          hasBonus = true;
        }

        // Check daily limit for each student
        if (finalScoreChange > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          // Check penalty from readopt
          let currentLimit = dailyLimit;
          if (student.penaltyEndDate) {
            if (today < student.penaltyEndDate) {
              currentLimit = Math.floor(dailyLimit / 2); // 减半惩罚
            }
          }

          const dailyRecords = await tx.record.findMany({
            where: {
              studentId: student.id,
              scoreChange: { gt: 0 },
              createdAt: {
                gte: today,
              },
            },
          });

          const dailyScore = dailyRecords.reduce((sum, record) => sum + record.scoreChange, 0);

          if (dailyScore >= currentLimit) {
            skippedCount++; // Skip if already at limit
            continue;
          }
          
          if (dailyScore + finalScoreChange > currentLimit) {
            finalScoreChange = currentLimit - dailyScore;
          }
        }

        // 1. Create a score record for this student
        await tx.record.create({
          data: {
            studentId: student.id,
            ruleId,
            scoreChange: finalScoreChange,
            teacherId: teacherId || "system",
          },
        });

        // 2. Update student score and totalScore/coins
        let coinsToAdd = 0;
        if (finalScoreChange > 0) {
          const oldTotal = student.totalScore || 0;
          const newTotal = oldTotal + finalScoreChange;
          coinsToAdd = Math.floor(newTotal / 10) - Math.floor(oldTotal / 10);
        }

        const updatedStudent = await tx.student.update({
          where: { id: student.id },
          data: {
            score: {
              increment: finalScoreChange,
            },
            totalScore: {
              increment: finalScoreChange > 0 ? finalScoreChange : 0,
            },
            coins: {
              increment: coinsToAdd,
            }
          },
        });

        // 3. Update pet health and level if student has a pet
        if (student.pet) {
          let healthChange = finalScoreChange;
          
          let newLevel = student.pet.level;

          if (finalScoreChange > 0) {
            // Check for level up using new thresholds
            const calculatedLevel = calculateLevel(updatedStudent.score, thresholdsStr);
            if (calculatedLevel > student.pet.level) {
              anyLevelUp = true;
              newLevel = calculatedLevel;
            }
          }

          const newHealth = Math.max(0, Math.min(100, student.pet.health + healthChange));
          
          // Check if pet dies
          const isDead = newHealth === 0 || updatedStudent.score < 0;
          
          const updateData: any = {
            health: isDead ? 0 : newHealth,
            level: newLevel,
            isDead,
          };
          
          updateData.lastScoreAt = new Date();

          await tx.pet.update({
            where: { id: student.pet.id },
            data: updateData,
          });
        }
        
        successCount++;
        totalScoreChange += finalScoreChange;
      }
      
      // 4. Update the total group score (sum of all students' scores)
      if (successCount > 0 && totalScoreChange !== 0) {
        await tx.group.update({
          where: { id: groupId },
          data: {
            score: {
              increment: totalScoreChange
            }
          }
        });
      }
    });

    if (successCount === 0 && skippedCount > 0) {
      return NextResponse.json({ error: "组内所有学生的宠物均已阵亡，无法评分" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      successCount,
      skippedCount,
      anyLevelUp,
      message: `Successfully scored ${successCount} students. Skipped ${skippedCount} dead pets.` 
    });

  } catch (error) {
    console.error("Error processing group score:", error);
    return NextResponse.json(
      { error: "Failed to process group score" },
      { status: 500 }
    );
  }
}
