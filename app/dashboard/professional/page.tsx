"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import ProfilePhoto from "@/components/ProfilePhoto";
import BangladeshUpazilaInput from "@/components/BangladeshUpazilaInput";

type Category = { id: string; slug: string; nameEn: string; nameBn?: string };
type Booking = {
  id: string;
  status: string;
  problemNote: string;
  address: string;
  preferredDate: string;
  customer: { name: string; phone: string | null; photoUrl: string | null };
};

type ProfessionalProfile = {
  id: string;
  categoryId: string;
  bio: string;
  area: string;
  city: string;
  yearsExperience: number;
  ratePerVisit: number | null;
  isVerified: boolean;
  isAvailable: boolean;
  photoUrl: string | null;
  category?: { id: string; slug: string; nameEn: string; nameBn: string };
};

const statusColor: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: "bg-amber-100 border-amber-300", text: "text-amber-950 font-bold", dot: "bg-amber-600" },
  ACCEPTED: { bg: "bg-blue-100 border-blue-300", text: "text-blue-950 font-bold", dot: "bg-blue-600" },
  DECLINED: { bg: "bg-red-100 border-red-300", text: "text-red-950 font-bold", dot: "bg-red-600" },
  COMPLETED: { bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-950 font-bold", dot: "bg-emerald-600" },
  CANCELLED: { bg: "bg-slate-100 border-slate-300", text: "text-slate-800 font-bold", dot: "bg-slate-500" },
};

export default function ProfessionalDashboard() {
  const { user, status } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [categorySlug, setCategorySlug] = useState("");
  const [bio, setBio] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [yearsExperience, setYearsExperience] = useState(1);
  const [ratePerVisit, setRatePerVisit] = useState<number | "">("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/dashboard/professional");
    if (status === "authenticated" && user?.role && user.role !== "PROFESSIONAL") {
      const destination = user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/customer";
      router.push(destination);
    }
  }, [status, user, router]);

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

  useEffect(() => {
    if (status !== "authenticated" || user?.role !== "PROFESSIONAL") return;
    fetch("/api/professional/onboard")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const existingProfile = data?.profile as ProfessionalProfile | undefined;
        if (!existingProfile) {
          setProfileLoaded(true);
          return;
        }

        setProfile(existingProfile);
        setCategorySlug(existingProfile.category?.slug ?? "");
        setBio(existingProfile.bio ?? "");
        setArea(existingProfile.area ?? "");
        setCity(existingProfile.city ?? "");
        setYearsExperience(existingProfile.yearsExperience ?? 0);
        setRatePerVisit(existingProfile.ratePerVisit ?? "");
        setPhotoUrl(existingProfile.photoUrl ?? "");
        setIsAvailable(existingProfile.isAvailable ?? true);
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
  }, [status, user]);

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
        photoUrl,
        isAvailable,
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
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
  }

  if (status === "loading" || loading || !profileLoaded) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm">Loading professional portal...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10 motion-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-[var(--color-ink)]">
            Professional Portal
          </h1>
          <p className="text-xs text-slate-500">
            Manage your public service listing and incoming client booking requests
          </p>
        </div>
        {profile && (
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border w-fit ${
              profile.isVerified
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {profile.isVerified ? "✓ Verified Badge Active" : "⏳ Pending Verification"}
          </span>
        )}
      </div>

      {/* Listing Profile Settings Form */}
      <div className="signplate bg-white p-8 shadow-md border border-slate-200 space-y-6">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900">Service Profile & Rates</h2>
          <p className="text-xs text-slate-500">
            Keep this accurate so local customers in your upazila can contact and book you directly.
          </p>
        </div>

        <form onSubmit={handleOnboard} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Service Category
              </label>
              <select
                required
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white text-slate-900 focus:border-[var(--color-teal)] focus:ring-2 focus:ring-blue-100 focus:outline-none"
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 p-2.5 rounded-xl border border-slate-200 w-full">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="h-4 w-4 text-[var(--color-teal)] rounded"
                />
                <span>Available to receive new bookings</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Bio & Experience Details
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell customers about your skills, experience, and tools..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-[var(--color-teal)] focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Primary Upazila / Area
              </label>
              <BangladeshUpazilaInput
                required
                value={area}
                onChange={setArea}
                onLocationSelect={(location) => setCity(location.district)}
                placeholder="Select upazila"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                District
              </label>
              <input
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="District name"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[var(--color-teal)] focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Years of Experience
              </label>
              <input
                type="number"
                min={0}
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[var(--color-teal)] focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Rate per Visit (৳, optional)
              </label>
              <input
                type="number"
                min={0}
                value={ratePerVisit}
                onChange={(e) =>
                  setRatePerVisit(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="e.g. 500"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[var(--color-teal)] focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {saving ? "Saving listing..." : "Save Listing"}
            </button>
            {saved && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                ✅ Listing updated successfully!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Booking Requests Feed */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-xl text-slate-900">
          Client Booking Requests ({bookings.length})
        </h2>

        {bookings.length === 0 ? (
          <div className="signplate bg-white p-8 text-center text-xs text-slate-500 border border-slate-200">
            No booking requests yet. Once nearby customers submit a request, it will appear here.
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
                        name={b.customer.name}
                        photoUrl={b.customer.photoUrl}
                        size="md"
                      />
                      <div>
                        <span className="font-display font-bold text-base text-slate-900 block">
                          {b.customer.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {b.address} · {new Date(b.preferredDate).toLocaleString()}
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

                  <div className="py-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Problem Note:
                    </span>
                    <p className="text-sm text-slate-800 mt-1">{b.problemNote}</p>
                    {b.status === "ACCEPTED" && b.customer.phone && (
                      <p className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 p-2 rounded-lg mt-2 w-fit">
                        📞 Client Phone: {b.customer.phone}
                      </p>
                    )}
                  </div>

                  {/* Pro Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex gap-2">
                    {b.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() => updateBooking(b.id, "ACCEPTED")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs active:scale-95"
                        >
                          ✓ Accept Request
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBooking(b.id, "DECLINED")}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
                        >
                          ✕ Decline
                        </button>
                      </>
                    )}

                    {b.status === "ACCEPTED" && (
                      <button
                        type="button"
                        onClick={() => updateBooking(b.id, "COMPLETED")}
                        className="bg-[var(--color-teal)] hover:bg-[var(--color-teal-dark)] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs active:scale-95"
                      >
                        ✓ Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
