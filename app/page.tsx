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

  return (
    <div>
      <HomeHero />
      <CategoryGrid categories={allCategories} />
      <HowItWorks />

      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="signplate inline-block bg-[var(--color-teal)] text-white px-8 py-6">
          <p className="font-display text-xl font-bold mb-2">
            Are you a skilled tradesperson?
          </p>
          <p className="mb-4 text-white/90">
            List your services for free and get discovered by neighbors who need you.
          </p>
          <Link
            href="/register?role=professional"
            className="inline-block bg-[var(--color-marigold)] text-[var(--color-ink)] font-semibold px-5 py-2 rounded-lg"
          >
            Join as a professional
          </Link>
        </div>
      </section>
    </div>
  );
}
