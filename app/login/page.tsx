"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import BrandLogo from "@/components/BrandLogo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const callbackUrl = params.get("callbackUrl") || "";
  const paramError = params.get("error");
  const paramMsg = params.get("message");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(paramError || "");
  const [info, setInfo] = useState(paramMsg || "");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Detect whether user is typing an email or mobile number for UX feedback
  const isEmail = identifier.includes("@");
  const isPhone = !isEmail && identifier.trim().length > 0 && /^[0-9+-\s()]+$/.test(identifier);

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(callbackUrl || "/")}`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            prompt: "select_account",
            access_type: "offline",
          },
        },
      });

      if (authError) {
        setGoogleLoading(false);
        setError(authError.message || "Failed to initialize Google sign in.");
      }
    } catch (err: unknown) {
      setGoogleLoading(false);
      setError(err instanceof Error ? err.message : "Failed to connect to Google authentication.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setError(data.error || "Incorrect email/mobile number or password.");
        return;
      }

      await refresh();
      setLoading(false);

      if (callbackUrl && !callbackUrl.includes("/login") && !callbackUrl.includes("/register")) {
        window.location.href = callbackUrl;
      } else if (data.user?.role === "PROFESSIONAL") {
        window.location.href = "/dashboard/professional";
      } else if (data.user?.role === "ADMIN") {
        window.location.href = "/dashboard/admin";
      } else {
        window.location.href = "/";
      }
    } catch (err: unknown) {
      setLoading(false);
      setError(
        err instanceof Error ? err.message : "Failed to connect to authentication service."
      );
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-200/80 space-y-6 motion-enter">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex justify-center mb-1">
              <BrandLogo compact />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome to SohojService
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Sign in to book local technicians or manage your services
            </p>
          </div>

          {/* Alerts */}
          {info && (
            <div className="text-xs text-blue-900 bg-blue-50 border border-blue-200 p-3.5 rounded-xl font-medium flex items-center gap-2">
              <span>ℹ️</span> {info}
            </div>
          )}

          {error && (
            <div className="text-xs text-red-900 bg-red-50 border border-red-200 p-3.5 rounded-xl font-bold flex items-start gap-2">
              <span className="text-sm shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* PRIMARY HERO ACTION: CONTINUE WITH GOOGLE */}
          <div>
            <button
              type="button"
              disabled={googleLoading || loading}
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm py-3.5 px-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-3"
            >
              {googleLoading ? (
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  Connecting to Google...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
              ⚡ Instant 1-click login & registration
            </p>
          </div>

          {/* Quick Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Or sign in with mobile / email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Identifier (Email or Phone) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Email or Mobile Number
                </label>
                {identifier.trim() && (
                  <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {isEmail ? "📧 Email" : isPhone ? "📱 Mobile" : "Account ID"}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. you@gmail.com or 017XXXXXXXX"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In with Password"}
            </button>
          </form>

          {/* Quick Registration Footer */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-xs text-slate-600 font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-blue-600 font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center text-sm text-slate-400">
          Loading login...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
