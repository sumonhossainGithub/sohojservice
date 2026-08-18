"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfilePhoto from "@/components/ProfilePhoto";
import RoleSwitchModal from "@/components/RoleSwitchModal";

type Booking = {
  id: string;
  status: string;
  problemNote: string;
  address: string;
  preferredDate: string;
  professional?: {
    user?: { name: string; photoUrl: string | null };
    category?: { nameEn: string };
  };
};

const statusColor: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: "bg-amber-100 border-amber-300", text: "text-amber-950 font-bold", dot: "bg-amber-600" },
  ACCEPTED: { bg: "bg-blue-100 border-blue-300", text: "text-blue-950 font-bold", dot: "bg-blue-600" },
  DECLINED: { bg: "bg-red-100 border-red-300", text: "text-red-950 font-bold", dot: "bg-red-600" },
  COMPLETED: { bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-950 font-bold", dot: "bg-emerald-600" },
  CANCELLED: { bg: "bg-slate-100 border-slate-300", text: "text-slate-800 font-bold", dot: "bg-slate-500" },
};

export default function CustomerDashboard() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/dashboard/customer");
  }, [status, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/bookings")
        .then((r) => r.json())
        .then((data) => setBookings(Array.isArray(data) ? data : []))
        .finally(() => setLoading(false));
    }
  }, [user]);

  async function cancelBooking(id: string) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b)));
  }

  async function submitReview(bookingId: string) {
    setSubmittingReview(true);
    setReviewMessage("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment }),
    });
    setSubmittingReview(false);

    if (res.ok) {
      setReviewing(null);
      setComment("");
      setRating(5);
      setReviewMessage("Review submitted successfully!");
    } else {
      const d = await res.json();
      setReviewMessage(d.error || "Could not submit review.");
    }
  }

  if (status === "loading" || loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm">Loading your bookings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 motion-enter space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-[var(--color-ink)]">
            My Bookings
          </h1>
          <p className="text-xs text-slate-500">
            Track your service requests, booking statuses, and reviews
          </p>
        </div>
        <Link
          href="/browse"
          className="bg-[var(--color-teal)] hover:bg-[var(--color-teal-dark)] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 w-fit"
        >
          + Request New Service
        </Link>
      </div>

      {/* Become a Professional Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl shrink-0">
            🛠️
          </span>
          <div>
            <h2 className="font-display font-extrabold text-sm text-indigo-950">
              Are you a skilled technician or service provider?
            </h2>
            <p className="text-xs text-indigo-900/80 font-medium">
              List your electrical, plumbing, AC or repair services and get direct customer jobs across your upazila.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setRoleModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer active:scale-95 text-center"
        >
          🚀 Switch to Pro Mode
        </button>
      </div>

      {reviewMessage && (
        <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-medium">
          {reviewMessage}
        </p>
      )}

      {bookings.length === 0 ? (
        <div className="signplate bg-white p-12 text-center space-y-4 shadow-sm border border-slate-200">
          <span className="text-4xl block">📋</span>
          <h2 className="font-display font-bold text-lg text-slate-800">No bookings yet</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t requested any service bookings yet. Explore top-rated local professionals in your upazila.
          </p>
          <Link
            href="/browse"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs"
          >
            Browse Professionals
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const sc = statusColor[b.status] ?? statusColor.PENDING;
            return (
              <div
                key={b.id}
                className="signplate bg-white p-6 shadow-sm border border-slate-200/90 transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <ProfilePhoto
                      name={b.professional?.user?.name ?? "Professional"}
                      photoUrl={b.professional?.user?.photoUrl}
                      size="md"
                    />
                    <div>
                      <span className="font-display font-bold text-base text-slate-900 block">
                        {b.professional?.user?.name ?? "Professional unavailable"}
                      </span>
                      <span className="text-xs font-semibold text-[var(--color-teal)]">
                        {b.professional?.category?.nameEn ?? "Service Professional"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${sc.bg} ${sc.text} w-fit`}
                  >
                    <span className={`h-2 w-2 rounded-full ${sc.dot}`} />
                    {b.status}
                  </span>
                </div>

                <div className="py-3 space-y-2 text-sm">
                  <div>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                      Problem / Service Note:
                    </span>
                    <p className="text-sm text-slate-900 font-medium mt-0.5 leading-relaxed">{b.problemNote}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 font-semibold pt-1">
                    <span>📍 {b.address}</span>
                    <span>🗓️ {new Date(b.preferredDate).toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {b.status === "PENDING" && (
                    <button
                      type="button"
                      onClick={() => cancelBooking(b.id)}
                      className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Cancel Request
                    </button>
                  )}

                  {b.status === "COMPLETED" && (
                    <div className="w-full">
                      {reviewing === b.id ? (
                        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 motion-enter">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                            Rate your experience (1 - 5 ★)
                          </label>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="text-2xl text-amber-400 hover:scale-125 transition-transform"
                              >
                                {rating >= star ? "★" : "☆"}
                              </button>
                            ))}
                            <span className="text-xs font-bold ml-2 text-slate-600">{rating} / 5</span>
                          </div>

                          <textarea
                            placeholder="Share your feedback..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={2}
                            className="w-full bg-white rounded-lg border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={submittingReview}
                              onClick={() => submitReview(b.id)}
                              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs active:scale-95 disabled:opacity-60"
                            >
                              {submittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setReviewing(null)}
                              className="text-xs text-slate-500 hover:text-slate-700 px-3 py-2"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setReviewing(b.id)}
                          className="text-xs font-bold text-[var(--color-teal)] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-1.5 rounded-lg transition-colors"
                        >
                          ⭐ Rate & Review Service
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RoleSwitchModal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} targetRole="PROFESSIONAL" />
    </div>
  );
}
