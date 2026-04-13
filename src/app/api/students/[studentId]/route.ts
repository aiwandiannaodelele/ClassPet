import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(
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
      include: {
        pet: true,
        class: true,
        records: {
          include: {
            rule: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        exchanges: {
          include: {
            product: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!student || student.class.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: "Student not found or Forbidden" },
        { status: 404 }
      );
    }

    // Apply lazy decay logic before returning
    const now = new Date();
    if (student.pet && !student.pet.isDead && !student.class.isFrozen) {
      const decayGraceDays = student.class.decayGraceDays ?? 2;
      const decayHealthPerDay = student.class.decayHealthPerDay ?? 50;

      const lastScoreAt = student.pet.lastScoreAt;
      const lastDecayAt = student.pet.lastDecayAt || lastScoreAt;
      
      // Calculate days passed excluding weekends
      let daysSinceLastScore = 0;
      let currentDate = new Date(lastScoreAt);
      while (currentDate < now) {
        currentDate.setDate(currentDate.getDate() + 1);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
          daysSinceLastScore++;
        }
      }
      
      // 宽限期后才开始扣血：例如宽限期2天，第3天开始扣（即超过2天的部分）
      if (daysSinceLastScore > decayGraceDays) {
        // 应该扣血的天数 = 超过宽限期的天数
        const daysShouldDecayed = daysSinceLastScore - decayGraceDays;
        
        // 计算已经扣过血的天数（基于 lastDecayAt）
        let daysAlreadyDecayed = 0;
        if (student.pet.lastDecayAt) {
          let tempDecayDate = new Date(lastScoreAt);
          while (tempDecayDate < student.pet.lastDecayAt) {
            tempDecayDate.setDate(tempDecayDate.getDate() + 1);
            const dayOfWeek = tempDecayDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              daysAlreadyDecayed++;
            }
          }
          // 只计算超过宽限期的部分
          daysAlreadyDecayed = Math.max(0, daysAlreadyDecayed - decayGraceDays);
        }
        
        // 本次需要扣血的天数
        const newDaysToDecay = daysShouldDecayed - daysAlreadyDecayed;
        
        if (newDaysToDecay > 0) {
          const penalty = newDaysToDecay * decayHealthPerDay;
          let newHealth = student.pet.health - penalty;
          let isDead = false;
          
          if (newHealth <= 0) {
            newHealth = 0;
            isDead = true;
          }
          
          const updatedPet = await prisma.pet.update({
            where: { id: student.pet.id },
            data: {
              health: newHealth,
              isDead: isDead,
              lastDecayAt: now
            }
          });
          student.pet = updatedPet;
        }
      }
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await params;

    const targetStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true }
    });

    if (!targetStudent || targetStudent.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, score, level } = body;

    const student = await prisma.student.update({
      where: { id: studentId },
      data: {
        name,
        score,
        level,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await params;

    const targetStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true }
    });

    if (!targetStudent || targetStudent.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.student.delete({
      where: { id: studentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
