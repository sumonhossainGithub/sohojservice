"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

type Professional = {
  id: string;
  name: string;
  category: { slug: string; nameEn: string; nameBn: string };
  area: string;
  city: string;
  bio: string;
  yearsExperience: number;
  ratePerVisit: number | null;
  isVerified: boolean;
  avgRating: number | null;
  reviewCount: number;
};

function BrowseContent() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const [results, setResults] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [area, setArea] = useState(params.get("area") ?? "");

  const category = params.get("category") ?? "";

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-param-change loading pattern
    setLoading(true);
    const qs = new URLSearchParams();
    if (params.get("category")) qs.set("category", params.get("category")!);
    if (params.get("q")) qs.set("q", params.get("q")!);
    if (params.get("area")) qs.set("area", params.get("area")!);

    fetch(`/api/professionals?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params]);

  function applyFilters(e: React.FormEvent) {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (category) qs.set("category", category);
    if (q) qs.set("q", q);
    if (area) qs.set("area", area);
    router.push(`/browse?${qs.toString()}`);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-extrabold mb-6">{t("browse")}</h1>

      <form onSubmit={applyFilters} className="flex flex-wrap gap-3 mb-8">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="flex-1 min-w-[200px] border-2 border-[var(--color-ink)] rounded-lg px-3 py-2"
        />
        <input
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Area (e.g. Sirajganj Sadar)"
          className="flex-1 min-w-[180px] border-2 border-[var(--color-ink)] rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          className="signplate bg-[var(--color-marigold)] px-5 py-2 font-semibold"
        >
          Search
        </button>
      </form>

      {loading ? (
        <p>Loading…</p>
      ) : results.length === 0 ? (
        <p className="text-[var(--color-ink)]/70">
          No professionals found yet for this search. Try a different area or category.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((p) => (
            <Link
              key={p.id}
              href={`/professional/${p.id}`}
              className="signplate bg-white p-5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold">{p.name}</span>
                {p.isVerified ? (
                  <span className="text-xs bg-[var(--color-success)] text-white px-2 py-0.5 rounded-full">
                    {t("verified")}
                  </span>
                ) : (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    {t("notVerified")}
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--color-teal)] font-semibold">
                {lang === "bn" ? p.category.nameBn : p.category.nameEn}
              </p>
              <p className="text-sm text-[var(--color-ink)]/70">{p.area}, {p.city}</p>
              <p className="text-sm text-[var(--color-ink)]/70 line-clamp-2">{p.bio}</p>
              <div className="flex items-center justify-between text-sm mt-2">
                <span>
                  {p.yearsExperience} {t("yearsExp")}
                </span>
                {p.ratePerVisit ? (
                  <span className="font-semibold">৳{p.ratePerVisit} {t("perVisit")}</span>
                ) : null}
              </div>
              {p.reviewCount > 0 && (
                <p className="text-xs text-[var(--color-ink)]/60">
                  ★ {p.avgRating?.toFixed(1)} ({p.reviewCount})
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense>
      <BrowseContent />
    </Suspense>
  );
}
