import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!name || !email || !password) {
      return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
    }

    const [adminCount, userCount] = await prisma.$transaction([
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count(),
    ]);

    if (adminCount > 0) {
      return NextResponse.json({ error: "系统已初始化" }, { status: 409 });
    }

    if (userCount > 0) {
      return NextResponse.json({ error: "检测到已有用户，请选择一个现有账号作为管理员" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "ADMIN",
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e: any) {
    const msg = typeof e?.message === "string" ? e.message : "";
    if (msg.toLowerCase().includes("unique")) {
      return NextResponse.json({ error: "邮箱已存在" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
