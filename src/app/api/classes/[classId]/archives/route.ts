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

    const archives = await prisma.groupArchive.findMany({
      where: { classId },
      include: {
        groups: {
          include: {
            students: {
              select: { id: true, name: true, score: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json(archives);
  } catch (error) {
    console.error('Failed to fetch archives:', error);
    return NextResponse.json({ error: 'Failed to fetch archives' }, { status: 500 });
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
    
    // Check if it's the first archive, if so make it active
    const count = await prisma.groupArchive.count({ where: { classId } });
    
    const archive = await prisma.groupArchive.create({
      data: { 
        name, 
        classId,
        isActive: count === 0
      },
      include: {
        groups: {
          include: {
            students: {
              select: { id: true, name: true, score: true }
            }
          }
        }
      }
    });
    return NextResponse.json(archive, { status: 201 });
  } catch (error) {
    console.error('Failed to create archive:', error);
    return NextResponse.json({ error: 'Failed to create archive' }, { status: 500 });
  }
}
