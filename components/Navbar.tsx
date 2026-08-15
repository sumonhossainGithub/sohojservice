"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/dashboard/admin"
      : user?.role === "PROFESSIONAL"
      ? "/dashboard/professional"
      : "/dashboard/customer";

  async function handleLogout() {
    await logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b-2 border-[var(--color-ink)] bg-[var(--color-paper)] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-800 text-xl flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-teal)] text-white text-sm font-display font-800">
            স
          </span>
          <span className="font-display font-extrabold">SohojService</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/browse" className="hover:text-[var(--color-teal)]">
            {t("browse")}
          </Link>
          {user ? (
            <>
              <Link href={dashboardHref} className="hover:text-[var(--color-teal)]">
                {t("dashboard")}
              </Link>
              <button onClick={handleLogout} className="hover:text-[var(--color-teal)]">
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/register?role=professional" className="hover:text-[var(--color-teal)]">
                {t("joinAsPro")}
              </Link>
              <Link href="/login" className="hover:text-[var(--color-teal)]">
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="signplate bg-[var(--color-marigold)] px-4 py-1.5 font-semibold"
              >
                {t("register")}
              </Link>
            </>
          )}

          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="text-xs border-2 border-[var(--color-ink)] rounded-full px-3 py-1 font-semibold"
            aria-label="Toggle language"
          >
            {lang === "en" ? "বাং" : "EN"}
          </button>
        </nav>

        <button className="md:hidden text-2xl" onClick={() => setOpen(!open)} aria-label="Menu">
          ☰
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t-2 border-[var(--color-ink)] px-4 py-3 flex flex-col gap-3 text-sm font-medium">
          <Link href="/browse" onClick={() => setOpen(false)}>
            {t("browse")}
          </Link>
          {user ? (
            <>
              <Link href={dashboardHref} onClick={() => setOpen(false)}>
                {t("dashboard")}
              </Link>
              <button onClick={handleLogout} className="text-left">
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/register?role=professional" onClick={() => setOpen(false)}>
                {t("joinAsPro")}
              </Link>
              <Link href="/login" onClick={() => setOpen(false)}>
                {t("login")}
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                {t("register")}
              </Link>
            </>
          )}
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="text-xs border-2 border-[var(--color-ink)] rounded-full px-3 py-1 font-semibold w-fit"
          >
            {lang === "en" ? "বাং" : "EN"}
          </button>
        </div>
      )}
    </header>
  );
}
