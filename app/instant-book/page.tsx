"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import BangladeshUpazilaInput from "@/components/BangladeshUpazilaInput";

const SERVICE_OPTIONS = [
  { slug: "electrician", nameEn: "Electrician / Electrical Work", nameBn: "ইলেকট্রিশিয়ান / বৈদ্যুতিক কাজ" },
  { slug: "plumber", nameEn: "Plumber / Pipe & Sanitary", nameBn: "প্লাম্বার / পাইপ ও সেনিটারি" },
  { slug: "ac-repair", nameEn: "AC Repair & Servicing", nameBn: "এসি মেরামত ও সার্ভিসিং" },
  { slug: "painter", nameEn: "Painter / Home Painting", nameBn: "পেইন্টার / রং মিস্ত্রি" },
  { slug: "carpenter", nameEn: "Carpenter / Furniture Repair", nameBn: "কাঠমিস্ত্রি / ফার্নিচার মেরামত" },
  { slug: "cleaning", nameEn: "Home & Office Deep Cleaning", nameBn: "বাড়ি ও অফিস ক্লিনিং" },
  { slug: "tutor", nameEn: "Home Tutor / Teacher", nameBn: "হোম টিউটর / শিক্ষক" },
  { slug: "cctv", nameEn: "CCTV & Security Tech", nameBn: "সিসিটিভি ও সিকিউরিটি" },
  { slug: "internet-tech", nameEn: "WiFi / Internet Technician", nameBn: "ওয়াইফাই ও ইন্টারনেট মিস্ত্রি" },
  { slug: "mechanic", nameEn: "Motorbike / Home Appliance Mechanic", nameBn: "মেকানিক ও হোম অ্যাপ্লায়েন্স" },
  { slug: "other", nameEn: "Other Skilled Service", nameBn: "অন্যান্য কারিগরি সেবা" },
];

