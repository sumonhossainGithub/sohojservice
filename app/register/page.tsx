"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, role }),
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
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-2xl font-extrabold mb-2">Create an account</h1>
      <p className="text-sm text-[var(--color-ink)]/70 mb-6">
        Free for everyone — no fees to book or list your services.
      </p>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setRole("CUSTOMER")}
          className={`flex-1 rounded-lg border-2 border-[var(--color-ink)] py-2 text-sm font-semibold ${
            role === "CUSTOMER" ? "bg-[var(--color-teal)] text-white" : "bg-white"
          }`}
        >
          I need a service
        </button>
        <button
          type="button"
          onClick={() => setRole("PROFESSIONAL")}
          className={`flex-1 rounded-lg border-2 border-[var(--color-ink)] py-2 text-sm font-semibold ${
            role === "PROFESSIONAL" ? "bg-[var(--color-teal)] text-white" : "bg-white"
          }`}
        >
          I offer a service
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-2 border-[var(--color-ink)] rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-[var(--color-ink)] rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="w-full border-2 border-[var(--color-ink)] rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-[var(--color-ink)] rounded-lg px-3 py-2"
          />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="signplate bg-[var(--color-marigold)] w-full py-2 font-semibold disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="text-sm mt-4">
        Already have an account?{" "}
        <Link href="/login" className="underline font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
