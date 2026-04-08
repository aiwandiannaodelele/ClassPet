import NextAuth from "next-auth";
import { authOptions } from "./authOptions";

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
