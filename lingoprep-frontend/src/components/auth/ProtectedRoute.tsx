"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] flex-col gap-3">
        <div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-[13px] text-[#999]">Checking authentication...</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