export default function InstantBookPage() {
  const { lang, t } = useLanguage();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [categoryName, setCategoryName] = useState("Electrician / Electrical Work");
  const [problemDescription, setProblemDescription] = useState("");
  const [area, setArea] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [urgency, setUrgency] = useState<"ASAP" | "TODAY" | "FLEXIBLE">("ASAP");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedBooking, setSubmittedBooking] = useState<any | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/instant-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          categoryName,
          problemDescription,
          area,
          fullAddress,
          urgency,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Failed to submit request. Please try again.");
        return;
      }

      setSubmittedBooking(data.booking);
    } catch {
      setLoading(false);
      setError("Network error. Please check your connection.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 motion-enter">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-800 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          <span>{lang === "bn" ? "জরুরি সার্ভিস হেল্পডেস্ক" : "Emergency Concierge Service"}</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
          {lang === "bn" ? "ইনস্ট্যান্ট সেবা অনুরোধ" : "Instant Service Booking"}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto font-medium">
          {lang === "bn"
            ? "কোনো অ্যাকাউন্ট বা রেজিস্ট্রেশন লাগবে না। আপনার কাজের বিবরণ দিন — আমাদের অ্যাডমিন টিম সরাসরি আপনার এলাকার সেরা যাচাইকৃত টেকনিশিয়ান নির্ধারণ করে ফোনে কনফার্ম করবে।"
            : "No registration required. Submit your requirements in seconds — our support team will match and dispatch the top verified technician in your area."}
        </p>
      </div>

      {/* Trust Highlights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-8">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center space-y-1">
          <p className="text-xs font-bold text-slate-900">{lang === "bn" ? "দ্রুত কলব্যাক" : "Fast Callback"}</p>
          <p className="text-[11px] text-slate-500 font-medium">{lang === "bn" ? "১৫-৩০ মিনিটে যোগাযোগ" : "Within 15-30 minutes"}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center space-y-1">
          <p className="text-xs font-bold text-slate-900">{lang === "bn" ? "যাচাইকৃত টেকনিশিয়ান" : "Verified Technicians"}</p>
          <p className="text-[11px] text-slate-500 font-medium">{lang === "bn" ? "আইডি ও অভিজ্ঞতা চেকড" : "Background checked"}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center space-y-1">
          <p className="text-xs font-bold text-slate-900">{lang === "bn" ? "১০০% ফ্রি বুকিং" : "100% Free Booking"}</p>
          <p className="text-[11px] text-slate-500 font-medium">{lang === "bn" ? "কোনো হিডেন ফি নেই" : "No platform charges"}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-center space-y-1">
          <p className="text-xs font-bold text-slate-900">{lang === "bn" ? "লোকাল উপজেলা কভারেজ" : "Local Upazila Match"}</p>
          <p className="text-[11px] text-slate-500 font-medium">{lang === "bn" ? "সরাসরি আপনার এলাকায়" : "Nearest tech assigned"}</p>
        </div>
      </div>

      {/* Main Container */}
      {submittedBooking ? (
        /* Success Screen */
        <div className="bg-white p-8 md:p-12 shadow-xl rounded-3xl border border-slate-200 text-center space-y-6 motion-enter">
          <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center text-2xl mx-auto shadow-2xs text-emerald-700 font-black">
            ✓
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {lang === "bn" ? "অনুরোধ সফলভাবে গ্রহণ করা হয়েছে" : "Request Successfully Received"}
            </span>
            <h2 className="font-display text-2xl font-extrabold text-slate-900">
              {lang === "bn" ? "ধন্যবাদ, " + submittedBooking.customerName + "!" : "Thank You, " + submittedBooking.customerName + "!"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto font-medium leading-relaxed">
              {lang === "bn"
                ? "আমাদের কনসিয়ার্জ টিম আপনার রিকোয়েস্ট পেয়েছে। " + submittedBooking.area + " উপজেলার সেরা টেকনিশিয়ানের সাথে সমন্বয় করে কিছুক্ষণের মধ্যেই আপনার মোবাইল নম্বরে (" + submittedBooking.customerPhone + ") কল করা হবে।"
                : "Our concierge team has received your request. We are matching the top verified technician in " + submittedBooking.area + " and will call you at " + submittedBooking.customerPhone + " shortly to confirm dispatch."}
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">{lang === "bn" ? "ট্র্যাকিং আইডি:" : "Tracking ID:"}</span>
              <span className="font-mono font-extrabold text-slate-900">#{submittedBooking.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">{lang === "bn" ? "প্রয়োজনীয় সেবা:" : "Service:"}</span>
              <span className="font-bold text-slate-900">{submittedBooking.categoryName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">{lang === "bn" ? "জরুরিতা:" : "Urgency:"}</span>
              <span className="font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                {submittedBooking.urgency === "ASAP"
                  ? (lang === "bn" ? "জরুরি (যত দ্রুত সম্ভব)" : "Urgent (ASAP)")
                  : submittedBooking.urgency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">{lang === "bn" ? "অবস্থান:" : "Location:"}</span>
              <span className="font-semibold text-slate-800">{submittedBooking.area}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSubmittedBooking(null);
                setProblemDescription("");
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              {lang === "bn" ? "আরেকটি অনুরোধ পাঠান" : "Submit Another Request"}
            </button>
            <Link
              href="/browse"
              className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs px-5 py-3 rounded-xl transition-all"
            >
              {lang === "bn" ? "সব টেকনিশিয়ানদের তালিকা" : "Browse Directory"}
            </Link>
          </div>
        </div>
      ) : (
        /* Instant Book Form */
        <div className="bg-white p-6 sm:p-10 shadow-xl rounded-3xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Urgency Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                1. {lang === "bn" ? "কখন সেবা প্রয়োজন?" : "When Do You Need the Service?"}
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setUrgency("ASAP")}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    urgency === "ASAP"
                      ? "border-blue-600 bg-blue-50 text-blue-950 font-extrabold ring-2 ring-blue-200"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  }`}
                >
                  <span className="text-xs block font-bold">{lang === "bn" ? "জরুরি (১-২ ঘণ্টা)" : "Urgent (1-2 Hours)"}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{lang === "bn" ? "যত দ্রুত সম্ভব" : "Immediate Dispatch"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgency("TODAY")}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    urgency === "TODAY"
                      ? "border-blue-600 bg-blue-50 text-blue-950 font-extrabold ring-2 ring-blue-200"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  }`}
                >
                  <span className="text-xs block font-bold">{lang === "bn" ? "আজকের মধ্যে" : "Today"}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{lang === "bn" ? "আজ যে কোনো সময়" : "Same-day Service"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgency("FLEXIBLE")}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    urgency === "FLEXIBLE"
                      ? "border-blue-600 bg-blue-50 text-blue-950 font-extrabold ring-2 ring-blue-200"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                  }`}
                >
                  <span className="text-xs block font-bold">{lang === "bn" ? "সুবিধামতো সময়ে" : "Flexible"}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{lang === "bn" ? "পরবর্তী দিনগুলোতে" : "Within This Week"}</span>
                </button>
              </div>
            </div>

            {/* Step 2: Contact Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  2. {lang === "bn" ? "আপনার নাম" : "Your Name"} <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={lang === "bn" ? "যেমন: সুজন মাহমুদ" : "e.g. Sujon Mahmud"}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  3. {lang === "bn" ? "মোবাইল নম্বর (কলের জন্য)" : "Mobile Number (For Callback)"} <span className="text-red-600">*</span>
                </label>
                <input
                  required
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Step 3: Service Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                4. {lang === "bn" ? "কী ধরনের সেবা প্রয়োজন?" : "What Service Do You Need?"} <span className="text-red-600">*</span>
              </label>
              <select
                required
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer"
              >
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s.slug} value={s.nameEn}>
                    {lang === "bn" ? s.nameBn : s.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 4: Problem Details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                5. {lang === "bn" ? "সমস্যা বা কাজের বিবরণ লিখুন" : "Describe the Problem / Requirement"} <span className="text-red-600">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                placeholder={
                  lang === "bn"
                    ? "যেমন: মেইন সুইচে সমস্যা হচ্ছে, লাইট জ্বলছে না। অথবা ২ টন এসি কুলিং করছে না।"
                    : "e.g. Main power tripped, water leaking under sink, or 9th class math tutor needed..."
                }
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
              />
            </div>

            {/* Step 5: Location Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  6. {lang === "bn" ? "উপজেলা / এলাকা" : "Upazila / Area"} <span className="text-red-600">*</span>
                </label>
                <BangladeshUpazilaInput
                  required
                  value={area}
                  onChange={setArea}
                  placeholder={lang === "bn" ? "উপজেলা বা জেলা খুঁজুন..." : "Search upazila..."}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  7. {lang === "bn" ? "বিস্তারিত ঠিকানা / ল্যান্ডমার্ক" : "Detailed Address / Landmark"}
                </label>
                <input
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder={lang === "bn" ? "রোড/বাড়ি নং, পরিচিত জায়গা..." : "House/Road, near landmark..."}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-900 bg-red-50 border border-red-300 p-3 rounded-xl font-bold">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:opacity-95 text-slate-950 font-black text-xs py-4 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2.5 animate-emergency border border-amber-300/80"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
              </span>
              <span>
                {loading
                  ? (lang === "bn" ? "জরুরি অনুরোধ পাঠানো হচ্ছে..." : "Submitting Emergency Request...")
                  : (lang === "bn" ? "জরুরি অনুরোধ জমা দিন (সম্পূর্ণ ফ্রি)" : "Submit Emergency Request (100% Free)")}
              </span>
              <span>→</span>
            </button>

            <p className="text-center text-xs text-slate-500 font-medium">
              {lang === "bn" ? "আপনার তথ্য সম্পূর্ণ সুরক্ষিত থাকবে এবং শুধুমাত্র সেবাদাতার যোগাযোগের জন্য ব্যবহার করা হবে।" : "Your contact information is strictly protected and only used for service dispatch."}
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
