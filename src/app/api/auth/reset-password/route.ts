import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || "").toString().trim().toLowerCase();
    const token = (body?.token || "").toString().trim();
    const newPassword = (body?.newPassword || "").toString();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
    }

    const tokenRecord = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token,
        },
      },
    });

    if (!tokenRecord || tokenRecord.expires < new Date()) {
      return NextResponse.json({ error: "链接已失效，请重新获取" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "链接已失效，请重新获取" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });
      await tx.verificationToken.deleteMany({
        where: { identifier: email },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

