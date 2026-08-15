"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import BrandLogo from "@/components/BrandLogo";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl transition-all">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="transition-transform hover:scale-[1.03] active:scale-[0.98]"
          aria-label="SohojService home"
        >
          <BrandLogo />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
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
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {roleLabel(user.role)}
              </span>

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

              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors px-2 py-1"
              >
                {t("logout")}
              </button>
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
                className="text-[var(--color-ink)]/80 hover:text-[var(--color-teal)] transition-colors text-sm font-semibold"
              >
                {t("login")}
              </Link>

              <Link
                href="/register"
                className="signplate bg-[var(--color-marigold)] hover:bg-[var(--color-marigold-light)] text-[var(--color-ink)] text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
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

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-700"
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
            href="/browse"
            onClick={() => setOpen(false)}
            className={`py-1.5 ${isActive("/browse") ? "text-[var(--color-teal)]" : "text-slate-700"}`}
          >
            {t("browse")}
          </Link>

          {user ? (
            <>
              <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                {t("signedInAs")} {roleLabel(user.role)}
              </span>
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
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="text-left text-red-600 py-1.5"
              >
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/register?role=professional"
                onClick={() => setOpen(false)}
                className="text-[var(--color-teal)] py-1.5"
              >
                {t("joinAsPro")}
              </Link>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-slate-700 py-1.5"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="w-fit bg-[var(--color-marigold)] text-[var(--color-ink)] px-4 py-2 rounded-xl text-xs font-bold"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
