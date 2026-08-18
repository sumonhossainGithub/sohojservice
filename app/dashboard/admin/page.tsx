"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export type AdminLocation = {
  id: string;
  nameEn: string;
  nameBn: string;
  district: string;
  division: string;
  lat: number | null;
  lng: number | null;
  isActive: boolean;
  isCustom: boolean;
  createdAt?: string;
};

type AdminReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    photoUrl: string | null;
  };
  professional: {
    id: string;
    name: string;
    categoryName: string;
    area: string;
    city: string;
    photoUrl: string | null;
  };
};

type AdminTab =
  | "overview"
  | "instantBookings"
  | "completedTasks"
  | "professionals"
  | "bookings"
  | "users"
  | "reviews"
  | "announcements"
  | "settings"
  | "categories"
  | "locations";

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
  // Repair, Tools & Construction
  { id: "wrench", emoji: "🔧", label: "Wrench / Repair" },
  { id: "tool", emoji: "🛠️", label: "Tools / Workshop" },
  { id: "hammer", emoji: "🔨", label: "Hammer / Carpenter" },
  { id: "screwdriver", emoji: "🪛", label: "Screwdriver / Tech" },
  { id: "drill", emoji: "🔩", label: "Drill / Fasteners" },
  { id: "paint", emoji: "🖌️", label: "Paint Brush / Painter" },
  { id: "roller", emoji: "🎨", label: "Paint Roller / Art" },
  { id: "brick", emoji: "🧱", label: "Masonry / Brickwork" },
  { id: "construction", emoji: "🚧", label: "Construction Barrier" },
  { id: "hard-hat", emoji: "👷", label: "Contractor / Worker" },

  // Electricity, Solar, Cooling & Plumbing
  { id: "zap", emoji: "⚡", label: "Electrician / Power" },
  { id: "plug", emoji: "🔌", label: "Electric Plug / Socket" },
  { id: "battery", emoji: "🔋", label: "IPS / Inverter Battery" },
  { id: "solar", emoji: "☀️", label: "Solar Energy & Panels" },
  { id: "lightbulb", emoji: "💡", label: "Lighting & Fixtures" },
  { id: "droplet", emoji: "💧", label: "Plumber / Water Drop" },
  { id: "tap", emoji: "🚰", label: "Water Tap / Pipe" },
  { id: "snowflake", emoji: "❄️", label: "AC & Refrigerator" },
  { id: "wind", emoji: "💨", label: "Fan & Ventilation" },
  { id: "fire", emoji: "🔥", label: "Gas Stove / Burner" },
  { id: "gear", emoji: "⚙️", label: "Motor & Generator" },

  // Tech, Electronics & Security
  { id: "tv", emoji: "📺", label: "Television & Audio" },
  { id: "camera", emoji: "📷", label: "CCTV / Security Camera" },
  { id: "phone", emoji: "📱", label: "Mobile Repair" },
  { id: "laptop", emoji: "💻", label: "Computer / Laptop" },
  { id: "wifi", emoji: "📶", label: "WiFi & Internet Tech" },
  { id: "printer", emoji: "🖨️", label: "Printer & Office Tech" },
  { id: "satellite", emoji: "📡", label: "Dish / Cable TV" },
  { id: "shield", emoji: "🛡️", label: "Security & Guard" },

  // Cleaning, Hygiene & Home Care
  { id: "sparkles", emoji: "✨", label: "Cleaning & Housekeeping" },
  { id: "broom", emoji: "🧹", label: "Broom / Deep Clean" },
  { id: "soap", emoji: "🧼", label: "Sanitization & Wash" },
  { id: "bug", emoji: "🪲", label: "Pest Control & Spray" },
  { id: "trash", emoji: "🗑️", label: "Waste / Septic Tank" },

  // Transport, Moving & Vehicles
  { id: "truck", emoji: "🚚", label: "Movers & Packers" },
  { id: "motorcycle", emoji: "🏍️", label: "Motorbike Mechanic" },
  { id: "car", emoji: "🚗", label: "Car & Auto Repair" },
  { id: "package", emoji: "📦", label: "Parcel & Courier" },

  // Gardening, Plants & Outdoors
  { id: "plant", emoji: "🪴", label: "Potted Plant / Indoor" },
  { id: "tree", emoji: "🌳", label: "Gardener / Tree Cutting" },
  { id: "flower", emoji: "🌸", label: "Flower & Landscape" },

  // Food, Catering & Lifestyle
  { id: "chef", emoji: "👨‍🍳", label: "Cook / Chef" },
  { id: "book", emoji: "📖", label: "Home Tutor / Teacher" },
  { id: "scissors", emoji: "✂️", label: "Home Salon / Barber" },
  { id: "photo", emoji: "📸", label: "Photographer / Video" },
  { id: "home", emoji: "🏠", label: "House Renovation" },
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

