"use client";

import { useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"REQUEST" | "VERIFY" | "SUCCESS">("REQUEST");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfoMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Failed to process reset request.");
        return;
      }

      setEmail(data.email);
      if (data.resetCode) {
        setCode(data.resetCode);
      }
      setInfoMessage(data.message || "Verification code generated!");
      setStep("VERIFY");
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }

      setStep("SUCCESS");
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 motion-enter">
      <div className="p-8 bg-white shadow-xl rounded-3xl border border-slate-200 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block mb-1">
            <BrandLogo compact />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900">
            {step === "SUCCESS" ? "Password Reset Complete" : "Reset Your Password"}
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            {step === "REQUEST"
              ? "Enter your registered email to receive a password reset verification code."
              : step === "VERIFY"
              ? `Enter the 6-digit code and your new password for ${email}.`
              : "Your account password has been updated securely."}
          </p>
        </div>

        {/* Security Warning Badge: Admin Accounts are protected */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-[11px] font-semibold flex items-center gap-2">
          <span>🛡️</span>
          <span>Security Policy: Admin passwords cannot be reset via public portal.</span>
        </div>

        {error && (
          <p className="text-xs text-red-900 bg-red-50 border border-red-300 p-3 rounded-xl font-bold">
            ⚠️ {error}
          </p>
        )}

        {infoMessage && step === "VERIFY" && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-bold space-y-1">
            <p>🔑 Verification Code: <span className="font-mono text-sm font-black bg-white px-2 py-0.5 rounded border border-blue-300 tracking-wider">{code}</span></p>
            <p className="text-[11px] text-blue-700 font-medium">Valid for 15 minutes.</p>
          </div>
        )}

        {/* STEP 1: Request Verification Code */}
        {step === "REQUEST" && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                Registered Email Address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sujon@gmail.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Checking email..." : "Send Reset Code →"}
            </button>
          </form>
        )}

        {/* STEP 2: Enter Code & New Password */}
        {step === "VERIFY" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                6-Digit Verification Code <span className="text-red-600">*</span>
              </label>
              <input
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono text-center tracking-widest text-slate-900 font-bold focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                New Password (Min 6 characters) <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                Confirm New Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep("REQUEST");
                  setError("");
                }}
                className="w-1/3 border border-slate-300 text-slate-700 font-bold text-xs py-3 rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Updating..." : "Set New Password"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === "SUCCESS" && (
          <div className="text-center space-y-4 py-4">
            <span className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-3xl mx-auto font-bold shadow-xs">
              ✓
            </span>
            <p className="text-sm font-bold text-slate-800">
              Your password has been successfully reset!
            </p>
            <Link
              href="/login"
              className="inline-block w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              Sign In Now →
            </Link>
          </div>
        )}

        <div className="pt-2 text-center border-t border-slate-100 text-xs text-slate-600 font-medium">
          Remember your password?{" "}
          <Link href="/login" className="text-blue-700 font-bold hover:underline">
            Back to Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
