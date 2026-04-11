import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rateLimit";

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

    // 速率限制：基于用户邮箱
    const rateLimitResult = checkRateLimit(
      `pin:${session.user.email}`,
      RATE_LIMITS.PIN_VERIFY
    );

    if (!rateLimitResult.allowed) {
      const waitMinutes = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 60000
      );
      return NextResponse.json(
        { error: `尝试次数过多，请 ${waitMinutes} 分钟后再试` },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.pinCode) {
      return NextResponse.json({ error: "PIN not set" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(pinCode, user.pinCode);

    if (!isValid) {
      return NextResponse.json(
        { error: `PIN 错误，剩余 ${rateLimitResult.remaining} 次尝试机会` },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PIN verification error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
