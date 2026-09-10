"use client";

// Dashboard: ringkasan operasional hari ini (penjualan, hutang/piutang, stok
// menipis). Semua data diambil dari backend nyata; loading/error/empty state
// ditampilkan secara eksplisit.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/lib/session";
import { formatRupiah, isToday } from "@/lib/format";
import type { Product, Sale } from "@/lib/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";

interface DashboardData {
  sales: Sale[];
  summary: { hutang: number; piutang: number };
  lowStock: Product[];
}

export default function DashboardPage() {
  const { token, user } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [sales, summary, lowStock] = await Promise.all([
        api.listSales(),
        api.getTransactionSummary(),
        api.getLowStock(),
      ]);
      setData({ sales, summary, lowStock });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Ambil data saat mount (pola fetch-on-mount standar).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
  }, [load]);

  if (!token || !user) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <h1 className="text-lg font-semibold">Nusantara Motor</h1>
        <p className="max-w-xs text-sm text-slate-500">
          Masuk untuk melihat ringkasan penjualan, hutang/piutang, dan stok.
        </p>
        <Link
          href="/login"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white active:bg-blue-800"
        >
          Masuk
        </Link>
      </div>
    );
  }

  const todaySales = data ? data.sales.filter((s) => isToday(s.created_at)) : [];
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total_amount, 0);

  return (
    <div className="space-y-4">
      <header>
        <p className="text-sm text-slate-500">Halo,</p>
        <h1 className="text-xl font-bold">{user.username}</h1>
      </header>

      {loading ? (
        <Loading label="Memuat ringkasan..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-xs text-slate-500">Penjualan hari ini</p>
              <p className="mt-1 text-lg font-bold">{formatRupiah(todayTotal)}</p>
              <p className="text-xs text-slate-400">{todaySales.length} transaksi</p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500">Saldo hutang/piutang</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge tone="danger">{formatRupiah(data.summary.hutang)}</Badge>
                <span className="text-xs text-slate-400">/</span>
                <Badge tone="success">{formatRupiah(data.summary.piutang)}</Badge>
              </div>
            </Card>
          </div>

          <Card title="Stok menipis">
            {data.lowStock.length === 0 ? (
              <EmptyState title="Semua stok aman" hint="Tidak ada produk di bawah stok minimum." />
            ) : (
              <ul className="divide-y divide-border-soft">
                {data.lowStock.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="truncate pr-3">{p.name}</span>
                    <Badge tone="warning">sisa {p.stock}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Penjualan hari ini">
            {todaySales.length === 0 ? (
              <EmptyState title="Belum ada penjualan" hint="Transaksi baru akan muncul di sini." />
            ) : (
              <ul className="divide-y divide-border-soft">
                {todaySales.slice(0, 5).map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="truncate pr-3">{s.customer_name || "Umum"}</span>
                    <span className="font-semibold">{formatRupiah(s.total_amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
