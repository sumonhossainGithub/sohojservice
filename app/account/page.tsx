"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);

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
      setMessage("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Please choose an image smaller than 2 MB.");
      return;
    }

    setSaving(true);
    setMessage("");
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
    if (!res.ok) return setMessage(data.error ?? "Could not upload photo.");
    setAccount((current) => (current ? { ...current, photoUrl: data.photoUrl } : current));
    setMessage("Profile photo updated successfully.");
  }

  function saveCurrentLocation() {
    if (!navigator.geolocation) return setMessage("Location is not available in this browser.");
    setSavingLocation(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const res = await fetch("/api/account/location", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
        });
        const data = await res.json();
        setSavingLocation(false);
        if (!res.ok) return setMessage(data.error ?? "Could not save location.");
        setAccount((current) =>
          current ? { ...current, latitude: data.latitude, longitude: data.longitude } : current
        );
        setMessage("Location saved. We use it to show nearby services.");
      },
      () => {
        setSavingLocation(false);
        setMessage("Location permission was not granted.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  if (!account) return <div className="max-w-xl mx-auto px-4 py-16 text-center text-sm">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 motion-enter">
      <div className="signplate bg-white p-8 shadow-xl border border-slate-200 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-[var(--color-ink)] mb-1">
            My Account
          </h1>
          <p className="text-xs text-slate-500">
            Manage your personal profile and service location preferences
          </p>
        </div>

        {/* Profile Avatar Card */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <ProfilePhoto name={account.name} photoUrl={account.photoUrl} size="lg" />
          <div className="text-center sm:text-left space-y-2">
            <h2 className="font-display font-bold text-lg text-slate-900">{account.name}</h2>
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 px-3 py-0.5 rounded-full">
              {account.role}
            </span>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={saving}
                className="bg-[var(--color-marigold)] hover:bg-[var(--color-marigold-light)] text-[var(--color-ink)] text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs active:scale-95 disabled:opacity-60 cursor-pointer"
              >
                {saving ? "Uploading..." : "Change photo"}
              </button>
              <p className="text-[11px] text-slate-400 mt-1">JPG, PNG, or WebP up to 2 MB</p>
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

        {message && (
          <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-medium">
            ✅ {message}
          </p>
        )}

        {/* Details Grid */}
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Email
            </span>
            <span className="font-semibold text-slate-800 break-all">{account.email}</span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Phone
            </span>
            <span className="font-semibold text-slate-800">
              {account.phone || "Not provided"}
            </span>
          </div>
        </div>

        {/* Location Section */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900">Service Location</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Saved for matching nearby professionals and calculating distance.
            </p>
          </div>

          <button
            type="button"
            onClick={saveCurrentLocation}
            disabled={savingLocation}
            className="inline-flex items-center gap-1.5 bg-[var(--color-teal)] hover:bg-[var(--color-teal-dark)] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
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
      </div>
    </div>
  );
}
