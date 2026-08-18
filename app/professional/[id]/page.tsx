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
      setErrorMsg("Only client accounts can request direct bookings. You can switch to Client in My Account.");
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
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-600 font-medium text-sm">{t("loading")}</div>;
  }

  const isSelf = user?.id === pro.userId;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-5 gap-8">
      {/* Left Column: Details & Ratings */}
      <div className="md:col-span-3 space-y-6">
        {/* Profile Card */}
        <div className="signplate bg-white p-6 md:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <ProfilePhoto name={pro.name} photoUrl={pro.photoUrl} size="lg" />
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">{pro.name}</h1>
                <p className="text-blue-700 font-bold text-sm">
                  {lang === "bn" ? pro.category.nameBn : pro.category.nameEn}
                </p>
              </div>
            </div>
            {pro.isVerified ? (
              <span className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-full font-bold shadow-2xs">
                ✓ {t("verified")}
              </span>
            ) : (
              <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-semibold border border-slate-200">
                {t("notVerified")}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-600">
              📍 {pro.area}, {pro.city} · <span className="text-slate-800">{pro.yearsExperience} {t("yearsExp")}</span>
            </p>

            {pro.ratePerVisit && (
              <p className="font-black text-slate-950 text-lg">৳{pro.ratePerVisit} <span className="text-xs font-semibold text-slate-500">{t("perVisit")}</span></p>
            )}

            {pro.bio && (
              <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/70">
                {pro.bio}
              </p>
            )}

            <MapPreview latitude={pro.latitude} longitude={pro.longitude} title={`${pro.name}'s service area`} compact />
          </div>
        </div>

        {/* Rating & Review Section */}
        <div className="signplate bg-white p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <h2 className="font-display font-extrabold text-xl text-slate-900">
              {t("rateThisPro")}
            </h2>
            {pro.avgRating && (
              <span className="text-xs font-black bg-amber-50 text-amber-950 border border-amber-300 px-3 py-1 rounded-full">
                ★ {pro.avgRating.toFixed(1)} ({pro.reviews.length} {pro.reviews.length === 1 ? "review" : "reviews"})
              </span>
            )}
          </div>

          {/* Rating Submission Form - Strictly for registered users */}
          {user ? (
            isSelf ? (
              <div className="bg-slate-50 border border-slate-200 text-slate-800 font-medium text-xs p-3.5 rounded-xl">
                ℹ️ {t("cannotRateOwn")}
              </div>
            ) : (
              <form onSubmit={handleRatingSubmit} className="space-y-4 bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
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
                          className="text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                          aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        >
                          <span className={filled ? "text-amber-400" : "text-slate-300"}>★</span>
                        </button>
                      );
                    })}
                    <span className="text-xs font-bold ml-2 text-slate-800">
                      {userRating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                    {t("writeReview")}
                  </label>
                  <textarea
                    rows={2}
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder={t("writeReview")}
                    className="w-full bg-white rounded-xl border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {ratingMessage && (
                  <p
                    className={`text-xs font-bold p-3 rounded-xl ${
                      ratingMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
                        : "bg-red-50 text-red-900 border border-red-300"
                    }`}
                  >
                    {ratingMessage.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={ratingSubmitting}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs"
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
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-center space-y-3">
              <p className="text-xs font-bold text-amber-950">
                🔒 {t("loginToRate")}
              </p>
              <Link
                href={`/login?callbackUrl=/professional/${id}`}
                className="inline-block bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-xs"
              >
                {t("loginToRateLink")}
              </Link>
            </div>
          )}

          {/* List of Previous Reviews */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {lang === "bn" ? "সকল রিভিউ" : "All Reviews"} ({pro.reviews.length})
            </h3>
            {pro.reviews.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                {lang === "bn" ? "এখনো কোনো রিভিউ দেওয়া হয়নি।" : "No reviews yet. Be the first to rate!"}
              </p>
            ) : (
              pro.reviews.map((r) => (
                <div key={r.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <ProfilePhoto name={r.author} photoUrl={r.authorPhotoUrl} size="sm" />
                      <span className="text-xs font-bold text-slate-900">{r.author}</span>
                      {user && r.authorId === user.id && (
                        <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.2 rounded">
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
                    <p className="text-xs text-slate-800 pl-8 leading-relaxed font-normal">
                      {r.comment}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Modern & Minimal Booking Request Form */}
      <div className="md:col-span-2">
        <div className="bg-white p-6 md:p-7 rounded-3xl sticky top-20 shadow-xl border border-slate-200/90 space-y-5">
          <div className="space-y-1.5 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 text-[11px] font-bold text-blue-800">
                <span>🤝</span>
                <span>Free Direct Request</span>
              </span>
              {pro.ratePerVisit && (
                <span className="text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                  ৳{pro.ratePerVisit}/visit
                </span>
              )}
            </div>
            <h2 className="font-display font-extrabold text-xl text-slate-900">{t("bookNow")}</h2>
            <p className="text-xs text-slate-500 font-medium">
              {lang === "bn"
                ? `সরাসরি ${pro.name}-এর কাছে কাজের অনুরোধ পাঠান।`
                : `Connect directly with ${pro.name} with zero middleman fees.`}
            </p>
          </div>

          {status === "sent" ? (
            <div className="bg-emerald-50/80 p-6 rounded-2xl text-center space-y-3 border border-emerald-200 motion-enter">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto font-bold shadow-2xs">
                ✓
              </div>
              <p className="text-sm font-extrabold text-slate-900">
                {lang === "bn" ? "অনুরোধ সফলভাবে পাঠানো হয়েছে!" : "Request Sent Successfully!"}
              </p>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {lang === "bn"
                  ? `${pro.name} আপনার কাজের বিবরণ পেয়েছেন। ড্যাশবোর্ডে গিয়ে স্ট্যাটাস ও আপডেট দেখতে পারবেন।`
                  : `${pro.name} has received your job details. You can track communication and status in your dashboard.`}
              </p>
              <Link
                href="/dashboard/customer"
                className="inline-block mt-2 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition-all shadow-xs"
              >
                Go to Dashboard →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  {lang === "bn" ? "কী সমস্যা? (কাজের বিবরণ)" : "What's the problem?"} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={problemNote}
                  onChange={(e) => setProblemNote(e.target.value)}
                  placeholder={lang === "bn" ? "যেমন: বেসিনের পাইপ লিক করছে, মেরামত দরকার..." : "Describe the job requirements..."}
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  {t("chooseUpazila")} <span className="text-red-500">*</span>
                </label>
                <BangladeshUpazilaInput
                  required
                  value={bookingArea}
                  onChange={setBookingArea}
                  placeholder={lang === "bn" ? "উপজেলা খুঁজুন" : "Search your upazila"}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white p-2.5 text-xs text-slate-900 focus:border-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  {lang === "bn" ? "বিস্তারিত ঠিকানা / ল্যান্ডমার্ক" : "Street Address / Landmark"} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={lang === "bn" ? "বাড়ি নং, রোড নং, পরিচিত জায়গা..." : "House, road, landmark..."}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  {lang === "bn" ? "পছন্দের তারিখ ও সময়" : "Preferred Date & Time"} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="datetime-local"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50/50 hover:bg-white focus:bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all"
                />
              </div>

              {errorMsg && (
                <p className="text-xs bg-red-50 border border-red-300 text-red-900 p-3 rounded-xl font-bold">
                  ⚠️ {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl py-3.5 text-xs tracking-wider transition-all disabled:opacity-60 shadow-md hover:shadow-lg active:scale-95 cursor-pointer uppercase flex items-center justify-center gap-2"
              >
                <span>{status === "sending" ? "Sending Request..." : (lang === "bn" ? "অনুরোধ পাঠান (সম্পূর্ণ ফ্রি)" : "Send Request (Free)")}</span>
                <span>→</span>
              </button>

              <div className="flex items-center justify-center gap-3 text-[11px] font-semibold text-slate-500 pt-1">
                <span>Verified Pro</span>
                <span>•</span>
                <span>Direct Contact</span>
                <span>•</span>
                <span>0% Commission</span>
              </div>
            </form>
          )}

          <div className="pt-3 text-center border-t border-slate-100">
            <Link
              href="/instant-book"
              className="text-[11px] font-extrabold text-red-600 hover:text-red-800 hover:underline inline-flex items-center gap-1.5"
            >
              <span>{lang === "bn" ? "জরুরি সার্ভিস দরকার? ইনস্ট্যান্ট বুকিং করুন" : "Need Urgent Help? Instant Book (No Account)"}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
