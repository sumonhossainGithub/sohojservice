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
      <h2 className="font-display text-2xl font-extrabold mb-8">{t("categoriesTitle")}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/browse?category=${c.slug}`}
            className="signplate bg-white px-4 py-6 flex flex-col items-center gap-2 text-center"
          >
            <span className="text-3xl">{iconFor[c.slug] ?? "🛠️"}</span>
            <span className="font-display font-bold text-sm">
              {lang === "bn" ? c.nameBn : c.nameEn}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