function exportToCsv(filename: string, rows: string[][]) {
  const processRow = (row: string[]) =>
    row
      .map((val) => {
        let text = (val || "").toString().replace(/"/g, '""');
        if (text.search(/("|,|\n)/g) >= 0) text = `"${text}"`;
        return text;
      })
      .join(",");

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(processRow).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function AdminDashboard() {
  const { user, status } = useAuth();
  const router = useRouter();

  // Core Data
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [instantBookingsList, setInstantBookingsList] = useState<InstantBookingItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<AdminCategory[]>([]);
  const [locationsList, setLocationsList] = useState<AdminLocation[]>([]);
  const [reviewsList, setReviewsList] = useState<AdminReview[]>([]);
  const [reviewsStats, setReviewsStats] = useState({
    total: 0,
    avgRating: 0,
    rating5: 0,
    rating4: 0,
    rating3: 0,
    rating2: 0,
    rating1: 0,
  });

  // Analytics & Settings
  const [analyticsData, setAnalyticsData] = useState<{
    financials?: { estimatedGmv: number; avgTicket: number; completedVolume: number };
    operations?: { totalJobs: number; totalDone: number; activeInstant: number; fulfillmentRate: number };
    people?: { totalUsers: number; customerCount: number; proUserCount: number; verifiedPros: number; pendingPros: number };
    topCategories?: { name: string; count: number }[];
    topAreas?: { name: string; count: number }[];
  } | null>(null);

  const [settings, setSettings] = useState<Record<string, string>>({
    emergency_hotline: "01700-000000",
    support_whatsapp: "8801700000000",
    support_email: "support@sohojservice.com",
    banner_announcement_text: "⚡ 24/7 Monsoon Emergency Electrician & Plumbing Support active in Sirajganj",
    banner_announcement_active: "true",
    banner_announcement_type: "emergency",
    default_visiting_fee: "300",
    maintenance_mode: "false",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Navigation & Filtering
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [search, setSearch] = useState("");
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [timeframe, setTimeframe] = useState<TimeframeFilter>("ALL");
  const [selectedReviewRating, setSelectedReviewRating] = useState<number | "ALL">("ALL");
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>("ALL");
  const [actionMessage, setActionMessage] = useState("");

  // Category Direct Entry State
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

  // Area & Location Direct Entry State
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [editingLocation, setEditingLocation] = useState<AdminLocation | null>(null);
  const [locNameEn, setLocNameEn] = useState("");
  const [locNameBn, setLocNameBn] = useState("");
  const [locDistrict, setLocDistrict] = useState("Sirajganj");
  const [locDivision, setLocDivision] = useState("Rajshahi");
  const [locLat, setLocLat] = useState<number | "">("");
  const [locLng, setLocLng] = useState<number | "">("");
  const [locIsActive, setLocIsActive] = useState(true);
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [gpsDetecting, setGpsDetecting] = useState(false);

  // Professional Detail Modal State
  const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalDetails | null>(null);
  const [editingProBio, setEditingProBio] = useState("");
  const [editingProArea, setEditingProArea] = useState("");
  const [editingProCity, setEditingProCity] = useState("");
  const [editingProExp, setEditingProExp] = useState(0);
  const [editingProRate, setEditingProRate] = useState<number | "">("");
  const [savingPro, setSavingPro] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // User Detail Modal State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [editingUserName, setEditingUserName] = useState("");
  const [editingUserPhone, setEditingUserPhone] = useState("");
  const [editingUserRole, setEditingUserRole] = useState<UserItem["role"]>("CUSTOMER");
  const [savingUser, setSavingUser] = useState(false);

  // Instant booking note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // Lock body scroll on detail modals
  useEffect(() => {
    const isAnyModalOpen = Boolean(selectedProfessional || selectedUser);
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProfessional, selectedUser]);

  async function loadCategories() {
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCategoriesList(data);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  }

  async function loadLocations() {
    setLocationsLoading(true);
    try {
      const res = await fetch("/api/admin/locations", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.locations)) setLocationsList(data.locations);
      }
    } catch (err) {
      console.error("Error loading locations:", err);
    } finally {
      setLocationsLoading(false);
    }
  }

  async function loadReviews() {
    try {
      const res = await fetch("/api/admin/reviews", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.reviews)) {
          setReviewsList(data.reviews);
          if (data.stats) setReviewsStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    }
  }

  async function loadSettings() {
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setSettings(data as Record<string, string>);
        }
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  }

  async function loadAnalytics() {
    try {
      const res = await fetch("/api/admin/analytics", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error("Error loading analytics:", err);
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
      fetch("/api/admin/locations").then((r) => (r.ok ? r.json() : { locations: [] })),
      fetch("/api/admin/reviews").then((r) => (r.ok ? r.json() : { reviews: [] })),
      fetch("/api/admin/settings").then((r) => (r.ok ? r.json() : {})),
      fetch("/api/admin/analytics").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(
        ([
          proData,
          bookingData,
          userData,
          instantData,
          categoryData,
          locationData,
          reviewData,
          settingsData,
          analyticsResp,
        ]) => {
          setProfessionals(Array.isArray(proData) ? proData : []);
          setBookings(Array.isArray(bookingData) ? bookingData : []);
          setUsers(Array.isArray(userData) ? userData : []);
          setInstantBookingsList(Array.isArray(instantData?.instantBookings) ? instantData.instantBookings : []);
          if (Array.isArray(categoryData)) setCategoriesList(categoryData);
          if (Array.isArray(locationData?.locations)) setLocationsList(locationData.locations);
          if (Array.isArray(reviewData?.reviews)) {
            setReviewsList(reviewData.reviews);
            if (reviewData.stats) setReviewsStats(reviewData.stats);
          }
          if (settingsData && typeof settingsData === "object" && !Array.isArray(settingsData)) {
            setSettings(settingsData as Record<string, string>);
          }
          if (analyticsResp) setAnalyticsData(analyticsResp);
        }
      )
      .finally(() => setLoading(false));
  }, []);

  // Quick Action Handlers
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
    setActionMessage(!isVerified ? "✓ Professional verified and published." : "Professional verification removed.");
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
    setActionMessage(!isAvailable ? "Set to available for jobs." : "Set to unavailable.");
  }

  async function openProfessionalDetails(id: string) {
    setDetailsLoading(true);
    const res = await fetch(`/api/admin/professionals/${id}`);
    if (res.ok) {
      const data: ProfessionalDetails = await res.json();
      setSelectedProfessional(data);
      setEditingProBio(data.bio || "");
      setEditingProArea(data.area);
      setEditingProCity(data.city);
      setEditingProExp(data.yearsExperience);
      setEditingProRate(data.ratePerVisit ?? "");
    }
    setDetailsLoading(false);
  }

  async function saveProfessionalEdits() {
    if (!selectedProfessional) return;
    setSavingPro(true);
    const res = await fetch(`/api/admin/professionals/${selectedProfessional.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: editingProBio,
        area: editingProArea,
        city: editingProCity,
        yearsExperience: editingProExp,
        ratePerVisit: editingProRate === "" ? null : Number(editingProRate),
      }),
    });
    setSavingPro(false);
    if (res.ok) {
      setProfessionals((prev) =>
        prev.map((p) =>
          p.id === selectedProfessional.id
            ? {
                ...p,
                area: editingProArea,
                city: editingProCity,
              }
            : p
        )
      );
      setSelectedProfessional((prev) =>
        prev
          ? {
              ...prev,
              bio: editingProBio,
              area: editingProArea,
              city: editingProCity,
              yearsExperience: editingProExp,
              ratePerVisit: editingProRate === "" ? null : Number(editingProRate),
            }
          : null
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

  async function updateInstantStatus(id: string, newStatus: InstantBookingItem["status"]) {
    setActionMessage("");
    const res = await fetch(`/api/instant-bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setInstantBookingsList((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus, updatedAt: new Date().toISOString() } : b))
      );
      setActionMessage(newStatus === "COMPLETED" ? "🎉 Instant booking marked as COMPLETED and archived!" : `Instant booking marked as ${newStatus}`);
    }
  }

  async function assignInstantProfessional(id: string, professionalId: string | null) {
    setActionMessage("");
    const res = await fetch(`/api/instant-bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assignedProfessionalId: professionalId,
        status: professionalId ? "ASSIGNED" : "NEW",
      }),
    });
    if (res.ok) {
      const pro = professionalId ? professionals.find((p) => p.id === professionalId) : null;
      setInstantBookingsList((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                assignedProfessionalId: professionalId,
                status: professionalId ? "ASSIGNED" : "NEW",
                assignedProfessional: pro ? { user: { name: pro.name, phone: null }, category: { nameEn: pro.category.nameEn } } : null,
                updatedAt: new Date().toISOString(),
              }
            : b
        )
      );
      setActionMessage(professionalId ? `Technician assigned to booking #${id.slice(-6)}` : "Assignment removed.");
    }
  }

  async function saveInstantNote(id: string) {
    const res = await fetch(`/api/instant-bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: noteText }),
    });
    if (res.ok) {
      setInstantBookingsList((prev) =>
        prev.map((b) => (b.id === id ? { ...b, adminNotes: noteText } : b))
      );
      setEditingNoteId(null);
      setActionMessage("Admin notes updated.");
    }
  }

  // Location Handlers
  function openEditLocation(loc: AdminLocation) {
    setEditingLocation(loc);
    setLocNameEn(loc.nameEn);
    setLocNameBn(loc.nameBn);
    setLocDistrict(loc.district);
    setLocDivision(loc.division);
    setLocLat(loc.lat !== null && loc.lat !== undefined ? loc.lat : "");
    setLocLng(loc.lng !== null && loc.lng !== undefined ? loc.lng : "");
    setLocIsActive(loc.isActive);
    setLocationError("");
    const el = document.getElementById("location-entry-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetLocationForm() {
    setEditingLocation(null);
    setLocNameEn("");
    setLocNameBn("");
    setLocDistrict("Sirajganj");
    setLocDivision("Rajshahi");
    setLocLat("");
    setLocLng("");
    setLocIsActive(true);
    setLocationError("");
  }

  async function handleSaveLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!locNameEn.trim() || !locNameBn.trim() || !locDistrict.trim()) {
      setLocationError("English Name, Bangla Name, and District are required.");
      return;
    }
    setSavingLocation(true);
    setLocationError("");

    const payload = {
      nameEn: locNameEn.trim(),
      nameBn: locNameBn.trim(),
      district: locDistrict.trim(),
      division: locDivision.trim() || "Rajshahi",
      lat: locLat === "" ? null : Number(locLat),
      lng: locLng === "" ? null : Number(locLng),
      isActive: locIsActive,
    };

    try {
      if (editingLocation) {
        const res = await fetch(`/api/admin/locations/${editingLocation.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setSavingLocation(false);
        if (!res.ok) {
          setLocationError(data.error || "Failed to update location");
          return;
        }
        setActionMessage(`Location "${locNameEn}" updated successfully.`);
      } else {
        const res = await fetch("/api/admin/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        setSavingLocation(false);
        if (!res.ok) {
          setLocationError(data.error || "Failed to create location");
          return;
        }
        setActionMessage(`Location "${locNameEn}" added to system.`);
      }
      resetLocationForm();
      loadLocations();
    } catch {
      setSavingLocation(false);
      setLocationError("Network error. Please try again.");
    }
  }

  async function handleDeleteLocation(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete / reset area "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setActionMessage(`Location "${name}" removed/reset.`);
        loadLocations();
      }
    } catch {
      setActionMessage("Error deleting location.");
    }
  }

  function handleDetectCurrentGPS() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocLat(Math.round(pos.coords.latitude * 10000) / 10000);
        setLocLng(Math.round(pos.coords.longitude * 10000) / 10000);
        setGpsDetecting(false);
      },
      () => {
        setGpsDetecting(false);
        setLocationError("Could not retrieve GPS coordinates. Please allow location access.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // Category Handlers
  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatNameEn.trim() || !newCatNameBn.trim()) {
      setCreateCatError("Both English and Bangla names are required.");
      return;
    }
    setCreatingCategory(true);
    setCreateCatError("");

    let cleanSlug = (newCatSlug && newCatSlug.trim().length > 0 ? newCatSlug : newCatNameEn)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: newCatNameEn.trim(),
          nameBn: newCatNameBn.trim(),
          slug: cleanSlug,
          icon: newCatIcon || "wrench",
        }),
      });

      const data = await res.json();
      setCreatingCategory(false);

      if (!res.ok) {
        setCreateCatError(data.error || "Failed to create category");
        return;
      }

      setCategoriesList((prev) => [...prev, data].sort((a, b) => a.nameEn.localeCompare(b.nameEn)));
      setNewCatNameEn("");
      setNewCatNameBn("");
      setNewCatSlug("");
      setNewCatIcon("wrench");
      setActionMessage(`Category "${data.nameEn}" added successfully.`);
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
    const el = document.getElementById("category-entry-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSaveCategoryEdits(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editCatNameEn.trim() || !editCatNameBn.trim()) {
      setEditCatError("Both English and Bangla names are required.");
      return;
    }
    setSavingCategory(true);
    setEditCatError("");

    let cleanSlug = (editCatSlug && editCatSlug.trim().length > 0 ? editCatSlug : editCatNameEn)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    try {
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
        prev.map((c) => (c.id === editingCategory.id ? { ...c, ...data } : c)).sort((a, b) => a.nameEn.localeCompare(b.nameEn))
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

  // Review Handlers
  async function handleDeleteReview(id: string) {
    if (!confirm("Are you sure you want to remove this customer review?")) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviewsList((prev) => prev.filter((r) => r.id !== id));
        setActionMessage("Review removed successfully.");
        loadReviews();
      }
    } catch {
      setActionMessage("Error deleting review.");
    }
  }

  // Save System Settings Handler
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      setSavingSettings(false);
      if (res.ok) {
        if (data.settings) setSettings(data.settings);
        setActionMessage("System Settings & Announcements saved successfully.");
      }
    } catch {
      setSavingSettings(false);
      setActionMessage("Error saving settings.");
    }
  }
    // CSV Exporters
  function handleExportInstantCSV() {
    const headers = [
      "Booking ID",
      "Date",
      "Client Name",
      "Client Phone",
      "Service Category",
      "Problem Description",
      "Area",
      "Address",
      "Urgency",
      "Status",
      "Assigned Professional",
      "Admin Notes",
    ];
    const rows = instantBookingsList.map((b) => [
      b.id,
      b.createdAt,
      b.customerName,
      b.customerPhone,
      b.categoryName,
      b.problemDescription,
      b.area,
      b.fullAddress,
      b.urgency,
      b.status,
      b.assignedProfessional?.user?.name || "Unassigned",
      b.adminNotes || "",
    ]);
    exportToCsv("sohojservice-instant-bookings.csv", [headers, ...rows]);
  }

  function handleExportProsCSV() {
    const headers = ["Pro ID", "Name", "Category", "Area", "District", "Verified", "Available", "Lat", "Lng"];
    const rows = professionals.map((p) => [
      p.id,
      p.name,
      p.category?.nameEn || "",
      p.area,
      p.city,
      p.isVerified ? "Yes" : "No",
      p.isAvailable ? "Yes" : "No",
      p.latitude?.toString() || "",
      p.longitude?.toString() || "",
    ]);
    exportToCsv("sohojservice-professionals.csv", [headers, ...rows]);
  }

  function handleExportUsersCSV() {
    const headers = ["User ID", "Name", "Email", "Phone", "Role", "Join Date"];
    const rows = users.map((u) => [u.id, u.name, u.email, u.phone || "", u.role, u.createdAt]);
    exportToCsv("sohojservice-users.csv", [headers, ...rows]);
  }

  if (status !== "authenticated" || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-sm font-semibold text-slate-700">
        Loading admin command center...
      </div>
    );
  }

  // Metric counts
  const newInstantCount = instantBookingsList.filter((b) => b.status === "NEW").length;
  const pendingCount = professionals.filter((p) => !p.isVerified).length;
  const availableCount = professionals.filter((p) => p.isAvailable).length;

  const doneInstantList = instantBookingsList.filter((b) => b.status === "COMPLETED");
  const doneDirectList = bookings.filter((b) => b.status === "COMPLETED");
  const totalDoneCount = doneInstantList.length + doneDirectList.length;

  // Filtered Lists
  const displayedInstantBookings = instantBookingsList.filter((b) =>
    `${b.customerName} ${b.customerPhone} ${b.categoryName} ${b.area} ${b.problemDescription} ${b.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const displayedProfessionals = professionals.filter((p) => {
    const matchesSearch = `${p.name} ${p.category.nameEn} ${p.area} ${p.city}`
      .toLowerCase()
      .includes(search.toLowerCase());
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

  const displayedLocations = locationsList.filter((l) => {
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      l.nameEn.toLowerCase().includes(query) ||
      l.nameBn.includes(search) ||
      l.district.toLowerCase().includes(query) ||
      l.division.toLowerCase().includes(query);

    const matchesDivision =
      selectedDivisionFilter === "ALL" ||
      l.division.toLowerCase() === selectedDivisionFilter.toLowerCase();

    return matchesSearch && matchesDivision;
  });

  const displayedReviews = reviewsList.filter((r) => {
    const matchesRating = selectedReviewRating === "ALL" || r.rating === selectedReviewRating;
    const matchesSearch =
      !search ||
      r.comment.toLowerCase().includes(search.toLowerCase()) ||
      r.author.name.toLowerCase().includes(search.toLowerCase()) ||
      r.professional.name.toLowerCase().includes(search.toLowerCase());
    return matchesRating && matchesSearch;
  });

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

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Hero Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl shadow-xl shadow-slate-900/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <h1 className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
              Master Admin Control Center
            </h1>
            <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full uppercase">
              Full Master Access
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Welcome back, <strong>{user?.name}</strong>. Manage dispatches, technicians, clients, system settings & data.
          </p>
        </div>

        {/* Quick Exporter & Shortcut Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportInstantCSV}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Download Instant Bookings as CSV"
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("categories");
              setTimeout(() => {
                const el = document.getElementById("category-entry-section");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 60);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>➕</span>
            <span>Category</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab("locations");
              resetLocationForm();
              setTimeout(() => {
                const el = document.getElementById("location-entry-section");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 60);
            }}
            className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>📍</span>
            <span>Area</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-950 flex items-center justify-between shadow-2xs motion-enter">
          <span className="break-words">ℹ️ {actionMessage}</span>
          <button onClick={() => setActionMessage("")} className="text-slate-400 hover:text-slate-700 cursor-pointer ml-2 shrink-0">✕</button>
        </div>
      )}

      {/* Metric Cards Top Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={() => {
            setTab("overview");
            setSearch("");
            loadAnalytics();
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md ${
            tab === "overview" ? "bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-400" : "bg-white border-slate-200 hover:border-indigo-300"
          }`}
        >
          <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wide truncate">📊 Overview</p>
          <p className="font-display text-lg font-black text-slate-900 mt-0.5">Live KPI</p>
          <span className="text-[9px] text-slate-400 font-semibold block">Dashboard →</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("instantBookings");
            setSearch("");
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md ${
            tab === "instantBookings" ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-400" : "bg-white border-slate-200 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wide truncate">⚡ Dispatches</p>
            {newInstantCount > 0 && <span className="h-2 w-2 rounded-full bg-red-500 animate-ping shrink-0" />}
          </div>
          <p className="font-display text-lg font-black text-slate-900 mt-0.5">{newInstantCount}</p>
          <span className="text-[9px] text-slate-400 font-semibold block">Instant →</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("completedTasks");
            setSearch("");
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md ${
            tab === "completedTasks" ? "bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-400" : "bg-white border-slate-200 hover:border-emerald-300"
          }`}
        >
          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide truncate">✅ Completed</p>
          <p className="font-display text-lg font-black text-slate-900 mt-0.5">{totalDoneCount}</p>
          <span className="text-[9px] text-slate-400 font-semibold block">Archive →</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("professionals");
            setShowPendingOnly(false);
            setSearch("");
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md ${
            tab === "professionals" && !showPendingOnly ? "bg-blue-50/90 border-blue-300 ring-2 ring-blue-400" : "bg-white border-slate-200 hover:border-blue-300"
          }`}
        >
          <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wide truncate">🛠️ Pros</p>
          <p className="font-display text-lg font-black text-slate-900 mt-0.5">{professionals.length}</p>
          <span className="text-[9px] text-slate-400 font-semibold block">Directory →</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("professionals");
            setShowPendingOnly(true);
            setSearch("");
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md ${
            tab === "professionals" && showPendingOnly ? "bg-amber-50/90 border-amber-300 ring-2 ring-amber-400" : "bg-white border-slate-200 hover:border-amber-300"
          }`}
        >
          <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wide truncate">⏳ Pending</p>
          <p className="font-display text-lg font-black text-slate-900 mt-0.5">{pendingCount}</p>
          <span className="text-[9px] text-slate-400 font-semibold block">Review →</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("reviews");
            setSearch("");
            loadReviews();
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md ${
            tab === "reviews" ? "bg-yellow-50/90 border-yellow-300 ring-2 ring-yellow-400" : "bg-white border-slate-200 hover:border-yellow-300"
          }`}
        >
          <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-wide truncate">⭐ Reviews</p>
          <p className="font-display text-lg font-black text-slate-900 mt-0.5">{reviewsList.length}</p>
          <span className="text-[9px] text-slate-400 font-semibold block">Ratings →</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("categories");
            setSearch("");
            loadCategories();
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md ${
            tab === "categories" ? "bg-purple-50/90 border-purple-300 ring-2 ring-purple-400" : "bg-white border-slate-200 hover:border-purple-300"
          }`}
        >
          <p className="text-[10px] font-bold text-purple-800 uppercase tracking-wide truncate">📂 Categories</p>
          <p className="font-display text-lg font-black text-slate-900 mt-0.5">{categoriesList.length}</p>
          <span className="text-[9px] text-slate-400 font-semibold block">Trades →</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setTab("locations");
            setSearch("");
            loadLocations();
          }}
          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs hover:shadow-md ${
            tab === "locations" ? "bg-teal-50/90 border-teal-300 ring-2 ring-teal-400" : "bg-white border-slate-200 hover:border-teal-300"
          }`}
        >
          <p className="text-[10px] font-bold text-teal-800 uppercase tracking-wide truncate">📍 Areas</p>
          <p className="font-display text-lg font-black text-slate-900 mt-0.5">{locationsList.length}</p>
          <span className="text-[9px] text-slate-400 font-semibold block">Upazilas →</span>
        </button>
      </div>

      {/* Horizontal Nav Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-slate-200">
        <button
          onClick={() => {
            setTab("overview");
            loadAnalytics();
          }}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "overview" ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>📊 Overview & Analytics</span>
        </button>

        <button
          onClick={() => {
            setTab("instantBookings");
            setShowPendingOnly(false);
          }}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "instantBookings" ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>⚡ Dispatches ({instantBookingsList.length})</span>
          {newInstantCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
              {newInstantCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setTab("professionals")}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "professionals" ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Pros ({professionals.length})
        </button>

        <button
          onClick={() => setTab("completedTasks")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "completedTasks" ? "bg-emerald-600 text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>✅ Completed ({totalDoneCount})</span>
        </button>

        <button
          onClick={() => {
            setTab("reviews");
            loadReviews();
          }}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "reviews" ? "bg-yellow-600 text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>⭐ Reviews ({reviewsList.length})</span>
        </button>

        <button
          onClick={() => setTab("users")}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "users" ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Users ({users.length})
        </button>

        <button
          onClick={() => setTab("bookings")}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "bookings" ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          Direct Bookings ({bookings.length})
        </button>

        <button
          onClick={() => {
            setTab("categories");
            loadCategories();
          }}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "categories" ? "bg-purple-600 text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>📂 Categories ({categoriesList.length})</span>
        </button>

        <button
          onClick={() => {
            setTab("locations");
            loadLocations();
          }}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "locations" ? "bg-teal-700 text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>📍 Areas & Upazilas ({locationsList.length})</span>
        </button>

        <button
          onClick={() => {
            setTab("announcements");
            loadSettings();
          }}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "announcements" ? "bg-rose-600 text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>📢 Announcements</span>
        </button>

        <button
          onClick={() => {
            setTab("settings");
            loadSettings();
          }}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            tab === "settings" ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <span>⚙️ Settings & Backup</span>
        </button>
      </div>

      {/* Global Search Filter */}
      {tab !== "overview" && tab !== "settings" && tab !== "announcements" && (
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab}... (name, phone, area, category)`}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-2 rounded-xl cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW & LIVE ANALYTICS */}
      {/* ========================================================================= */}
      {tab === "overview" && (
        <div className="space-y-6 motion-enter">
          {/* Financial & GMV Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/10 space-y-2">
              <span className="text-xs uppercase font-bold text-emerald-100 tracking-wider">
                💰 Estimated Platform Value (GMV)
              </span>
              <p className="font-display font-black text-3xl sm:text-4xl text-white">
                ৳{(analyticsData?.financials?.estimatedGmv ?? totalDoneCount * 350).toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-100 font-medium">
                Based on completed jobs across Sirajganj & Bangladesh
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/10 space-y-2">
              <span className="text-xs uppercase font-bold text-blue-100 tracking-wider">
                ⚡ Service Fulfillment Rate
              </span>
              <p className="font-display font-black text-3xl sm:text-4xl text-white">
                {analyticsData?.operations?.fulfillmentRate ?? 95}%
              </p>
              <p className="text-[11px] text-blue-100 font-medium">
                {totalDoneCount} tasks fulfilled out of {instantBookingsList.length + bookings.length} total requests
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-700 text-white shadow-lg shadow-purple-600/10 space-y-2">
              <span className="text-xs uppercase font-bold text-purple-100 tracking-wider">
                ⭐ Platform Reputation Index
              </span>
              <p className="font-display font-black text-3xl sm:text-4xl text-white">
                {reviewsStats.avgRating > 0 ? reviewsStats.avgRating : 4.9} / 5.0
              </p>
              <p className="text-[11px] text-purple-100 font-medium">
                Calculated across {reviewsList.length} verified customer reviews
              </p>
            </div>
          </div>

          {/* Quick Dispatch & System Shortcuts */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <span>⚡</span> Quick Administrative Dispatch Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setTab("instantBookings")}
                className="p-3 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 rounded-2xl text-left transition-all cursor-pointer"
              >
                <span className="text-lg block">🚨</span>
                <p className="font-bold text-xs text-blue-900 mt-1">Pending Dispatches</p>
                <span className="text-[10px] text-blue-700 font-semibold">{newInstantCount} new requests</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab("professionals");
                  setShowPendingOnly(true);
                }}
                className="p-3 bg-amber-50 hover:bg-amber-100/70 border border-amber-200 rounded-2xl text-left transition-all cursor-pointer"
              >
                <span className="text-lg block">⏳</span>
                <p className="font-bold text-xs text-amber-900 mt-1">Verify Technicians</p>
                <span className="text-[10px] text-amber-700 font-semibold">{pendingCount} pending review</span>
              </button>

              <button
                type="button"
                onClick={() => setTab("announcements")}
                className="p-3 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 rounded-2xl text-left transition-all cursor-pointer"
              >
                <span className="text-lg block">📢</span>
                <p className="font-bold text-xs text-rose-900 mt-1">Broadcast Banner</p>
                <span className="text-[10px] text-rose-700 font-semibold">Live announcement</span>
              </button>

              <button
                type="button"
                onClick={handleExportInstantCSV}
                className="p-3 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-2xl text-left transition-all cursor-pointer"
              >
                <span className="text-lg block">📊</span>
                <p className="font-bold text-xs text-emerald-900 mt-1">Export Database</p>
                <span className="text-[10px] text-emerald-700 font-semibold">1-Click CSV backup</span>
              </button>
            </div>
          </div>

          {/* Platform Distribution: Top Categories & Top Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Demand Categories */}
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span>🔥</span> Top Demanded Service Trades
              </h3>
              <div className="space-y-2">
                {analyticsData?.topCategories && analyticsData.topCategories.length > 0 ? (
                  analyticsData.topCategories.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-black flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span>{item.name}</span>
                      </span>
                      <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                        {item.count} bookings
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 p-4 text-center">Loading category distribution...</p>
                )}
              </div>
            </div>

            {/* Top Upazila Locations */}
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <span>📍</span> Most Active Service Locations / Upazilas
              </h3>
              <div className="space-y-2">
                {analyticsData?.topAreas && analyticsData.topAreas.length > 0 ? (
                  analyticsData.topAreas.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span>{item.name}</span>
                      </span>
                      <span className="text-xs font-extrabold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-lg">
                        {item.count} requests
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 p-4 text-center">Loading location distribution...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INSTANT BOOKINGS & SMART DISPATCH */}
      {/* ========================================================================= */}
      {tab === "instantBookings" && (
        <div className="space-y-4 motion-enter">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl">
            <div>
              <h2 className="font-display font-extrabold text-base text-amber-950">
                Live Emergency Dispatches ({displayedInstantBookings.length})
              </h2>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                Assign nearest technician, send instant WhatsApp/Call dispatch, and track service status.
              </p>
            </div>
            <button
              onClick={handleExportInstantCSV}
              className="bg-white hover:bg-amber-100/50 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-2 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>📥</span>
              <span>Export Dispatches CSV</span>
            </button>
          </div>

          {displayedInstantBookings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <span className="text-3xl block">⚡</span>
              <p className="text-sm font-bold text-slate-800">No instant bookings found.</p>
              <p className="text-xs text-slate-500">All client emergency requests are fulfilled.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedInstantBookings.map((booking) => {
                const isNew = booking.status === "NEW";
                const isCompleted = booking.status === "COMPLETED";

                const cleanPhone = booking.customerPhone ? booking.customerPhone.replace(/\D/g, "") : "";
                const waPhone = cleanPhone.startsWith("88") ? cleanPhone : `88${cleanPhone}`;
                const waText = encodeURIComponent(
                  `আসসালামু আলাইকুম ${booking.customerName}। SohojService থেকে আপনার "${booking.categoryName}" এর অনুরোধটি গ্রহণ করা হয়েছে।`
                );

                return (
                  <div
                    key={booking.id}
                    className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border shadow-sm transition-all space-y-3.5 ${
                      isNew
                        ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/40"
                        : isCompleted
                        ? "bg-emerald-50/50 border-emerald-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          #{booking.id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                          {booking.categoryName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            booking.urgency === "ASAP"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {booking.urgency === "ASAP" ? "🚨 Emergency (ASAP)" : booking.urgency}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isNew
                              ? "bg-red-500 text-white animate-pulse"
                              : booking.status === "ASSIGNED"
                              ? "bg-blue-600 text-white"
                              : isCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-700 text-white"
                          }`}
                        >
                          {booking.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(booking.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>

                    {/* Client & Location Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Client</span>
                        <p className="font-bold text-slate-900 text-sm">{booking.customerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${booking.customerPhone}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded"
                          >
                            <span>📞</span> {booking.customerPhone}
                          </a>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${waPhone}?text=${waText}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline bg-emerald-50 px-2 py-0.5 rounded"
                            >
                              <span>💬</span> WhatsApp
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Location</span>
                        <p className="font-bold text-slate-900">📍 {booking.area}</p>
                        <p className="text-slate-500 text-[11px] truncate">{booking.fullAddress}</p>
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-slate-400 font-semibold block text-[10px] uppercase">Problem Description</span>
                        <p className="font-medium text-slate-800 bg-slate-50/90 p-2 rounded-xl border border-slate-200">
                          {booking.problemDescription}
                        </p>
                      </div>
                    </div>

                    {/* Smart Technician Assignment & Status Stepper */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-bold text-slate-700 whitespace-nowrap">Assign Technician:</span>
                        <select
                          value={booking.assignedProfessionalId || ""}
                          onChange={(e) => assignInstantProfessional(booking.id, e.target.value || null)}
                          className="flex-1 sm:max-w-xs border border-slate-300 bg-white rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-indigo-600 focus:outline-none cursor-pointer"
                        >
                          <option value="">-- Unassigned (Click to Assign) --</option>
                          {professionals.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.category?.nameEn} · {p.area}) {p.isVerified ? "✓ Verified" : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isNew && (
                          <button
                            type="button"
                            onClick={() => updateInstantStatus(booking.id, "CONTACTED")}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                          >
                            Mark Contacted
                          </button>
                        )}

                        {!isCompleted && (
                          <button
                            type="button"
                            onClick={() => updateInstantStatus(booking.id, "COMPLETED")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <span>✓</span> Mark Completed
                          </button>
                        )}

                        {booking.status !== "CANCELLED" && (
                          <button
                            type="button"
                            onClick={() => updateInstantStatus(booking.id, "CANCELLED")}
                            className="text-slate-500 hover:text-red-700 hover:bg-red-50 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REVIEWS & REPUTATION MODERATION */}
      {/* ========================================================================= */}
      {tab === "reviews" && (
        <div className="space-y-4 motion-enter">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-yellow-50/80 border border-yellow-200/90 rounded-2xl">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-extrabold text-base text-yellow-950">
                  Client Ratings & Reviews ({displayedReviews.length})
                </h2>
                <span className="text-[10px] font-bold bg-yellow-200 text-yellow-950 px-2 py-0.5 rounded-full">
                  Avg: {reviewsStats.avgRating} ★
                </span>
              </div>
              <p className="text-xs text-yellow-900 font-medium mt-0.5">
                Moderate, inspect, and manage verified ratings and comments submitted by clients.
              </p>
            </div>

            <button
              onClick={() => loadReviews()}
              className="bg-white hover:bg-yellow-100/60 text-yellow-950 border border-yellow-300 text-xs font-bold px-3 py-2 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>🔄</span> Refresh Reviews
            </button>
          </div>

          {/* Star Rating Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedReviewRating("ALL")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedReviewRating === "ALL" ? "bg-yellow-600 text-white shadow-2xs" : "bg-white border border-slate-200 text-slate-700"
              }`}
            >
              All Reviews ({reviewsStats.total})
            </button>
            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                type="button"
                onClick={() => setSelectedReviewRating(stars)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedReviewRating === stars ? "bg-yellow-600 text-white shadow-2xs" : "bg-white border border-slate-200 text-slate-700"
                }`}
              >
                <span>{stars} ★</span>
                <span className="text-[10px] opacity-80">
                  ({stars === 5 ? reviewsStats.rating5 : stars === 4 ? reviewsStats.rating4 : stars === 3 ? reviewsStats.rating3 : stars === 2 ? reviewsStats.rating2 : reviewsStats.rating1})
                </span>
              </button>
            ))}
          </div>

          {/* Reviews Grid */}
          {displayedReviews.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <span className="text-3xl block">⭐</span>
              <p className="text-sm font-bold text-slate-800">No reviews found.</p>
              <p className="text-xs text-slate-500">No ratings match your filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedReviews.map((rev) => (
                <div key={rev.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-bold text-sm">{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</span>
                        <span className="text-xs font-bold text-slate-900">{rev.rating}.0 / 5.0</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      &quot;{rev.comment || "No written review text."}&quot;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">For Technician</span>
                      <p className="font-bold text-slate-900">{rev.professional.name}</p>
                      <span className="text-[10px] text-slate-500">{rev.professional.categoryName} · {rev.professional.area}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-[11px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                      >
                        🗑️ Delete Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SITE-WIDE ANNOUNCEMENT & BANNER */}
      {/* ========================================================================= */}
      {tab === "announcements" && (
        <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6 motion-enter">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="font-display font-extrabold text-base sm:text-lg text-slate-900">
              📢 Public Site-Wide Announcement Banner
            </h2>
            <p className="text-xs text-slate-500">
              Broadcast urgent notifications, holiday alerts, weather advisories, or service updates across all pages.
            </p>
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">Live Preview on Homepage:</label>
            <div
              className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 shadow-2xs ${
                settings.banner_announcement_type === "emergency"
                  ? "bg-red-600 text-white border-red-700"
                  : settings.banner_announcement_type === "warning"
                  ? "bg-amber-500 text-slate-950 border-amber-600"
                  : settings.banner_announcement_type === "success"
                  ? "bg-emerald-600 text-white border-emerald-700"
                  : "bg-blue-600 text-white border-blue-700"
              }`}
            >
              <span>{settings.banner_announcement_text || "No announcement text configured."}</span>
              <span className="text-[10px] uppercase font-black bg-white/20 px-2 py-0.5 rounded">Live</span>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-800 block mb-1">
                Announcement Text (Bangla / English)
              </label>
              <textarea
                rows={3}
                value={settings.banner_announcement_text || ""}
                onChange={(e) => setSettings({ ...settings, banner_announcement_text: e.target.value })}
                placeholder="e.g. ⚡ 24/7 Monsoon Emergency Electrician & Plumbing Support active in Sirajganj"
                className="w-full border border-slate-300 bg-white rounded-xl p-3 text-xs text-slate-900 focus:border-rose-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Banner Style Theme</label>
                <select
                  value={settings.banner_announcement_type || "emergency"}
                  onChange={(e) => setSettings({ ...settings, banner_announcement_type: e.target.value })}
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:border-rose-600 focus:outline-none cursor-pointer"
                >
                  <option value="emergency">🚨 Emergency Red</option>
                  <option value="warning">⚠️ Warning / Advisory Amber</option>
                  <option value="info">ℹ️ Informational Blue</option>
                  <option value="success">✅ Success / Promo Green</option>
                </select>
              </div>

              <div className="flex items-center sm:items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={settings.banner_announcement_active === "true"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        banner_announcement_active: e.target.checked ? "true" : "false",
                      })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Enable Banner on SohojService
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {savingSettings ? "Saving..." : "✓ Publish Announcement"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SYSTEM SETTINGS & DATA BACKUP */}
      {/* ========================================================================= */}
      {tab === "settings" && (
        <div className="space-y-6 motion-enter">
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="font-display font-extrabold text-base sm:text-lg text-slate-900">
                ⚙️ Platform Business Rules & Support Settings
              </h2>
              <p className="text-xs text-slate-500">Configure central hotline, WhatsApp gateway, and base fees.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Emergency Hotline Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.emergency_hotline || ""}
                    onChange={(e) => setSettings({ ...settings, emergency_hotline: e.target.value })}
                    placeholder="01700-000000"
                    className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Support WhatsApp Number (International)
                  </label>
                  <input
                    type="text"
                    value={settings.support_whatsapp || ""}
                    onChange={(e) => setSettings({ ...settings, support_whatsapp: e.target.value })}
                    placeholder="8801700000000"
                    className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Default Visiting Base Fee (BDT ৳)
                  </label>
                  <input
                    type="number"
                    value={settings.default_visiting_fee || "300"}
                    onChange={(e) => setSettings({ ...settings, default_visiting_fee: e.target.value })}
                    placeholder="300"
                    className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {savingSettings ? "Saving..." : "💾 Save Business Rules"}
                </button>
              </div>
            </form>
          </div>

          {/* Database Backup Exporter */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900">
                📦 1-Click Database Export & Backup
              </h3>
              <p className="text-xs text-slate-500">Download formatted CSV reports of your live database tables.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={handleExportInstantCSV}
                className="p-4 bg-amber-50/70 hover:bg-amber-100 border border-amber-200 rounded-2xl text-left transition-all cursor-pointer"
              >
                <p className="font-bold text-xs text-amber-950">📥 Instant Bookings CSV</p>
                <span className="text-[11px] text-amber-700 block mt-0.5">{instantBookingsList.length} records</span>
              </button>

              <button
                type="button"
                onClick={handleExportProsCSV}
                className="p-4 bg-blue-50/70 hover:bg-blue-100 border border-blue-200 rounded-2xl text-left transition-all cursor-pointer"
              >
                <p className="font-bold text-xs text-blue-950">📥 Professionals CSV</p>
                <span className="text-[11px] text-blue-700 block mt-0.5">{professionals.length} records</span>
              </button>

              <button
                type="button"
                onClick={handleExportUsersCSV}
                className="p-4 bg-purple-50/70 hover:bg-purple-100 border border-purple-200 rounded-2xl text-left transition-all cursor-pointer"
              >
                <p className="font-bold text-xs text-purple-950">📥 User Accounts CSV</p>
                <span className="text-[11px] text-purple-700 block mt-0.5">{users.length} records</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: PROFESSIONALS DIRECTORY */}
      {/* ========================================================================= */}
      {tab === "professionals" && (
        <div className="space-y-4 motion-enter">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-50/80 border border-blue-200/90 rounded-2xl">
            <div>
              <h2 className="font-display font-extrabold text-base text-blue-950">
                Service Professionals Directory ({displayedProfessionals.length})
              </h2>
              <p className="text-xs text-blue-800 font-medium mt-0.5">
                Verify listings, edit visiting rates, manage locations, and monitor technician performance.
              </p>
            </div>
            <button
              onClick={handleExportProsCSV}
              className="bg-white hover:bg-blue-100/50 text-blue-900 border border-blue-300 text-xs font-bold px-3 py-2 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>📥</span>
              <span>Export Pros CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayedProfessionals.map((pro) => (
              <div
                key={pro.id}
                onClick={() => openProfessionalDetails(pro.id)}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <ProfilePhoto name={pro.name} photoUrl={pro.photoUrl} size="md" />
                      <div>
                        <h3 className="font-display font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                          {pro.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{pro.category?.nameEn}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                      📍 {pro.area}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold ${
                        pro.isVerified ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {pro.isVerified ? "✓ Verified" : "⏳ Pending"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold ${
                        pro.isAvailable ? "bg-blue-50 text-blue-800" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {pro.isAvailable ? "Active" : "Offline"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => toggleVerify(pro.id, pro.isVerified)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      pro.isVerified
                        ? "text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                        : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                    }`}
                  >
                    {pro.isVerified ? "Unverify" : "✓ Verify"}
                  </button>

                  <button
                    type="button"
                    onClick={() => openProfessionalDetails(pro.id)}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Edit Profile →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: DIRECT CUSTOMER BOOKINGS */}
      {/* ========================================================================= */}
      {tab === "bookings" && (
        <div className="space-y-4 motion-enter">
          <div className="flex items-center justify-between p-4 bg-slate-100 rounded-2xl">
            <h2 className="font-display font-extrabold text-base text-slate-900">
              Direct Scheduled Bookings ({displayedBookings.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {displayedBookings.map((b) => (
              <div key={b.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{b.customerName}</span>
                  <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full">{b.status}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">{b.problemNote}</p>
                <p className="text-[11px] text-slate-400 font-medium">📍 {b.address}</p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  {b.status !== "COMPLETED" && (
                    <button
                      type="button"
                      onClick={() => updateBookingStatus(b.id, "COMPLETED")}
                      className="text-[11px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      ✓ Complete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteBooking(b.id)}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 8: USERS MANAGEMENT */}
      {/* ========================================================================= */}
      {tab === "users" && (
        <div className="space-y-4 motion-enter">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-purple-50/80 border border-purple-200/90 rounded-2xl">
            <div>
              <h2 className="font-display font-extrabold text-base text-purple-950">
                Registered Users Directory ({displayedUsers.length})
              </h2>
              <p className="text-xs text-purple-800 font-medium mt-0.5">
                Manage user permissions, roles (Client, Professional, Admin), and contact credentials.
              </p>
            </div>
            <button
              onClick={handleExportUsersCSV}
              className="bg-white hover:bg-purple-100/50 text-purple-900 border border-purple-300 text-xs font-bold px-3 py-2 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>📥</span>
              <span>Export Users CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayedUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => openUserDetails(u)}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ProfilePhoto name={u.name} photoUrl={u.photoUrl} size="md" />
                  <div className="truncate">
                    <h3 className="font-display font-bold text-sm text-slate-900 truncate group-hover:text-purple-700">
                      {u.name}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.role === "ADMIN"
                        ? "bg-purple-100 text-purple-900 font-black"
                        : u.role === "PROFESSIONAL"
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-blue-100 text-blue-900"
                    }`}
                  >
                    {u.role === "CUSTOMER" ? "CLIENT" : u.role}
                  </span>
                  <button type="button" className="text-blue-600 font-bold text-[11px] hover:underline">
                    Edit User →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 9: COMPLETED TASKS ARCHIVE */}
      {/* ========================================================================= */}
      {tab === "completedTasks" && (
        <div className="space-y-4 motion-enter">
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
            <h2 className="font-display font-extrabold text-base text-emerald-950">
              Completed Tasks Archive ({allDoneTasks.length})
            </h2>
            <p className="text-xs text-emerald-800 font-medium mt-0.5">
              Historical ledger of all resolved emergency and scheduled client jobs.
            </p>
          </div>

          <div className="space-y-2.5">
            {allDoneTasks.map((t) => (
              <div key={t.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{t.customerName}</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">{t.category}</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">📍 {t.location}</p>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  ✓ Done ({new Date(t.date).toLocaleDateString()})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 10: SERVICE CATEGORIES */}
      {/* ========================================================================= */}
      {tab === "categories" && (
        <div className="space-y-4 motion-enter">
          <div className="flex items-center justify-between p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl">
            <div>
              <h2 className="font-display font-extrabold text-base text-purple-950">
                Manage Service Categories ({categoriesList.length})
              </h2>
              <p className="text-xs text-purple-800 font-medium">Add and edit public service trades on SohojService.</p>
            </div>
            <button
              type="button"
              onClick={() => loadCategories()}
              className="bg-white hover:bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Direct Category Entry */}
          <div
            id="category-entry-section"
            className={`p-4 sm:p-6 rounded-2xl border transition-all shadow-sm space-y-4 ${
              editingCategory ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/50" : "bg-white border-purple-200"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                {editingCategory ? `Edit Category: ${editingCategory.nameEn}` : "Add New Category"}
              </h3>
              {editingCategory && (
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {createCatError && <p className="text-xs text-red-600 font-bold">{createCatError}</p>}
            {editCatError && <p className="text-xs text-red-600 font-bold">{editCatError}</p>}

            <form onSubmit={editingCategory ? handleSaveCategoryEdits : handleCreateCategory} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  required
                  placeholder="Category Name (English)"
                  value={editingCategory ? editCatNameEn : newCatNameEn}
                  onChange={(e) => (editingCategory ? setEditCatNameEn(e.target.value) : setNewCatNameEn(e.target.value))}
                  className="border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                />
                <input
                  required
                  placeholder="Category Name (Bangla)"
                  value={editingCategory ? editCatNameBn : newCatNameBn}
                  onChange={(e) => (editingCategory ? setEditCatNameBn(e.target.value) : setNewCatNameBn(e.target.value))}
                  className="border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                />
                <select
                  value={editingCategory ? editCatIcon : newCatIcon}
                  onChange={(e) => (editingCategory ? setEditCatIcon(e.target.value) : setNewCatIcon(e.target.value))}
                  className="border border-slate-300 bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 cursor-pointer"
                >
                  {ICON_THEMES.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.emoji} {theme.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={creatingCategory || savingCategory}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  {editingCategory ? "Save Changes" : "+ Add Category"}
                </button>
              </div>
            </form>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayedCategories.map((cat) => (
              <div key={cat.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
                    {getCategoryEmoji(cat.icon, cat.slug)}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{cat.nameEn}</h4>
                    <p className="text-[11px] text-slate-500">{cat.nameBn}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openEditCategoryModal(cat)}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id, cat.nameEn)}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 11: AREAS & UPAZILAS */}
      {/* ========================================================================= */}
      {tab === "locations" && (
        <div className="space-y-4 motion-enter">
          <div className="flex items-center justify-between p-4 bg-teal-50/80 border border-teal-200/90 rounded-2xl">
            <div>
              <h2 className="font-display font-extrabold text-base text-teal-950">
                Service Areas & Upazilas ({locationsList.length})
              </h2>
              <p className="text-xs text-teal-800 font-medium">Manage all districts and upazilas across Bangladesh.</p>
            </div>
            <button
              type="button"
              onClick={() => loadLocations()}
              className="bg-white hover:bg-teal-100 text-teal-950 border border-teal-300 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Direct Location Entry */}
          <div
            id="location-entry-section"
            className={`p-4 sm:p-6 rounded-2xl border transition-all shadow-sm space-y-4 ${
              editingLocation ? "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/50" : "bg-white border-teal-200"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                {editingLocation ? `Edit Area: ${editingLocation.nameEn}` : "Add New Area / Upazila"}
              </h3>
              {editingLocation && (
                <button
                  type="button"
                  onClick={resetLocationForm}
                  className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {locationError && <p className="text-xs text-red-600 font-bold">{locationError}</p>}

            <form onSubmit={handleSaveLocation} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <input
                  required
                  placeholder="Area Name (English)"
                  value={locNameEn}
                  onChange={(e) => setLocNameEn(e.target.value)}
                  className="border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                />
                <input
                  required
                  placeholder="Area Name (Bangla)"
                  value={locNameBn}
                  onChange={(e) => setLocNameBn(e.target.value)}
                  className="border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                />
                <input
                  required
                  placeholder="District / Jela"
                  value={locDistrict}
                  onChange={(e) => setLocDistrict(e.target.value)}
                  className="border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                />
                <select
                  value={locDivision}
                  onChange={(e) => setLocDivision(e.target.value)}
                  className="border border-slate-300 bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 cursor-pointer"
                >
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chattogram">Chattogram</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Barishal">Barishal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (Optional)"
                  value={locLat}
                  onChange={(e) => setLocLat(e.target.value === "" ? "" : Number(e.target.value))}
                  className="border border-slate-300 bg-white rounded-xl p-2 text-xs text-slate-900"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude (Optional)"
                  value={locLng}
                  onChange={(e) => setLocLng(e.target.value === "" ? "" : Number(e.target.value))}
                  className="border border-slate-300 bg-white rounded-xl p-2 text-xs text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleDetectCurrentGPS}
                  className="bg-teal-50 text-teal-800 border border-teal-200 rounded-xl px-3 py-2 text-xs font-bold cursor-pointer"
                >
                  {gpsDetecting ? "Detecting..." : "📍 Detect Current GPS"}
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingLocation}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  {editingLocation ? "Save Changes" : "+ Add Area"}
                </button>
              </div>
            </form>
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayedLocations.map((loc) => (
              <div key={loc.id} className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{loc.nameEn}</h4>
                  <p className="text-[11px] text-slate-500">{loc.nameBn}</p>
                  <span className="text-[10px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded-md inline-block mt-1">
                    🏛️ {loc.district} · {loc.division}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openEditLocation(loc)}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  {loc.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteLocation(loc.id, loc.nameEn)}
                      className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAIL MODAL: EDIT PROFESSIONAL */}
      {/* ========================================================================= */}
      {selectedProfessional && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-xs motion-enter">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <ProfilePhoto name={selectedProfessional.user.name} photoUrl={selectedProfessional.photoUrl} size="md" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedProfessional.user.name}</h3>
                  <p className="text-xs text-blue-700 font-bold">{selectedProfessional.category.nameEn}</p>
                </div>
              </div>
              <button onClick={() => setSelectedProfessional(null)} className="text-slate-400 hover:text-slate-700 font-bold text-base p-1">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Service Area (Upazila)</label>
                <BangladeshUpazilaInput
                  value={editingProArea}
                  onChange={setEditingProArea}
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="font-bold text-slate-800 block mb-1">Visiting Rate (BDT ৳)</label>
                  <input
                    type="number"
                    value={editingProRate}
                    onChange={(e) => setEditingProRate(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Professional Bio</label>
                <textarea
                  rows={2}
                  value={editingProBio}
                  onChange={(e) => setEditingProBio(e.target.value)}
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => deleteProfessionalListing(selectedProfessional.id)}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                Delete Listing
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProfessional(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingPro}
                  onClick={saveProfessionalEdits}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold rounded-xl cursor-pointer"
                >
                  {savingPro ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAIL MODAL: EDIT USER */}
      {/* ========================================================================= */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-xs motion-enter">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <ProfilePhoto name={selectedUser.name} photoUrl={selectedUser.photoUrl} size="md" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-700 font-bold text-base p-1">✕</button>
            </div>

            <div className="space-y-3 text-xs">
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
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Account Role</label>
                <select
                  value={editingUserRole}
                  onChange={(e) => setEditingUserRole(e.target.value as any)}
                  className="w-full border border-slate-300 bg-white rounded-xl p-2.5 text-xs font-bold text-slate-900 cursor-pointer"
                >
                  <option value="CUSTOMER">CLIENT (Can book services & submit reviews)</option>
                  <option value="PROFESSIONAL">PROFESSIONAL (Can offer services & list profile)</option>
                  <option value="ADMIN">ADMIN (Full control center access)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => deleteUser(selectedUser.id)}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                Delete User
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingUser}
                  onClick={saveUserEdits}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 text-xs font-bold rounded-xl cursor-pointer"
                >
                  {savingUser ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
