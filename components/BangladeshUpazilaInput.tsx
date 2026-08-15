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
  const listId = useId();
  const menuId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<BDLocation[]>(defaultStarterLocations);
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const defaultPlaceholder =
    placeholder ?? (lang === "bn" ? "উপজেলা বা এলাকা খুঁজুন..." : "Search upazila or district...");

  useEffect(() => {
    fetch("/api/locations/upazilas")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.locations) && data.locations.length) {
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
    <div className="relative w-full" ref={wrapper}>
      <div className="relative flex items-center">
        <input
          required={required}
          list={listId}
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
          className={`${className} ${showGpsButton ? "pr-16" : "pr-8"}`}
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
              className="text-xs text-slate-400 hover:text-slate-600 px-1 py-0.5"
              title="Clear location"
            >
              ✕
            </button>
          )}

          {showGpsButton && (
            <button
              type="button"
              onClick={handleGpsDetect}
              disabled={locating}
              className="flex items-center gap-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
              title={lang === "bn" ? "আমার জিপিএস অবস্থান সনাক্ত করুন" : "Detect my GPS location"}
            >
              {locating ? (
                <span className="inline-block animate-spin">⏳</span>
              ) : (
                <span>📍</span>
              )}
              <span className="hidden sm:inline">{lang === "bn" ? "GPS" : "GPS"}</span>
            </button>
          )}
        </div>
      </div>

      <datalist id={listId}>
        {locations.map((loc) => (
          <option key={`${loc.district}-${loc.nameEn}`} value={loc.nameEn}>
            {loc.nameBn} · {loc.district}
          </option>
        ))}
      </datalist>

      {gpsError && (
        <p className="text-[11px] text-red-500 font-medium mt-1 pl-1">{gpsError}</p>
      )}

      {open && (
        <div
          id={menuId}
          className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-[var(--color-line)] bg-white p-1.5 shadow-2xl"
        >
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink)]/50">
              {lang === "bn" ? "বাংলাদেশের উপজেলা ও জেলাসমূহ" : "Bangladesh Location Suggestions"}
            </p>
            {showGpsButton && (
              <button
                type="button"
                onClick={handleGpsDetect}
                disabled={locating}
                className="text-[11px] font-semibold text-[var(--color-teal)] hover:underline flex items-center gap-1"
              >
                📍 {lang === "bn" ? "বর্তমান অবস্থান ব্যবহার করুন" : "Use current location"}
              </button>
            )}
          </div>

          {suggestions.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500">
              {lang === "bn"
                ? "কোনো মিল পাওয়া যায়নি। জেলা বা উপজেলার নাম লিখুন।"
                : "No matching location found. Type your district or upazila name."}
            </div>
          ) : (
            suggestions.map((loc, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={`${loc.district}-${loc.nameEn}`}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isSelected ? "bg-blue-50 text-blue-950 font-semibold" : "hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <span className="font-semibold block text-[var(--color-ink)]">
                      {lang === "bn" && loc.nameBn ? loc.nameBn : loc.nameEn}
                    </span>
                    {lang === "bn" && loc.nameBn && (
                      <span className="text-[11px] text-slate-400">{loc.nameEn}</span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--color-ink)]/60 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {loc.district} {loc.division ? `(${loc.division})` : ""}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
