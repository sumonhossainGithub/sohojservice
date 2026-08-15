"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import BrandLogo from "@/components/BrandLogo";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const defaultRole = params.get("role") === "professional" ? "PROFESSIONAL" : "CUSTOMER";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "PROFESSIONAL">(defaultRole);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, role, photoUrl }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong.");
      return;
    }

    await refresh();
    router.push(role === "PROFESSIONAL" ? "/dashboard/professional" : "/dashboard/customer");
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
            Create an Account
          </h1>
          <p className="text-xs text-slate-500">
            100% Free for everyone — no hidden fees to book or list services
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Full Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sumon Hossain"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-teal)] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Phone Number (Optional)
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-teal)] focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Password (Min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
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
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100 text-xs text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[var(--color-teal)] hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-16 text-center text-sm">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
