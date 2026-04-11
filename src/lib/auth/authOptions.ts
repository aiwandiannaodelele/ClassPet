import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "teacher@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user) {
          throw new Error("找不到该用户，请先注册");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error("密码错误");
        }

        // Avoid sending huge base64 strings in the JWT cookie
        let safeImage = user.avatar;
        if (safeImage && safeImage.startsWith('data:image')) {
          safeImage = "db-fetch-required";
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: safeImage,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image;
      }
      
      // Handle session updates (e.g., when updating profile)
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        // Do not update token.picture if it's a huge base64 string, to prevent Cookie bloat
        // We will rely on the UI fetching it, or we just let it be if it's an emoji/url
        if (session.image && !session.image.startsWith('data:image')) {
          token.picture = session.image;
        } else if (session.image && session.image.startsWith('data:image')) {
          // If they uploaded a base64 image, we flag it so the client knows to fetch from DB
          token.picture = "db-fetch-required";
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        session.user.image = token.picture as string | null | undefined;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  secret: (() => {
    if (!process.env.NEXTAUTH_SECRET) {
      if (process.env.NODE_ENV === "production") {
        throw new Error("NEXTAUTH_SECRET environment variable is required in production");
      }
      console.warn("⚠️ Using fallback secret for development. Set NEXTAUTH_SECRET in production!");
      return "fallback_secret_for_dev_classpet_123";
    }
    return process.env.NEXTAUTH_SECRET;
  })(),
};
