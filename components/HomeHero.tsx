"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import BangladeshUpazilaInput from "@/components/BangladeshUpazilaInput";

export default function HomeHero() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (area) params.set("area", area);
    router.push(params.size ? `/browse?${params}` : "/browse");
  }

  const popularTags = [
    { nameEn: "Electrician", nameBn: "ইলেকট্রিশিয়ান", slug: "electrician", icon: "⚡" },
    { nameEn: "Plumber", nameBn: "প্লাম্বার", slug: "plumber", icon: "🚰" },
    { nameEn: "AC Repair", nameBn: "এসি সার্ভিসিং", slug: "ac-repair", icon: "❄️" },
    { nameEn: "Home Tutor", nameBn: "হোম টিউটর", slug: "tutor", icon: "📚" },
    { nameEn: "Painter", nameBn: "রং মিস্ত্রি", slug: "painter", icon: "🎨" },
  ];

  return (
    <section className="relative overflow-visible border-b border-slate-200/80 bg-[linear-gradient(135deg,#0b1938_0%,#133170_45%,#1d4ed8_100%)] text-white py-12 md:py-20">
      {/* Background Animated Gradient Mesh / Glowing Blobs */}
      <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl blob-animated" />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-blue-400/25 blur-3xl blob-animated"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="pointer-events-none absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl blob-animated"
        style={{ animationDelay: "-12s" }}
      />

      <div className="max-w-6xl mx-auto px-4 grid items-center gap-10 lg:grid-cols-12 relative z-30">
        {/* Left Column: Search & Headlines */}
        <div className="lg:col-span-7 motion-enter space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-white/95">{t("heroBadge")}</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-2.5">
            <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12]">
              {t("tagline")}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-blue-100/90 max-w-xl font-normal leading-relaxed">
              {t("subtitle")}
            </p>
          </div>

          {/* Unified Responsive Search & Location Form */}
          <div className="relative z-40 max-w-2xl">
            <form
              onSubmit={handleSearch}
              className="p-2 sm:p-2.5 rounded-2xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/40 flex flex-col sm:flex-row gap-2"
            >
              {/* Service Query Input */}
              <div className="relative flex-1 flex items-center min-w-0">
                <span className="absolute left-3.5 text-slate-400 text-base pointer-events-none">
                  🔍
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-3 text-sm text-[var(--color-ink)] placeholder:text-slate-400 focus:border-[var(--color-teal)] focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
              </div>

              {/* Location Input Selector */}
              <div className="flex-1 min-w-0 relative">
                <BangladeshUpazilaInput
                  value={area}
                  onChange={setArea}
                  placeholder={t("chooseUpazila")}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-[var(--color-ink)] placeholder:text-slate-400 focus:border-[var(--color-teal)] focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
              </div>

              {/* Search Action Button */}
              <button
                type="submit"
                className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t("search")}</span>
                <span className="text-base sm:hidden">→</span>
              </button>
            </form>
          </div>

          {/* Instant Book Quick Action Callout */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/instant-book"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:opacity-95 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all animate-emergency border border-amber-300/60"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
              </span>
              <span>
                {lang === "bn"
                  ? "জরুরি সার্ভিস দরকার? ইনস্ট্যান্ট বুকিং"
                  : "Need Urgent Help? Instant Book"}
              </span>
              <span>→</span>
            </Link>
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 text-xs text-white">
            <span className="font-bold shrink-0">{lang === "bn" ? "জনপ্রিয়:" : "Popular:"}</span>
            {popularTags.map((item) => (
              <Link
                key={item.slug}
                href={`/browse?category=${item.slug}`}
                className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs text-white hover:bg-white/30 hover:border-white/50 transition-all font-bold backdrop-blur-sm"
              >
                <span>{item.icon}</span>
                <span>{lang === "bn" ? item.nameBn : item.nameEn}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Floating Live Showcase Cards (Desktop/Tablet) */}
        <div className="lg:col-span-5 relative motion-enter-delay-1 hidden lg:block">
          <div className="relative mx-auto max-w-sm h-96 flex items-center justify-center">
            {/* Center Decorative Circle */}
            <div className="absolute h-72 w-72 rounded-full border border-white/20 bg-white/10 backdrop-blur-2xl flex items-center justify-center p-6 text-center">
              <div className="space-y-1">
                <span className="text-4xl">🇧🇩</span>
                <p className="font-display font-extrabold text-lg text-white">64 Districts</p>
                <p className="text-xs text-blue-100 font-semibold">Covering All Bangladesh Upazilas</p>
              </div>
            </div>

            {/* Floating Card 1: Verified Professional */}
            <div className="absolute -top-4 -left-4 signplate bg-white p-3.5 shadow-2xl motion-float text-slate-900 flex items-center gap-3 border border-slate-200">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl shadow-xs">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-display font-extrabold text-xs text-slate-900">Electrician Pro</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded-full">✓ Verified</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">Sirajganj Sadar · ★ 4.9</p>
              </div>
            </div>

            {/* Floating Card 2: Free Direct Booking */}
            <div className="absolute top-1/2 -right-6 signplate bg-white p-3.5 shadow-2xl motion-float-reverse text-slate-900 flex items-center gap-3 border border-slate-200">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl shadow-xs">
                🤝
              </div>
              <div>
                <p className="font-display font-extrabold text-xs text-slate-900">Direct Booking</p>
                <p className="text-[11px] text-emerald-800 font-bold">100% Free · No Middleman</p>
              </div>
            </div>

            {/* Floating Card 3: Live Rating */}
            <div
              className="absolute -bottom-4 left-6 signplate bg-white p-3.5 shadow-2xl motion-float text-slate-900 flex items-center gap-3 border border-slate-200"
              style={{ animationDelay: "-3s" }}
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl shadow-xs">
                ⭐
              </div>
              <div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <span>★★★★★</span>
                  <span className="text-slate-900 font-extrabold">5.0</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">Trusted Customer Ratings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
