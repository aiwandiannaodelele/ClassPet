"use client";

import { SessionProvider } from "next-auth/react";
import { SetupGate } from "@/components/SetupGate";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SetupGate>{children}</SetupGate>
    </SessionProvider>
  );
}
