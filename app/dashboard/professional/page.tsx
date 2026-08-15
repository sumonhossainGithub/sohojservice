"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

type Category = { id: string; slug: string; nameEn: string };
type Booking = {
  id: string;
  status: string;
  problemNote: string;
  address: string;
  preferredDate: string;
  customer: { name: string; phone: string | null };
};

const statusColor: Record<string, string> = {
  PENDING: "bg-yellow-200 text-yellow-900",
  ACCEPTED: "bg-blue-200 text-blue-900",
  DECLINED: "bg-red-200 text-red-900",
  COMPLETED: "bg-green-200 text-green-900",
  CANCELLED: "bg-gray-200 text-gray-700",
};

export default function ProfessionalDashboard() {
  const { user, status } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [categorySlug, setCategorySlug] = useState("");
  const [bio, setBio] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Sirajganj");
  const [yearsExperience, setYearsExperience] = useState(1);
  const [ratePerVisit, setRatePerVisit] = useState<number | "">("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/dashboard/professional");
  }, [status, router]);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setBookings(data))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  async function handleOnboard(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/professional/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categorySlug,
        bio,
        area,
        city,
        yearsExperience,
        ratePerVisit: ratePerVisit || undefined,
      }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  async function updateBooking(id: string, newStatus: string) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  }

  if (status === "loading" || loading) {
    return <div className="max-w-3xl mx-auto px-4 py-16">Loading…</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div>
        <h1 className="font-display text-2xl font-extrabold mb-2">Your listing</h1>
        <p className="text-sm text-[var(--color-ink)]/70 mb-4">
          Fill this in (or update it any time) so customers can find and book you. New listings
          are reviewed by an admin before showing the &quot;Verified&quot; badge.
        </p>
        <form onSubmit={handleOnboard} className="signplate bg-white p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Service category</label>
            <select
              required
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full border-2 border-[var(--color-ink)] rounded-lg px-3 py-2"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.nameEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Short bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full border-2 border-[var(--color-ink)] rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Area</label>
              <input
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Sirajganj Sadar"
                className="w-full border-2 border-[var(--color-ink)] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full border-2 border-[var(--color-ink)] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Years of experience</label>
              <input
                type="number"
                min={0}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full border-2 border-[var(--color-ink)] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Rate per visit (৳, optional)</label>
              <input
                type="number"
                min={0}
                value={ratePerVisit}
                onChange={(e) =>
                  setRatePerVisit(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="w-full border-2 border-[var(--color-ink)] rounded-lg px-3 py-2"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="signplate bg-[var(--color-marigold)] px-5 py-2 font-semibold disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save listing"}
          </button>
          {saved && <p className="text-sm text-[var(--color-success)]">Saved!</p>}
        </form>
      </div>

      <div>
        <h2 className="font-display text-xl font-extrabold mb-4">Booking requests</h2>
        {bookings.length === 0 ? (
          <p className="text-[var(--color-ink)]/70">No booking requests yet.</p>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="signplate bg-white p-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold">{b.customer.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[b.status]}`}>
                    {b.status}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-ink)]/75 mb-1">{b.problemNote}</p>
                <p className="text-xs text-[var(--color-ink)]/60 mb-3">
                  {b.address} · {new Date(b.preferredDate).toLocaleString()}
                  {b.status === "ACCEPTED" && b.customer.phone
                    ? ` · ${b.customer.phone}`
                    : ""}
                </p>

                {b.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateBooking(b.id, "ACCEPTED")}
                      className="signplate bg-[var(--color-success)] text-white px-4 py-1.5 text-sm font-semibold"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateBooking(b.id, "DECLINED")}
                      className="signplate bg-white px-4 py-1.5 text-sm font-semibold"
                    >
                      Decline
                    </button>
                  </div>
                )}
                {b.status === "ACCEPTED" && (
                  <button
                    onClick={() => updateBooking(b.id, "COMPLETED")}
                    className="signplate bg-[var(--color-teal)] text-white px-4 py-1.5 text-sm font-semibold"
                  >
                    Mark completed
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
