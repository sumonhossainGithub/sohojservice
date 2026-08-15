"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    { n: "1", title: t("step1Title"), body: t("step1Body") },
    { n: "2", title: t("step2Title"), body: t("step2Body") },
    { n: "3", title: t("step3Title"), body: t("step3Body") },
  ];

  return (
    <section className="bg-white border-y-2 border-[var(--color-ink)]">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-display text-2xl font-extrabold mb-10">{t("howItWorks")}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.n}>
              <div className="signplate bg-[var(--color-marigold)] h-12 w-12 flex items-center justify-center font-display font-extrabold text-lg mb-4">
                {s.n}
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-[var(--color-ink)]/75">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
