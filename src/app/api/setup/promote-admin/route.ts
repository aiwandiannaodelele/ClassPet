import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const mode = body?.mode === "session" ? "session" : "credentials";

    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount > 0) {
      return NextResponse.json({ error: "系统已初始化" }, { status: 409 });
    }

    if (mode === "session") {
      const session = await auth();
      const userId = (session?.user as any)?.id as string | undefined;
      if (!userId) {
        return NextResponse.json({ error: "请先登录" }, { status: 401 });
      }

      await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
      return NextResponse.json({ ok: true });
    }

    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!email || !password) {
      return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "账号不存在" }, { status: 404 });
    }
    if (!user.password) {
      return NextResponse.json({ error: "该账号不支持密码校验，请联系运维处理" }, { status: 400 });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
