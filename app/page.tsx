import Link from "next/link";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import HomeHero from "@/components/HomeHero";
import CategoryGrid from "@/components/CategoryGrid";
import HowItWorks from "@/components/HowItWorks";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allCategories = await db.select().from(categories).orderBy(asc(categories.nameEn));

  const stats = [
    { value: "64", label: "Districts Covered", bnLabel: "৬৪টি জেলা কভার্ড", icon: "🗺️" },
    { value: "100%", label: "Free Booking", bnLabel: "১০০% ফ্রি বুকিং", icon: "⚡" },
    { value: "Direct", label: "No Middleman Fees", bnLabel: "কোনো মধ্যস্বত্বভোগী নেই", icon: "🤝" },
    { value: "Verified", label: "Checked Profiles", bnLabel: "যাচাইকৃত প্রফেশনাল", icon: "🛡️" },
  ];

  return (
    <div className="space-y-4">
      {/* Dynamic Animated Hero */}
      <HomeHero />

      {/* Trust & Live Highlights Bar */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-white shadow-xl border border-slate-200/80">
          {stats.map((st) => (
            <div
              key={st.label}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <span className="text-2xl p-2.5 rounded-xl bg-blue-50 border border-blue-100 shrink-0">
                {st.icon}
              </span>
              <div>
                <p className="font-display font-extrabold text-base text-slate-900 leading-none">
                  {st.value}
                </p>
                <p className="text-xs text-slate-600 font-semibold mt-1">
                  {st.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <CategoryGrid categories={allCategories} />

      {/* How It Works Pipeline */}
      <HowItWorks />

      {/* Call to Action Banner for Tradespeople / Professionals */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0b1938_0%,#1e3a8a_50%,#1d4ed8_100%)] text-white p-8 md:p-12 shadow-2xl border border-blue-900/60 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Animated Background Mesh Glow */}
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl blob-animated" />

          <div className="space-y-3 max-w-xl relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/15 border border-amber-400/30 px-3.5 py-1 rounded-full">
              🛠️ For Professionals & Technicians
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Are you a skilled tradesperson or tutor?
            </h2>
            <p className="text-sm text-blue-100 font-medium leading-relaxed">
              List your services for free and get discovered by neighbors across your upazila who need your expertise today. No commission charges.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              href="/register?role=professional"
              className="inline-block bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm px-7 py-4 rounded-xl transition-all shadow-xl hover:shadow-2xl active:scale-95 cursor-pointer"
            >
              Join as a Professional →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
