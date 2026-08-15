"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";

type ProfessionalDetail = {
  id: string;
  name: string;
  category: { slug: string; nameEn: string; nameBn: string };
  area: string;
  city: string;
  bio: string;
  yearsExperience: number;
  ratePerVisit: number | null;
  isVerified: boolean;
  avgRating: number | null;
  reviews: { id: string; rating: number; comment: string; author: string }[];
};

export default function ProfessionalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const { lang, t } = useLanguage();

  const [pro, setPro] = useState<ProfessionalDetail | null>(null);
  const [problemNote, setProblemNote] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/professionals/${id}`)
      .then((r) => r.json())
      .then(setPro);
  }, [id]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      router.push(`/login?callbackUrl=/professional/${id}`);
      return;
    }
    if (user.role !== "CUSTOMER") {
      setErrorMsg("Only customer accounts can request bookings.");
      return;
    }

    setStatus("sending");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professionalId: id,
        problemNote,
        address,
        preferredDate,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setErrorMsg(data.error || "Could not send request.");
      setStatus("error");
      return;
    }

    setStatus("sent");
  }

  if (!pro) {
    return <div className="max-w-3xl mx-auto px-4 py-16">Loading…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 grid md:grid-cols-5 gap-8">
      <div className="md:col-span-3">
        <div className="signplate bg-white p-6 mb-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-display text-2xl font-extrabold">{pro.name}</h1>
            {pro.isVerified ? (
              <span className="text-xs bg-[var(--color-success)] text-white px-2 py-0.5 rounded-full">
                {t("verified")}
              </span>
            ) : (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                {t("notVerified")}
              </span>
            )}
          </div>
          <p className="text-[var(--color-teal)] font-semibold mb-2">
            {lang === "bn" ? pro.category.nameBn : pro.category.nameEn}
          </p>
          <p className="text-sm text-[var(--color-ink)]/70 mb-3">
            {pro.area}, {pro.city} · {pro.yearsExperience} {t("yearsExp")}
          </p>
          {pro.ratePerVisit && (
            <p className="font-semibold mb-3">৳{pro.ratePerVisit} {t("perVisit")}</p>
          )}
          <p className="text-[var(--color-ink)]/85">{pro.bio}</p>
        </div>

        <div>
          <h2 className="font-display font-bold text-lg mb-3">
            Reviews {pro.avgRating ? `· ★ ${pro.avgRating.toFixed(1)}` : ""}
          </h2>
          {pro.reviews.length === 0 ? (
            <p className="text-sm text-[var(--color-ink)]/60">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {pro.reviews.map((r) => (
                <div key={r.id} className="border-2 border-[var(--color-line)] rounded-lg p-3">
                  <p className="text-sm font-semibold">{r.author} · ★ {r.rating}</p>
                  <p className="text-sm text-[var(--color-ink)]/75">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="signplate bg-[var(--color-teal)] text-white p-6 sticky top-20">
          <h2 className="font-display font-bold text-lg mb-4">{t("bookNow")}</h2>
          {status === "sent" ? (
            <p className="text-sm">
              Your request has been sent. You&apos;ll see the response in your dashboard.
            </p>
          ) : (
            <form onSubmit={handleBook} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">What&apos;s the problem?</label>
                <textarea
                  required
                  value={problemNote}
                  onChange={(e) => setProblemNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-[var(--color-ink)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Your address</label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-[var(--color-ink)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Preferred date/time</label>
                <input
                  required
                  type="datetime-local"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-[var(--color-ink)]"
                />
              </div>
              {errorMsg && <p className="text-sm text-yellow-200">{errorMsg}</p>}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-[var(--color-marigold)] text-[var(--color-ink)] font-semibold rounded-lg py-2 disabled:opacity-60"
              >
                {status === "sending" ? "Sending…" : t("bookNow")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
