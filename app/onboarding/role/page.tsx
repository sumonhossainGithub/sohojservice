"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import BrandLogo from "@/components/BrandLogo";
import BangladeshUpazilaInput, { BDLocation } from "@/components/BangladeshUpazilaInput";

type CategoryOption = {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  icon: string;
};

function RoleSelectionContent() {
  const router = useRouter();
  const { user, refresh, status } = useAuth();

  const [selectedRole, setSelectedRole] = useState<"CUSTOMER" | "PROFESSIONAL" | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [area, setArea] = useState("Sirajganj Sadar");
  const [city, setCity] = useState("Sirajganj");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [yearsExperience, setYearsExperience] = useState<number | "">(2);
  const [ratePerVisit, setRatePerVisit] = useState<number | "">(300);
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        // Ignore fallback
      }
    }
    loadCategories();
  }, []);

  function handleLocationSelect(loc: BDLocation) {
    setArea(loc.nameEn);
    if (loc.district) setCity(loc.district);
    if (loc.lat) setLatitude(loc.lat);
    if (loc.lng) setLongitude(loc.lng);
  }

  async function handleConfirmRole(role: "CUSTOMER" | "PROFESSIONAL") {
    setLoading(true);
    setError("");

    try {
      const payload: {
        role: "CUSTOMER" | "PROFESSIONAL";
        professionalData?: {
          categoryId: string;
          area: string;
          city: string;
          yearsExperience: number;
          ratePerVisit: number;
          bio?: string;
          latitude?: number | null;
          longitude?: number | null;
        };
      } = {
        role,
      };

      if (role === "PROFESSIONAL") {
        payload.professionalData = {
          categoryId: categoryId || (categories[0]?.id ?? ""),
          area: area.trim() || "Sirajganj Sadar",
          city: city.trim() || "Sirajganj",
          yearsExperience: yearsExperience === "" ? 0 : Number(yearsExperience),
          ratePerVisit: ratePerVisit === "" ? 0 : Number(ratePerVisit),
          bio: bio.trim() || undefined,
          latitude: latitude,
          longitude: longitude,
        };
      }

      const res = await fetch("/api/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        setError(data.error || "Failed to save role. Please try again.");
        return;
      }

      await refresh();
      setLoading(false);

      if (role === "PROFESSIONAL") {
        window.location.href = "/dashboard/professional?welcome=true";
      } else {
        window.location.href = "/dashboard/customer?welcome=true";
      }
    } catch {
      setLoading(false);
      setError("Network connection error. Please try again.");
    }
  }

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-slate-50 via-purple-50/20 to-white">
      <div className="w-full max-w-2xl space-y-6 motion-enter">
        {/* Top Header Card */}
        <div className="text-center space-y-3">
          <div className="inline-flex justify-center mb-1">
            <BrandLogo compact />
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How would you like to use SohojService?
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {user ? (
              <span>
                Signed in as <strong className="text-slate-900">{user.name}</strong> ({user.email})
              </span>
            ) : (
              "Select your account role to personalize your experience"
            )}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* 2 Main Role Choice Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* OPTION 1: CUSTOMER */}
          <div
            onClick={() => setSelectedRole("CUSTOMER")}
            className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 cursor-pointer group ${
              selectedRole === "CUSTOMER"
                ? "bg-blue-50/70 border-blue-600 shadow-xl shadow-blue-500/10 ring-4 ring-blue-100"
                : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md"
            }`}
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                🙋
              </div>
              <div>
                <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider bg-blue-100/70 px-2.5 py-0.5 rounded-full">
                  Client · সেবা গ্রহীতা
                </span>
                <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 mt-1.5">
                  I Need a Service
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Hire verified local technicians in Sirajganj and all across Bangladesh for home repairs, plumbing, electrician, AC servicing, and appliance fixes.
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <span className="text-blue-600 font-bold">✓</span> 1-Click Instant Emergency Booking
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-blue-600 font-bold">✓</span> Transparent Pricing & Verified Reviews
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-blue-600 font-bold">✓</span> Live Technician Status Tracking
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                handleConfirmRole("CUSTOMER");
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-4 rounded-2xl transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{loading && selectedRole === "CUSTOMER" ? "Setting up..." : "Join as Client →"}</span>
            </button>
          </div>

          {/* OPTION 2: PROFESSIONAL */}
          <div
            onClick={() => setSelectedRole("PROFESSIONAL")}
            className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 cursor-pointer group ${
              selectedRole === "PROFESSIONAL"
                ? "bg-emerald-50/70 border-emerald-600 shadow-xl shadow-emerald-500/10 ring-4 ring-emerald-100"
                : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md"
            }`}
          >
            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                🛠️
              </div>
              <div>
                <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                  Professional · কারিগর
                </span>
                <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 mt-1.5">
                  I Offer a Service
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Join as a technician or service provider to get daily customer jobs, build your local reputation, and grow your income.
                </p>
              </div>

              <ul className="text-xs text-slate-600 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span> Direct Customer Job Requests
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span> Public Verified Profile Listing
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span> Set Your Own Visiting Rates
                </li>
              </ul>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRole("PROFESSIONAL");
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 px-4 rounded-2xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Join as Professional →</span>
            </button>
          </div>
        </div>

        {/* EXPANDED PROFESSIONAL SETUP (When Professional is selected) */}
        {selectedRole === "PROFESSIONAL" && (
          <div className="p-6 bg-white rounded-3xl border border-emerald-300 shadow-lg shadow-emerald-500/5 space-y-4 motion-enter">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛠️</span>
                <div>
                  <h3 className="font-display font-extrabold text-base text-slate-900">
                    Quick Professional Setup
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure your trade and primary service location</p>
                </div>
              </div>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                Step 2 of 2
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Category */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Primary Trade / Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border border-slate-300 bg-white rounded-xl p-3 font-bold text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn} ({c.nameBn})
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <option value="">Loading categories...</option>
                  )}
                </select>
              </div>

              {/* Dynamic Bangladesh Upazila & Jela Searchable Input */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Primary Service Area & District <span className="text-red-500">*</span>
                </label>
                <BangladeshUpazilaInput
                  required
                  value={area}
                  onChange={setArea}
                  onLocationSelect={handleLocationSelect}
                  placeholder="Search any district or upazila (e.g. Sirajganj Sadar, Dhanmondi, Bogura...)"
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                  showGpsButton={true}
                />
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  {city ? `Selected District (জেলা): ${city}` : "Search all 64 districts and 495+ upazilas"}
                </p>
              </div>

              {/* Experience */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Experience (Years)</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 2"
                  className="w-full border border-slate-300 bg-white rounded-xl p-3 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                />
              </div>

              {/* Rate */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Visiting Fee (BDT ৳)</label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={ratePerVisit}
                  onChange={(e) => setRatePerVisit(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 300"
                  className="w-full border border-slate-300 bg-white rounded-xl p-3 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none"
                />
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-800 block mb-1">
                  Short Bio / Specialization (Optional)
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Expert in house wiring, motor servicing, plumbing, IPS and pump repair..."
                  className="w-full border border-slate-300 bg-white rounded-xl p-3 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleConfirmRole("PROFESSIONAL")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <span>{loading ? "Creating Profile..." : "✓ Complete & Go to Dashboard"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingRolePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center text-sm text-slate-400">
          Loading onboarding...
        </div>
      }
    >
      <RoleSelectionContent />
    </Suspense>
  );
}
