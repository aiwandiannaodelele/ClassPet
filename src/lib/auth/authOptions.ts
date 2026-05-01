import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function getAuthOptions(): Promise<NextAuthConfig> {
  const globalSettings = await prisma.systemSetting.findUnique({ where: { id: "global" } });
  const githubClientId = globalSettings?.githubClientId || "";
  const githubClientSecret = globalSettings?.githubClientSecret || "";
  const enableGithubOAuth = !!globalSettings?.enableGithubOAuth && !!githubClientId && !!githubClientSecret;

  const providers: NextAuthConfig["providers"] = [
    ...(enableGithubOAuth
      ? [
          GitHubProvider({
            clientId: githubClientId,
            clientSecret: githubClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "teacher@example.com" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        // Verify turnstile if enabled
        const globalSettings = await prisma.systemSetting.findUnique({ where: { id: "global" } });
        if (globalSettings?.enableTurnstile && globalSettings.turnstileSecretKey) {
          if (!credentials.turnstileToken) {
            throw new Error("请完成人机验证");
          }
          const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `secret=${globalSettings.turnstileSecretKey}&response=${credentials.turnstileToken}`,
          });
          const verifyData = await verifyRes.json();
          if (!verifyData.success) {
            throw new Error("人机验证失败");
          }
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user || !user.password) {
          throw new Error("找不到该用户或使用第三方登录");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error("密码错误");
        }

        let safeImage = user.avatar || user.image;
        if (safeImage && safeImage.startsWith('data:image')) {
          safeImage = "db-fetch-required";
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: safeImage,
          role: user.role,
        };
      }
    })
  ];

  return {
    adapter: PrismaAdapter(prisma),
    providers,
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
    },
    callbacks: {
      async signIn({ account }) {
        if (!account?.provider || account.provider === "credentials") return true;
        if (account.provider === "github") return enableGithubOAuth;
        return false;
      },
      async jwt({ token, user, trigger, session }) {
        if (user) {
          token.id = user.id;
          token.picture = user.image;
          token.role = (user as any).role || "USER";
        }

        if (token.id && !token.role) {
          const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
          if (dbUser) {
            token.role = dbUser.role;
          }
        }

        if (trigger === "update" && session) {
          if (session.name) token.name = session.name;
          if (session.image && !session.image.startsWith("data:image")) {
            token.picture = session.image;
          } else if (session.image && session.image.startsWith("data:image")) {
            token.picture = "db-fetch-required";
          }
        }

        return token;
      },
      async session({ session, token }) {
        if (token && session.user) {
          (session.user as any).id = token.id;
          session.user.image = token.picture as string | null | undefined;
          (session.user as any).role = token.role as string;
        }
        return session;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
    secret: (() => {
      if (!process.env.NEXTAUTH_SECRET) {
        console.warn("⚠️ Using fallback secret. Set NEXTAUTH_SECRET in production!");
        return "fallback_secret_for_dev_classpet_123";
      }
      return process.env.NEXTAUTH_SECRET;
    })(),
  };
}
