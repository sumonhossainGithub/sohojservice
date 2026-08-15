"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import ProfilePhoto from "@/components/ProfilePhoto";
import BangladeshUpazilaInput from "@/components/BangladeshUpazilaInput";
import MapPreview from "@/components/MapPreview";

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
  isAvailable: boolean;
  avgRating: number | null;
  reviewCount: number;
  photoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
};

type Coordinates = { latitude: number; longitude: number };

function distanceInKm(from: Coordinates, to: Coordinates) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latDifference = radians(to.latitude - from.latitude);
  const lonDifference = radians(to.longitude - from.longitude);
  const value =
    Math.sin(latDifference / 2) ** 2 +
    Math.cos(radians(from.latitude)) *
      Math.cos(radians(to.latitude)) *
      Math.sin(lonDifference / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function BrowseContent() {
  const { lang, t } = useLanguage();
  const router = useRouter();
  const params = useSearchParams();
  const [results, setResults] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [area, setArea] = useState(params.get("area") ?? "");
  const [onlyAvailable, setOnlyAvailable] = useState(params.get("available") === "true");
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [locating, setLocating] = useState(false);

  const category = params.get("category") ?? "";

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on search params change
    setLoading(true);
    const qs = new URLSearchParams();
    if (params.get("category")) qs.set("category", params.get("category")!);
    if (params.get("q")) qs.set("q", params.get("q")!);
    if (params.get("area")) qs.set("area", params.get("area")!);
    if (params.get("available") === "true") qs.set("available", "true");

    fetch(`/api/professionals?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setResults(Array.isArray(data) ? data : []);
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
    if (onlyAvailable) qs.set("available", "true");
    router.push(`/browse?${qs.toString()}`);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(
        lang === "bn"
          ? "এই ব্রাউজারে লোকেশন সুবিধা নেই।"
          : "Location is not available in this browser."
      );
      return;
    }

    setLocating(true);
    setLocationMessage(lang === "bn" ? "অবস্থান খোঁজা হচ্ছে..." : "Detecting location...");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocating(false);

        // Optionally reverse geocode to get nearest upazila name
        try {
          const res = await fetch(
            `/api/locations/upazilas?lat=${coords.latitude}&lng=${coords.longitude}`
          );
          const data = await res.json();
          if (data.nearest) {
            setLocationMessage(
              lang === "bn"
                ? `নিকটবর্তী এলাকা: ${data.nearest.nameBn} (${data.nearest.district})। দূরত্বের ক্রমানুসারে সাজানো হয়েছে।`
                : `Near ${data.nearest.nameEn}, ${data.nearest.district}. Sorted by closest distance.`
            );
          } else {
            setLocationMessage(
              lang === "bn"
                ? "বর্তমান অবস্থান থেকে দূরত্ব দেখানো হচ্ছে।"
                : "Showing distances from your current location."
            );
          }
        } catch {
          setLocationMessage(
            lang === "bn"
              ? "বর্তমান অবস্থান থেকে দূরত্ব দেখানো হচ্ছে।"
              : "Showing distances from your current location."
          );
        }
      },
      () => {
        setLocating(false);
        setLocationMessage(
          lang === "bn"
            ? "লোকেশন অনুমতি দেওয়া হয়নি।"
            : "Location permission was not granted."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Sort by closest distance if location is active
  const sortedResults = useMemo(() => {
    if (!location) return results;
    return [...results].sort((a, b) => {
      const distA =
        a.latitude != null && a.longitude != null
          ? distanceInKm(location, { latitude: a.latitude, longitude: a.longitude })
          : Infinity;
      const distB =
        b.latitude != null && b.longitude != null
          ? distanceInKm(location, { latitude: b.latitude, longitude: b.longitude })
          : Infinity;
      return distA - distB;
    });
  }, [results, location]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-extrabold mb-6">{t("browse")}</h1>

      <form onSubmit={applyFilters} className="flex flex-wrap gap-3 mb-8">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="flex-1 min-w-[200px] border-2 border-[var(--color-ink)] rounded-lg px-3 py-2 text-sm"
        />
        <div className="flex-1 min-w-[220px]">
          <BangladeshUpazilaInput
            value={area}
            onChange={setArea}
            placeholder={lang === "bn" ? "উপজেলা বা জেলা খুঁজুন" : "Search an upazila or district"}
            className="w-full border-2 border-[var(--color-ink)] rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="signplate bg-[var(--color-marigold)] px-5 py-2 font-semibold text-sm"
        >
          {t("search")}
        </button>
      </form>

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="rounded-lg border-2 border-[var(--color-ink)] bg-white px-3 py-1.5 font-semibold text-xs hover:bg-slate-50 transition-colors disabled:opacity-60 flex items-center gap-1.5"
        >
          <span>📍</span>
          <span>{locating ? (lang === "bn" ? "সনাক্ত হচ্ছে..." : "Locating...") : t("useMyLocation")}</span>
        </button>

        <button
          type="button"
          onClick={() => setOnlyAvailable((value) => !value)}
          className={`rounded-lg border-2 border-[var(--color-ink)] px-3 py-1.5 font-semibold text-xs transition-colors ${
            onlyAvailable ? "bg-[var(--color-marigold)]" : "bg-white hover:bg-slate-50"
          }`}
        >
          {onlyAvailable ? t("availableNowOnly") : t("showAvailableNow")}
        </button>

        {locationMessage && (
          <span className="text-xs text-[var(--color-teal)] font-semibold bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
            {locationMessage}
          </span>
        )}
      </div>

      {location && (
        <MapPreview
          latitude={location.latitude}
          longitude={location.longitude}
          title="your current location"
          compact
        />
      )}

      {loading ? (
        <p className="text-sm">{t("loading")}</p>
      ) : sortedResults.length === 0 ? (
        <p className="text-[var(--color-ink)]/70 text-sm">{t("noProfessionalsFound")}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedResults.map((p) => (
            <Link
              key={p.id}
              href={`/professional/${p.id}`}
              className="signplate bg-white p-5 flex flex-col gap-2 transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <ProfilePhoto name={p.name} photoUrl={p.photoUrl} size="sm" />
                  <span className="font-display font-bold truncate">{p.name}</span>
                </div>
                {p.isVerified ? (
                  <span className="text-xs bg-[var(--color-success)] text-white px-2 py-0.5 rounded-full font-medium">
                    {t("verified")}
                  </span>
                ) : (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                    {t("notVerified")}
                  </span>
                )}
              </div>

              <p className="text-sm text-[var(--color-teal)] font-semibold">
                {lang === "bn" ? p.category.nameBn : p.category.nameEn}
              </p>
              <p className="text-xs text-[var(--color-ink)]/70">
                {p.area}, {p.city}
              </p>

              <p
                className={`text-xs font-semibold ${
                  p.isAvailable ? "text-[var(--color-success)]" : "text-[var(--color-ink)]/45"
                }`}
              >
                {p.isAvailable ? `● ${t("availableForRequests")}` : `● ${t("currentlyUnavailable")}`}
              </p>

              {location && p.latitude != null && p.longitude != null && (
                <p className="text-xs font-bold text-[var(--color-teal)] bg-blue-50 px-2 py-1 rounded w-fit">
                  📍 {distanceInKm(location, { latitude: p.latitude, longitude: p.longitude }).toFixed(1)}{" "}
                  {t("kmAway")}
                </p>
              )}

              {p.bio && (
                <p className="text-xs text-[var(--color-ink)]/70 line-clamp-2 mt-1">{p.bio}</p>
              )}

              <div className="flex items-center justify-between text-xs mt-2 border-t border-slate-100 pt-2 font-medium">
                <span>
                  {p.yearsExperience} {t("yearsExp")}
                </span>
                {p.ratePerVisit ? (
                  <span className="font-bold text-[var(--color-ink)]">
                    ৳{p.ratePerVisit} {t("perVisit")}
                  </span>
                ) : null}
              </div>

              {p.reviewCount > 0 && (
                <p className="text-xs text-amber-800 font-semibold mt-1">
                  ★ {p.avgRating?.toFixed(1)} ({p.reviewCount}{" "}
                  {p.reviewCount === 1 ? "review" : "reviews"})
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
