"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState("");
  const [statusText, setStatusText] = useState("Authenticating with Google...");

  useEffect(() => {
    let unmounted = false;
    let syncInitiated = false;

    async function handleSync(accessToken: string) {
      if (syncInitiated) return;
      syncInitiated = true;
      setStatusText("Setting up your account...");

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
        setStatusText("Redirecting to SohojService...");

        const requestedRole = searchParams.get("role");
        const callbackUrl = searchParams.get("callbackUrl");

        if (
          syncData.isNewPro ||
          (syncData.user?.role === "PROFESSIONAL" && requestedRole === "PROFESSIONAL")
        ) {
          window.location.href = "/dashboard/professional?welcome=true";
          return;
        }

        if (callbackUrl && !callbackUrl.includes("/login") && !callbackUrl.includes("/register")) {
          window.location.href = callbackUrl;
          return;
        }

        window.location.href = "/";
      } catch (err: unknown) {
        if (!unmounted) {
          setError(err instanceof Error ? err.message : "Failed to sync authentication session.");
        }
      }
    }

    async function processAuth() {
      try {
        const supabase = createClient();

        // 1. Check for error in query or hash
        const urlError = searchParams.get("error_description") || searchParams.get("error");
        if (urlError) {
          if (!unmounted) setError(urlError);
          return;
        }

        // 2. Check URL hash (Implicit Grant #access_token=...&refresh_token=...)
        if (typeof window !== "undefined" && window.location.hash) {
          const hashClean = window.location.hash.startsWith("#")
            ? window.location.hash.substring(1)
            : window.location.hash;
          const hashParams = new URLSearchParams(hashClean);
          const hashError = hashParams.get("error_description") || hashParams.get("error");
          if (hashError) {
            if (!unmounted) setError(hashError);
            return;
          }

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
            await handleSync(hashAccessToken);
            return;
          }
        }

        // 3. Check for PKCE authorization code in search params (?code=...)
        const code = searchParams.get("code");
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && data?.session?.access_token) {
            await handleSync(data.session.access_token);
            return;
          } else if (exchangeError) {
            console.error("Code exchange failed:", exchangeError);
            if (!unmounted) {
              setError(`OAuth Code Exchange Error: ${exchangeError.message}`);
            }
            return;
          }
        }

        // 4. Check if session is already stored locally
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.access_token) {
          await handleSync(session.access_token);
          return;
        }

        // 5. Listen for onAuthStateChange
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (newSession?.access_token) {
            await handleSync(newSession.access_token);
          }
        });

        // 6. Timeout guard after 10s if nothing caught
        const timer = setTimeout(() => {
          if (!unmounted && !syncInitiated && !error) {
            setError(
              "Google sign-in did not return authentication credentials. Please verify your Supabase Redirect URLs."
            );
          }
        }, 10000);

        return () => {
          clearTimeout(timer);
          subscription.unsubscribe();
        };
      } catch (err: unknown) {
        if (!unmounted) {
          setError(err instanceof Error ? err.message : "Authentication processing error.");
        }
      }
    }

    processAuth();

    return () => {
      unmounted = true;
    };
  }, [searchParams, refresh, router, error]);

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 motion-enter">
        <div className="text-3xl">⚠️</div>
        <h1 className="font-display text-xl font-bold text-slate-900">Sign In Issue</h1>
        <p className="text-xs text-red-600 font-bold bg-red-50 p-3 rounded-xl border border-red-200">
          {error}
        </p>
        <div className="pt-2">
          <a
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Back to Login →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4 motion-enter">
      <div className="inline-block animate-spin text-3xl">🔄</div>
      <h1 className="font-display text-xl font-bold text-slate-900">{statusText}</h1>
      <p className="text-xs text-slate-500">Please wait while we log you into SohojService...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-20 text-center text-sm">
          Processing authentication...
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
