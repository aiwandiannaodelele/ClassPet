import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, name, image } = body;

    if (!studentId || !name || !image) {
      return NextResponse.json(
        { error: "studentId, name, and image are required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true }
    });

    if (!student || student.class.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if student already has a pet
    const existingPet = await prisma.pet.findUnique({
      where: { studentId: studentId },
    });

    if (existingPet) {
      return NextResponse.json(
        { error: "Student already has a pet" },
        { status: 400 }
      );
    }

    // Create the pet for the student
    const pet = await prisma.pet.create({
      data: {
        name,
        image,
        studentId,
      },
    });

    return NextResponse.json(pet);
  } catch (error) {
    console.error("Error creating pet:", error);
    return NextResponse.json(
      { error: "Failed to create pet" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pets = await prisma.pet.findMany({
      where: {
        student: {
          class: {
            teacherId: session.user.id
          }
        }
      },
      include: {
        student: true,
      },
    });

    return NextResponse.json(pets);
  } catch (error) {
    console.error("Error fetching pets:", error);
    return NextResponse.json(
      { error: "Failed to fetch pets" },
      { status: 500 }
    );
  }
}
