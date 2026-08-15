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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Incorrect email or password.");
      return;
    }

    await refresh();
    router.push(params.get("callbackUrl") || "/");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 motion-enter">
      <div className="signplate p-8 bg-white shadow-xl border border-slate-200 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block mb-1">
            <BrandLogo compact />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-[var(--color-ink)]">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to manage your bookings and account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-teal)] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-teal)] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-lg font-medium">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-marigold)] hover:bg-[var(--color-marigold-light)] text-[var(--color-ink)] py-3 font-extrabold text-sm rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Signing in..." : "Log in"}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100 text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-[var(--color-teal)] hover:underline">
            Sign up for free
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16 text-center text-sm">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
