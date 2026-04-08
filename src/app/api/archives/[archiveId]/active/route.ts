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
    
    // Deactivate all other archives in this class
    await prisma.groupArchive.updateMany({
      where: { classId: archive.classId },
      data: { isActive: false }
    });
    
    // Activate this archive
    const updated = await prisma.groupArchive.update({
      where: { id: archiveId },
      data: { isActive: true }
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to set active archive:', error);
    return NextResponse.json({ error: 'Failed to set active archive' }, { status: 500 });
  }
}
