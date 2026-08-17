"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

function SyncSessionContent() {
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const code = searchParams.get("code");
  const requestedRole = searchParams.get("role");
  const callbackUrl = searchParams.get("callbackUrl");
  const [error, setError] = useState("");
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let unmounted = false;
    let syncInitiated = false;

    async function handleSessionSync(accessToken: string) {
      if (syncInitiated) return;
      syncInitiated = true;

      try {
        const res = await fetch("/api/auth/sync", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const data = await res.json();
          if (!unmounted) {
            setError(data.error || "Failed to create application session.");
          }
          return;
        }

        const syncData = await res.json();
        await refresh();

        if (unmounted) return;
        setSynced(true);

        // If new professional without a profile, take them to onboarding
        if (
          syncData.isNewPro ||
          (syncData.user?.role === "PROFESSIONAL" && requestedRole === "PROFESSIONAL")
        ) {
          window.location.href = "/dashboard/professional?welcome=true";
          return;
        }

        // If a specific callback was requested
        if (callbackUrl && !callbackUrl.includes("/login") && !callbackUrl.includes("/register")) {
          window.location.href = callbackUrl;
          return;
        }

        // Default: Full document navigation to Home Page ('/') with complete session cookies!
        window.location.href = "/";
      } catch (err: unknown) {
        if (!unmounted) {
          setError(err instanceof Error ? err.message : "Failed to sync authentication session.");
        }
      }
    }

    async function initialize() {
      try {
        const supabase = createClient();

        // 1. Check URL hash parameters (e.g. #access_token=...&refresh_token=...)
        if (typeof window !== "undefined" && window.location.hash) {
          const hashClean = window.location.hash.startsWith("#")
            ? window.location.hash.substring(1)
            : window.location.hash;
          const hashParams = new URLSearchParams(hashClean);
          const hashAccessToken = hashParams.get("access_token");
          const hashRefreshToken = hashParams.get("refresh_token");

          if (hashAccessToken) {
            try {
              await supabase.auth.setSession({
                access_token: hashAccessToken,
                refresh_token: hashRefreshToken || "",
              });
            } catch {
              // ignore
            }
            await handleSessionSync(hashAccessToken);
            return;
          }
        }

        // 2. If an authorization code was forwarded, exchange it on client
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && data?.session?.access_token) {
            await handleSessionSync(data.session.access_token);
            return;
          }
        }

        // 3. Check if session is already stored in client storage
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          await handleSessionSync(session.access_token);
          return;
        }

        // 4. Listen for OAuth token parsing in browser
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (newSession?.access_token) {
            await handleSessionSync(newSession.access_token);
          }
        });

        // 5. Fallback safety timer only if no error occurred
        const timeout = setTimeout(() => {
          if (!unmounted && !syncInitiated && !error) {
            setError("Authentication took too long to complete. Please try signing in again.");
          }
        }, 10000);

        return () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      } catch (err: unknown) {
        if (!unmounted) {
          setError(err instanceof Error ? err.message : "Session initialization failed.");
        }
      }
    }

    initialize();

    return () => {
      unmounted = true;
    };
  }, [code, refresh, requestedRole, callbackUrl, error]);

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 motion-enter">
        <div className="text-3xl">⚠️</div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Sign In Notice
        </h2>
        <p className="text-xs text-red-600 font-bold bg-red-50 p-3 rounded-xl border border-red-200">
          {error}
        </p>
        <div className="pt-2">
          <a
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Try Again →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4 motion-enter">
      <div className="inline-block animate-spin text-3xl">🔄</div>
      <h2 className="font-display text-xl font-bold text-slate-900">
        {synced ? "Redirecting..." : "Signing you in with Google..."}
      </h2>
      <p className="text-xs text-slate-500">
        Setting up your account and redirecting to SohojService...
      </p>
    </div>
  );
}

export default function SyncSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-20 text-center text-sm">
          Loading session...
        </div>
      }
    >
      <SyncSessionContent />
    </Suspense>
  );
}
