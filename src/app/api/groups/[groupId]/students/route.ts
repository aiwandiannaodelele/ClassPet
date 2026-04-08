import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await params;
    const { studentIds } = await request.json();

    const targetGroup = await prisma.group.findUnique({ 
      where: { id: groupId },
      include: { class: true }
    });

    if (!targetGroup || targetGroup.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (targetGroup?.archiveId && studentIds && studentIds.length > 0) {
      // Find other groups in the same archive
      const otherGroups = await prisma.group.findMany({
        where: {
          archiveId: targetGroup.archiveId,
          id: { not: groupId }
        }
      });
      
      // Disconnect these students from other groups in the same archive
      for (const other of otherGroups) {
        await prisma.group.update({
          where: { id: other.id },
          data: {
            students: {
              disconnect: studentIds.map((id: string) => ({ id }))
            }
          }
        });
      }
    }

    // Set students for this group (this will remove unselected students and add selected ones)
    await prisma.group.update({
      where: { id: groupId },
      data: {
        students: {
          set: (studentIds || []).map((id: string) => ({ id }))
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to assign students', error);
    return NextResponse.json({ error: 'Failed to assign students' }, { status: 500 });
  }
}
