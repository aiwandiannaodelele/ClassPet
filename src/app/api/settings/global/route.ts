import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findUnique({
      where: { id: "global" },
      select: {
        enableEmailVerify: true,
        enablePasswordReset: true,
        enableTurnstile: true,
        turnstileSiteKey: true,
        enableGithubOAuth: true,
        githubClientId: true,
        githubClientSecret: true,
        smtpHost: true,
        smtpPort: true,
        smtpFrom: true,
      },
    });

    if (!settings) {
      return NextResponse.json({
        enableEmailVerify: false,
        enablePasswordReset: false,
        enableTurnstile: false,
        enableGithubOAuth: false,
        githubOAuthConfigured: false,
        smtpConfigured: false,
      });
    }

    const githubOAuthConfigured = !!(settings.githubClientId && settings.githubClientSecret);
    const smtpConfigured = !!(settings.smtpHost && settings.smtpPort && settings.smtpFrom);

    return NextResponse.json({
      enableEmailVerify: settings.enableEmailVerify,
      enablePasswordReset: settings.enablePasswordReset,
      enableTurnstile: settings.enableTurnstile,
      turnstileSiteKey: settings.turnstileSiteKey,
      enableGithubOAuth: settings.enableGithubOAuth,
      githubOAuthConfigured,
      smtpConfigured,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
