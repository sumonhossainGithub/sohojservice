"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function HomeHero() {
  const { t } = useLanguage();
  const router = useRouter();
  const [q, setQ] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q ? `/browse?q=${encodeURIComponent(q)}` : "/browse");
  }

  return (
    <section className="border-b-2 border-[var(--color-ink)] bg-[var(--color-teal)] text-white">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-block bg-[var(--color-marigold)] text-[var(--color-ink)] text-xs font-bold px-3 py-1 rounded-full mb-4">
            100% Free · Sirajganj
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            {t("tagline")}
          </h1>
          <p className="text-white/85 text-lg mb-8">{t("subtitle")}</p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="flex-1 rounded-lg px-4 py-3 text-[var(--color-ink)] border-2 border-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-marigold)]"
            />
            <button
              type="submit"
              className="signplate bg-[var(--color-marigold)] text-[var(--color-ink)] px-5 font-semibold"
            >
              {t("browse")}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {["⚡ Electrician", "🔧 Plumber", "🎨 Painter", "📚 Tutor"].map((item) => (
            <div
              key={item}
              className="signplate bg-white text-[var(--color-ink)] px-4 py-6 text-center font-display font-bold"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
