import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await params;

    const targetClass = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!targetClass || targetClass.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not your class" }, { status: 403 });
    }

    const body = await request.json();
    
    // Handle class reset
    if (body.type === 'reset') {
      // Reset all students' scores to 0
      await prisma.student.updateMany({
        where: { classId },
        data: { score: 0 }
      });
      
      // Get all students in this class to reset their pets
      const students = await prisma.student.findMany({
        where: { classId },
        select: { id: true }
      });
      const studentIds = students.map(s => s.id);
      
      // Reset all pets associated with these students
      await prisma.pet.updateMany({
        where: {
          studentId: {
            in: studentIds
          }
        },
        data: {
          level: 1,
          health: 100,
          experience: 0,
          isDead: false,
          reviveCount: 0,
          lastReviveAt: null,
          lastScoreAt: new Date()
        }
      });
      
      return NextResponse.json({ success: true, message: 'Class data reset successfully' });
    }

    // Handle restore all pets health
    if (body.type === 'restoreHealth') {
      const students = await prisma.student.findMany({
        where: { classId },
        select: { id: true }
      });
      const studentIds = students.map(s => s.id);
      
      await prisma.pet.updateMany({
        where: {
          studentId: { in: studentIds }
        },
        data: {
          health: 100,
          isDead: false,
          lastScoreAt: new Date()
        }
      });
      
      return NextResponse.json({ success: true, message: 'All pets health restored' });
    }

    // Check if it's a settings update
    if (body.type === 'settings') {
      const { 
        name, description, logo, dailyScoreLimit, reviveCost, 
        reviveBaseHealth, levelThresholds, ruleCategories,
        decayGraceDays, decayHealthPerDay, reviveCooldownHours, maxRevivesPerSemester,
        isFrozen, petResetCost
      } = body.data;
      
      const updatedClass = await prisma.class.update({
        where: { id: classId },
        data: {
          name,
          description,
          logo,
          dailyScoreLimit,
          reviveCost,
          reviveBaseHealth,
          levelThresholds,
          ruleCategories,
          decayGraceDays,
          decayHealthPerDay,
          reviveCooldownHours,
          maxRevivesPerSemester,
          isFrozen,
          petResetCost
        }
      });

      // If unfreezing, reset all pets' hunger timer to prevent instant death
      if (isFrozen === false && targetClass.isFrozen === true) {
        const students = await prisma.student.findMany({
          where: { classId },
          select: { id: true }
        });
        const studentIds = students.map(s => s.id);
        
        await prisma.pet.updateMany({
          where: {
            studentId: { in: studentIds },
            isDead: false
          },
          data: {
            lastScoreAt: new Date()
          }
        });
      }
      
      return NextResponse.json(updatedClass);
    }
    
    // Otherwise standard class update (name, etc)
    const { name, description } = body;
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: { name, description }
    });
    
    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('[CLASSES_PUT]', error);
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
  }
}

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
      where: {
        id: classId,
      },
    });

    if (!classInfo || classInfo.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Class not found or Forbidden' }, { status: 404 });
    }

    return NextResponse.json(classInfo);
  } catch (error) {
    console.error('[CLASSES_GET_BY_ID]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
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

    const targetClass = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!targetClass || targetClass.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not your class" }, { status: 403 });
    }

    await prisma.class.delete({
      where: {
        id: classId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CLASSES_DELETE]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
