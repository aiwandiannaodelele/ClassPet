import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pinCode } = await request.json();

    if (!pinCode) {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.pinCode) {
      return NextResponse.json({ error: "PIN not set" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(pinCode, user.pinCode);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PIN verification error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
