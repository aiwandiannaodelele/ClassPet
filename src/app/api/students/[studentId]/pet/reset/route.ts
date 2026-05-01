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

    const resetCost = student.class.petResetCost ?? 20;

    if (!student.pet.isDead && student.score < resetCost) {
      return NextResponse.json(
        { error: `成长值不足，重置宠物需要 ${resetCost} 点成长值` },
        { status: 400 }
      );
    }

    let penaltyEndDate = student.penaltyEndDate;
    let penaltyDays = 0;

    if (student.pet.isDead) {
      if (student.pet.reviveCount === 1) {
        penaltyDays = 7;
      } else if (student.pet.reviveCount >= 2) {
        penaltyDays = 14;
      } else if (student.score < 0) {
        penaltyDays = 3;
      }
    } else if (student.score < 0) {
      penaltyDays = 3;
    }

    if (penaltyDays > 0) {
      penaltyEndDate = new Date();
      penaltyEndDate.setDate(penaltyEndDate.getDate() + penaltyDays);
    }

    const isDead = student.pet.isDead;
    const petId = student.pet.id;

    const updatedStudent = await prisma.$transaction(async (tx) => {
      await tx.pet.delete({ where: { id: petId } });

      await tx.student.update({
        where: { id: studentId },
        data: {
          score: isDead ? 0 : { decrement: resetCost },
          penaltyEndDate: penaltyEndDate,
        },
      });

      return tx.student.findUnique({
        where: { id: studentId },
        include: { pet: true },
      });
    });

    if (!updatedStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, student: updatedStudent });
  } catch (error) {
    console.error("Error resetting pet:", error);
    return NextResponse.json(
      { error: "Failed to reset pet" },
      { status: 500 }
    );
  }
}
