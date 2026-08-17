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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">{t("browse")}</h1>
          <p className="text-xs text-slate-600 mt-1">
            {lang === "bn" ? "যাচাইকৃত স্থানীয় কারিগর ও প্রফেশনাল খুঁজুন" : "Find verified local technicians and professionals"}
          </p>
        </div>
        <Link
          href="/instant-book"
          className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-md animate-emergency transition-all w-fit border border-amber-300/80"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
          </span>
          <span>{lang === "bn" ? "জরুরি সার্ভিস দরকার? ইনস্ট্যান্ট বুকিং" : "Need Urgent Help? Instant Book"}</span>
          <span className="ml-1">→</span>
        </Link>
      </div>

      <form onSubmit={applyFilters} className="relative z-30 flex flex-col sm:flex-row gap-3 mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-white placeholder:text-slate-500 focus:border-blue-600 focus:outline-none"
        />
        <div className="flex-1 relative">
          <BangladeshUpazilaInput
            value={area}
            onChange={setArea}
            placeholder={lang === "bn" ? "উপজেলা বা জেলা খুঁজুন" : "Search an upazila or district"}
            className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 font-bold text-sm rounded-xl transition-all shadow-xs cursor-pointer"
        >
          {t("search")}
        </button>
      </form>

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors disabled:opacity-60 flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <span>📍</span>
          <span>{locating ? (lang === "bn" ? "সনাক্ত হচ্ছে..." : "Locating...") : t("useMyLocation")}</span>
        </button>

        <button
          type="button"
          onClick={() => setOnlyAvailable((value) => !value)}
          className={`rounded-xl border px-3.5 py-2 font-bold text-xs transition-colors cursor-pointer ${
            onlyAvailable ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
          }`}
        >
          {onlyAvailable ? `✓ ${t("availableNowOnly")}` : t("showAvailableNow")}
        </button>

        {locationMessage && (
          <span className="text-xs text-blue-900 font-bold bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            {locationMessage}
          </span>
        )}
      </div>

      {location && (
        <div className="mb-6">
          <MapPreview
            latitude={location.latitude}
            longitude={location.longitude}
            title="your current location"
            compact
          />
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-600 font-medium text-sm">{t("loading")}</div>
      ) : sortedResults.length === 0 ? (
        <div className="signplate bg-white p-12 text-center text-slate-600 text-sm border border-slate-200">
          {t("noProfessionalsFound")}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedResults.map((p) => (
            <Link
              key={p.id}
              href={`/professional/${p.id}`}
              className="signplate bg-white p-5 flex flex-col gap-2.5 transition-transform hover:-translate-y-1 hover:shadow-lg border border-slate-200"
            >
              <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3 min-w-0">
                  <ProfilePhoto name={p.name} photoUrl={p.photoUrl} size="sm" />
                  <span className="font-display font-bold text-slate-900 truncate block">{p.name}</span>
                </div>
                {p.isVerified ? (
                  <span className="text-[11px] bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold shadow-2xs">
                    ✓ {t("verified")}
                  </span>
                ) : (
                  <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                    {t("notVerified")}
                  </span>
                )}
              </div>

              <p className="text-sm text-blue-700 font-extrabold">
                {lang === "bn" ? p.category.nameBn : p.category.nameEn}
              </p>
              
              <p className="text-xs text-slate-600 font-medium">
                📍 {p.area}, {p.city}
              </p>

              <p
                className={`text-xs font-bold ${
                  p.isAvailable ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {p.isAvailable ? `● ${t("availableForRequests")}` : `● ${t("currentlyUnavailable")}`}
              </p>

              {location && p.latitude != null && p.longitude != null && (
                <p className="text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md w-fit">
                  📍 {distanceInKm(location, { latitude: p.latitude, longitude: p.longitude }).toFixed(1)}{" "}
                  {t("kmAway")}
                </p>
              )}

              {p.bio && (
                <p className="text-xs text-slate-700 line-clamp-2 mt-0.5 leading-relaxed">{p.bio}</p>
              )}

              <div className="flex items-center justify-between text-xs mt-auto border-t border-slate-100 pt-3">
                <span className="text-slate-600 font-semibold">
                  {p.yearsExperience} {t("yearsExp")}
                </span>
                {p.ratePerVisit ? (
                  <span className="font-black text-slate-900 text-sm">
                    ৳{p.ratePerVisit} {t("perVisit")}
                  </span>
                ) : null}
              </div>

              {p.reviewCount > 0 && (
                <div className="text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md w-fit">
                  ★ {p.avgRating?.toFixed(1)} ({p.reviewCount}{" "}
                  {p.reviewCount === 1 ? "review" : "reviews"})
                </div>
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
