"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import BrandLogo from "@/components/BrandLogo";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const callbackUrl = params.get("callbackUrl") || "";
  const paramError = params.get("error");
  const paramMsg = params.get("message");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(paramError || "");
  const [info, setInfo] = useState(paramMsg || "");
  const [loading, setLoading] = useState(false);

  // Email unconfirmed state
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    setUnconfirmedEmail(null);
    setResendSuccess(false);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const supabase = createClient();

      // 1. Attempt Supabase Auth
      const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (supaError) {
        // If email not confirmed in Supabase
        if (
          supaError.message.toLowerCase().includes("email not confirmed") ||
          supaError.message.toLowerCase().includes("unconfirmed")
        ) {
          setLoading(false);
          setUnconfirmedEmail(cleanEmail);
          setError("Your email address is not verified yet. Please check your inbox or resend the verification link below.");
          return;
        }

        // 2. If Supabase fails, try existing backend password login (e.g. for seeded admin or legacy accounts)
        const localRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password }),
        });

        if (localRes.ok) {
          await refresh();
          setLoading(false);
          router.push(callbackUrl || "/");
          router.refresh();
          return;
        }

        setLoading(false);
        setError("Incorrect email or password. Please try again.");
        return;
      }

      // 3. Supabase login succeeded -> sync user to database and create session
      if (supaData.session) {
        const syncRes = await fetch("/api/auth/sync", { method: "POST" });
        if (!syncRes.ok) {
          setLoading(false);
          setError("Login succeeded, but database session creation failed. Please try again.");
          return;
        }

        await refresh();
        setLoading(false);
        router.push(callbackUrl || "/");
        router.refresh();
      }
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during sign in.");
    }
  }

  async function handleResendVerification() {
    if (!unconfirmedEmail || resending) return;
    setResending(true);
    setResendSuccess(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: unconfirmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      setResending(false);
      if (error) {
        setError(error.message);
      } else {
        setResendSuccess(true);
      }
    } catch {
      setResending(false);
      setError("Failed to resend confirmation email.");
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 motion-enter">
      <div className="signplate p-8 bg-white shadow-xl border border-slate-200 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block mb-1">
            <BrandLogo compact />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            Sign in to manage your bookings and account
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-3">
          <GoogleAuthButton
            text="Continue with Google"
            callbackUrl={callbackUrl}
            onError={(msg) => setError(msg)}
          />

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Or with email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
          </div>

          {info && (
            <p className="text-xs text-blue-900 bg-blue-50 border border-blue-200 p-3 rounded-xl font-bold">
              {info}
            </p>
          )}

          {error && (
            <div className="text-xs text-red-900 bg-red-50 border border-red-300 p-3 rounded-xl font-bold space-y-2">
              <p>{error}</p>
              {unconfirmedEmail && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="mt-1 inline-block text-xs bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded-lg font-bold cursor-pointer disabled:opacity-50"
                >
                  {resending ? "Sending..." : "Resend Verification Email"}
                </button>
              )}
            </div>
          )}

          {resendSuccess && (
            <p className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-300 p-3 rounded-xl font-bold">
              Verification email resent! Please check your inbox.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 font-medium">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-700 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-16 text-center text-sm">Loading...</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
