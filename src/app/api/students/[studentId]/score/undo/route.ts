import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await params;
    const body = await request.json();
    const { score } = body;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true }
    });

    if (!student || student.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.student.update({
      where: { id: studentId },
      data: {
        score: {
          decrement: Math.abs(score),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error undoing score:", error);
    return NextResponse.json(
      { error: "Failed to undo score" },
      { status: 500 }
    );
  }
}
