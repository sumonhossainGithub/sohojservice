"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export type BDLocation = {
  nameEn: string;
  nameBn: string;
  district: string;
  division?: string;
  lat?: number;
  lng?: number;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  showGpsButton?: boolean;
  onLocationSelect?: (location: BDLocation) => void;
};

const defaultStarterLocations: BDLocation[] = [
  { nameEn: "Sirajganj Sadar", nameBn: "সিরাজগঞ্জ সদর", district: "Sirajganj", division: "Rajshahi" },
  { nameEn: "Belkuchi", nameBn: "বেলকুচি", district: "Sirajganj", division: "Rajshahi" },
  { nameEn: "Ullapara", nameBn: "উল্লাপাড়া", district: "Sirajganj", division: "Rajshahi" },
  { nameEn: "Shahjadpur", nameBn: "শাহজাদপুর", district: "Sirajganj", division: "Rajshahi" },
  { nameEn: "Dhanmondi", nameBn: "ধানমন্ডি", district: "Dhaka", division: "Dhaka" },
  { nameEn: "Gulshan", nameBn: "গুলশান", district: "Dhaka", division: "Dhaka" },
  { nameEn: "Mirpur", nameBn: "মিরপুর", district: "Dhaka", division: "Dhaka" },
  { nameEn: "Uttara", nameBn: "উত্তরা", district: "Dhaka", division: "Dhaka" },
  { nameEn: "Chattogram Sadar / Kotwali", nameBn: "চট্টগ্রাম সদর / কোতোয়ালী", district: "Chattogram", division: "Chattogram" },
  { nameEn: "Rajshahi Sadar", nameBn: "রাজশাহী সদর", district: "Rajshahi", division: "Rajshahi" },
  { nameEn: "Khulna Sadar", nameBn: "খুলনা সদর", district: "Khulna", division: "Khulna" },
  { nameEn: "Sylhet Sadar / Kotwali", nameBn: "সিলেট সদর / কোতোয়ালী", district: "Sylhet", division: "Sylhet" },
  { nameEn: "Bogura Sadar", nameBn: "বগুড়া সদর", district: "Bogura", division: "Rajshahi" },
  { nameEn: "Pabna Sadar", nameBn: "পাবনা সদর", district: "Pabna", division: "Rajshahi" },
];

// In-memory module cache to avoid repeat network requests
let globalCachedLocations: BDLocation[] | null = null;

export default function BangladeshUpazilaInput({
  value,
  onChange,
  required = false,
  placeholder,
  className = "",
  showGpsButton = true,
  onLocationSelect,
}: Props) {
  const { lang } = useLanguage();
  const menuId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<BDLocation[]>(
    globalCachedLocations ?? defaultStarterLocations
  );
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const defaultPlaceholder =
    placeholder ?? (lang === "bn" ? "উপজেলা বা জেলা খুঁজুন..." : "Search upazila or district...");

  useEffect(() => {
    if (globalCachedLocations) {
      setLocations(globalCachedLocations);
      return;
    }

    fetch("/api/locations/upazilas")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.locations) && data.locations.length) {
          globalCachedLocations = data.locations;
          setLocations(data.locations);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapper.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return locations.slice(0, 8);
    return locations
      .filter((item) =>
        `${item.nameEn} ${item.nameBn} ${item.district} ${item.division ?? ""}`
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 10);
  }, [locations, value]);

  function handleSelect(loc: BDLocation) {
    const displayName = loc.nameEn;
    onChange(displayName);
    onLocationSelect?.(loc);
    setOpen(false);
    setActiveIndex(-1);
    setGpsError("");
  }

  function handleGpsDetect() {
    if (!navigator.geolocation) {
      setGpsError(lang === "bn" ? "ব্রাউজারে জিপিএস সুবিধা নেই" : "GPS not supported in browser");
      return;
    }

    setLocating(true);
    setGpsError("");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(`/api/locations/upazilas?lat=${coords.latitude}&lng=${coords.longitude}`);
          const data = await res.json();
          if (data.nearest) {
            handleSelect(data.nearest);
          } else {
            setGpsError(lang === "bn" ? "কাছের অবস্থান পাওয়া যায়নি" : "Could not determine location");
          }
        } catch {
          setGpsError(lang === "bn" ? "লোকেশন নির্ধারণে ত্রুটি" : "Location service error");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setGpsError(lang === "bn" ? "লোকেশন অনুমতি দিন" : "Please allow location permission");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0 && suggestions[activeIndex]) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div className="relative w-full text-slate-900" ref={wrapper}>
      <div className="relative flex items-center">
        <input
          required={required}
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
            setGpsError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder={defaultPlaceholder}
          className={`text-slate-900 font-medium placeholder:text-slate-400 bg-white ${className} ${showGpsButton ? "pr-16" : "pr-8"}`}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={menuId}
          aria-expanded={open}
        />

        <div className="absolute right-2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer"
              title="Clear location"
              aria-label="Clear location input"
            >
              ✕
            </button>
          )}

          {showGpsButton && (
            <button
              type="button"
              onClick={handleGpsDetect}
              disabled={locating}
              className="flex items-center gap-1 text-[11px] font-extrabold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 px-2 py-1 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              title={lang === "bn" ? "আমার জিপিএস অবস্থান সনাক্ত করুন" : "Detect my GPS location"}
              aria-label="Detect GPS location"
            >
              {locating ? (
                <span className="inline-block animate-spin">⏳</span>
              ) : (
                <span>📍</span>
              )}
              <span className="font-bold">GPS</span>
            </button>
          )}
        </div>
      </div>

      {gpsError && (
        <p className="text-[11px] text-red-600 font-bold mt-1 pl-1 bg-red-50 p-1 rounded-lg border border-red-200">{gpsError}</p>
      )}

      {open && (
        <div
          id={menuId}
          className="absolute left-0 right-0 top-full z-[100] mt-1.5 max-h-72 w-full min-w-[280px] sm:min-w-[340px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-black/5 motion-enter"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/90 rounded-xl mb-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              {lang === "bn" ? "বাংলাদেশের উপজেলা ও জেলাসমূহ" : "Bangladesh Locations"}
            </p>
            {showGpsButton && (
              <button
                type="button"
                onClick={handleGpsDetect}
                disabled={locating}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
              >
                📍 {lang === "bn" ? "বর্তমান অবস্থান" : "Use GPS"}
              </button>
            )}
          </div>

          {suggestions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 font-medium">
              {lang === "bn"
                ? "কোনো মিল পাওয়া যায়নি। জেলা বা উপজেলার নাম লিখুন।"
                : "No matching location found. Type your district or upazila name."}
            </div>
          ) : (
            <div className="space-y-0.5">
              {suggestions.map((loc, idx) => {
                const isSelected = activeIndex === idx;
                return (
                  <button
                    key={`${loc.district}-${loc.nameEn}`}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white font-bold shadow-xs"
                        : "hover:bg-slate-100 text-slate-900"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className={`font-bold block truncate text-sm ${isSelected ? "text-white" : "text-slate-900"}`}>
                        {lang === "bn" && loc.nameBn ? loc.nameBn : loc.nameEn}
                      </span>
                      {lang === "bn" && loc.nameBn && (
                        <span className={`text-[11px] font-medium block truncate ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                          {loc.nameEn}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 whitespace-nowrap ${
                        isSelected
                          ? "bg-white/20 text-white border border-white/30"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {loc.district} {loc.division ? `(${loc.division})` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
