"use client";

// Dashboard: hub semua fitur — sapaan + grid aksi cepat ke semua modul
// (Jual, Katalog, Keuangan, Panduan, dsb.) + ringkasan operasional hari ini
// (penjualan, hutang/piutang, stok menipis). Pola visual BYON: tile icon
// warna + header section. Semua data dari SQLite lokal (localApi).
import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { localApi as api, ApiError } from "@/lib/localApi";
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

// Ikon SVG sederhana (24×24, stroke=2, tanpa icon library).
function IconJual() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
      <path d="M9 11l2 2 4-4" />
    </svg>
  );
}
function IconKatalog() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="7" height="7" rx="1.5" />
      <rect x="14" y="4" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconKeuangan() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconPanduan() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}
function IconTambah() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6v12M6 12h12" />
    </svg>
  );
}
function IconHutang() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 4v12M5 9l3-3 3 3M16 20V8M13 15l-3-3 3-3z" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="3" />
      <path d="M4 16v-2a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2" />
      <circle cx="17" cy="7" r="3" />
      <path d="M14 16v-2a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2" />
    </svg>
  );
}
function IconBackup() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="8" ry="2.5" />
      <path d="M4 5v14a8 2.5 0 0 0 16 0V5" />
      <path d="M4 12a8 2.5 0 0 0 16 0" />
    </svg>
  );
}

interface Tile {
  label: string;
  href: string;
  icon: ReactNode;
  iconClass: string;
  ownerOnly?: boolean;
}

const TILES: Tile[] = [
  { label: "Jual", href: "/penjualan", icon: <IconJual />, iconClass: "bg-sky-100 text-sky-700" },
  { label: "Katalog", href: "/katalog", icon: <IconKatalog />, iconClass: "bg-teal-100 text-teal-700" },
  { label: "Keuangan", href: "/keuangan", icon: <IconKeuangan />, iconClass: "bg-amber-100 text-amber-700" },
  { label: "Panduan", href: "/panduan", icon: <IconPanduan />, iconClass: "bg-pink-100 text-pink-700" },
  { label: "Tambah", href: "/katalog/tambah", icon: <IconTambah />, iconClass: "bg-emerald-100 text-emerald-700", ownerOnly: true },
  { label: "Hutang", href: "/keuangan/tambah", icon: <IconHutang />, iconClass: "bg-violet-100 text-violet-700" },
  { label: "Users", href: "/users", icon: <IconUsers />, iconClass: "bg-rose-100 text-rose-700", ownerOnly: true },
  { label: "Backup", href: "/profil", icon: <IconBackup />, iconClass: "bg-indigo-100 text-indigo-700" },
];

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
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{user.username}</h1>
          <Badge tone={user.role === "owner" ? "info" : "success"} className="capitalize">
            {user.role}
          </Badge>
        </div>
      </header>

      {loading ? (
        <Loading label="Memuat ringkasan..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        data && (
          <>
            {/* Grid aksi cepat ke semua modul. */}
            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Aksi Cepat</p>
              <div className="grid grid-cols-4 gap-3">
                {TILES.filter((t) => !t.ownerOnly || user.role === "owner").map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="group flex flex-col items-center gap-2 rounded-2xl bg-surface p-3 text-center shadow-sm ring-1 ring-border-soft active:bg-slate-50"
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${t.iconClass}`}>
                      {t.icon}
                    </span>
                    <span className="text-xs font-medium text-slate-600">{t.label}</span>
                  </Link>
                ))}
              </div>
            </section>

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
        )
      )}
    </div>
  );
}
