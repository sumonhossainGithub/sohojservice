"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

type Category = {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
};

const iconFor: Record<string, string> = {
  electrician: "⚡",
  plumber: "🚰",
  "ac-repair": "❄️",
  cleaning: "🧹",
  painter: "🎨",
  carpenter: "🪚",
  "mobile-repair": "📱",
  "internet-tech": "📶",
  mechanic: "🔧",
  cctv: "📷",
  tutor: "📚",
};

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  const { lang, t } = useLanguage();

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-teal)] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {lang === "bn" ? "সকল সেবা" : "All Categories"}
          </span>
          <h2 className="font-display text-3xl font-extrabold text-[var(--color-ink)] mt-2">
            {t("categoriesTitle")}
          </h2>
        </div>
        <Link
          href="/browse"
          className="text-sm font-bold text-[var(--color-teal)] hover:underline flex items-center gap-1 group"
        >
          <span>{lang === "bn" ? "সবগুলো দেখুন" : "Explore all services"}</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {categories.map((c, idx) => (
          <Link
            key={c.id}
            href={`/browse?category=${c.slug}`}
            className="signplate group p-5 flex flex-col items-center justify-center text-center gap-3 bg-white hover:border-[var(--color-teal)]/40 hover:-translate-y-1.5 transition-all relative overflow-hidden"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {/* Subtle Top Gradient Accent on hover */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Icon Container with subtle pulse animation on hover */}
            <div className="h-14 w-14 rounded-2xl bg-slate-50 group-hover:bg-blue-50 group-hover:scale-110 flex items-center justify-center text-3xl transition-all duration-300 shadow-2xs">
              <span>{iconFor[c.slug] ?? "🛠️"}</span>
            </div>

            <span className="font-display font-extrabold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
              {lang === "bn" ? c.nameBn : c.nameEn}
            </span>

            <span className="text-xs text-slate-600 font-semibold group-hover:text-blue-700 transition-colors">
              {lang === "bn" ? "সেবাদাতা খুঁজুন →" : "Find Pros →"}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
