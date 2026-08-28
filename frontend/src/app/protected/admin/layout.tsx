"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getAccessToken } from "../../../lib/auth/auth-storage";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/auth/login");
      return;
    }

    setIsAuthenticated(true);
    setIsCheckingAuth(false);
  }, [router]);

  if (isCheckingAuth || !isAuthenticated) {
    return null;
  }

  return children;
}
