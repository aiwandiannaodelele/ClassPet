import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(
  request: NextRequest,
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

    const levelConfigs = await prisma.levelConfig.findMany({
      where: { classId },
      orderBy: {
        level: "asc",
      },
    });

    return NextResponse.json(levelConfigs);
  } catch (error) {
    console.error("Error fetching level configs:", error);
    return NextResponse.json(
      { error: "Failed to fetch level configs" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
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

    const body = await request.json();
    const { configs } = body;

    if (!configs || !Array.isArray(configs)) {
      return NextResponse.json(
        { error: "configs array is required" },
        { status: 400 }
      );
    }

    // 批量创建或更新等级配置
    const levelConfigs = await Promise.all(
      configs.map(async (config: any) => {
        return await prisma.levelConfig.upsert({
          where: {
            classId_level: {
              classId: classId,
              level: config.level,
            },
          },
          update: {
            experience: config.experience,
          },
          create: {
            classId: classId,
            level: config.level,
            experience: config.experience,
          },
        });
      })
    );

    return NextResponse.json(levelConfigs);
  } catch (error) {
    console.error("Error saving level configs:", error);
    return NextResponse.json(
      { error: "Failed to save level configs" },
      { status: 500 }
    );
  }
}
