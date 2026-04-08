import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { calculateLevel } from "@/lib/utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ scoreId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { scoreId } = await params;

    const targetRecord = await prisma.record.findUnique({
      where: { id: scoreId },
      include: {
        student: {
          include: {
            pet: true,
            class: true
          }
        }
      }
    });

    if (!targetRecord || targetRecord.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { scoreChange, student } = targetRecord;
    const reversedScore = -scoreChange;

    await prisma.$transaction(async (tx) => {
      await tx.record.delete({
        where: { id: scoreId },
      });

      let coinsToDeduct = 0;
      if (scoreChange > 0) {
        const oldTotal = student.totalScore || 0;
        const newTotal = oldTotal - scoreChange;
        coinsToDeduct = Math.floor(oldTotal / 10) - Math.floor(Math.max(0, newTotal) / 10);
      }

      const updatedStudent = await tx.student.update({
        where: { id: student.id },
        data: {
          score: {
            increment: reversedScore,
          },
          totalScore: {
            decrement: scoreChange > 0 ? scoreChange : 0,
          },
          coins: {
            decrement: coinsToDeduct,
          },
        },
        include: {
          pet: true,
        },
      });

      if (updatedStudent.pet) {
        let newHealth = updatedStudent.pet.health;
        let isDead = updatedStudent.pet.isDead;

        if (scoreChange > 0) {
          // 撤销加分：如果健康值已满100，保持不变；否则扣除
          if (newHealth < 100) {
            newHealth = Math.max(0, newHealth - scoreChange);
          }
        } else if (scoreChange < 0) {
          // 撤销扣分：恢复健康值，上限100
          newHealth = Math.min(100, newHealth - scoreChange);
        }

        // 核心死亡逻辑检查：
        // 1. 如果撤销后成长值为负数 -> 死亡
        // 2. 如果撤销后健康值为0 -> 死亡
        if (updatedStudent.score < 0 || newHealth <= 0) {
          isDead = true;
          newHealth = 0;
        } else if (updatedStudent.score >= 0 && newHealth > 0) {
          // 如果之前是死的，但现在条件都满足了（比如撤销了一个致命扣分），则复活
          isDead = false;
        }

        const thresholdsStr = student.class.levelThresholds || "5,10,15,20,30,40,50,60,75,90";
        const calculatedLevel = calculateLevel(updatedStudent.score, thresholdsStr);

        await tx.pet.update({
          where: { id: updatedStudent.pet.id },
          data: {
            health: newHealth,
            level: calculatedLevel,
            isDead: isDead,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting score:", error);
    return NextResponse.json(
      { error: "Failed to delete score" },
      { status: 500 }
    );
  }
}
