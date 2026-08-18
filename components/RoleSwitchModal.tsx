"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import BangladeshUpazilaInput, { BDLocation } from "@/components/BangladeshUpazilaInput";

type Category = {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  icon?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: "CUSTOMER" | "PROFESSIONAL";
};

export default function RoleSwitchModal({ isOpen, onClose, targetRole }: Props) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const router = useRouter();

  // If user is CUSTOMER, destination is PROFESSIONAL and vice versa
  const destinationRole = targetRole || (user?.role === "PROFESSIONAL" ? "CUSTOMER" : "PROFESSIONAL");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [area, setArea] = useState("Sirajganj Sadar");
  const [city, setCity] = useState("Sirajganj");
  const [phone, setPhone] = useState("");
  const [yearsExperience, setYearsExperience] = useState<number | "">(2);
  const [ratePerVisit, setRatePerVisit] = useState<number | "">(300);
  const [bio, setBio] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Load existing profile & categories when opening
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError("");

    fetch("/api/auth/set-role")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
          if (data.categories.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(data.categories[0].id);
          }
        }

        if (data.user?.phone) {
          setPhone(data.user.phone);
        }

        if (data.professionalProfile) {
          const prof = data.professionalProfile;
          if (prof.categoryId) setSelectedCategoryId(prof.categoryId);
          if (prof.area) setArea(prof.area);
          if (prof.city) setCity(prof.city);
          if (prof.yearsExperience !== undefined) setYearsExperience(prof.yearsExperience);
          if (prof.ratePerVisit !== undefined) setRatePerVisit(prof.ratePerVisit);
          if (prof.bio) setBio(prof.bio);
          if (prof.latitude) setLatitude(prof.latitude);
          if (prof.longitude) setLongitude(prof.longitude);
        }
      })
      .catch((err) => {
        console.error("Failed to load role details:", err);
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSwitch(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload: Record<string, any> = {
        role: destinationRole,
      };

      if (destinationRole === "PROFESSIONAL") {
        if (!selectedCategoryId) {
          setError(lang === "bn" ? "দয়া করে সার্ভিস ক্যাটাগরি নির্বাচন করুন।" : "Please select your trade category.");
          setSaving(false);
          return;
        }

        payload.professionalData = {
          categoryId: selectedCategoryId,
          area: area.trim() || "Sirajganj Sadar",
          city: city.trim() || "Sirajganj",
          phone: phone.trim() || undefined,
          yearsExperience: yearsExperience === "" ? 1 : Number(yearsExperience),
          ratePerVisit: ratePerVisit === "" ? 300 : Number(ratePerVisit),
          bio: bio.trim(),
          latitude,
          longitude,
        };
      }

      const res = await fetch("/api/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSaving(false);

      if (!res.ok) {
        setError(data.error || "Failed to switch mode. Please try again.");
        return;
      }

      onClose();

      if (destinationRole === "PROFESSIONAL") {
        router.push("/dashboard/professional?welcome=true");
      } else {
        router.push("/dashboard/customer");
      }
      router.refresh();
    } catch {
      setSaving(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs motion-enter">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Minimal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-base">🔄</span>
            <h2 className="font-display font-bold text-sm sm:text-base text-slate-900">
              {destinationRole === "PROFESSIONAL"
                ? lang === "bn"
                  ? "প্রফেশনাল মোড"
                  : "Switch to Professional"
                : lang === "bn"
                ? "ক্লায়েন্ট মোড"
                : "Switch to Client"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Minimal Form Body */}
        <div className="overflow-y-auto py-3 space-y-3 flex-1 pr-1 text-xs">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 font-semibold rounded-lg text-xs">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-6 text-center text-slate-500 font-medium">
              {lang === "bn" ? "তথ্য লোড হচ্ছে..." : "Loading..."}
            </div>
          ) : (
            <form id="role-switch-form" onSubmit={handleSwitch} className="space-y-3">
              {destinationRole === "PROFESSIONAL" ? (
                <>
                  {/* Category Selection */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {lang === "bn" ? "ক্যাটাগরি *" : "Service Category *"}
                    </label>
                    <select
                      required
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {lang === "bn" ? c.nameBn : c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Service Upazila */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {lang === "bn" ? "সার্ভিস এলাকা (উপজেলা) *" : "Service Area (Upazila) *"}
                    </label>
                    <BangladeshUpazilaInput
                      value={area}
                      onChange={(val) => {
                        setArea(val);
                        if (val.includes("Sadar") || val.includes("Belkuchi") || val.includes("Ullapara")) {
                          setCity("Sirajganj");
                        }
                      }}
                      onLocationSelect={(loc: BDLocation) => {
                        setArea(loc.nameEn);
                        setCity(loc.district);
                        if (loc.lat && loc.lng) {
                          setLatitude(loc.lat);
                          setLongitude(loc.lng);
                        }
                      }}
                      className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  {/* Visiting Fee & Experience Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {lang === "bn" ? "ভিজিট ফি (৳) *" : "Visiting Fee (৳) *"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={ratePerVisit}
                        onChange={(e) => setRatePerVisit(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="300"
                        className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {lang === "bn" ? "অভিজ্ঞতা (বছর) *" : "Experience (Yrs) *"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="2"
                        className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Contact Mobile Phone */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {lang === "bn" ? "ফোন নম্বর" : "Contact Phone"}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {lang === "bn" ? "বিবরণ" : "Bio / Notes"}
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={lang === "bn" ? "আপনার কাজের অভিজ্ঞতা..." : "Brief summary of skills..."}
                      className="w-full border border-slate-200 bg-white rounded-lg p-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <p className="font-semibold text-slate-800">
                    {lang === "bn"
                      ? "ক্লায়েন্ট মোডে স্যুইচ করুন।"
                      : "Switch to Client Mode."}
                  </p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {lang === "bn"
                      ? "আপনি টেকনিশিয়ানদের সরাসরি বুকিং এবং কাজের রিভিউ দিতে পারবেন। আপনার প্রফেশনাল তথ্য সংরক্ষিত থাকবে।"
                      : "You can book home services, manage orders, and submit reviews. Your technician listing will remain saved."}
                  </p>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Minimal Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {lang === "bn" ? "বাতিল" : "Cancel"}
          </button>

          <button
            type="submit"
            form="role-switch-form"
            disabled={saving || loading}
            className="bg-slate-900 hover:bg-black text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving
              ? lang === "bn" ? "স্যুইচ হচ্ছে..." : "Switching..."
              : destinationRole === "PROFESSIONAL"
              ? lang === "bn" ? "প্রো মোডে যান" : "Switch to Pro"
              : lang === "bn" ? "ক্লায়েন্ট মোডে যান" : "Switch to Client"}
          </button>
        </div>
      </div>
    </div>
  );
}
