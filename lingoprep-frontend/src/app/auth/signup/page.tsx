"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-sm bg-white border border-[#e0e0e0] rounded-lg p-8 text-center">
          <svg className="mx-auto mb-4" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h2 className="text-[18px] font-bold text-[#1a1a1a] mb-2">Check your email</h2>
          <p className="text-[13px] text-[#666] mb-5">
            We sent a confirmation link to <strong>{email}</strong>. Click the link to verify your account.
          </p>
          <Link href="/auth/login" className="text-[13px] text-[#c8102e] font-semibold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-[#e0e0e0] rounded-lg p-8">
          <h1 className="text-[22px] font-bold text-[#1a1a1a] mb-1 text-center">Create account</h1>
          <p className="text-[13px] text-[#999] text-center mb-6">Start practicing for IELTS & TOEFL</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#ddd] rounded-full text-[13px] font-semibold text-[#333] hover:bg-[#fafafa] transition-colors mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#e0e0e0]" />
            <span className="text-[11px] text-[#999] font-semibold uppercase">or</span>
            <div className="flex-1 h-px bg-[#e0e0e0]" />
          </div>

          <form onSubmit={handleSignup} className="space-y-3">
            <div>
              <label className="block text-[12px] font-bold text-[#555] uppercase tracking-wide mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-[#ddd] rounded text-[14px] focus:outline-none focus:border-[#c8102e] transition-colors"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#555] uppercase tracking-wide mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-[#ddd] rounded text-[14px] focus:outline-none focus:border-[#c8102e] transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#555] uppercase tracking-wide mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 border border-[#ddd] rounded text-[14px] focus:outline-none focus:border-[#c8102e] transition-colors"
                placeholder="Min. 6 characters"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#c8102e] text-white font-semibold text-[13px] rounded-full hover:bg-[#a50d24] disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-[13px] text-[#666] mt-5">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#c8102e] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
