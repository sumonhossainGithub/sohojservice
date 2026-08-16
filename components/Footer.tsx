"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="border-t border-slate-200 bg-white/90 backdrop-blur-md mt-20 text-slate-700">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          {/* Col 1: Brand */}
          <div className="space-y-3 sm:col-span-2">
            <BrandLogo />
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed font-medium">
              {t("footerTagline")}
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-300 w-fit px-3 py-1 rounded-full">
              <span>🛡️</span>
              <span>100% Free Booking · Verified Service Directory</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <p className="font-display font-extrabold text-xs uppercase tracking-wider text-slate-900 mb-3">
              {lang === "bn" ? "জনপ্রিয় সেবা" : "Popular Services"}
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li><Link href="/browse?category=electrician" className="hover:text-blue-700 transition-colors">⚡ Electrician / ইলেকট্রিশিয়ান</Link></li>
              <li><Link href="/browse?category=plumber" className="hover:text-blue-700 transition-colors">🚰 Plumber / প্লাম্বার</Link></li>
              <li><Link href="/browse?category=ac-repair" className="hover:text-blue-700 transition-colors">❄️ AC Repair / এসি সার্ভিসিং</Link></li>
              <li><Link href="/browse?category=tutor" className="hover:text-blue-700 transition-colors">📚 Home Tutor / হোম টিউটর</Link></li>
              <li><Link href="/browse" className="hover:text-blue-700 font-bold text-blue-700">{lang === "bn" ? "সবগুলো দেখুন →" : "View All Services →"}</Link></li>
            </ul>
          </div>

          {/* Col 3: Quick Links */}
          <div>
            <p className="font-display font-extrabold text-xs uppercase tracking-wider text-slate-900 mb-3">
              {lang === "bn" ? "দ্রুত লিংক" : "Quick Links"}
            </p>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li><Link href="/browse" className="hover:text-blue-700 transition-colors">{t("browse")}</Link></li>
              <li><Link href="/register?role=professional" className="hover:text-blue-700 transition-colors">{t("joinAsPro")}</Link></li>
              <li><Link href="/login" className="hover:text-blue-700 transition-colors">{t("login")}</Link></li>
              <li><Link href="/register" className="hover:text-blue-700 transition-colors">{t("register")}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 font-semibold">
          <p>© {new Date().getFullYear()} SohojService. All rights reserved across Bangladesh.</p>
          <p className="text-xs text-slate-500">Built for Bangladesh • Dhaka, Sirajganj, Chattogram, Rajshahi & beyond</p>
        </div>
      </div>
    </footer>
  );
}
