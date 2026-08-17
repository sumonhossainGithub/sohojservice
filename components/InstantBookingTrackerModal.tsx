"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type AssignedPro = {
  id: string;
  user: {
    name: string;
    phone: string | null;
    photoUrl: string | null;
  };
  category: {
    nameEn: string;
    nameBn: string;
  };
  area: string;
  ratePerVisit: number | null;
};

type TrackedBooking = {
  id: string;
  customerName: string;
  customerPhone: string;
  categoryName: string;
  problemDescription: string;
  area: string;
  fullAddress: string;
  urgency: "ASAP" | "TODAY" | "FLEXIBLE";
  status: "NEW" | "CONTACTED" | "ASSIGNED" | "COMPLETED" | "CANCELLED";
  assignedProfessional?: AssignedPro | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function InstantBookingTrackerModal({
  isOpen,
  onClose,
  initialQuery = "",
}: Props) {
  const { lang } = useLanguage();
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState<TrackedBooking[] | null>(null);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleTrack(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  async function handleTrack(searchVal?: string) {
    const q = (searchVal ?? query).trim();
    if (!q) {
      setError(
        lang === "bn"
          ? "দয়া করে ট্র্যাকিং আইডি বা মোবাইল নম্বর দিন।"
          : "Please enter your Tracking ID or Mobile Number."
      );
      return;
    }

    setLoading(true);
    setError("");
    setBookings(null);

    try {
      const res = await fetch(`/api/instant-bookings/track?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(
          data.error ||
            (lang === "bn"
              ? "কোনো অনুরোধ খুঁজে পাওয়া যায়নি।"
              : "No booking found matching your search.")
        );
        return;
      }

      setBookings(data.bookings || []);
    } catch {
      setLoading(false);
      setError(
        lang === "bn"
          ? "তথ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।"
          : "Failed to connect to tracking server. Please try again."
      );
    }
  }

  if (!isOpen) return null;

  function getStepNumber(status: TrackedBooking["status"]) {
    switch (status) {
      case "NEW":
        return 1;
      case "CONTACTED":
        return 2;
      case "ASSIGNED":
        return 3;
      case "COMPLETED":
        return 4;
      case "CANCELLED":
        return -1;
      default:
        return 1;
    }
  }

  function formatStatusLabel(status: TrackedBooking["status"]) {
    switch (status) {
      case "NEW":
        return {
          label: lang === "bn" ? "অনুরোধ গ্রহণ হয়েছে" : "Request Received",
          color: "bg-blue-100 text-blue-900 border-blue-200",
        };
      case "CONTACTED":
        return {
          label: lang === "bn" ? "যোগাযোগ করা হয়েছে" : "Concierge Contacted",
          color: "bg-amber-100 text-amber-900 border-amber-200",
        };
      case "ASSIGNED":
        return {
          label: lang === "bn" ? "টেকনিশিয়ান নির্ধারিত" : "Technician Assigned",
          color: "bg-purple-100 text-purple-900 border-purple-200",
        };
      case "COMPLETED":
        return {
          label: lang === "bn" ? "কাজ সম্পন্ন" : "Service Completed",
          color: "bg-emerald-100 text-emerald-900 border-emerald-200",
        };
      case "CANCELLED":
        return {
          label: lang === "bn" ? "বাতিল হয়েছে" : "Cancelled",
          color: "bg-red-100 text-red-900 border-red-200",
        };
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-all motion-enter"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm">
              📍
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
                {lang === "bn" ? "ইনস্ট্যান্ট বুকিং ট্র্যাকিং" : "Track Instant Request"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {lang === "bn"
                  ? "আপনার ট্র্যাকিং আইডি বা মোবাইল নম্বর দিয়ে লাইভ স্ট্যাটাস দেখুন"
                  : "Check live dispatch and technician status in real-time"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close tracking modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                🔍
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  lang === "bn"
                    ? "মোবাইল নম্বর (০১XXXXXXXXX) বা ট্র্যাকিং আইডি..."
                    : "Enter Mobile Number (01XXXXXXXXX) or Tracking ID..."
                }
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all font-medium"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
            >
              {loading
                ? lang === "bn"
                  ? "খোঁজা হচ্ছে..."
                  : "Searching..."
                : lang === "bn"
                ? "ট্র্যাক করুন"
                : "Track"}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold flex items-center gap-2.5">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Initial Helper Guide */}
          {!bookings && !loading && !error && (
            <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-100 text-center space-y-3">
              <div className="text-3xl">⚡</div>
              <h3 className="font-display font-extrabold text-sm text-slate-900">
                {lang === "bn" ? "কীভাবে ট্র্যাক করবেন?" : "How Live Tracking Works"}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {lang === "bn"
                  ? "ইনস্ট্যান্ট বুকিং করার পর প্রাপ্ত ট্র্যাকিং কোড (যেমন #ABCD1234) অথবা আপনার দেওয়া ফোন নম্বরটি লিখুন। আপনি দেখতে পাবেন কোন টেকনিশিয়ান নির্ধারিত হয়েছে এবং কতক্ষণে পৌঁছাবে।"
                  : "Enter the tracking code you received or your registered phone number to view live technician assignment, dispatcher notes, and real-time status."}
              </p>
            </div>
          )}

          {/* Search Results List */}
          {bookings && bookings.length > 0 && (
            <div className="space-y-6">
              {bookings.map((booking) => {
                const step = getStepNumber(booking.status);
                const statusMeta = formatStatusLabel(booking.status);

                return (
                  <div
                    key={booking.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-5"
                  >
                    {/* Header: ID, Category & Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 text-sm">
                            #{booking.id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.color}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                          {booking.categoryName} · {booking.area}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-medium block">
                          {new Date(booking.createdAt).toLocaleString(
                            lang === "bn" ? "bn-BD" : "en-US",
                            { dateStyle: "medium", timeStyle: "short" }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Progress Stepper (if not cancelled) */}
                    {booking.status !== "CANCELLED" ? (
                      <div className="py-2">
                        <div className="grid grid-cols-4 gap-2 text-center relative">
                          {/* Step 1 */}
                          <div className="space-y-1.5">
                            <div
                              className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                step >= 1
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              ✓
                            </div>
                            <p
                              className={`text-[11px] font-bold ${
                                step >= 1 ? "text-slate-900" : "text-slate-400"
                              }`}
                            >
                              {lang === "bn" ? "অনুরোধ জমা" : "Received"}
                            </p>
                          </div>

                          {/* Step 2 */}
                          <div className="space-y-1.5">
                            <div
                              className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                step >= 2
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {step >= 2 ? "✓" : "2"}
                            </div>
                            <p
                              className={`text-[11px] font-bold ${
                                step >= 2 ? "text-slate-900" : "text-slate-400"
                              }`}
                            >
                              {lang === "bn" ? "কল কনফার্ম" : "Contacted"}
                            </p>
                          </div>

                          {/* Step 3 */}
                          <div className="space-y-1.5">
                            <div
                              className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                step >= 3
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {step >= 3 ? "✓" : "3"}
                            </div>
                            <p
                              className={`text-[11px] font-bold ${
                                step >= 3 ? "text-slate-900" : "text-slate-400"
                              }`}
                            >
                              {lang === "bn" ? "টেকনিশিয়ান" : "Assigned"}
                            </p>
                          </div>

                          {/* Step 4 */}
                          <div className="space-y-1.5">
                            <div
                              className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                step >= 4
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {step >= 4 ? "✓" : "4"}
                            </div>
                            <p
                              className={`text-[11px] font-bold ${
                                step >= 4 ? "text-emerald-800" : "text-slate-400"
                              }`}
                            >
                              {lang === "bn" ? "সম্পন্ন" : "Completed"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold">
                        {lang === "bn"
                          ? "এই অনুরোধটি বাতিল করা হয়েছে।"
                          : "This instant request was cancelled."}
                      </div>
                    )}

                    {/* Assigned Technician Profile Box */}
                    {booking.assignedProfessional ? (
                      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                            {lang === "bn"
                              ? "নির্ধারিত টেকনিশিয়ান বিবরণ"
                              : "Assigned Technician"}
                          </span>
                          <span className="text-[11px] bg-white text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Verified Pro
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-display font-extrabold text-sm text-slate-900">
                              {booking.assignedProfessional.user.name}
                            </p>
                            <p className="text-xs text-slate-600 font-medium">
                              {lang === "bn"
                                ? booking.assignedProfessional.category.nameBn
                                : booking.assignedProfessional.category.nameEn}{" "}
                              · {booking.assignedProfessional.area}
                            </p>
                          </div>

                          {booking.assignedProfessional.user.phone && (
                            <a
                              href={`tel:${booking.assignedProfessional.user.phone}`}
                              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs shrink-0"
                            >
                              <span>📞</span>
                              <span>
                                {lang === "bn" ? "কল করুন" : "Call Pro"}
                              </span>
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      step < 3 &&
                      booking.status !== "CANCELLED" && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                          <span className="animate-spin text-base">⏳</span>
                          <span>
                            {lang === "bn"
                              ? "আমাদের টিম আপনার এলাকার সেরা যাচাইকৃত টেকনিশিয়ান প্রস্তুত করছে। শীঘ্রই ফোনে আপডেট জানানো হবে।"
                              : "Our concierge desk is matching the best verified technician in your upazila."}
                          </span>
                        </div>
                      )
                    )}

                    {/* Problem Summary & Address */}
                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-100">
                      <p>
                        <strong className="text-slate-900">
                          {lang === "bn" ? "কাজের বিবরণ:" : "Problem Note:"}
                        </strong>{" "}
                        {booking.problemDescription}
                      </p>
                      <p>
                        <strong className="text-slate-900">
                          {lang === "bn" ? "ঠিকানা:" : "Address:"}
                        </strong>{" "}
                        {booking.fullAddress}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer with Support helpline */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-600">
          <span>
            {lang === "bn"
              ? "সাহায্য প্রয়োজন? কল করুন: ০১৫১৮৯৭৭২০৬"
              : "Emergency Helpline: 01518977206"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-700 font-bold hover:underline cursor-pointer"
          >
            {lang === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
