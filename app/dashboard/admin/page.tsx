"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import ProfilePhoto from "@/components/ProfilePhoto";

type Professional = {
  id: string;
  name: string;
  category: { nameEn: string };
  area: string;
  city: string;
  isVerified: boolean;
  photoUrl: string | null;
  isAvailable: boolean;
  latitude: number | null;
  longitude: number | null;
};

type AdminBooking = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED" | "CANCELLED";
  problemNote: string;
  address: string;
  preferredDate: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
  createdAt: string;
  photoUrl: string | null;
};

type AdminTab = "professionals" | "bookings" | "users";

type ProfessionalDetails = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    photoUrl: string | null;
  };
  category: { slug: string; nameEn: string; nameBn: string };
  bio: string;
  area: string;
  city: string;
  yearsExperience: number;
  ratePerVisit: number | null;
  isVerified: boolean;
  isAvailable: boolean;
  photoUrl: string | null;
  listingPhotoUrl: string | null;
  accountPhotoUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  stats: {
    totalBookings: number;
    completedBookings: number;
    reviewCount: number;
    avgRating: number | null;
  };
};

export default function AdminDashboard() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AdminTab>("professionals");
  const [search, setSearch] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalDetails | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/admin");
    } else if (status === "authenticated" && user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, user, router]);

  useEffect(() => {
    Promise.all([
      fetch("/api/professionals").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/bookings").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/admin/users").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([proData, bookingData, userData]) => {
        setProfessionals(Array.isArray(proData) ? proData : []);
        setBookings(Array.isArray(bookingData) ? bookingData : []);
        setUsers(Array.isArray(userData) ? userData : []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleVerify(id: string, isVerified: boolean) {
    setActionMessage("");
    await fetch(`/api/admin/professionals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !isVerified }),
    });
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isVerified: !isVerified } : p))
    );
    setSelectedProfessional((prev) =>
      prev && prev.id === id ? { ...prev, isVerified: !isVerified } : prev
    );
    setActionMessage("Professional verification status updated.");
  }

  async function toggleAvailability(id: string, isAvailable: boolean) {
    setActionMessage("");
    await fetch(`/api/admin/professionals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !isAvailable }),
    });
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isAvailable: !isAvailable } : p))
    );
    setSelectedProfessional((prev) =>
      prev && prev.id === id ? { ...prev, isAvailable: !isAvailable } : prev
    );
    setActionMessage("Professional availability updated.");
  }

  async function removeProfessional(id: string) {
    setActionMessage("");
    await fetch(`/api/admin/professionals/${id}`, { method: "DELETE" });
    setProfessionals((prev) => prev.filter((p) => p.id !== id));
    setSelectedProfessional((prev) => (prev?.id === id ? null : prev));
    setActionMessage("Professional listing removed.");
  }

  async function openProfessionalDetails(id: string) {
    setDetailsLoading(true);
    const res = await fetch(`/api/admin/professionals/${id}`);
    if (res.ok) {
      const data = await res.json();
      setSelectedProfessional(data);
    }
    setDetailsLoading(false);
  }

  async function updateBookingStatus(id: string, newStatus: AdminBooking["status"]) {
    setActionMessage("");
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus, updatedAt: new Date().toISOString() } : b))
    );
    setActionMessage("Booking status updated.");
  }

  async function deleteBooking(id: string) {
    setActionMessage("");
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setActionMessage("Booking deleted.");
  }

  async function changeUserRole(id: string, role: UserItem["role"]) {
    setActionMessage("");
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      setActionMessage("User role updated.");
    }
  }

  async function deleteUser(id: string) {
    setActionMessage("");
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setActionMessage("User deleted.");
    }
  }

  if (status !== "authenticated" || loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16">Loading…</div>;
  }

  const pendingCount = professionals.filter((p) => !p.isVerified).length;
  const availableCount = professionals.filter((p) => p.isAvailable).length;
  const displayedProfessionals = professionals.filter((p) => {
    const matchesSearch = `${p.name} ${p.category.nameEn} ${p.area}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (!showPendingOnly || !p.isVerified);
  });
  const displayedBookings = bookings.filter((b) =>
    `${b.customerName} ${b.problemNote} ${b.address} ${b.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const displayedUsers = users.filter((u) =>
    `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-extrabold mb-2">Admin control center</h1>
      <p className="text-sm text-[var(--color-ink)]/70 mb-6">
        Full access: manage professionals, bookings, and user roles.
      </p>
      {actionMessage && (
        <p className="mb-4 rounded-lg border-2 border-[var(--color-line)] bg-white px-3 py-2 text-sm">
          {actionMessage}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="signplate bg-white p-3"><p className="text-xs text-[var(--color-ink)]/60">Professionals</p><p className="font-display text-xl font-bold">{professionals.length}</p></div>
        <div className="signplate bg-white p-3"><p className="text-xs text-[var(--color-ink)]/60">Pending review</p><p className="font-display text-xl font-bold">{pendingCount}</p></div>
        <div className="signplate bg-white p-3"><p className="text-xs text-[var(--color-ink)]/60">Available now</p><p className="font-display text-xl font-bold">{availableCount}</p></div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button onClick={() => setTab("professionals")} className={`rounded-lg border-2 border-[var(--color-ink)] px-3 py-1.5 text-sm font-semibold ${tab === "professionals" ? "bg-[var(--color-marigold)]" : "bg-white"}`}>Professionals</button>
        <button onClick={() => setTab("bookings")} className={`rounded-lg border-2 border-[var(--color-ink)] px-3 py-1.5 text-sm font-semibold ${tab === "bookings" ? "bg-[var(--color-marigold)]" : "bg-white"}`}>Bookings</button>
        <button onClick={() => setTab("users")} className={`rounded-lg border-2 border-[var(--color-ink)] px-3 py-1.5 text-sm font-semibold ${tab === "users" ? "bg-[var(--color-marigold)]" : "bg-white"}`}>Users</button>
      </div>
      <div className="mb-5 flex flex-wrap gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search professional, service, or area" className="min-w-[220px] flex-1 rounded-lg border-2 border-[var(--color-ink)] bg-white px-3 py-2 text-sm" />
        {tab === "professionals" && (
          <button onClick={() => setShowPendingOnly((value) => !value)} className={`rounded-lg border-2 border-[var(--color-ink)] px-3 py-2 text-sm font-semibold ${showPendingOnly ? "bg-[var(--color-marigold)]" : "bg-white"}`}>{showPendingOnly ? "Showing pending" : "Show pending only"}</button>
        )}
      </div>
      {tab === "professionals" && (
        <div className="space-y-3">
          {displayedProfessionals.map((p) => (
            <div
              key={p.id}
              className="signplate bg-white p-4 flex items-center justify-between gap-4 cursor-pointer"
              onClick={() => openProfessionalDetails(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openProfessionalDetails(p.id);
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <ProfilePhoto name={p.name} photoUrl={p.photoUrl} size="md" />
                <div>
                  <p className="font-display font-bold">{p.name}</p>
                  <p className="text-sm text-[var(--color-ink)]/70">
                    {p.category.nameEn} · {p.area}, {p.city}
                  </p>
                  <p className="text-xs text-[var(--color-ink)]/55">Click to review full profile data</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVerify(p.id, p.isVerified);
                  }}
                  className={`signplate px-4 py-1.5 text-sm font-semibold whitespace-nowrap ${
                    p.isVerified ? "bg-white" : "bg-[var(--color-success)] text-white"
                  }`}
                >
                  {p.isVerified ? "Unverify" : "Verify"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAvailability(p.id, p.isAvailable);
                  }}
                  className="signplate bg-white px-4 py-1.5 text-sm font-semibold whitespace-nowrap"
                >
                  {p.isAvailable ? "Set unavailable" : "Set available"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeProfessional(p.id);
                  }}
                  className="signplate bg-red-600 px-4 py-1.5 text-sm font-semibold text-white whitespace-nowrap"
                >
                  Remove listing
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "bookings" && (
        <div className="space-y-3">
          {displayedBookings.map((b) => (
            <div key={b.id} className="signplate bg-white p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-display font-bold">{b.customerName}</p>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold">{b.status}</span>
              </div>
              <p className="text-sm text-[var(--color-ink)]/80">{b.problemNote}</p>
              <p className="mb-3 text-xs text-[var(--color-ink)]/60">{b.address} · {new Date(b.preferredDate).toLocaleString()}</p>
              <div className="flex flex-wrap gap-2">
                {(["PENDING", "ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"] as const).map((state) => (
                  <button key={state} onClick={() => updateBookingStatus(b.id, state)} className="signplate bg-white px-3 py-1 text-xs font-semibold">
                    {state}
                  </button>
                ))}
                <button onClick={() => deleteBooking(b.id)} className="signplate bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-3">
          {displayedUsers.map((u) => (
            <div key={u.id} className="signplate bg-white p-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <ProfilePhoto name={u.name} photoUrl={u.photoUrl} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-display font-bold">{u.name}</p>
                  <p className="truncate text-xs text-[var(--color-ink)]/65">{u.email}</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <select
                  value={u.role}
                  onChange={(e) => changeUserRole(u.id, e.target.value as UserItem["role"])}
                  className="rounded-lg border-2 border-[var(--color-ink)] bg-white px-2 py-1 text-xs font-semibold"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="PROFESSIONAL">PROFESSIONAL</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button onClick={() => deleteUser(u.id)} className="signplate bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                  Delete user
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(selectedProfessional || detailsLoading) && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setSelectedProfessional(null)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border-2 border-[var(--color-ink)] bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-extrabold">Professional profile review</h2>
              <button className="rounded-lg border-2 border-[var(--color-ink)] px-3 py-1 text-sm font-semibold" onClick={() => setSelectedProfessional(null)}>Close</button>
            </div>
            {detailsLoading || !selectedProfessional ? (
              <p className="text-sm text-[var(--color-ink)]/70">Loading profile data...</p>
            ) : (
              <div className="space-y-5 text-sm">
                <div className="flex items-center gap-4">
                  <ProfilePhoto name={selectedProfessional.user.name} photoUrl={selectedProfessional.photoUrl} size="lg" />
                  <div>
                    <p className="font-display text-lg font-bold">{selectedProfessional.user.name}</p>
                    <p className="text-[var(--color-ink)]/65">{selectedProfessional.user.email}</p>
                    <p className="text-[var(--color-ink)]/65">{selectedProfessional.user.phone ?? "No phone"}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border-2 border-[var(--color-line)] p-3">
                    <p className="text-xs text-[var(--color-ink)]/55">Category</p>
                    <p className="font-semibold">{selectedProfessional.category.nameEn}</p>
                    <p className="text-xs text-[var(--color-ink)]/65">{selectedProfessional.category.slug}</p>
                  </div>
                  <div className="rounded-lg border-2 border-[var(--color-line)] p-3">
                    <p className="text-xs text-[var(--color-ink)]/55">Status</p>
                    <p className="font-semibold">{selectedProfessional.isVerified ? "Verified" : "Not verified"}</p>
                    <p className="text-xs text-[var(--color-ink)]/65">{selectedProfessional.isAvailable ? "Available" : "Unavailable"}</p>
                  </div>
                  <div className="rounded-lg border-2 border-[var(--color-line)] p-3">
                    <p className="text-xs text-[var(--color-ink)]/55">Location</p>
                    <p className="font-semibold">{selectedProfessional.area}, {selectedProfessional.city}</p>
                    <p className="text-xs text-[var(--color-ink)]/65">Lat: {selectedProfessional.latitude ?? "-"} · Lng: {selectedProfessional.longitude ?? "-"}</p>
                  </div>
                  <div className="rounded-lg border-2 border-[var(--color-line)] p-3">
                    <p className="text-xs text-[var(--color-ink)]/55">Experience and rate</p>
                    <p className="font-semibold">{selectedProfessional.yearsExperience} years</p>
                    <p className="text-xs text-[var(--color-ink)]/65">{selectedProfessional.ratePerVisit ? `BDT ${selectedProfessional.ratePerVisit} per visit` : "Rate not set"}</p>
                  </div>
                </div>

                <div className="rounded-lg border-2 border-[var(--color-line)] p-3">
                  <p className="text-xs text-[var(--color-ink)]/55">Bio</p>
                  <p>{selectedProfessional.bio || "No bio provided"}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border-2 border-[var(--color-line)] p-3"><p className="text-xs text-[var(--color-ink)]/55">Total bookings</p><p className="font-display text-lg font-bold">{selectedProfessional.stats.totalBookings}</p></div>
                  <div className="rounded-lg border-2 border-[var(--color-line)] p-3"><p className="text-xs text-[var(--color-ink)]/55">Completed bookings</p><p className="font-display text-lg font-bold">{selectedProfessional.stats.completedBookings}</p></div>
                  <div className="rounded-lg border-2 border-[var(--color-line)] p-3"><p className="text-xs text-[var(--color-ink)]/55">Reviews</p><p className="font-display text-lg font-bold">{selectedProfessional.stats.reviewCount}{selectedProfessional.stats.avgRating ? ` · ${selectedProfessional.stats.avgRating.toFixed(1)}★` : ""}</p></div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => toggleVerify(selectedProfessional.id, selectedProfessional.isVerified)}
                    className={`signplate px-4 py-1.5 text-sm font-semibold ${selectedProfessional.isVerified ? "bg-white" : "bg-[var(--color-success)] text-white"}`}
                  >
                    {selectedProfessional.isVerified ? "Unverify" : "Verify"}
                  </button>
                  <button
                    onClick={() => toggleAvailability(selectedProfessional.id, selectedProfessional.isAvailable)}
                    className="signplate bg-white px-4 py-1.5 text-sm font-semibold"
                  >
                    {selectedProfessional.isAvailable ? "Set unavailable" : "Set available"}
                  </button>
                  <button
                    onClick={() => removeProfessional(selectedProfessional.id)}
                    className="signplate bg-red-600 px-4 py-1.5 text-sm font-semibold text-white"
                  >
                    Remove listing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
