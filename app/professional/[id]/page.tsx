"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageProvider";
import ProfilePhoto from "@/components/ProfilePhoto";
import MapPreview from "@/components/MapPreview";
import BangladeshUpazilaInput from "@/components/BangladeshUpazilaInput";

type ReviewItem = {
  id: string;
  authorId?: string;
  rating: number;
  comment: string;
  author: string;
  authorPhotoUrl?: string | null;
  createdAt?: string;
};

type ProfessionalDetail = {
  id: string;
  userId: string;
  name: string;
  category: { slug: string; nameEn: string; nameBn: string };
  area: string;
  city: string;
  bio: string;
  yearsExperience: number;
  ratePerVisit: number | null;
  isVerified: boolean;
  avgRating: number | null;
  reviewCount?: number;
  reviews: ReviewItem[];
  photoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
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
  const [bookingArea, setBookingArea] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Rating State
  const [userRating, setUserRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [userComment, setUserComment] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingMessage, setRatingMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hasExistingReview, setHasExistingReview] = useState(false);

  function loadProfessional() {
    fetch(`/api/professionals/${id}`)
      .then((r) => r.json())
      .then((data: ProfessionalDetail) => {
        setPro(data);
        if (user && data.reviews) {
          const myReview = data.reviews.find((r) => r.authorId === user.id);
          if (myReview) {
            setUserRating(myReview.rating);
            setUserComment(myReview.comment || "");
            setHasExistingReview(true);
          }
        }
      });
  }

  useEffect(() => {
    loadProfessional();
  }, [id, user]);

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
        address: bookingArea ? `${address}, ${bookingArea}` : address,
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

  async function handleRatingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push(`/login?callbackUrl=/professional/${id}`);
      return;
    }

    setRatingSubmitting(true);
    setRatingMessage(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId: id,
          rating: userRating,
          comment: userComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRatingMessage({ type: "error", text: data.error || "Could not submit rating." });
      } else {
        setRatingMessage({
          type: "success",
          text: data.isUpdated ? "Rating updated successfully!" : t("ratingSuccess"),
        });
        setHasExistingReview(true);
        loadProfessional();
      }
    } catch {
      setRatingMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setRatingSubmitting(false);
    }
  }

  if (!pro) {
    return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-sm">{t("loading")}</div>;
  }

  const isSelf = user?.id === pro.userId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-5 gap-8">
      {/* Left Column: Details & Ratings */}
      <div className="md:col-span-3 space-y-6">
        {/* Profile Card */}
        <div className="signplate bg-white p-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-4">
              <ProfilePhoto name={pro.name} photoUrl={pro.photoUrl} size="lg" />
              <div>
                <h1 className="font-display text-2xl font-extrabold">{pro.name}</h1>
                <p className="text-[var(--color-teal)] font-semibold text-sm">
                  {lang === "bn" ? pro.category.nameBn : pro.category.nameEn}
                </p>
              </div>
            </div>
            {pro.isVerified ? (
              <span className="text-xs bg-[var(--color-success)] text-white px-2 py-0.5 rounded-full font-medium">
                {t("verified")}
              </span>
            ) : (
              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                {t("notVerified")}
              </span>
            )}
          </div>

          <p className="text-sm text-[var(--color-ink)]/70 mb-3">
            {pro.area}, {pro.city} · {pro.yearsExperience} {t("yearsExp")}
          </p>
          {pro.ratePerVisit && (
            <p className="font-semibold text-base mb-3">৳{pro.ratePerVisit} {t("perVisit")}</p>
          )}
          {pro.bio && <p className="text-sm text-[var(--color-ink)]/85 mb-4">{pro.bio}</p>}
          <MapPreview latitude={pro.latitude} longitude={pro.longitude} title={`${pro.name}'s service area`} compact />
        </div>

        {/* Rating & Review Section */}
        <div className="signplate bg-white p-6">
          <div className="flex items-center justify-between gap-2 mb-4 border-b border-[var(--color-line)] pb-3">
            <h2 className="font-display font-bold text-lg">
              {t("rateThisPro")}
            </h2>
            {pro.avgRating && (
              <span className="text-sm font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">
                ★ {pro.avgRating.toFixed(1)} ({pro.reviews.length} {pro.reviews.length === 1 ? "review" : "reviews"})
              </span>
            )}
          </div>

          {/* Rating Submission Form - Strictly for registered users */}
          {user ? (
            isSelf ? (
              <div className="bg-slate-50 border border-slate-200 text-slate-700 text-sm p-4 rounded-xl">
                ℹ️ {t("cannotRateOwn")}
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit} className="space-y-4 mb-6 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink)]/80 uppercase tracking-wide mb-1.5">
                    {t("yourRating")} (1 - 5 ★)
                  </label>
                  <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Star rating">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const filled = (hoverRating ?? userRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="text-2xl transition-transform hover:scale-125 focus:outline-none"
                          aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        >
                          <span className={filled ? "text-amber-400" : "text-slate-300"}>★</span>
                        </button>
                      );
                    })}
                    <span className="text-xs font-bold ml-2 text-[var(--color-ink)]/70">
                      {userRating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-ink)]/80 uppercase tracking-wide mb-1">
                    {t("writeReview")}
                  </label>
                  <textarea
                    rows={2}
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder={t("writeReview")}
                    className="w-full bg-white rounded-lg border border-[var(--color-line)] p-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-teal)] focus:ring-1 focus:ring-[var(--color-teal)]"
                  />
                </div>

                {ratingMessage && (
                  <p
                    className={`text-xs font-medium p-2.5 rounded-lg ${
                      ratingMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {ratingMessage.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={ratingSubmitting}
                  className="bg-[var(--color-teal)] hover:opacity-90 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all disabled:opacity-50"
                >
                  {ratingSubmitting
                    ? t("loading")
                    : hasExistingReview
                    ? t("updateRating")
                    : t("submitRating")}
                </button>
              </form>
            )
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center mb-6">
              <p className="text-xs font-medium text-amber-900 mb-2">
                🔒 {t("loginToRate")}
              </p>
              <Link
                href={`/login?callbackUrl=/professional/${id}`}
                className="inline-block bg-[var(--color-teal)] text-white text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-all shadow-sm"
              >
                {t("loginToRateLink")}
              </Link>
            </div>
          )}

          {/* List of Previous Reviews */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[var(--color-ink)]/60 uppercase tracking-wider">
              {lang === "bn" ? "সকল রিভিউ" : "All Reviews"} ({pro.reviews.length})
            </h3>
            {pro.reviews.length === 0 ? (
              <p className="text-sm text-[var(--color-ink)]/60 italic">
                {lang === "bn" ? "এখনো কোনো রিভিউ দেওয়া হয়নি।" : "No reviews yet. Be the first to rate!"}
              </p>
            ) : (
              pro.reviews.map((r) => (
                <div key={r.id} className="border border-[var(--color-line)] rounded-xl p-3 bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <ProfilePhoto name={r.author} photoUrl={r.authorPhotoUrl} size="sm" />
                      <span className="text-xs font-bold text-[var(--color-ink)]">{r.author}</span>
                      {user && r.authorId === user.id && (
                        <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded-md">
                          {lang === "bn" ? "আপনি" : "You"}
                        </span>
                      )}
                    </div>
                    <div className="flex text-amber-400 text-xs">
                      {"★".repeat(r.rating)}
                      <span className="text-slate-300">{"★".repeat(5 - r.rating)}</span>
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-xs text-[var(--color-ink)]/80 mt-1 pl-8">
                      {r.comment}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Booking Request Form */}
      <div className="md:col-span-2">
        <div className="signplate bg-[var(--color-teal)] text-white p-6 sticky top-20">
          <h2 className="font-display font-bold text-lg mb-4">{t("bookNow")}</h2>
          {status === "sent" ? (
            <div className="bg-white/10 p-4 rounded-xl text-center space-y-2">
              <span className="text-2xl">✅</span>
              <p className="text-sm font-semibold">
                {lang === "bn" ? "অনুরোধ পাঠানো হয়েছে!" : "Request Sent!"}
              </p>
              <p className="text-xs text-white/80">
                {lang === "bn"
                  ? "আপনার বুকিং অনুরোধ সেবাদাতার কাছে পৌঁছে গেছে। ড্যাশবোর্ডে স্ট্যাটাস দেখতে পাবেন।"
                  : "Your booking request has been sent. You will see updates on your dashboard."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  {lang === "bn" ? "কী সমস্যা?" : "What's the problem?"}
                </label>
                <textarea
                  required
                  value={problemNote}
                  onChange={(e) => setProblemNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg px-3 py-2 text-[var(--color-ink)] bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">{t("chooseUpazila")}</label>
                <BangladeshUpazilaInput
                  required
                  value={bookingArea}
                  onChange={setBookingArea}
                  placeholder="Search your upazila"
                  className="w-full rounded-lg px-3 py-2 text-[var(--color-ink)] bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  {lang === "bn" ? "আপনার বিস্তারিত ঠিকানা" : "Your address details"}
                </label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-[var(--color-ink)] bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  {lang === "bn" ? "পছন্দের তারিখ ও সময়" : "Preferred date/time"}
                </label>
                <input
                  required
                  type="datetime-local"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-[var(--color-ink)] bg-white text-sm"
                />
              </div>
              {errorMsg && (
                <p className="text-xs bg-red-600/80 text-white p-2 rounded-lg">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-[var(--color-marigold)] hover:opacity-90 text-[var(--color-ink)] font-bold rounded-lg py-2.5 text-sm transition-all disabled:opacity-60 shadow-md"
              >
                {status === "sending" ? t("loading") : t("bookNow")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
