"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function SetupGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let canceled = false;

    const run = async () => {
      if (!pathname) return;
      if (pathname === "/setup") return;

      try {
        const res = await fetch("/api/setup/status", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { needsSetup?: boolean };
        if (canceled) return;
        if (data?.needsSetup) {
          router.replace("/setup");
        }
      } catch {}
    };

    run();
    return () => {
      canceled = true;
    };
  }, [pathname, router]);

  return children;
}

