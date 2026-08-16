"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import BrandLogo from "@/components/BrandLogo";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const defaultRole = params.get("role") === "professional" ? "PROFESSIONAL" : "CUSTOMER";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "PROFESSIONAL">(defaultRole);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Verification state
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const cleanEmail = email.trim().toLowerCase();

      // Sign up with Supabase Auth (enforces email verification)
      const { data, error: supaError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: name.trim(),
            name: name.trim(),
            phone: phone.trim() || null,
            role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        },
      });

      if (supaError) {
        setLoading(false);
        setError(supaError.message || "Failed to create account. Please try again.");
        return;
      }

      // If user requires email confirmation (session is null or identities unconfirmed)
      if (data.user && !data.session) {
        setLoading(false);
        setEmailSentTo(cleanEmail);
        startCooldown();
        return;
      }

      // If already confirmed or session returned directly, sync to DB
      const syncRes = await fetch("/api/auth/sync", { method: "POST" });
      setLoading(false);

      if (!syncRes.ok) {
        setError("Account created, but database session sync failed. Please log in.");
        return;
      }

      await refresh();
      router.push(role === "PROFESSIONAL" ? "/dashboard/professional" : "/dashboard/customer");
      router.refresh();
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Something went wrong during registration.");
    }
  }

  function startCooldown() {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleResendEmail() {
    if (!emailSentTo || resendCooldown > 0) return;
    try {
      setResendMsg("");
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailSentTo,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setResendMsg("Verification email resent! Please check your inbox.");
        startCooldown();
      }
    } catch {
      setError("Failed to resend verification email.");
    }
  }

  // Render "Email Verification Sent" confirmation screen
  if (emailSentTo) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 motion-enter">
        <div className="signplate p-8 bg-white shadow-xl border border-slate-200 space-y-6 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl font-extrabold text-slate-900">
              Verify Your Email
            </h1>
            <p className="text-sm text-slate-600">
              We sent a verification link to:
            </p>
            <p className="text-sm font-bold text-slate-900 bg-slate-100 py-1.5 px-3 rounded-lg inline-block break-all">
              {emailSentTo}
            </p>
            <p className="text-xs text-slate-500 pt-2">
              Please click the link inside your email to activate your account. Check your Spam or Promotions folder if you don&apos;t see it.
            </p>
          </div>

          {resendMsg && (
            <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl font-bold">
              {resendMsg}
            </p>
          )}

          {error && (
            <p className="text-xs text-red-900 bg-red-50 border border-red-300 p-2.5 rounded-xl font-bold">
              {error}
            </p>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resendCooldown > 0}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              {resendCooldown > 0
                ? `Resend Email in ${resendCooldown}s`
                : "Resend Verification Email"}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setEmailSentTo(null)}
                className="text-slate-600 hover:text-slate-900 font-medium underline cursor-pointer"
              >
                ← Change email address
              </button>
              <Link href="/login" className="text-blue-700 font-bold hover:underline">
                Go to Login →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 motion-enter">
      <div className="signplate p-8 bg-white shadow-xl border border-slate-200 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block mb-1">
            <BrandLogo compact />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--color-ink)]">
            Create an Account
          </h1>
          <p className="text-xs text-slate-500">
            100% Free for everyone — verified emails ensure safe local services
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setRole("CUSTOMER")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              role === "CUSTOMER"
                ? "bg-white text-[var(--color-teal)] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🙋 I Need a Service
          </button>
          <button
            type="button"
            onClick={() => setRole("PROFESSIONAL")}
            className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              role === "PROFESSIONAL"
                ? "bg-white text-[var(--color-teal)] shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🛠️ I Offer a Service
          </button>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-3">
          <GoogleAuthButton
            text={`Sign up with Google as ${role === "PROFESSIONAL" ? "Pro" : "Customer"}`}
            role={role}
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sumon Hossain"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
              Real Email Address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              We&apos;ll send a verification link to confirm this email.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
              Phone Number (Optional)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
              Password (Min 6 characters) <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-red-900 bg-red-50 border border-red-300 p-3 rounded-xl font-bold">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Sending verification email..." : "Sign Up with Email"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-700 font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-16 text-center text-sm">Loading...</div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
