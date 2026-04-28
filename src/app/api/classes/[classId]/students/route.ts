import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await params;

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
      select: { decayGraceDays: true, decayHealthPerDay: true, teacherId: true, isFrozen: true }
    });

    if (!classInfo || classInfo.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Class not found or Forbidden' }, { status: 403 });
    }
    const decayGraceDays = classInfo?.decayGraceDays ?? 2;
    const decayHealthPerDay = classInfo?.decayHealthPerDay ?? 50;
    const isFrozen = classInfo?.isFrozen ?? false;

    const students = await prisma.student.findMany({
      where: {
        classId: classId,
      },
      include: {
        pet: true, // Include related pet information
      },
      orderBy: {
        name: 'asc',
      },
    });

    const now = new Date();
    
    // Apply lazy decay logic before returning
    const updatedStudents = await Promise.all(students.map(async (student) => {
      if (student.pet && !student.pet.isDead && !isFrozen) {
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
        
        if (daysSinceLastScore > decayGraceDays) {
          // Calculate how many days we should decay for this specific tick
          const startDecayDay = decayGraceDays;
          const currentDay = daysSinceLastScore;
          
          let daysAlreadyDecayed = 0;
          let tempDecayDate = new Date(lastScoreAt);
          while (tempDecayDate < lastDecayAt) {
            tempDecayDate.setDate(tempDecayDate.getDate() + 1);
            const dayOfWeek = tempDecayDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              daysAlreadyDecayed++;
            }
          }
          daysAlreadyDecayed = Math.max(0, daysAlreadyDecayed - startDecayDay);
          
          const totalDaysToDecay = Math.max(0, currentDay - startDecayDay);
          const newDaysToDecay = totalDaysToDecay - daysAlreadyDecayed;
          
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
            return { ...student, pet: updatedPet };
          }
        }
      }
      return student;
    }));

    return NextResponse.json(updatedStudents);
  } catch (error) {
    console.error('[STUDENTS_GET_BY_CLASS_ID]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await params;
    const body = await request.json();
    const { name, studentNo } = body;

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classInfo || classInfo.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Class not found or Forbidden' }, { status: 403 });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Student name is required' }, { status: 400 });
    }

    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        studentNo: studentNo?.trim() || null,
        classId: classId,
        score: 0,
      },
      include: {
        pet: true,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error('[STUDENTS_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
