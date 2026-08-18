"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import BrandLogo from "@/components/BrandLogo";
import { useState, useEffect } from "react";
import { getStoredLiveLocation, detectLiveGpsLocation, LiveLocationState } from "@/lib/liveLocation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [liveLocation, setLiveLocation] = useState<LiveLocationState | null>(null);
  const [locatingGps, setLocatingGps] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load live location on mount & listen for updates
  useEffect(() => {
    setLiveLocation(getStoredLiveLocation());

    const handleLocationUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<LiveLocationState>;
      if (customEvent.detail) {
        setLiveLocation(customEvent.detail);
      }
    };

    window.addEventListener("sohojservice:location_updated", handleLocationUpdate);
    return () => window.removeEventListener("sohojservice:location_updated", handleLocationUpdate);
  }, []);

  async function handleQuickDetectGps() {
    setLocatingGps(true);
    const res = await detectLiveGpsLocation();
    setLocatingGps(false);
    if (res.success && res.location) {
      setLiveLocation(res.location);
    }
  }

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/dashboard/admin"
      : user?.role === "PROFESSIONAL"
      ? "/dashboard/professional"
      : "/dashboard/customer";

  function roleLabel(role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN") {
    if (role === "PROFESSIONAL") return t("roleProfessional");
    if (role === "ADMIN") return t("roleAdmin");
    return t("roleCustomer");
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (pathname === href) return true;
    return pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-3 sm:px-6">
        {/* Brand Logo & Live Location Pill */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="transition-transform hover:scale-[1.03] active:scale-[0.98] shrink-0"
            aria-label="SohojService home"
          >
            <BrandLogo />
          </Link>

          {/* Global Live Location Pill */}
          <button
            type="button"
            onClick={handleQuickDetectGps}
            disabled={locatingGps}
            className="hidden sm:inline-flex items-center gap-1.5 bg-slate-100/90 hover:bg-slate-200/80 text-slate-800 border border-slate-300/80 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs group"
            title={lang === "bn" ? "লাইভ লোকেশন সনাক্ত করুন" : "Detect live GPS location"}
          >
            {locatingGps ? (
              <span className="inline-block animate-spin text-[11px]">⏳</span>
            ) : (
              <span className="text-blue-600 group-hover:scale-110 transition-transform">📍</span>
            )}
            <span className="truncate max-w-[130px] font-semibold text-[11px]">
              {liveLocation
                ? lang === "bn"
                  ? liveLocation.nameBn || liveLocation.nameEn
                  : liveLocation.nameEn
                : lang === "bn"
                ? "লোকেশন দিন"
                : "Live Location"}
            </span>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-4 text-sm font-semibold md:flex">
          {/* Instant Booking Highlight Pill */}
          <Link
            href="/instant-book"
            className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-1.5 rounded-full text-xs font-black shadow-md animate-emergency hover:scale-105 active:scale-95 transition-all"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
            </span>
            <span>{t("instantBook")}</span>
          </Link>

          <Link
            href="/browse"
            className={`relative py-1 transition-colors hover:text-[var(--color-teal)] ${
              isActive("/browse")
                ? "text-[var(--color-teal)] after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[var(--color-teal)]"
                : "text-[var(--color-ink)]/75"
            }`}
            aria-current={isActive("/browse") ? "page" : undefined}
          >
            {t("browse")}
          </Link>

          {user ? (
            <>
              <Link
                href={dashboardHref}
                className={`relative py-1 transition-colors hover:text-[var(--color-teal)] ${
                  isActive(dashboardHref)
                    ? "text-[var(--color-teal)] after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[var(--color-teal)]"
                    : "text-[var(--color-ink)]/75"
                }`}
                aria-current={isActive(dashboardHref) ? "page" : undefined}
              >
                {t("dashboard")}
              </Link>

              <Link
                href="/account"
                className={`relative py-1 transition-colors hover:text-[var(--color-teal)] ${
                  isActive("/account")
                    ? "text-[var(--color-teal)] after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[var(--color-teal)]"
                    : "text-[var(--color-ink)]/75"
                }`}
                aria-current={isActive("/account") ? "page" : undefined}
              >
                {t("myAccount")}
              </Link>

              {/* Minimal User Role & Logout */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-full pl-2.5 pr-1.5 py-1 text-xs">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{roleLabel(user.role)}</span>
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors px-1.5 py-0.5 cursor-pointer border-l border-slate-200"
                  title="Log out"
                >
                  {t("logout")}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/register?role=professional"
                className="text-[var(--color-teal)] hover:underline text-xs font-bold px-2 py-1"
              >
                {t("joinAsPro")}
              </Link>

              <Link
                href="/login"
                className="text-[var(--color-ink)]/80 hover:text-[var(--color-teal)] transition-colors text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                {t("login")}
              </Link>

              <Link
                href="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs hover:shadow-md active:scale-95"
              >
                {t("register")}
              </Link>
            </>
          )}

          {/* Bilingual Language Switcher */}
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] transition-all cursor-pointer"
            aria-label="Toggle language"
          >
            <span>🌐</span>
            <span>{lang === "en" ? "বাংলা" : "English"}</span>
          </button>
        </nav>

        {/* Mobile Header Elements */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Mobile Live Location Button */}
          <button
            type="button"
            onClick={handleQuickDetectGps}
            disabled={locatingGps}
            className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-200 px-2 py-1 rounded-lg text-xs font-bold"
          >
            <span>📍</span>
            <span className="max-w-[70px] truncate text-[10px]">
              {liveLocation ? liveLocation.nameEn.split(" ")[0] : "GPS"}
            </span>
          </button>

          <Link
            href="/instant-book"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full shadow-md animate-emergency inline-flex items-center gap-1"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-slate-950 animate-ping"></span>
            <span>{lang === "bn" ? "জরুরি" : "Instant"}</span>
          </Link>

          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="rounded-full border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-700"
          >
            {lang === "en" ? "বাংলা" : "EN"}
          </button>

          <button
            type="button"
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 py-4 text-sm font-semibold md:hidden shadow-xl motion-enter">
          <Link
            href="/instant-book"
            onClick={() => setOpen(false)}
            className="bg-amber-50 border border-amber-300 text-amber-950 px-4 py-2.5 rounded-xl flex items-center justify-between font-extrabold"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>{t("instantBook")}</span>
            </span>
            <span className="text-xs bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black animate-pulse">Emergency</span>
          </Link>

          <Link
            href="/browse"
            onClick={() => setOpen(false)}
            className={`py-1.5 ${isActive("/browse") ? "text-[var(--color-teal)]" : "text-slate-700"}`}
          >
            {t("browse")}
          </Link>

          {user ? (
            <>
              <Link
                href={dashboardHref}
                onClick={() => setOpen(false)}
                className={`py-1.5 ${isActive(dashboardHref) ? "text-[var(--color-teal)]" : "text-slate-700"}`}
              >
                {t("dashboard")}
              </Link>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className={`py-1.5 ${isActive("/account") ? "text-[var(--color-teal)]" : "text-slate-700"}`}
              >
                {t("myAccount")}
              </Link>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 mt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{roleLabel(user.role)}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors px-2 py-0.5 cursor-pointer"
                >
                  {t("logout")}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/register?role=professional"
                onClick={() => setOpen(false)}
                className="text-[var(--color-teal)] py-1.5 font-bold"
              >
                {t("joinAsPro")}
              </Link>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="text-center py-2 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="text-center py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                >
                  {t("register")}
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
