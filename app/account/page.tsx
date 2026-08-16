"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import ProfilePhoto from "@/components/ProfilePhoto";
import MapPreview from "@/components/MapPreview";

type Account = {
  name: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  role: string;
  latitude: number | null;
  longitude: number | null;
};

export default function AccountPage() {
  const { status } = useAuth();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

  // Password reset state (for non-admin users)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login?callbackUrl=/account");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/account")
      .then((res) => res.json())
      .then((data) => setAccount(data.user ?? null));
  }, [status]);

  async function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/image\/(jpeg|png|webp)/.test(file.type)) {
      setNotification({ type: "warning", text: "Please choose a JPG, PNG, or WebP image." });
      return;
    }
    if (file.size > 500 * 1024) {
      setNotification({ type: "warning", text: "Please choose an image smaller than 500 KB." });
      return;
    }

    setSaving(true);
    setNotification(null);
    try {
      const photoUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read image."));
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl }),
      });
      const data = await res.json();
      setSaving(false);
      if (!res.ok) {
        setNotification({ type: "error", text: data.error ?? "Could not upload photo." });
        return;
      }
      setAccount((current) => (current ? { ...current, photoUrl: data.photoUrl } : current));
      setNotification({ type: "success", text: "Profile photo updated successfully." });
    } catch {
      setSaving(false);
      setNotification({ type: "error", text: "Failed to upload image. Please try again." });
    }
  }

  function saveCurrentLocation() {
    if (!navigator.geolocation) {
      setNotification({ type: "warning", text: "Location is not available in this browser." });
      return;
    }
    setSavingLocation(true);
    setNotification(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const res = await fetch("/api/account/location", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
        });
        const data = await res.json();
        setSavingLocation(false);
        if (!res.ok) {
          setNotification({ type: "error", text: data.error ?? "Could not save location." });
          return;
        }
        setAccount((current) =>
          current ? { ...current, latitude: data.latitude, longitude: data.longitude } : current
        );
        setNotification({ type: "success", text: "Location saved. We use it to show nearby services." });
      },
      () => {
        setSavingLocation(false);
        setNotification({ type: "warning", text: "Location permission was not granted." });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      setPasswordLoading(false);

      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password.");
        return;
      }

      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordLoading(false);
      setPasswordError("An unexpected error occurred. Please try again.");
    }
  }

  if (!account) return <div className="max-w-xl mx-auto px-4 py-16 text-center text-sm font-semibold text-slate-700">Loading profile...</div>;

  const isAdmin = account.role === "ADMIN";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 motion-enter space-y-6">
      <div className="bg-white p-8 shadow-xl rounded-3xl border border-slate-200 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 mb-1">
            My Account
          </h1>
          <p className="text-xs text-slate-600 font-medium">
            {isAdmin
              ? "Manage your administrator credentials and platform settings."
              : "Manage your personal profile, security credentials, and service location."}
          </p>
        </div>

        {/* Profile Avatar Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <ProfilePhoto name={account.name} photoUrl={account.photoUrl} size="lg" />
          <div className="text-center sm:text-left space-y-2">
            <h2 className="font-display font-extrabold text-lg text-slate-900">{account.name}</h2>
            <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full ${
              isAdmin ? "bg-purple-100 text-purple-950 border border-purple-200" : "bg-blue-100 text-blue-950 border border-blue-200"
            }`}>
              {account.role}
            </span>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={saving}
                className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-2xs active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {saving ? "Uploading..." : "Change photo"}
              </button>
              <p className="text-[11px] text-slate-500 font-medium mt-1">JPG, PNG, or WebP up to 500 KB</p>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={uploadPhoto}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {notification && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-2xs motion-enter ${
              notification.type === "warning"
                ? "bg-amber-50 text-amber-950 border border-amber-300"
                : notification.type === "error"
                ? "bg-red-50 text-red-950 border border-red-300"
                : "bg-emerald-50 text-emerald-950 border border-emerald-300"
            }`}
          >
            <span className="text-sm">
              {notification.type === "warning" ? "⚠️" : notification.type === "error" ? "❌" : "✅"}
            </span>
            <span>{notification.text}</span>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Email Address
            </span>
            <span className="font-bold text-slate-900 break-all">{account.email}</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Mobile Phone
            </span>
            <span className="font-bold text-slate-900">
              {account.phone || "Not provided"}
            </span>
          </div>
        </div>

        {/* PASSWORD RESET / CHANGE SECTION (EXCEPT ADMIN) */}
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                <span>🔐</span>
                <span>Password & Security</span>
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {isAdmin
                  ? "Admin security rules apply to this account."
                  : "Update your account password or reset your login credentials."}
              </p>
            </div>
          </div>

          {isAdmin ? (
            /* Admin Protection Notice */
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-purple-950 text-xs font-semibold space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <span>🛡️</span>
                <span>Admin Password Protection</span>
              </div>
              <p className="text-[11px] text-purple-900">
                Self-service password modification is disabled for Administrator accounts to protect website infrastructure. Admin credentials are managed at server level.
              </p>
            </div>
          ) : (
            /* Non-Admin (Customer & Professional) Password Reset Form */
            <form onSubmit={handlePasswordChange} className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3.5">
              {passwordError && (
                <p className="text-xs text-red-900 bg-red-50 border border-red-300 p-3 rounded-xl font-bold">
                  ⚠️ {passwordError}
                </p>
              )}

              {passwordSuccess && (
                <p className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-300 p-3 rounded-xl font-bold">
                  ✅ {passwordSuccess}
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                  Current Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                    New Password (Min 6 chars) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                    Confirm New Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-blue-700 hover:underline"
                >
                  Forgot your current password? Reset with email OTP →
                </Link>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Service Location Section (Except Admin) */}
        {!isAdmin && (
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900">Service Location</h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Saved for matching nearby professionals and calculating distance.
              </p>
            </div>

            <button
              type="button"
              onClick={saveCurrentLocation}
              disabled={savingLocation}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <span>📍</span>
              <span>
                {savingLocation
                  ? "Detecting location..."
                  : account.latitude == null
                  ? "Use my GPS location"
                  : "Update GPS location"}
              </span>
            </button>

            <MapPreview
              latitude={account.latitude}
              longitude={account.longitude}
              title="your location"
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
}
