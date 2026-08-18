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

  // If user is CUSTOMER, default destination is PROFESSIONAL and vice versa
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
          setError(lang === "bn" ? "দয়া করে সার্ভিস ক্যাটাগরি নির্বাচন করুন।" : "Please select your service trade category.");
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
        setError(data.error || "Failed to switch role. Please try again.");
        return;
      }

      onClose();

      // Redirect to target dashboard
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs motion-enter">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 sm:p-6 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center text-xl font-bold">
              🔄
            </span>
            <div>
              <h2 className="font-display font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                {destinationRole === "PROFESSIONAL"
                  ? lang === "bn"
                    ? "প্রফেশনাল মোডে স্যুইচ করুন"
                    : "Switch to Professional Mode"
                  : lang === "bn"
                  ? "কাস্টমার মোডে স্যুইচ করুন"
                  : "Switch to Customer Mode"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {destinationRole === "PROFESSIONAL"
                  ? lang === "bn"
                    ? "আপনার কাজের তথ্য যোগ করে টেকনিশিয়ান হিসেবে সেবা দিন"
                    : "Offer your trade services & manage bookings"
                  : lang === "bn"
                  ? "সেবা গ্রহণ এবং বুকিং করতে কাস্টমার অ্যাকাউন্টে যান"
                  : "Book services and hire local verified technicians"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto py-3 space-y-4 flex-1 pr-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-slate-500 font-medium">
              {lang === "bn" ? "প্রোফাইল লোড হচ্ছে..." : "Loading account details..."}
            </div>
          ) : (
            <form id="role-switch-form" onSubmit={handleSwitch} className="space-y-4">
              {destinationRole === "PROFESSIONAL" ? (
                <>
                  {/* Category Selection */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      {lang === "bn" ? "আপনার সার্ভিস ক্যাটাগরি / পেশা *" : "Service Category / Trade *"}
                    </label>
                    <select
                      required
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {lang === "bn" ? c.nameBn : c.nameEn} ({c.nameEn})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Service Upazila */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      {lang === "bn" ? "প্রধান সেবা প্রদানের এলাকা (উপজেলা) *" : "Primary Service Area (Upazila) *"}
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
                      className="w-full border border-slate-300 bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  {/* Visiting Fee & Experience Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        {lang === "bn" ? "ভিজিটিং চার্জ (৳ টাকা) *" : "Visiting Rate (BDT ৳) *"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={ratePerVisit}
                        onChange={(e) => setRatePerVisit(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="300"
                        className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">
                        {lang === "bn" ? "অভিজ্ঞতা (বছর) *" : "Experience (Years) *"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="2"
                        className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Contact Mobile Phone */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      {lang === "bn" ? "মোবাইল নম্বর (বুকিং গ্রহণের জন্য)" : "Contact Mobile Phone"}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      {lang === "bn" ? "সংক্ষিপ্ত বিবরণ / পরিচিতি" : "Professional Bio / Skills"}
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder={
                        lang === "bn"
                          ? "আপনার কাজের অভিজ্ঞতা এবং দক্ষতা সংক্ষেপে লিখুন..."
                          : "Brief summary of your technician background and expertise..."
                      }
                      className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🙋</span>
                    <div>
                      <h3 className="font-bold text-sm text-blue-950">
                        {lang === "bn" ? "কাস্টমার মোডে পরিবর্তন করুন" : "Switch to Customer Mode"}
                      </h3>
                      <p className="text-xs text-blue-800">
                        {lang === "bn"
                          ? "আপনি যখন খুশি আবার প্রফেশনাল মোডে ফিরে আসতে পারবেন। আপনার পূর্বের কাজের তথ্য সংরক্ষিত থাকবে।"
                          : "You can return to Professional mode anytime without losing your technician profile or history."}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-1.5 text-xs text-blue-900 font-medium pl-6 list-disc">
                    <li>{lang === "bn" ? "ইনস্ট্যান্ট ও শিডিউল বুকিং করুন" : "Request Instant & Scheduled emergency bookings"}</li>
                    <li>{lang === "bn" ? "কাজের রেটিং ও রিভিউ দিন" : "Submit ratings and feedback for technicians"}</li>
                    <li>{lang === "bn" ? "বুকিং হিস্টোরি ট্র্যাক করুন" : "Manage and track personal service requests"}</li>
                  </ul>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            {lang === "bn" ? "বাতিল" : "Cancel"}
          </button>

          <button
            type="submit"
            form="role-switch-form"
            disabled={saving || loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {saving ? (
              <span>⏳ {lang === "bn" ? "স্যুইচ হচ্ছে..." : "Switching..."}</span>
            ) : destinationRole === "PROFESSIONAL" ? (
              <span>🚀 {lang === "bn" ? "প্রফেশনাল মোডে যান" : "Launch Pro Mode"}</span>
            ) : (
              <span>✓ {lang === "bn" ? "কাস্টমার মোডে যান" : "Switch to Customer"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
