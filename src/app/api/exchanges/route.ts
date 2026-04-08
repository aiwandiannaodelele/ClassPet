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
    const studentId = searchParams.get("studentId");

    const exchanges = await prisma.exchange.findMany({
      where: {
        student: {
          class: {
            teacherId: session.user.id,
            ...(classId ? { id: classId } : {})
          },
          ...(studentId ? { id: studentId } : {})
        }
      },
      include: {
        product: true,
        student: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(exchanges);
  } catch (error) {
    console.error("Error fetching exchanges:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchanges" },
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
    const { classId, studentId, productId, productName, price } = body;

    if (!classId || !studentId || !productId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true }
    });

    if (!student || student.class.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: "Student not found or Forbidden" },
        { status: 403 }
      );
    }

    if (student.score < price) {
      return NextResponse.json(
        { error: "成长值不足" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "商品不存在" },
        { status: 404 }
      );
    }

    if (product.stock !== -1 && product.stock <= 0) {
      return NextResponse.json(
        { error: "商品库存不足" },
        { status: 400 }
      );
    }

    const exchange = await prisma.exchange.create({
      data: {
        studentId,
        productId,
      },
    });

    await prisma.student.update({
      where: { id: studentId },
      data: {
        score: {
          decrement: price,
        },
      },
    });

    if (product.stock !== -1) {
      await prisma.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });
    }

    return NextResponse.json(exchange, { status: 201 });
  } catch (error) {
    console.error("Error creating exchange:", error);
    return NextResponse.json(
      { error: "Failed to create exchange" },
      { status: 500 }
    );
  }
}
