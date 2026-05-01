import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import crypto from "crypto";
import { sendSystemMail } from "@/lib/mailer";

export async function POST(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await prisma.systemSetting.findUnique({
      where: { id: "global" },
      select: { enablePasswordReset: true },
    });
    if (!settings?.enablePasswordReset) {
      return NextResponse.json({ error: "功能未开启" }, { status: 404 });
    }

    const { userId } = await params;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const email = user?.email || "";
    if (!email) {
      return NextResponse.json({ error: "该用户没有邮箱，无法重置密码" }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${origin}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

    try {
      await sendSystemMail({
        to: email,
        subject: "重置密码",
        text: `请打开链接重置密码：${resetUrl}`,
        html: `<p>请打开链接重置密码：</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
      });
    } catch (e: any) {
      const msg = typeof e?.message === "string" ? e.message : "";
      return NextResponse.json({ error: msg || "SMTP 未配置" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
