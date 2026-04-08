import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    const whereClause: any = {
      class: {
        teacherId: session.user.id
      }
    };
    
    if (classId) {
      whereClause.classId = classId;
    }

    const rules = await prisma.rule.findMany({
      where: whereClause,
      orderBy: [
        { category: "asc" },
        { score: "desc" },
      ],
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { classId, name, category, score, limit, validPeriod, icon } = body;

    if (!classId || !name || !category || typeof score !== "number") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const targetClass = await prisma.class.findUnique({
      where: { id: classId }
    });

    if (!targetClass || targetClass.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Not your class" }, { status: 403 });
    }

    const rule = await prisma.rule.create({
      data: {
        classId,
        name,
        category,
        score,
        limit,
        validPeriod,
        icon,
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Error creating rule:", error);
    return NextResponse.json(
      { error: "Failed to create rule" },
      { status: 500 }
    );
  }
}
