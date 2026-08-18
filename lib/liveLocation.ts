"use client";

import { BDLocation } from "@/lib/locations";

export type LiveLocationState = {
  latitude: number;
  longitude: number;
  nameEn: string;
  nameBn: string;
  district: string;
  division?: string;
  distanceKm?: number;
  detectedAt: number;
};

const STORAGE_KEY = "sohojservice_live_location";
const EVENT_NAME = "sohojservice:location_updated";

/**
 * Retrieves the cached live location from localStorage if available and fresh (< 24 hours).
 */
export function getStoredLiveLocation(): LiveLocationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: LiveLocationState = JSON.parse(raw);
    // Keep cached location valid for 24 hours
    if (Date.now() - parsed.detectedAt < 24 * 60 * 60 * 1000) {
      return parsed;
    }
  } catch {
    // Ignore storage parse errors
  }
  return null;
}

/**
 * Stores the detected live location to localStorage and notifies all components across the app.
 */
export function setStoredLiveLocation(location: LiveLocationState): void {
  if (typeof window === "undefined") return null as unknown as void;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: location }));
  } catch {
    // Ignore storage write errors
  }
}

/**
 * Robust live GPS detection with automatic fallback from High Accuracy to Standard Accuracy.
 */
export async function detectLiveGpsLocation(): Promise<{
  success: boolean;
  location?: LiveLocationState;
  error?: string;
}> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return { success: false, error: "Geolocation is not supported in this browser." };
  }

  return new Promise((resolve) => {
    let resolved = false;

    // Helper to resolve coordinates with reverse geocoding API
    const resolveCoords = async (coords: GeolocationCoordinates) => {
      if (resolved) return;
      resolved = true;

      try {
        const res = await fetch(`/api/locations/upazilas?lat=${coords.latitude}&lng=${coords.longitude}`);
        const data = await res.json();

        if (data.nearest) {
          const nearest: BDLocation = data.nearest;
          const liveLoc: LiveLocationState = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            nameEn: nearest.nameEn,
            nameBn: nearest.nameBn,
            district: nearest.district,
            division: nearest.division,
            distanceKm: data.distanceKm,
            detectedAt: Date.now(),
          };

          setStoredLiveLocation(liveLoc);

          // If user is authenticated, sync coordinates in background
          fetch("/api/account/location", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
          }).catch(() => undefined);

          resolve({ success: true, location: liveLoc });
          return;
        }

        // Fallback default if no match
        const fallbackLoc: LiveLocationState = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          nameEn: "Sirajganj Sadar",
          nameBn: "সিরাজগঞ্জ সদর",
          district: "Sirajganj",
          division: "Rajshahi",
          detectedAt: Date.now(),
        };
        setStoredLiveLocation(fallbackLoc);
        resolve({ success: true, location: fallbackLoc });
      } catch (err) {
        resolve({ success: false, error: "Failed to resolve nearest address." });
      }
    };

    // Primary High Accuracy Attempt
    navigator.geolocation.getCurrentPosition(
      (pos) => resolveCoords(pos.coords),
      (err) => {
        // If high accuracy timed out or failed, try low accuracy fallback
        console.warn("High accuracy GPS failed, falling back to standard accuracy...", err);
        navigator.geolocation.getCurrentPosition(
          (pos) => resolveCoords(pos.coords),
          (fallbackErr) => {
            if (resolved) return;
            resolved = true;
            let msg = "Could not get location. Please allow location permissions in your browser.";
            if (fallbackErr.code === fallbackErr.PERMISSION_DENIED) {
              msg = "Location permission was denied. Please allow location access in your browser settings.";
            } else if (fallbackErr.code === fallbackErr.TIMEOUT) {
              msg = "Location request timed out. Please check your GPS signal.";
            }
            resolve({ success: false, error: msg });
          },
          { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}
