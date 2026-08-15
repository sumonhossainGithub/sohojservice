"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

type Professional = {
  id: string;
  name: string;
  category: { nameEn: string };
  area: string;
  city: string;
  isVerified: boolean;
};

export default function AdminDashboard() {
  const { user, status } = useAuth();
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/admin");
    } else if (status === "authenticated" && user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, user, router]);

  useEffect(() => {
    fetch("/api/professionals")
      .then((r) => r.json())
      .then(setProfessionals)
      .finally(() => setLoading(false));
  }, []);

  async function toggleVerify(id: string, isVerified: boolean) {
    await fetch(`/api/admin/professionals/${id}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !isVerified }),
    });
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isVerified: !isVerified } : p))
    );
  }

  if (status !== "authenticated" || loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16">Loading…</div>;
  }

  const pendingCount = professionals.filter((p) => !p.isVerified).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-2xl font-extrabold mb-2">Admin — professionals</h1>
      <p className="text-sm text-[var(--color-ink)]/70 mb-6">
        {professionals.length} listed · {pendingCount} awaiting verification
      </p>

      <div className="space-y-3">
        {professionals.map((p) => (
          <div
            key={p.id}
            className="signplate bg-white p-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-display font-bold">{p.name}</p>
              <p className="text-sm text-[var(--color-ink)]/70">
                {p.category.nameEn} · {p.area}, {p.city}
              </p>
            </div>
            <button
              onClick={() => toggleVerify(p.id, p.isVerified)}
              className={`signplate px-4 py-1.5 text-sm font-semibold whitespace-nowrap ${
                p.isVerified ? "bg-white" : "bg-[var(--color-success)] text-white"
              }`}
            >
              {p.isVerified ? "Unverify" : "Verify"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
