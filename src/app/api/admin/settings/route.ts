import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { enableEmailVerify, enableTurnstile, turnstileSiteKey, turnstileSecretKey, enableGithubOAuth, enableGoogleOAuth } = body;

    const updatedSettings = await prisma.systemSetting.upsert({
      where: { id: "global" },
      update: {
        enableEmailVerify,
        enableTurnstile,
        turnstileSiteKey,
        turnstileSecretKey,
        enableGithubOAuth,
        enableGoogleOAuth,
      },
      create: {
        id: "global",
        enableEmailVerify,
        enableTurnstile,
        turnstileSiteKey,
        turnstileSecretKey,
        enableGithubOAuth,
        enableGoogleOAuth,
      },
    });

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
