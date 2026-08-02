"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Completing sign in...");

  useEffect(() => {
    async function handleSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setStatus("Authentication failed. Redirecting to login...");
        setTimeout(() => router.push("/auth/login"), 2000);
      } else if (data.session) {
        setStatus("Sign in successful! Redirecting to dashboard...");
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    }
    handleSession();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh] flex-col gap-3">
      <div className="w-7 h-7 border-2 border-[#c8102e] border-t-transparent rounded-full animate-spin" />
      <p className="text-[14px] text-[#666] font-medium">{status}</p>
    </div>
  );
}
