import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

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
    const { students } = body;

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 });
    }

    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classInfo || classInfo.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Class not found or Forbidden' }, { status: 403 });
    }

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'Valid students array is required' }, { status: 400 });
    }

    // Create many students
    const createdStudents = await prisma.$transaction(
      students.map((student: { name: string; studentNo?: string }) => 
        prisma.student.create({
          data: {
            name: student.name.trim(),
            studentNo: student.studentNo?.trim() || null,
            classId: classId,
            score: 0,
          },
        })
      )
    );

    return NextResponse.json({ count: createdStudents.length });
  } catch (error) {
    console.error('[STUDENTS_BATCH_POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
