import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
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

      if (process.env.NODE_ENV !== "production") {
        resetUrl = `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
      }
    }

    return NextResponse.json({ success: true, resetUrl });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

