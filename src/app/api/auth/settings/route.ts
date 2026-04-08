import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        name: true,
        avatar: true,
        lockSettings: true,
        lockScoring: true,
        pinCode: true,
      }
    });

    return NextResponse.json({
      name: user?.name,
      avatar: user?.avatar,
      lockSettings: user?.lockSettings,
      lockScoring: user?.lockScoring,
      hasPinCode: !!user?.pinCode
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Next.js has a limit on payload size (usually 1MB-4MB depending on server config).
    // If the image is a base64 string, it might be large, but Prisma should handle it if within DB limits.
    const body = await request.json();
    const { pinCode, lockSettings, lockScoring, name, avatar } = body;

    const dataToUpdate: any = {
      lockSettings: Boolean(lockSettings),
      lockScoring: Boolean(lockScoring),
    };

    if (name !== undefined) dataToUpdate.name = name;
    if (avatar !== undefined) dataToUpdate.avatar = avatar;

    if (pinCode) {
      dataToUpdate.pinCode = await bcrypt.hash(pinCode, 10);
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
