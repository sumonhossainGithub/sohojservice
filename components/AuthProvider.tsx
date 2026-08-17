"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "PROFESSIONAL" | "ADMIN";
} | null;

type AuthContextValue = {
  user: AuthUser;
  status: "loading" | "authenticated" | "unauthenticated";
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  const syncWithBackend = useCallback(async (accessToken?: string) => {
    try {
      const headers: Record<string, string> = {};
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers,
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setStatus("authenticated");
          return data.user;
        }
      }
    } catch {
      // ignore sync errors
    }
    return null;
  }, []);

  const refresh = useCallback(async () => {
    try {
      // 1. Fetch current server session cookie
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setStatus("authenticated");
          return;
        }
      }

      // 2. If cookie session not present, check if Supabase browser client has an active session
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.access_token) {
        const syncedUser = await syncWithBackend(session.access_token);
        if (syncedUser) return;
      }

      setUser(null);
      setStatus("unauthenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, [syncWithBackend]);

  useEffect(() => {
    // 1. Initial auth check
    refresh();

    // 2. Real-time Supabase auth state listener (OAuth callbacks, token refreshes, logins)
    try {
      const supabase = createClient();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (
          event === "SIGNED_IN" ||
          event === "INITIAL_SESSION" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          if (session?.access_token) {
            await syncWithBackend(session.access_token);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setStatus("unauthenticated");
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } catch {
      // Supabase client error guard
    }
  }, [refresh, syncWithBackend]);

  async function logout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setStatus("unauthenticated");
  }

  return (
    <AuthContext.Provider value={{ user, status, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
