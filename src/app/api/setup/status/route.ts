import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [adminCount, userCount] = await prisma.$transaction([
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count(),
    ]);

    const hasAdmin = adminCount > 0;
    const hasAnyUser = userCount > 0;

    return NextResponse.json({
      needsSetup: !hasAdmin,
      hasAdmin,
      hasAnyUser,
      userCount,
    });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
