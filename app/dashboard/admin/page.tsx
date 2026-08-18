"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import ProfilePhoto from "@/components/ProfilePhoto";
import BangladeshUpazilaInput from "@/components/BangladeshUpazilaInput";

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

type InstantBookingItem = {
  id: string;
  customerName: string;
  customerPhone: string;
  categoryName: string;
  problemDescription: string;
  area: string;
  fullAddress: string;
  urgency: string;
  status: "NEW" | "CONTACTED" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
  assignedProfessionalId: string | null;
  assignedProfessional?: {
    user?: { name: string; phone: string | null };
    category?: { nameEn: string };
  } | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type AdminCategory = {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  icon: string;
  proCount?: number;
};

type AdminTab = "instantBookings" | "professionals" | "bookings" | "users" | "completedTasks" | "categories";
type TimeframeFilter = "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR";

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

function isDateToday(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

function isDateThisWeek(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

function isDateThisMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function isDateThisYear(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear();
}

const ICON_THEMES = [
  { id: "wrench", emoji: "🔧", label: "Mechanic / Repair" },
  { id: "zap", emoji: "⚡", label: "Electrician / Wiring" },
  { id: "droplet", emoji: "💧", label: "Plumber / Water" },
  { id: "wind", emoji: "💨", label: "AC Cooling / Air" },
  { id: "snowflake", emoji: "❄️", label: "Fridge / Freeze" },
  { id: "sparkles", emoji: "✨", label: "Deep Cleaning" },
  { id: "paintbrush", emoji: "🖌️", label: "House Painter" },
  { id: "hammer", emoji: "🔨", label: "Carpenter / Wood" },
  { id: "smartphone", emoji: "📱", label: "Mobile Repair" },
  { id: "monitor", emoji: "💻", label: "Computer / IT" },
  { id: "wifi", emoji: "📶", label: "WiFi / Internet" },
  { id: "camera", emoji: "📷", label: "CCTV / Security" },
  { id: "book-open", emoji: "📖", label: "Home Tutor" },
  { id: "battery-charging", emoji: "🔋", label: "IPS / Battery" },
  { id: "sun", emoji: "☀️", label: "Solar Energy" },
  { id: "flame", emoji: "🔥", label: "Gas Stove" },
  { id: "filter", emoji: "🚰", label: "Water Purifier" },
  { id: "activity", emoji: "⚙️", label: "Motor & Pump" },
  { id: "shield", emoji: "🛡️", label: "Pest Control" },
  { id: "tool", emoji: "🛠️", label: "Welding / Metal" },
  { id: "grid", emoji: "🧱", label: "Tiles & Masonry" },
  { id: "truck", emoji: "🚚", label: "Shifting & Movers" },
  { id: "tv", emoji: "📺", label: "TV & Electronics" },
  { id: "scissors", emoji: "✂️", label: "Beauty & Salon" },
  { id: "aperture", emoji: "📸", label: "Photography" },
  { id: "trash", emoji: "🗑️", label: "Septic Cleaning" },
  { id: "car", emoji: "🚗", label: "Car & Bike" },
  { id: "home", emoji: "🏠", label: "Renovation" },
  { id: "lock", emoji: "🔒", label: "Locksmith / Key" },
  { id: "briefcase", emoji: "💼", label: "General Contractor" },
];

function getCategoryEmoji(icon?: string, slug?: string) {
  const found = ICON_THEMES.find((t) => t.id === icon);
  if (found) return found.emoji;

  const bySlug: Record<string, string> = {
    electrician: "⚡",
    plumber: "💧",
    "ac-repair": "💨",
    refrigerator: "❄️",
    cleaning: "✨",
    painter: "🖌️",
    carpenter: "🔨",
    "mobile-repair": "📱",
    computer: "💻",
    "internet-tech": "📶",
    cctv: "📷",
    tutor: "📖",
    ips: "🔋",
    solar: "☀️",
    "gas-stove": "🔥",
    "water-purifier": "🚰",
    "generator-motor": "⚙️",
    "pest-control": "🛡️",
    welder: "🛠️",
    masonry: "🧱",
    "movers-packers": "🚚",
    electronics: "📺",
    salon: "✂️",
    photographer: "📸",
    "septic-tank": "🗑️",
  };

  if (slug && bySlug[slug]) return bySlug[slug];
  return "📂";
}

export default function AdminDashboard() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [instantBookingsList, setInstantBookingsList] = useState<InstantBookingItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AdminTab>("instantBookings");
  const [search, setSearch] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [timeframe, setTimeframe] = useState<TimeframeFilter>("ALL");
  const [actionMessage, setActionMessage] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Category Modals State
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [newCatNameBn, setNewCatNameBn] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("wrench");
  const [createCatError, setCreateCatError] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [editCatNameEn, setEditCatNameEn] = useState("");
  const [editCatNameBn, setEditCatNameBn] = useState("");
  const [editCatSlug, setEditCatSlug] = useState("");
  const [editCatIcon, setEditCatIcon] = useState("wrench");
  const [editCatError, setEditCatError] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  // Selected Professional Detail Modal State
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalDetails | null>(null);
  const [editingProBio, setEditingProBio] = useState("");
  const [editingProArea, setEditingProArea] = useState("");
  const [editingProCity, setEditingProCity] = useState("");
  const [editingProExp, setEditingProExp] = useState(0);
  const [editingProRate, setEditingProRate] = useState<number | "">("");
  const [savingPro, setSavingPro] = useState(false);

  // Selected User Detail Modal State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [editingUserName, setEditingUserName] = useState("");
  const [editingUserPhone, setEditingUserPhone] = useState("");
  const [editingUserRole, setEditingUserRole] = useState<UserItem["role"]>("CUSTOMER");
  const [savingUser, setSavingUser] = useState(false);

  // Instant booking note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategoriesList(data);
          return;
        }
      }
      const fallback = await fetch("/api/categories", { cache: "no-store" });
      if (fallback.ok) {
        const data = await fallback.json();
        if (Array.isArray(data)) {
          setCategoriesList(data.map((c: any) => ({ ...c, proCount: 0 })));
        }
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }

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
      fetch("/api/instant-bookings").then((r) => (r.ok ? r.json() : { instantBookings: [] })),
      fetch("/api/admin/categories").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([proData, bookingData, userData, instantData, categoryData]) => {
        setProfessionals(Array.isArray(proData) ? proData : []);
        setBookings(Array.isArray(bookingData) ? bookingData : []);
        setUsers(Array.isArray(userData) ? userData : []);
        setInstantBookingsList(Array.isArray(instantData?.instantBookings) ? instantData.instantBookings : []);
        if (Array.isArray(categoryData) && categoryData.length > 0) {
          setCategoriesList(categoryData);
        } else {
          loadCategories();
        }
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
    if (selectedProfessional?.id === id) {
      setSelectedProfessional((current) =>
        current ? { ...current, isVerified: !isVerified } : current
      );
    }
    setActionMessage(
      !isVerified
        ? "Professional verified and published."
        : "Professional verification removed."
    );
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
    if (selectedProfessional?.id === id) {
      setSelectedProfessional((current) =>
        current ? { ...current, isAvailable: !isAvailable } : current
      );
    }
    setActionMessage(
      !isAvailable ? "Set to available for bookings." : "Set to unavailable."
    );
  }

  async function openProfessionalDetails(id: string) {
    setDetailsLoading(true);
    const res = await fetch(`/api/admin/professionals/${id}`);
    if (res.ok) {
      const data = (await res.json()) as ProfessionalDetails;
      setSelectedProfessional(data);
      setEditingProBio(data.bio || "");
      setEditingProArea(data.area || "");
      setEditingProCity(data.city || "");
      setEditingProExp(data.yearsExperience || 0);
      setEditingProRate(data.ratePerVisit ?? "");
    }
    setDetailsLoading(false);
  }

  async function saveProfessionalEdits() {
    if (!selectedProfessional) return;
    setSavingPro(true);
    const payload = {
      bio: editingProBio,
      area: editingProArea,
      city: editingProCity,
      yearsExperience: Number(editingProExp),
      ratePerVisit: editingProRate === "" ? null : Number(editingProRate),
    };

    const res = await fetch(`/api/admin/professionals/${selectedProfessional.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSavingPro(false);
    if (res.ok) {
      setSelectedProfessional((prev) =>
        prev
          ? {
              ...prev,
              bio: editingProBio,
              area: editingProArea,
              city: editingProCity,
              yearsExperience: Number(editingProExp),
              ratePerVisit: editingProRate === "" ? null : Number(editingProRate),
            }
          : null
      );
      setProfessionals((prev) =>
        prev.map((p) =>
          p.id === selectedProfessional.id
            ? { ...p, area: editingProArea, city: editingProCity }
            : p
        )
      );
      setActionMessage("Professional details saved successfully.");
    }
  }

  async function deleteProfessionalListing(id: string) {
    if (!confirm("Are you sure you want to delete this professional listing?")) return;
    const res = await fetch(`/api/admin/professionals/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProfessionals((prev) => prev.filter((p) => p.id !== id));
      setSelectedProfessional(null);
      setActionMessage("Professional listing removed.");
    }
  }

  function openUserDetails(u: UserItem) {
    setSelectedUser(u);
    setEditingUserName(u.name);
    setEditingUserPhone(u.phone || "");
    setEditingUserRole(u.role);
  }

  async function saveUserEdits() {
    if (!selectedUser) return;
    setSavingUser(true);
    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editingUserName,
        phone: editingUserPhone || null,
        role: editingUserRole,
      }),
    });
    setSavingUser(false);
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, name: editingUserName, phone: editingUserPhone || null, role: editingUserRole }
            : u
        )
      );
      setSelectedUser((prev) =>
        prev
          ? { ...prev, name: editingUserName, phone: editingUserPhone || null, role: editingUserRole }
          : null
      );
      setActionMessage("User profile updated successfully.");
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setActionMessage("");
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
      setActionMessage("User deleted.");
    }
  }

  async function updateBookingStatus(id: string, bookingStatus: AdminBooking["status"]) {
    setActionMessage("");
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: bookingStatus }),
    });
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: bookingStatus, updatedAt: new Date().toISOString() } : b))
    );
    setActionMessage(bookingStatus === "COMPLETED" ? "🎉 Booking marked as DONE and archived!" : "Booking status updated.");
  }

  async function deleteBooking(id: string) {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    setActionMessage("");
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setActionMessage("Booking deleted.");
  }

  // Instant booking actions
  async function updateInstantBookingStatus(id: string, newStatus: InstantBookingItem["status"]) {
    setActionMessage("");
    const res = await fetch(`/api/instant-bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setInstantBookingsList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item))
      );
      setActionMessage(newStatus === "COMPLETED" ? "🎉 Instant booking marked as DONE & completed!" : `Instant booking status set to ${newStatus}.`);
    }
  }

  async function assignInstantBookingPro(id: string, proId: string) {
    setActionMessage("");
    const res = await fetch(`/api/instant-bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedProfessionalId: proId }),
    });
    if (res.ok) {
      const assignedPro = professionals.find((p) => p.id === proId);
      setInstantBookingsList((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                assignedProfessionalId: proId,
                assignedProfessional: assignedPro
                  ? {
                      user: { name: assignedPro.name, phone: null },
                      category: { nameEn: assignedPro.category.nameEn },
                    }
                  : null,
                status: item.status === "NEW" ? "ASSIGNED" : item.status,
              }
            : item
        )
      );
      setActionMessage("Assigned professional to instant request.");
    }
  }

  async function saveInstantBookingNote(id: string) {
    const res = await fetch(`/api/instant-bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: noteText }),
    });
    if (res.ok) {
      setInstantBookingsList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, adminNotes: noteText } : item))
      );
      setEditingNoteId(null);
      setActionMessage("Note saved.");
    }
  }

  // Category Actions
  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setCreateCatError("");

    if (!newCatNameEn.trim()) {
      setCreateCatError("Please enter the English name.");
      return;
    }
    if (!newCatNameBn.trim()) {
      setCreateCatError("Please enter the Bangla name.");
      return;
    }

    setCreatingCategory(true);
    try {
      const generatedSlug = (newCatSlug || newCatNameEn)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: newCatNameEn.trim(),
          nameBn: newCatNameBn.trim(),
          slug: generatedSlug,
          icon: newCatIcon || "wrench",
        }),
      });

      const data = await res.json();
      setCreatingCategory(false);

      if (!res.ok) {
        setCreateCatError(data.error || "Failed to create category");
        return;
      }

      setCategoriesList((prev) =>
        [...prev, { ...data, proCount: 0 }].sort((a, b) => a.nameEn.localeCompare(b.nameEn))
      );
      setShowAddCategoryModal(false);
      setNewCatNameEn("");
      setNewCatNameBn("");
      setNewCatSlug("");
      setNewCatIcon("wrench");
      setCreateCatError("");
      setActionMessage("🎉 Service Category created successfully!");
      loadCategories();
    } catch {
      setCreatingCategory(false);
      setCreateCatError("Network error. Please try again.");
    }
  }

  function openEditCategoryModal(cat: AdminCategory) {
    setEditingCategory(cat);
    setEditCatNameEn(cat.nameEn);
    setEditCatNameBn(cat.nameBn);
    setEditCatSlug(cat.slug);
    setEditCatIcon(cat.icon || "wrench");
    setEditCatError("");
  }

  async function handleSaveCategoryEdits(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;
    setEditCatError("");

    if (!editCatNameEn.trim()) {
      setEditCatError("Please enter the English name.");
      return;
    }
    if (!editCatNameBn.trim()) {
      setEditCatError("Please enter the Bangla name.");
      return;
    }

    setSavingCategory(true);
    try {
      const cleanSlug = (editCatSlug || editCatNameEn)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: editCatNameEn.trim(),
          nameBn: editCatNameBn.trim(),
          slug: cleanSlug,
          icon: editCatIcon || "wrench",
        }),
      });

      const data = await res.json();
      setSavingCategory(false);

      if (!res.ok) {
        setEditCatError(data.error || "Failed to update category");
        return;
      }

      setCategoriesList((prev) =>
        prev
          .map((c) => (c.id === editingCategory.id ? { ...c, ...data } : c))
          .sort((a, b) => a.nameEn.localeCompare(b.nameEn))
      );
      setEditingCategory(null);
      setEditCatError("");
      setActionMessage("Service Category updated successfully.");
      loadCategories();
    } catch {
      setSavingCategory(false);
      setEditCatError("Network error. Please try again.");
    }
  }

  async function handleDeleteCategory(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;
    setActionMessage("");
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage(`Error: ${data.error || "Failed to delete category"}`);
        return;
      }
      setCategoriesList((prev) => prev.filter((c) => c.id !== id));
      setActionMessage(`Category "${name}" removed.`);
      loadCategories();
    } catch {
      setActionMessage("Error deleting category.");
    }
  }

  if (status !== "authenticated" || loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-sm font-semibold text-slate-700">Loading admin center...</div>;
  }

  // Metric counts
  const newInstantCount = instantBookingsList.filter((b) => b.status === "NEW").length;
  const pendingCount = professionals.filter((p) => !p.isVerified).length;
  const availableCount = professionals.filter((p) => p.isAvailable).length;

  // Completed Tasks Aggregation
  const doneInstantList = instantBookingsList.filter((b) => b.status === "COMPLETED");
  const doneDirectList = bookings.filter((b) => b.status === "COMPLETED");
  const totalDoneCount = doneInstantList.length + doneDirectList.length;

  const doneTodayCount =
    doneInstantList.filter((b) => isDateToday(b.updatedAt || b.createdAt)).length +
    doneDirectList.filter((b) => isDateToday(b.updatedAt || b.createdAt)).length;

  const doneWeekCount =
    doneInstantList.filter((b) => isDateThisWeek(b.updatedAt || b.createdAt)).length +
    doneDirectList.filter((b) => isDateThisWeek(b.updatedAt || b.createdAt)).length;

  const doneMonthCount =
    doneInstantList.filter((b) => isDateThisMonth(b.updatedAt || b.createdAt)).length +
    doneDirectList.filter((b) => isDateThisMonth(b.updatedAt || b.createdAt)).length;

  const doneYearCount =
    doneInstantList.filter((b) => isDateThisYear(b.updatedAt || b.createdAt)).length +
    doneDirectList.filter((b) => isDateThisYear(b.updatedAt || b.createdAt)).length;

  // Filtered Lists
  const displayedInstantBookings = instantBookingsList.filter((b) =>
    `${b.customerName} ${b.customerPhone} ${b.categoryName} ${b.area} ${b.problemDescription} ${b.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const displayedProfessionals = professionals.filter((p) => {
    const matchesSearch = `${p.name} ${p.category.nameEn} ${p.area} ${p.city}`.toLowerCase().includes(search.toLowerCase());
    const matchesPending = !showPendingOnly || !p.isVerified;
    const matchesAvailable = !showAvailableOnly || p.isAvailable;
    return matchesSearch && matchesPending && matchesAvailable;
  });

  const displayedBookings = bookings.filter((b) =>
    `${b.customerName} ${b.problemNote} ${b.address} ${b.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const displayedUsers = users.filter((u) =>
    `${u.name} ${u.email} ${u.phone || ""} ${u.role}`.toLowerCase().includes(search.toLowerCase())
  );

  const displayedCategories = categoriesList.filter((c) =>
    `${c.nameEn} ${c.nameBn} ${c.slug}`.toLowerCase().includes(search.toLowerCase())
  );

  // Unified Completed Tasks List with timeframe filtering
  const allDoneTasks = [
    ...doneInstantList.map((item) => ({
      id: item.id,
      kind: "⚡ Instant Booking",
      customerName: item.customerName,
      phone: item.customerPhone,
      category: item.categoryName,
      location: item.area,
      address: item.fullAddress,
      note: item.problemDescription,
      date: item.updatedAt || item.createdAt,
      adminNotes: item.adminNotes,
      assignedName: item.assignedProfessional?.user?.name || null,
      rawInstant: item,
    })),
    ...doneDirectList.map((item) => ({
      id: item.id,
      kind: "📅 Direct Request",
      customerName: item.customerName,
      phone: null,
      category: "Direct Service",
      location: item.address,
      address: item.address,
      note: item.problemNote,
      date: item.updatedAt || item.createdAt,
      adminNotes: null,
      assignedName: null,
      rawDirect: item,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredDoneTasks = allDoneTasks.filter((task) => {
    const matchesSearch = `${task.customerName} ${task.phone || ""} ${task.category} ${task.location} ${task.note}`
      .toLowerCase()
      .includes(search.toLowerCase());

    let matchesTimeframe = true;
    if (timeframe === "TODAY") matchesTimeframe = isDateToday(task.date);
    else if (timeframe === "THIS_WEEK") matchesTimeframe = isDateThisWeek(task.date);
    else if (timeframe === "THIS_MONTH") matchesTimeframe = isDateThisMonth(task.date);
    else if (timeframe === "THIS_YEAR") matchesTimeframe = isDateThisYear(task.date);

    return matchesSearch && matchesTimeframe;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10 space-y-5 sm:space-y-6 motion-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Control Center
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Full management: instant bookings, categories, 1-click completion archives, verified technicians, and users.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setCreateCatError("");
              setShowAddCategoryModal(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>➕</span>
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-950 flex items-center justify-between shadow-2xs">
          <span className="break-words">ℹ️ {actionMessage}</span>
          <button onClick={() => setActionMessage("")} className="text-slate-400 hover:text-slate-700 cursor-pointer ml-2 shrink-0">✕</button>
        </div>
      )}

      {/* Interactive Metric Cards: Clickable to Filter/Switch */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => {
            setTab("instantBookings");
            setSearch("");
            setShowPendingOnly(false);
            setShowAvailableOnly(false);
          }}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
            tab === "instantBookings"
              ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-400"
              : "bg-white border-slate-200 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] sm:text-xs font-bold text-amber-800 uppercase tracking-wide truncate">⚡ Instant</p>
            {newInstantCount > 0 && <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />}
          </div>
          <p className="font-display text-xl sm:text-2xl font-black text-slate-900 mt-1">{newInstantCount}</p>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Dispatches →</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("completedTasks");
            setTimeframe("ALL");
            setSearch("");
          }}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
            tab === "completedTasks"
              ? "bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-400"
              : "bg-white border-slate-200 hover:border-emerald-300"
          }`}
        >
          <p className="text-[11px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wide truncate">✅ Done Tasks</p>
          <p className="font-display text-xl sm:text-2xl font-black text-slate-900 mt-1">{totalDoneCount}</p>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Archive →</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("categories");
            setSearch("");
            loadCategories();
          }}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
            tab === "categories"
              ? "bg-purple-50/90 border-purple-300 ring-2 ring-purple-400"
              : "bg-white border-slate-200 hover:border-purple-300"
          }`}
        >
          <p className="text-[11px] sm:text-xs font-bold text-purple-800 uppercase tracking-wide truncate">📂 Categories</p>
          <p className="font-display text-xl sm:text-2xl font-black text-slate-900 mt-1">{categoriesList.length}</p>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Manage →</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("professionals");
            setShowPendingOnly(false);
            setShowAvailableOnly(false);
            setSearch("");
          }}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
            tab === "professionals" && !showPendingOnly && !showAvailableOnly
              ? "bg-blue-50/90 border-blue-300 ring-2 ring-blue-400"
              : "bg-white border-slate-200 hover:border-blue-300"
          }`}
        >
          <p className="text-[11px] sm:text-xs font-bold text-blue-800 uppercase tracking-wide truncate">All Pros</p>
          <p className="font-display text-xl sm:text-2xl font-black text-slate-900 mt-1">{professionals.length}</p>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Directory →</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("professionals");
            setShowPendingOnly(true);
            setShowAvailableOnly(false);
            setSearch("");
          }}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
            tab === "professionals" && showPendingOnly
              ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-400"
              : "bg-white border-slate-200 hover:border-amber-300"
          }`}
        >
          <p className="text-[11px] sm:text-xs font-bold text-amber-900 uppercase tracking-wide truncate">Pending</p>
          <p className="font-display text-xl sm:text-2xl font-black text-slate-900 mt-1">{pendingCount}</p>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Review →</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("professionals");
            setShowAvailableOnly(true);
            setShowPendingOnly(false);
            setSearch("");
          }}
          className={`p-3 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${
            tab === "professionals" && showAvailableOnly
              ? "bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-400"
              : "bg-white border-slate-200 hover:border-emerald-300"
          }`}
        >
          <p className="text-[11px] sm:text-xs font-bold text-emerald-800 uppercase tracking-wide truncate">Available</p>
          <p className="font-display text-xl sm:text-2xl font-black text-slate-900 mt-1">{availableCount}</p>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Active now →</span>
        </button>
      </div>

      {/* Responsive Horizontal Scroll Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200 sm:flex-wrap">
        <button
          onClick={() => {
            setTab("instantBookings");
            setShowPendingOnly(false);
            setShowAvailableOnly(false);
          }}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "instantBookings"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>⚡ Instant Bookings</span>
          {newInstantCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {newInstantCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setTab("completedTasks");
            setShowPendingOnly(false);
            setShowAvailableOnly(false);
          }}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "completedTasks"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>✅ Done Tasks</span>
          <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full">
            {totalDoneCount}
          </span>
        </button>

        <button
          onClick={() => {
            setTab("categories");
            setShowPendingOnly(false);
            setShowAvailableOnly(false);
            loadCategories();
          }}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "categories"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>📂 Categories</span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
            tab === "categories" ? "bg-purple-800 text-white" : "bg-purple-100 text-purple-900"
          }`}>
            {categoriesList.length}
          </span>
        </button>

        <button
          onClick={() => {
            setTab("professionals");
            setShowPendingOnly(false);
            setShowAvailableOnly(false);
          }}
          className={`rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "professionals"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Pros ({professionals.length})
        </button>

        <button
          onClick={() => {
            setTab("bookings");
            setShowPendingOnly(false);
            setShowAvailableOnly(false);
          }}
          className={`rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "bookings"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Direct ({bookings.length})
        </button>

        <button
          onClick={() => {
            setTab("users");
            setShowPendingOnly(false);
            setShowAvailableOnly(false);
          }}
          className={`rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "users"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Users ({users.length})
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search in ${tab}...`}
          className="w-full sm:min-w-[240px] sm:flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />

        {tab === "professionals" && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setShowPendingOnly((value) => !value);
                setShowAvailableOnly(false);
              }}
              className={`flex-1 sm:flex-initial rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer text-center ${
                showPendingOnly
                  ? "bg-amber-400 text-slate-950 border-amber-500 shadow-2xs"
                  : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {showPendingOnly ? "✓ Pending Only" : "Filter: Pending"}
            </button>

            <button
              onClick={() => {
                setShowAvailableOnly((value) => !value);
                setShowPendingOnly(false);
              }}
              className={`flex-1 sm:flex-initial rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer text-center ${
                showAvailableOnly
                  ? "bg-emerald-600 text-white border-emerald-700 shadow-2xs"
                  : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {showAvailableOnly ? "✓ Available Only" : "Filter: Available"}
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: INSTANT BOOKINGS */}
      {tab === "instantBookings" && (
        <div className="space-y-4">
          {displayedInstantBookings.length === 0 ? (
            <div className="p-8 text-center text-xs font-semibold text-slate-500 bg-white rounded-2xl border border-slate-200">
              No instant booking requests found.
            </div>
          ) : (
            displayedInstantBookings.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-6 rounded-2xl bg-white shadow-sm border border-slate-200/90 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-extrabold text-base text-slate-900">
                        {item.customerName}
                      </span>
                      <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                        {item.categoryName}
                      </span>
                      {item.urgency === "ASAP" && (
                        <span className="text-xs font-black bg-red-100 text-red-900 border border-red-200 px-2 py-0.5 rounded-lg animate-pulse">
                          ⚡ EMERGENCY
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      📍 {item.area} {item.fullAddress ? `· ${item.fullAddress}` : ""} · {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`tel:${item.customerPhone}`}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-2xs flex items-center gap-1 shrink-0"
                    >
                      <span>📞</span>
                      <span>{item.customerPhone}</span>
                    </a>

                    {/* Quick Mark as Done Action Button */}
                    {item.status !== "COMPLETED" ? (
                      <button
                        type="button"
                        onClick={() => updateInstantBookingStatus(item.id, "COMPLETED")}
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 text-xs font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs shrink-0"
                      >
                        ✅ Done
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg shrink-0">
                        ✓ Done
                      </span>
                    )}

                    <select
                      value={item.status}
                      onChange={(e) => updateInstantBookingStatus(item.id, e.target.value as any)}
                      className={`text-xs font-bold rounded-lg border px-2.5 py-1.5 cursor-pointer shrink-0 ${
                        item.status === "NEW"
                          ? "bg-red-50 text-red-900 border-red-300"
                          : item.status === "CONTACTED"
                          ? "bg-amber-50 text-amber-900 border-amber-300"
                          : item.status === "ASSIGNED"
                          ? "bg-blue-50 text-blue-900 border-blue-300"
                          : item.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                          : "bg-slate-100 text-slate-800 border-slate-300"
                      }`}
                    >
                      <option value="NEW">🔴 NEW</option>
                      <option value="CONTACTED">🟡 CONTACTED</option>
                      <option value="ASSIGNED">🔵 ASSIGNED</option>
                      <option value="COMPLETED">🟢 COMPLETED</option>
                      <option value="CANCELLED">⚪ CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Problem Description */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs">
                  <span className="font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Problem / Requirements:
                  </span>
                  <p className="text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">{item.problemDescription}</p>
                </div>

                {/* Assignment & Notes Row */}
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  {/* Assign to Pro */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 uppercase tracking-wide block">
                      Assign to Verified Professional:
                    </label>
                    <select
                      value={item.assignedProfessionalId || ""}
                      onChange={(e) => assignInstantBookingPro(item.id, e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 font-medium"
                    >
                      <option value="">-- Select a Professional to Assign --</option>
                      {professionals.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category.nameEn} · {p.area})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Admin Internal Notes */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700 uppercase tracking-wide">
                        Internal Admin Notes:
                      </label>
                      {editingNoteId !== item.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(item.id);
                            setNoteText(item.adminNotes || "");
                          }}
                          className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                        >
                          {item.adminNotes ? "Edit Note" : "+ Add Note"}
                        </button>
                      )}
                    </div>

                    {editingNoteId === item.id ? (
                      <div className="flex gap-2">
                        <input
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="e.g. Called customer, assigned technician..."
                          className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => saveInstantBookingNote(item.id)}
                          className="bg-slate-900 text-white font-bold px-3 py-1 rounded-lg text-xs cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingNoteId(null)}
                          className="text-slate-400 hover:text-slate-700 text-xs px-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <p className="text-slate-600 font-medium italic p-2 bg-slate-50 border border-slate-200 rounded-lg">
                        {item.adminNotes || "No notes yet."}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: COMPLETED / DONE TASK LIST (WITH TIMEFRAME FILTERS) */}
      {tab === "completedTasks" && (
        <div className="space-y-4">
          {/* Timeframe Filter Bar */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">Filter:</span>
              <button
                type="button"
                onClick={() => setTimeframe("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  timeframe === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All Time ({totalDoneCount})
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("TODAY")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  timeframe === "TODAY"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ⚡ Today ({doneTodayCount})
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("THIS_WEEK")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  timeframe === "THIS_WEEK"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                🗓️ This Week ({doneWeekCount})
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("THIS_MONTH")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  timeframe === "THIS_MONTH"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                📆 This Month ({doneMonthCount})
              </button>
              <button
                type="button"
                onClick={() => setTimeframe("THIS_YEAR")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  timeframe === "THIS_YEAR"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                🏆 This Year ({doneYearCount})
              </button>
            </div>

            <div className="text-[11px] sm:text-xs font-bold text-slate-500 self-end sm:self-auto">
              Showing {filteredDoneTasks.length} done tasks
            </div>
          </div>

          {/* List of Done Tasks */}
          {filteredDoneTasks.length === 0 ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-2">
              <span className="text-3xl block">📋</span>
              <p className="text-sm font-bold text-slate-800">No completed tasks in this timeframe.</p>
              <p className="text-slate-500">When requests are marked as Done, they will be organized here by date.</p>
            </div>
          ) : (
            filteredDoneTasks.map((t) => (
              <div
                key={t.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                      ✓
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-extrabold text-sm text-slate-900">{t.customerName}</span>
                        <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {t.kind}
                        </span>
                        <span className="text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        📍 {t.location} · Completed: {new Date(t.date).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {t.phone && (
                      <a
                        href={`tel:${t.phone}`}
                        className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1"
                      >
                        <span>📞</span>
                        <span>{t.phone}</span>
                      </a>
                    )}
                    <span className="text-xs font-extrabold text-emerald-950 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-lg">
                      ✅ COMPLETED
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <span className="font-bold text-slate-500 uppercase tracking-wide block mb-1">Requirement:</span>
                  <p className="font-medium whitespace-pre-wrap">{t.note}</p>
                </div>

                {(t.assignedName || t.adminNotes) && (
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    {t.assignedName && (
                      <span>🛠️ Assigned Technician: <strong className="text-slate-900">{t.assignedName}</strong></span>
                    )}
                    {t.adminNotes && (
                      <span>📝 Notes: <em className="text-slate-800">{t.adminNotes}</em></span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PROFESSIONALS */}
      {tab === "professionals" && (
        <div className="space-y-3">
          {displayedProfessionals.length === 0 ? (
            <div className="p-8 text-center text-xs font-semibold text-slate-500 bg-white rounded-2xl border border-slate-200">
              No professionals matching current filter.
            </div>
          ) : (
            displayedProfessionals.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group"
                onClick={() => openProfessionalDetails(p.id)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <ProfilePhoto name={p.name} photoUrl={p.photoUrl} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-sm text-slate-900 truncate block group-hover:text-blue-700 transition-colors">
                        {p.name}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">🔍 Tap to Edit</span>
                    </div>
                    <span className="text-xs text-slate-600 font-medium">{p.category.nameEn} · 📍 {p.area}, {p.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => toggleAvailability(p.id, p.isAvailable)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer ${
                      p.isAvailable ? "bg-emerald-50 text-emerald-900 border border-emerald-200" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {p.isAvailable ? "● Available" : "Unavailable"}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleVerify(p.id, p.isVerified)}
                    className={`text-xs font-bold px-3 py-1 rounded-lg cursor-pointer ${
                      p.isVerified ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "bg-amber-100 text-amber-950 border border-amber-300"
                    }`}
                  >
                    {p.isVerified ? "✓ Verified" : "Pending Review"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: DIRECT BOOKINGS */}
      {tab === "bookings" && (
        <div className="space-y-3">
          {displayedBookings.length === 0 ? (
            <div className="p-8 text-center text-xs font-semibold text-slate-500 bg-white rounded-2xl border border-slate-200">
              No direct bookings found.
            </div>
          ) : (
            displayedBookings.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-display font-extrabold text-sm text-slate-900 block">{b.customerName}</span>
                  <p className="text-xs text-slate-800 font-medium">{b.problemNote}</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">📍 {b.address} · 🗓️ {new Date(b.preferredDate).toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-2">
                  {b.status !== "COMPLETED" && (
                    <button
                      type="button"
                      onClick={() => updateBookingStatus(b.id, "COMPLETED")}
                      className="bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300 text-xs font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-2xs"
                    >
                      ✅ Mark as Done
                    </button>
                  )}

                  <select
                    value={b.status}
                    onChange={(e) => updateBookingStatus(b.id, e.target.value as any)}
                    className="text-xs font-bold border border-slate-300 rounded-lg p-1.5 text-slate-900 cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="DECLINED">DECLINED</option>
                    <option value="COMPLETED">COMPLETED (DONE)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => deleteBooking(b.id)}
                    className="text-red-600 hover:text-red-800 text-xs font-bold px-2 py-1 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: USERS */}
      {tab === "users" && (
        <div className="space-y-3">
          {displayedUsers.length === 0 ? (
            <div className="p-8 text-center text-xs font-semibold text-slate-500 bg-white rounded-2xl border border-slate-200">
              No users found.
            </div>
          ) : (
            displayedUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => openUserDetails(u)}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group"
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <ProfilePhoto name={u.name} photoUrl={u.photoUrl} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-extrabold text-sm text-slate-900 block group-hover:text-blue-700 transition-colors">
                        {u.name}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">🔍 Tap to Edit</span>
                    </div>
                    <span className="text-xs text-slate-600 font-medium">
                      {u.email} {u.phone ? `· 📞 ${u.phone}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-900 border border-purple-300"
                        : u.role === "PROFESSIONAL"
                        ? "bg-blue-100 text-blue-900 border border-blue-300"
                        : "bg-slate-100 text-slate-800 border border-slate-200"
                    }`}
                  >
                    {u.role}
                  </span>

                  <button
                    type="button"
                    onClick={() => openUserDetails(u)}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg cursor-pointer"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 6: SERVICE CATEGORIES */}
      {tab === "categories" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl">
            <div>
              <h2 className="font-display font-extrabold text-base text-purple-950">
                Manage Service Categories ({categoriesList.length})
              </h2>
              <p className="text-xs text-purple-800 font-medium">
                Add, edit, and organize all public service categories available on SohojService.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadCategories()}
                className="bg-white hover:bg-purple-100/50 text-purple-900 border border-purple-300 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                title="Reload categories from database"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreateCatError("");
                  setShowAddCategoryModal(true);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-sm transition-all hover:shadow hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <span>➕</span>
                <span>Add New Category</span>
              </button>
            </div>
          </div>

          {displayedCategories.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <span className="text-3xl block">📂</span>
              <p className="text-sm font-bold text-slate-800">No categories found.</p>
              <p className="text-xs text-slate-500">
                {search ? "No categories matched your search term." : "Your category list is empty or loading."}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => loadCategories()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  🔄 Reload List
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCreateCatError("");
                    setShowAddCategoryModal(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  ➕ Add New Category
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {displayedCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => openEditCategoryModal(cat)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                        {getCategoryEmoji(cat.icon, cat.slug)}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                          {cat.nameEn}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500">{cat.nameBn}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md shrink-0">
                      {cat.proCount ?? 0} Pros
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-100 pt-2">
                    <span>slug: <strong className="text-slate-600">{cat.slug}</strong></span>
                    <span>icon: <strong className="text-slate-600">{cat.icon || "wrench"}</strong></span>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => openEditCategoryModal(cat)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.nameEn)}
                      className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: EDIT PROFESSIONAL PROFILE */}
      {selectedProfessional && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs motion-enter">
          <div className="w-full max-w-lg sm:max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <ProfilePhoto name={selectedProfessional.user.name} photoUrl={selectedProfessional.photoUrl} size="md" />
                <div>
                  <h2 className="font-display font-extrabold text-base sm:text-xl text-slate-900">{selectedProfessional.user.name}</h2>
                  <p className="text-xs text-blue-700 font-bold">{selectedProfessional.category.nameEn} · ID: #{selectedProfessional.id.slice(-6)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProfessional(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Total Jobs</p>
                <p className="font-bold text-base text-slate-900">{selectedProfessional.stats.totalBookings}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Completed</p>
                <p className="font-bold text-base text-emerald-700">{selectedProfessional.stats.completedBookings}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Reviews</p>
                <p className="font-bold text-base text-slate-900">{selectedProfessional.stats.reviewCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500">Avg Rating</p>
                <p className="font-bold text-base text-amber-700">★ {selectedProfessional.stats.avgRating?.toFixed(1) || "N/A"}</p>
              </div>
            </div>

            {/* Editable Form */}
            <div className="space-y-3 sm:space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => toggleVerify(selectedProfessional.id, selectedProfessional.isVerified)}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-all text-center ${
                    selectedProfessional.isVerified
                      ? "bg-emerald-600 text-white"
                      : "bg-amber-100 text-amber-950 border border-amber-300"
                  }`}
                >
                  {selectedProfessional.isVerified ? "✓ Verified on Website" : "⚠️ Review (Click to Verify)"}
                </button>

                <button
                  type="button"
                  onClick={() => toggleAvailability(selectedProfessional.id, selectedProfessional.isAvailable)}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-all text-center ${
                    selectedProfessional.isAvailable
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {selectedProfessional.isAvailable ? "● Available for Jobs" : "Unavailable"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Upazila / Area</label>
                  <BangladeshUpazilaInput
                    value={editingProArea}
                    onChange={setEditingProArea}
                    placeholder="Search upazila"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">City / District</label>
                  <input
                    value={editingProCity}
                    onChange={(e) => setEditingProCity(e.target.value)}
                    className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={editingProExp}
                    onChange={(e) => setEditingProExp(Number(e.target.value))}
                    className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Visiting Rate (BDT)</label>
                  <input
                    type="number"
                    value={editingProRate}
                    onChange={(e) => setEditingProRate(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  value={editingProBio}
                  onChange={(e) => setEditingProBio(e.target.value)}
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => deleteProfessionalListing(selectedProfessional.id)}
                className="text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer text-center py-2"
              >
                🗑️ Delete Professional Listing
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProfessional(null)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingPro}
                  onClick={saveProfessionalEdits}
                  className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs cursor-pointer text-center"
                >
                  {savingPro ? "Saving..." : "💾 Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER PROFILE */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs motion-enter">
          <div className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <ProfilePhoto name={selectedUser.name} photoUrl={selectedUser.photoUrl} size="md" />
                <div>
                  <h2 className="font-display font-extrabold text-base sm:text-xl text-slate-900">{selectedUser.name}</h2>
                  <p className="text-xs text-slate-500 break-all">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Editable Form */}
            <div className="space-y-3 sm:space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Full Name</label>
                <input
                  value={editingUserName}
                  onChange={(e) => setEditingUserName(e.target.value)}
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Mobile Phone</label>
                <input
                  value={editingUserPhone}
                  onChange={(e) => setEditingUserPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Account Role</label>
                <select
                  value={editingUserRole}
                  onChange={(e) => setEditingUserRole(e.target.value as any)}
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900 font-bold"
                >
                  <option value="CUSTOMER">CUSTOMER (Can book services & submit reviews)</option>
                  <option value="PROFESSIONAL">PROFESSIONAL (Can offer services & list profile)</option>
                  <option value="ADMIN">ADMIN (Full control center access)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] font-medium space-y-1">
                <p>User ID: <span className="font-mono text-slate-900 break-all">{selectedUser.id}</span></p>
                <p>Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => deleteUser(selectedUser.id)}
                className="text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer text-center py-2"
              >
                🗑️ Delete User
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingUser}
                  onClick={saveUserEdits}
                  className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs cursor-pointer text-center"
                >
                  {savingUser ? "Saving..." : "💾 Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW SERVICE CATEGORY */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs motion-enter">
          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 p-5 sm:p-7 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{getCategoryEmoji(newCatIcon)}</span>
                <div>
                  <h2 className="font-display font-extrabold text-lg sm:text-xl text-slate-900">
                    Add Service Category
                  </h2>
                  <p className="text-xs text-slate-500">Create a new local service category</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setCreateCatError("");
                }}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createCatError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                <span>⚠️</span>
                <span>{createCatError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-3 sm:space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Category Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCatNameEn}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewCatNameEn(val);
                    setNewCatSlug(
                      val
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "")
                    );
                  }}
                  placeholder="e.g. Water Purifier & Filter"
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 sm:p-3 text-xs text-slate-900 focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Category Name (Bangla) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCatNameBn}
                  onChange={(e) => setNewCatNameBn(e.target.value)}
                  placeholder="e.g. ওয়াটার ফিল্টার সার্ভিস"
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 sm:p-3 text-xs text-slate-900 focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  URL Slug <span className="text-slate-400 text-[10px]">(Auto generated or custom)</span>
                </label>
                <input
                  type="text"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                  placeholder="water-filter"
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 sm:p-3 text-xs font-mono text-slate-900 focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* VISUAL ICON THEME CHOOSER */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 text-xs">
                    Choose Icon Theme <span className="text-purple-600 font-normal text-[11px]">(Click any icon)</span>
                  </label>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-purple-200">
                    <span>{getCategoryEmoji(newCatIcon)}</span>
                    <span>{ICON_THEMES.find((t) => t.id === (newCatIcon || "wrench"))?.label || newCatIcon}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-44 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  {ICON_THEMES.map((theme) => {
                    const isSelected = (newCatIcon || "wrench") === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setNewCatIcon(theme.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-100/90 border-purple-500 ring-2 ring-purple-500 shadow-xs scale-105 font-bold"
                            : "bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                        }`}
                      >
                        <span className="text-2xl mb-1">{theme.emoji}</span>
                        <span className="text-[10px] font-semibold text-slate-700 leading-tight line-clamp-1">
                          {theme.label.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Category Preview Card */}
              {newCatNameEn && (
                <div className="p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-200 text-purple-900 flex items-center justify-center font-bold text-2xl shadow-2xs">
                      {getCategoryEmoji(newCatIcon)}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-purple-950">{newCatNameEn}</p>
                      <p className="text-xs text-purple-700 font-semibold">{newCatNameBn || "বাংলা নাম..."}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono bg-white px-2.5 py-1 rounded-lg text-purple-900 border border-purple-200 font-bold shadow-2xs">
                    /{newCatSlug || "slug"}
                  </span>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setCreateCatError("");
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer text-center"
                >
                  {creatingCategory ? "Creating..." : "➕ Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT SERVICE CATEGORY */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs motion-enter">
          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 p-5 sm:p-7 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{getCategoryEmoji(editCatIcon)}</span>
                <div>
                  <h2 className="font-display font-extrabold text-lg sm:text-xl text-slate-900">
                    Edit Category
                  </h2>
                  <p className="text-xs text-slate-500">{editingCategory.nameEn}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setEditCatError("");
                }}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editCatError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
                <span>⚠️</span>
                <span>{editCatError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategoryEdits} className="space-y-3 sm:space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Category Name (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editCatNameEn}
                  onChange={(e) => setEditCatNameEn(e.target.value)}
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 sm:p-3 text-xs text-slate-900 focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Category Name (Bangla) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editCatNameBn}
                  onChange={(e) => setEditCatNameBn(e.target.value)}
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 sm:p-3 text-xs text-slate-900 focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">URL Slug</label>
                <input
                  type="text"
                  required
                  value={editCatSlug}
                  onChange={(e) => setEditCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 sm:p-3 text-xs font-mono text-slate-900 focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* VISUAL ICON THEME CHOOSER */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 text-xs">
                    Choose Icon Theme <span className="text-purple-600 font-normal text-[11px]">(Click any icon)</span>
                  </label>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-purple-200">
                    <span>{getCategoryEmoji(editCatIcon)}</span>
                    <span>{ICON_THEMES.find((t) => t.id === (editCatIcon || "wrench"))?.label || editCatIcon}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-44 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                  {ICON_THEMES.map((theme) => {
                    const isSelected = (editCatIcon || "wrench") === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setEditCatIcon(theme.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-100/90 border-purple-500 ring-2 ring-purple-500 shadow-xs scale-105 font-bold"
                            : "bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/50"
                        }`}
                      >
                        <span className="text-2xl mb-1">{theme.emoji}</span>
                        <span className="text-[10px] font-semibold text-slate-700 leading-tight line-clamp-1">
                          {theme.label.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Category Preview Card */}
              {editCatNameEn && (
                <div className="p-3.5 bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-200 text-purple-900 flex items-center justify-center font-bold text-2xl shadow-2xs">
                      {getCategoryEmoji(editCatIcon)}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-purple-950">{editCatNameEn}</p>
                      <p className="text-xs text-purple-700 font-semibold">{editCatNameBn || "বাংলা নাম..."}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono bg-white px-2.5 py-1 rounded-lg text-purple-900 border border-purple-200 font-bold shadow-2xs">
                    /{editCatSlug || "slug"}
                  </span>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setEditCatError("");
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer text-center"
                >
                  {savingCategory ? "Saving..." : "💾 Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
