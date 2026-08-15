"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

type Booking = {
  id: string;
  status: string;
  problemNote: string;
  address: string;
  preferredDate: string;
  professional: {
    user: { name: string };
    category: { nameEn: string };
  };
};

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-200 text-yellow-900",
  ACCEPTED: "bg-blue-200 text-blue-900",
  DECLINED: "bg-red-200 text-red-900",
  COMPLETED: "bg-green-200 text-green-900",
  CANCELLED: "bg-gray-200 text-gray-700",
};

export default function CustomerDashboard() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/dashboard/customer");
  }, [status, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/bookings")
        .then((r) => r.json())
        .then(setBookings)
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
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment }),
    });
    setReviewing(null);
    setComment("");
    setRating(5);
  }

  if (status === "loading" || loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16">Loading…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-extrabold mb-6">My bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-[var(--color-ink)]/70">
          You haven&apos;t requested any bookings yet. Go{" "}
          <a href="/browse" className="underline font-medium">
            browse professionals
          </a>{" "}
          in your area.
        </p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="signplate bg-white p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-display font-bold">{b.professional.user.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[b.status]}`}>
                  {b.status}
                </span>
              </div>
              <p className="text-sm text-[var(--color-teal)] font-semibold mb-1">
                {b.professional.category.nameEn}
              </p>
              <p className="text-sm text-[var(--color-ink)]/75 mb-1">{b.problemNote}</p>
              <p className="text-xs text-[var(--color-ink)]/60">
                {b.address} · {new Date(b.preferredDate).toLocaleString()}
              </p>

              {b.status === "PENDING" && (
                <button
                  onClick={() => cancelBooking(b.id)}
                  className="mt-3 text-sm underline text-red-700"
                >
                  Cancel request
                </button>
              )}

              {b.status === "COMPLETED" && (
                <div className="mt-3">
                  {reviewing === b.id ? (
                    <div className="space-y-2 border-t-2 border-[var(--color-line)] pt-3">
                      <label className="block text-xs font-medium">Rating (1-5)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="border-2 border-[var(--color-ink)] rounded-lg px-2 py-1 w-20"
                      />
                      <textarea
                        placeholder="How was the service?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full border-2 border-[var(--color-ink)] rounded-lg px-2 py-1"
                      />
                      <button
                        onClick={() => submitReview(b.id)}
                        className="signplate bg-[var(--color-marigold)] px-4 py-1.5 text-sm font-semibold"
                      >
                        Submit review
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewing(b.id)}
                      className="text-sm underline font-medium"
                    >
                      Leave a review
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
