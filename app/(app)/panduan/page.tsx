"use client";

// Panduan: kegunaan produk per kendaraan. Daftar semua guide (per produk) dan
// link ke detail produk. Semua data dari SQLite lokal.
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { localApi as api, ApiError } from "@/lib/localApi";
import { useSession } from "@/lib/session";
import type { ProductGuide } from "@/lib/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";

export default function PanduanPage() {
  const router = useRouter();
  const { token } = useSession();

  const [guides, setGuides] = useState<(ProductGuide & { product_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setGuides(await api.listGuides());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat panduan.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold">Panduan</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {guides.length} kegunaan produk terdaftar
        </p>
      </header>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      {loading ? (
        <Loading label="Memuat panduan..." />
      ) : guides.length === 0 ? (
        <Card>
          <EmptyState
            title="Belum ada panduan"
            hint="Panduan kegunaan kendaraan akan muncul di sini."
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {guides.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                onClick={() => router.push(`/katalog/produk?id=${g.product_id}`)}
                className="w-full rounded-2xl bg-surface p-4 text-left shadow-sm ring-1 ring-border-soft active:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {g.product_name}
                    </span>
                    <span className="mt-1 block text-sm text-slate-600">
                      {g.vehicle_brand} · {g.vehicle_model}
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {[g.vehicle_year, g.vehicle_cc].filter(Boolean).join(" · ") || "-"}
                    </span>
                  </span>
                  <Badge tone="info" className="shrink-0">
                    {g.notes || "Klik untuk lihat produk"}
                  </Badge>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
