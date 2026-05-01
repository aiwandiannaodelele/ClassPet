import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function sendSystemMail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  const settings = await prisma.systemSetting.findUnique({ where: { id: "global" } });

  const host = settings?.smtpHost || "";
  const port = settings?.smtpPort || 0;
  const secure = !!settings?.smtpSecure;
  const user = settings?.smtpUser || "";
  const pass = settings?.smtpPass || "";
  const from = settings?.smtpFrom || "";

  if (!host || !port || !from) {
    throw new Error("SMTP 未配置");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });
}

