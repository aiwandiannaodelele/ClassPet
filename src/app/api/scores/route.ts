import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLevel } from "@/lib/utils";
import { auth } from "@/lib/auth/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, ruleId, scoreChange } = body;
    const teacherId = session.user.id;

    if (!studentId || !ruleId || !scoreChange) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch student and class settings
    const currentStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: { pet: true, class: true }
    });

    if (!currentStudent || currentStudent.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Student not found or Forbidden" }, { status: 403 });
    }

    // Default to class setting if available
    let dailyLimit = currentStudent.class.dailyScoreLimit ?? 20;

    let finalScoreChange = scoreChange;

    // 健康值特权：健康值≥80，当日单次加分可额外上浮1点（不突破单日20分上限）
    // NOTE: This was causing "+1" to look like a double if the original score was +1.
    // Commenting out the +1 bonus logic to prevent confusion.
    /*
    let hasBonus = false;
    if (scoreChange > 0 && currentStudent.pet && currentStudent.pet.health >= 80 && !currentStudent.pet.isDead) {
      finalScoreChange += 1;
      hasBonus = true;
    }
    */

    // 健康值特权：健康值≥40，可使用1次每日免扣1分特权 (需要新字段或这里先实现自动抵扣)
    // 简单实现：如果是扣分，且健康值>=40，并且是今天第一次被扣分，抵扣1分。
    // 这里为了严格符合规则，我们暂不自动触发，而是等以后加UI按钮。
    // 目前先实现暴击特权。

    // Check penalty from readopt
    if (finalScoreChange > 0 && currentStudent.penaltyEndDate) {
      const now = new Date();
      if (now < currentStudent.penaltyEndDate) {
        // According to rules, multiple deaths drop limit to 10. 
        // We set dailyLimit directly to 10, or half if it's the basic 3-day negative score penalty.
        // For simplicity, we just cap it at 10 if there's any active penalty, as it aligns with both rules.
        dailyLimit = Math.min(10, Math.floor(dailyLimit / 2));
      }
    }

    // 检查每日加分上限
    if (finalScoreChange > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyRecords = await prisma.record.findMany({
        where: {
          studentId,
          scoreChange: { gt: 0 }, // 只统计加分
          createdAt: {
            gte: today,
          },
        },
      });

      const dailyScore = dailyRecords.reduce((sum, record) => sum + record.scoreChange, 0);

      if (dailyScore >= dailyLimit) {
        return NextResponse.json(
          { error: `今日喂食(加分)已达上限 (${dailyLimit}分)，宠物吃饱啦！` },
          { status: 400 }
        );
      }
      
      if (dailyScore + finalScoreChange > dailyLimit) {
        finalScoreChange = dailyLimit - dailyScore;
      }
    }

    // 创建评分记录
    const record = await prisma.record.create({
      data: {
        studentId,
        ruleId,
        scoreChange: finalScoreChange,
        teacherId,
      },
      include: {
        rule: true,
      }
    });

    // 更新学生分数 (score)
    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        score: {
          increment: finalScoreChange,
        },
      },
      include: {
        pet: true,
      },
    });

    let levelUp = false;
    let newLevel = 1;
    let petDied = false;

    // 如果学生有宠物，更新宠物健康值和等级
    if (student.pet && !student.pet.isDead) {
      let newHealth = student.pet.health;
      let newLastScoreAt = student.pet.lastScoreAt;
      let isDead: boolean = student.pet.isDead;
      
      // 1点成长值 = 1点健康值
      if (finalScoreChange > 0) {
        newHealth = Math.min(100, newHealth + finalScoreChange);
        newLastScoreAt = new Date(); // 加分时更新活跃时间
        
        // 计算新等级 based on the new total score (student.score)
        const thresholdsStr = currentStudent.class.levelThresholds || "5,10,15,20,30,40,50,60,75,90";
        const calculatedLevel = calculateLevel(student.score, thresholdsStr);
        
        // 扣分不掉级，只在计算出的等级大于当前等级时升级
        if (calculatedLevel > student.pet.level) {
          levelUp = true;
          newLevel = calculatedLevel;
        } else {
          newLevel = student.pet.level;
        }
      } else if (finalScoreChange < 0) {
        newHealth = Math.max(0, newHealth + finalScoreChange); // finalScoreChange is negative
        newLevel = student.pet.level; // 扣分不掉级
        // 如果健康值为0，则死亡
        if (newHealth === 0) {
          isDead = true;
          petDied = true;
        }
      }

      // 如果成长值为负，直接死亡
      if (student.score < 0) {
        isDead = true;
        newHealth = 0;
        petDied = true;
      }

      const updatedPet = await prisma.pet.update({
        where: { id: student.pet.id },
        data: {
          level: newLevel,
          health: newHealth,
          lastScoreAt: newLastScoreAt,
          isDead: isDead
        },
      });
      student.pet = updatedPet;
    }

    return NextResponse.json({
      record,
      student,
      levelUp,
      newLevel,
      petDied
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding score:", error);
    return NextResponse.json(
      { error: "Failed to add score" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");

    const whereClause: any = {
      teacherId: session.user.id
    };
    if (studentId) {
      whereClause.studentId = studentId;
    } else if (classId) {
      whereClause.student = {
        classId: classId
      };
    }

    const records = await prisma.record.findMany({
      where: whereClause,
      include: {
        student: true,
        rule: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to match frontend expectations
    const formattedRecords = records.map(record => ({
      id: record.id,
      studentName: record.student.name,
      ruleName: record.rule?.name || "未知规则",
      score: record.scoreChange,
      category: record.rule?.category || "未分类",
      createdAt: record.createdAt,
    }));

    return NextResponse.json(formattedRecords);
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}
