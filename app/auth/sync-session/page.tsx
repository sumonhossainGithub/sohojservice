"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

function SyncSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const code = searchParams.get("code");
  const requestedRole = searchParams.get("role");
  const callbackUrl = searchParams.get("callbackUrl");
  const [error, setError] = useState("");

  useEffect(() => {
    let unmounted = false;

    async function handleSessionSync(accessToken: string) {
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
          if (!unmounted) setError(data.error || "Failed to create application session.");
          return;
        }

        const syncData = await res.json();
        await refresh();

        if (unmounted) return;

        // If new professional without a profile, take them to onboarding
        if (
          syncData.isNewPro ||
          (syncData.user?.role === "PROFESSIONAL" && requestedRole === "PROFESSIONAL")
        ) {
          router.push("/dashboard/professional?welcome=true");
          router.refresh();
          return;
        }

        // If a specific callback was requested
        if (callbackUrl && !callbackUrl.includes("/login") && !callbackUrl.includes("/register")) {
          router.push(callbackUrl);
          router.refresh();
          return;
        }

        // Default: Redirect to Home Page ('/') with logged-in environment!
        router.push("/");
        router.refresh();
      } catch (err: unknown) {
        if (!unmounted) {
          setError(err instanceof Error ? err.message : "Failed to sync authentication session.");
        }
      }
    }

    async function initialize() {
      try {
        const supabase = createClient();

        // 1. If an authorization code was forwarded, exchange it on client
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && data?.session?.access_token) {
            await handleSessionSync(data.session.access_token);
            return;
          }
        }

        // 2. Check if session is already stored in client storage
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          await handleSessionSync(session.access_token);
          return;
        }

        // 3. Listen for OAuth token parsing in browser
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (newSession?.access_token) {
            await handleSessionSync(newSession.access_token);
          }
        });

        // Set a 6-second timeout fallback if no session is received
        const timeout = setTimeout(() => {
          if (!unmounted && !error) {
            router.push("/");
          }
        }, 6000);

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
  }, [router, refresh, code, requestedRole, callbackUrl, error]);

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="text-3xl">⚠️</div>
        <h2 className="font-display text-xl font-bold text-slate-900">
          Authentication Notice
        </h2>
        <p className="text-xs text-red-600 font-bold bg-red-50 p-3 rounded-xl border border-red-200">
          {error}
        </p>
        <a href="/login" className="inline-block text-xs font-bold text-blue-600 underline">
          Return to Login
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
      <div className="inline-block animate-spin text-3xl">🔄</div>
      <h2 className="font-display text-xl font-bold text-slate-900">
        Signing you in with Google...
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
