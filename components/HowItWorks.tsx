"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function HowItWorks() {
  const { lang, t } = useLanguage();

  const steps = [
    {
      n: "01",
      icon: "🔍",
      title: t("step1Title"),
      body: t("step1Body"),
      accent: "from-blue-500 to-indigo-600",
    },
    {
      n: "02",
      icon: "📍",
      title: t("step2Title"),
      body: t("step2Body"),
      accent: "from-amber-500 to-orange-500",
    },
    {
      n: "03",
      icon: "✅",
      title: t("step3Title"),
      body: t("step3Body"),
      accent: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <section className="bg-white border-y border-slate-200/80 py-20 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-blue-50/70 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-teal)] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            {lang === "bn" ? "সহজ ৩টি ধাপ" : "Simple 3 Steps"}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--color-ink)]">
            {t("howItWorks")}
          </h2>
          <p className="text-sm text-slate-500">
            {lang === "bn"
              ? "কোনো রেজিস্ট্রেশন ফি বা মধ্যস্বত্বভোগী ছাড়া সরাসরি সেবা গ্রহণ করুন।"
              : "Direct connection with verified professionals in your local area with zero middleman fees."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((s, idx) => (
            <div
              key={s.n}
              className="signplate p-8 bg-slate-50/60 hover:bg-white border border-slate-200 transition-all hover:shadow-xl group"
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 transition-transform">
                  {s.icon}
                </span>
                <span className="font-display font-black text-2xl text-slate-300 group-hover:text-[var(--color-teal)] transition-colors">
                  {s.n}
                </span>
              </div>

              <h3 className="font-display font-bold text-lg text-[var(--color-ink)] mb-2 group-hover:text-[var(--color-teal)] transition-colors">
                {s.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
