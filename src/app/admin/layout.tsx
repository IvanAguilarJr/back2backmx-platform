"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/useAuth";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.replace("/admin/login");
    }
  }, [loading, user, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen flex-1 items-center justify-center bg-bg">
        <p className="text-sm text-muted">Cargando…</p>
      </main>
    );
  }

  return <>{children}</>;
}
