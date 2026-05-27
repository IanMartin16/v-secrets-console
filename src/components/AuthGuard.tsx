"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { getToken } from "@/lib/auth";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}