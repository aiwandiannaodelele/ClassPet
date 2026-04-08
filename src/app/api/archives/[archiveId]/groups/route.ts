import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ archiveId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { archiveId } = await params;
    const { name } = await request.json();
    
    const archive = await prisma.groupArchive.findUnique({ 
      where: { id: archiveId },
      include: { class: true }
    });

    if (!archive) {
      return NextResponse.json({ error: 'Archive not found' }, { status: 404 });
    }

    if (archive.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const group = await prisma.group.create({
      data: { 
        name, 
        archiveId,
        classId: archive.classId
      },
      include: {
        students: {
          select: { id: true, name: true, score: true }
        }
      }
    });
    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Failed to create group:', error);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
