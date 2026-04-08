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

    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classInfo || classInfo.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Class not found or Forbidden' }, { status: 403 });
    }

    const groups = await prisma.group.findMany({
      where: { classId },
      include: {
        students: {
          select: { id: true, name: true, score: true }
        }
      }
    });
    return NextResponse.json(groups);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
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

    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classInfo || classInfo.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Class not found or Forbidden' }, { status: 403 });
    }

    const { name } = await request.json();
    const group = await prisma.group.create({
      data: { name, classId }
    });
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
