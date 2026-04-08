import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await params;
    const body = await request.json();
    const { extraHealCost = 0 } = body;

    // 获取学生和宠物信息
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { pet: true, class: true },
    });

    if (!student || !student.pet || student.class.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: "Student or Pet not found, or Forbidden" },
        { status: 404 }
      );
    }

    if (!student.pet.isDead) {
      return NextResponse.json(
        { error: "Pet is not dead" },
        { status: 400 }
      );
    }

    // Check cooldown
    if (student.pet.lastReviveAt) {
      const now = new Date();
      const msSinceLastRevive = now.getTime() - student.pet.lastReviveAt.getTime();
      const hoursSinceLastRevive = msSinceLastRevive / (1000 * 60 * 60);
      const cooldownHours = student.class.reviveCooldownHours ?? 24;
      if (hoursSinceLastRevive < cooldownHours) {
        const hoursLeft = Math.ceil(cooldownHours - hoursSinceLastRevive);
        return NextResponse.json(
          { error: `复活冷却中。每次复活后需等待${cooldownHours}小时，还需等待约 ${hoursLeft} 小时` },
          { status: 400 }
        );
      }
    }

    // Check max revive count
    const maxRevives = student.class.maxRevivesPerSemester ?? 3;
    if (student.pet.reviveCount >= maxRevives) {
      return NextResponse.json(
        { error: `复活次数已达上限（每学期最多${maxRevives}次），宠物已永久消亡，只能重新领养` },
        { status: 400 }
      );
    }

    const isNegative = student.score < 0;
    
    // Tiered penalties based on reviveCount
    // 1st revive (count 0): 10 base, 20 negative
    // 2nd revive (count 1): 15 base, 20 negative + diff
    // 3rd revive (count 2): (already maxed next time)
    let baseReviveCost = student.class.reviveCost || 10;
    if (student.pet.reviveCount >= 1) {
      baseReviveCost = 15;
    }

    const reviveCost = isNegative ? Math.abs(student.score) + (student.pet.reviveCount >= 1 ? 20 : 15) : baseReviveCost;
    const reviveBaseHealth = isNegative ? 20 : (student.class.reviveBaseHealth || 30);
    
    const totalCost = reviveCost + extraHealCost;

    if (student.score < totalCost && !isNegative) {
      return NextResponse.json(
        { error: `成长值不足。需要 ${totalCost} 点，当前仅有 ${student.score} 点` },
        { status: 400 }
      );
    }
    
    if (isNegative) {
      return NextResponse.json(
        { error: `负分状态下无法直接复活，需先补足差额并额外获取15分惩罚分。` },
        { status: 400 }
      );
    }

    // 复活逻辑：
    // 保留原等级，扣除对应的成长值，健康值回血
    const revivedScore = student.score - totalCost;
    
    // 基础复活给 reviveBaseHealth，额外回血：每1点成长值换2点健康值
    let newHealth = reviveBaseHealth + (extraHealCost * 2);
    if (newHealth > 100) newHealth = 100;

    // 更新学生分数
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        score: revivedScore,
      },
      include: { pet: true }
    });

    // 更新宠物状态
    const revivedPet = await prisma.pet.update({
      where: { id: student.pet.id },
      data: {
        health: newHealth,
        isDead: false,
        lastScoreAt: new Date(),
        reviveCount: {
          increment: 1
        },
        lastReviveAt: new Date()
      },
    });
    
    // Return updated student with pet so UI can sync
    return NextResponse.json({ 
      success: true, 
      student: {
        ...updatedStudent,
        pet: revivedPet
      } 
    });
  } catch (error) {
    console.error("Error reviving pet:", error);
    return NextResponse.json(
      { error: "Failed to revive pet" },
      { status: 500 }
    );
  }
}
