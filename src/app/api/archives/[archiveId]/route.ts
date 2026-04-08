import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ archiveId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { archiveId } = await params;

    const targetArchive = await prisma.groupArchive.findUnique({
      where: { id: archiveId },
      include: { class: true }
    });

    if (!targetArchive || targetArchive.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name } = await request.json();
    
    const updated = await prisma.groupArchive.update({
      where: { id: archiveId },
      data: { name }
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update archive:', error);
    return NextResponse.json({ error: 'Failed to update archive' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ archiveId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { archiveId } = await params;
    
    const archive = await prisma.groupArchive.findUnique({ 
      where: { id: archiveId },
      include: { class: true }
    });

    if (!archive || archive.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if it's the active one
    if (archive?.isActive) {
      // Find another archive to make active
      const other = await prisma.groupArchive.findFirst({
        where: { classId: archive.classId, id: { not: archiveId } }
      });
      if (other) {
        await prisma.groupArchive.update({
          where: { id: other.id },
          data: { isActive: true }
        });
      }
    }

    await prisma.groupArchive.delete({
      where: { id: archiveId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete archive:', error);
    return NextResponse.json({ error: 'Failed to delete archive' }, { status: 500 });
  }
}
