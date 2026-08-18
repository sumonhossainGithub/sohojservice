"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import BrandLogo from "@/components/BrandLogo";
import BangladeshUpazilaInput, { BDLocation } from "@/components/BangladeshUpazilaInput";

type CategoryOption = {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  icon: string;
};

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const defaultRole = params.get("role") === "professional" ? "PROFESSIONAL" : "CUSTOMER";

  // Account Type
  const [role, setRole] = useState<"CUSTOMER" | "PROFESSIONAL">(defaultRole);

  // Common Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Professional-Specific Fields
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [area, setArea] = useState("Sirajganj Sadar");
  const [city, setCity] = useState("Sirajganj");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [yearsExperience, setYearsExperience] = useState<number | "">(2);
  const [ratePerVisit, setRatePerVisit] = useState<number | "">(300);
  const [bio, setBio] = useState("");

  // Status
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Load categories for professional signup
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data);
            setCategoryId(data[0].id);
          }
        }
      } catch {
        // Fallback default categories
      }
    }
    loadCategories();
  }, []);

  async function handleGoogleSignUp() {
    setGoogleLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=/onboarding/role`;
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

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500 text-red-600" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500 text-amber-600" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500 text-blue-600" };
    return { score: 4, label: "Strong", color: "bg-emerald-500 text-emerald-600" };
  };

  const strength = getPasswordStrength();

  function handleLocationSelect(loc: BDLocation) {
    setArea(loc.nameEn);
    if (loc.district) setCity(loc.district);
    if (loc.lat) setLatitude(loc.lat);
    if (loc.lng) setLongitude(loc.lng);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validations
    if (!agreeTerms) {
      setLoading(false);
      setError("Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    if (password !== confirmPassword) {
      setLoading(false);
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (password.length < 6) {
      setLoading(false);
      setError("Password must be at least 6 characters long.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setLoading(false);
      setError("Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX).");
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role,
        ...(role === "PROFESSIONAL"
          ? {
              categoryId: categoryId || (categories[0]?.id ?? undefined),
              area: area.trim(),
              city: city.trim() || "Sirajganj",
              yearsExperience: yearsExperience === "" ? 0 : Number(yearsExperience),
              ratePerVisit: ratePerVisit === "" ? 0 : Number(ratePerVisit),
              bio: bio.trim() || undefined,
            }
          : {}),
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setError(data.error || "Registration failed. Please check your details.");
        return;
      }

      await refresh();
      setLoading(false);

      if (role === "PROFESSIONAL") {
        window.location.href = "/dashboard/professional?welcome=true";
      } else {
        window.location.href = "/dashboard/customer";
      }
    } catch (err: unknown) {
      setLoading(false);
      setError(
        err instanceof Error ? err.message : "Failed to connect to registration service."
      );
    }
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-xl">
        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-200/80 space-y-6 motion-enter">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex justify-center mb-1">
              <BrandLogo compact />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Join SohojService — Sirajganj&apos;s leading local service marketplace
            </p>
          </div>

          {/* PRIMARY HERO ACTION: CONTINUE WITH GOOGLE */}
          <div>
            <button
              type="button"
              disabled={googleLoading || loading}
              onClick={handleGoogleSignUp}
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
                  <span>Sign Up with Google (1-Click)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
              ⚡ Select your role (Customer or Pro) right after Google login
            </p>
          </div>

          {/* Quick Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Or register with phone / password
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setRole("CUSTOMER")}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl transition-all text-center cursor-pointer ${
                role === "CUSTOMER"
                  ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900 font-semibold"
              }`}
            >
              <span className="text-xl mb-1">🙋</span>
              <span className="text-xs sm:text-sm font-extrabold">I Need a Service</span>
              <span className="text-[10px] text-slate-400 font-normal">Hire verified technicians</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("PROFESSIONAL")}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl transition-all text-center cursor-pointer ${
                role === "PROFESSIONAL"
                  ? "bg-white text-emerald-700 shadow-md ring-1 ring-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900 font-semibold"
              }`}
            >
              <span className="text-xl mb-1">🛠️</span>
              <span className="text-xs sm:text-sm font-extrabold">I Offer a Service</span>
              <span className="text-[10px] text-slate-400 font-normal">Get daily customer jobs</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Md. Sumon Hossain"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-bold text-slate-500 pointer-events-none">
                    🇧🇩 +88
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-16 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Professional Specific Fields */}
            {role === "PROFESSIONAL" && (
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-4 motion-enter">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  <span>🛠️</span> Professional Profile Setup
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Service Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-emerald-600 focus:outline-none cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nameEn} ({cat.nameBn})
                        </option>
                      ))}
                      {categories.length === 0 && (
                        <>
                          <option value="electrician">Electrician (ইলেকট্রিশিয়ান)</option>
                          <option value="plumber">Plumber (প্লাম্বার)</option>
                          <option value="ac-repair">AC & Refrigerator Repair</option>
                          <option value="appliance">Home Appliance</option>
                          <option value="painter">House Painter</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Service Area & District <span className="text-red-500">*</span>
                    </label>
                    <BangladeshUpazilaInput
                      required
                      value={area}
                      onChange={setArea}
                      onLocationSelect={handleLocationSelect}
                      placeholder="Search district or upazila (e.g. Sirajganj Sadar, Dhanmondi, Bogura...)"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                      showGpsButton={true}
                    />
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                      {city ? `District: ${city}` : "All 64 districts & 495+ upazilas supported"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 2"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Visiting Fee (BDT ৳)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={ratePerVisit}
                      onChange={(e) => setRatePerVisit(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 300"
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Short Bio & Expertise (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. Expert in house wiring, IPS installation, fan & motor repair..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none resize-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
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

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={`w-full rounded-xl border bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:outline-none transition-all ${
                    confirmPassword && password !== confirmPassword
                      ? "border-red-400 focus:border-red-600 focus:ring-red-100"
                      : confirmPassword && password === confirmPassword
                      ? "border-emerald-400 focus:border-emerald-600 focus:ring-emerald-100"
                      : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
                  }`}
                />
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Password Strength:</span>
                  <span className={`font-bold ${strength.color.split(" ")[1]}`}>
                    {strength.label}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`rounded-full transition-all duration-300 ${
                        step <= strength.score ? strength.color.split(" ")[0] : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                I agree to the{" "}
                <span className="font-bold text-slate-800 hover:underline">Terms of Service</span>{" "}
                and{" "}
                <span className="font-bold text-slate-800 hover:underline">Privacy Policy</span>.
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-xs text-red-900 bg-red-50 border border-red-200 p-3.5 rounded-xl font-bold flex items-start gap-2 motion-enter">
                <span className="text-sm shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className={`w-full text-white font-extrabold text-sm py-3.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
                role === "PROFESSIONAL"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/20 hover:shadow-emerald-500/30"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20 hover:shadow-blue-500/30"
              }`}
            >
              {loading
                ? "Creating account..."
                : role === "PROFESSIONAL"
                ? "Register as Service Professional →"
                : "Create Free Customer Account →"}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-2 text-center border-t border-slate-100">
            <p className="text-xs text-slate-600 font-medium">
              Already registered on SohojService?{" "}
              <Link href="/login" className="text-blue-600 font-bold hover:underline">
                Sign In here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center text-sm text-slate-400">
          Loading registration...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
