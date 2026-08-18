"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
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

  // Detect whether user is typing an email or mobile number for UX feedback
  const isEmail = identifier.includes("@");
  const isPhone = !isEmail && identifier.trim().length > 0 && /^[0-9+-\s()]+$/.test(identifier);

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
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-200/80 space-y-6 motion-enter">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex justify-center mb-1">
              <BrandLogo compact />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Sign in with your email or mobile number to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Identifier (Email or Phone) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Email or Mobile Number
                </label>
                {identifier.trim() && (
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
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
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400">
                  {isEmail ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Signing in..." : "Sign In to SohojService"}
            </button>
          </form>

          {/* Quick Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              New to SohojService?
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Registration Options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <Link
              href="/register?role=customer"
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-center group cursor-pointer"
            >
              <span className="text-lg mb-1">🙋</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                Join as Customer
              </span>
              <span className="text-[10px] text-slate-400">Book services</span>
            </Link>

            <Link
              href="/register?role=professional"
              className="flex flex-col items-center justify-center p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-center group cursor-pointer"
            >
              <span className="text-lg mb-1">🛠️</span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                Join as Professional
              </span>
              <span className="text-[10px] text-slate-400">Offer services</span>
            </Link>
          </div>

          {/* Trust Footer */}
          <div className="pt-2 text-center border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">🔒 100% Secure</span>
            <span>•</span>
            <span className="flex items-center gap-1">🛡️ Verified Pros</span>
            <span>•</span>
            <span className="flex items-center gap-1">⚡ Fast Support</span>
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
