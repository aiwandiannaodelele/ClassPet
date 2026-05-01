import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendSystemMail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const settings = await prisma.systemSetting.findUnique({
      where: { id: "global" },
      select: { enablePasswordReset: true },
    });
    if (!settings?.enablePasswordReset) {
      return NextResponse.json({ error: "功能未开启" }, { status: 404 });
    }

    const body = await request.json();
    const email = (body?.email || "").toString().trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "邮箱不能为空" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    let resetUrl: string | undefined;

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      const origin = request.headers.get("origin") || "http://localhost:3000";
      const fullResetUrl = `${origin}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;

      if (process.env.NODE_ENV !== "production") {
        resetUrl = fullResetUrl;
      } else {
        try {
          await sendSystemMail({
            to: email,
            subject: "重置密码",
            text: `请打开链接重置密码：${fullResetUrl}`,
            html: `<p>请打开链接重置密码：</p><p><a href="${fullResetUrl}">${fullResetUrl}</a></p>`,
          });
        } catch (e: any) {
          const msg = typeof e?.message === "string" ? e.message : "";
          return NextResponse.json({ error: msg || "SMTP 未配置" }, { status: 400 });
        }
      }
    }

    return NextResponse.json({ success: true, resetUrl });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
