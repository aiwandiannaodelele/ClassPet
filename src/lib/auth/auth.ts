import NextAuth from "next-auth";
import { getAuthOptions } from "./authOptions";

export const { handlers, auth, signIn, signOut } = NextAuth(async () => await getAuthOptions());
