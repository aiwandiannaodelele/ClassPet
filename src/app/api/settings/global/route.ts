import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findUnique({
      where: { id: "global" },
      select: {
        enableEmailVerify: true,
        enableTurnstile: true,
        turnstileSiteKey: true,
      },
    });

    if (!settings) {
      return NextResponse.json({
        enableEmailVerify: false,
        enableTurnstile: false,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
