"use client";

// Keuangan: hutang & piutang. Filter per jenis + status, cari party, ringkasan
// saldo, ekspor Excel, dan catat transaksi baru. Semua data dari SQLite lokal.
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { localApi as api, ApiError } from "@/lib/localApi";
import { useSession } from "@/lib/session";
import { formatDateTime, formatRupiah } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Loading from "@/components/ui/Loading";

type StatusFilter = "semua" | "belum_lunas" | "lunas" | "jatuh_tempo";
type Tab = "hutang" | "piutang";

export default function KeuanganPage() {
  const router = useRouter();
  const { token } = useSession();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<{ hutang: number; piutang: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("hutang");
  const [status, setStatus] = useState<StatusFilter>("semua");
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [list, sum] = await Promise.all([
        api.listTransactions(),
        api.getTransactionSummary(),
      ]);
      setTransactions(list);
      setSummary(sum);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat transaksi.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
  }, [load]);

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = (t: Transaction) =>
    !!t.due_date && t.status === "belum_lunas" && t.due_date <= today;

  const matchesStatus = (t: Transaction) =>
    status === "semua" ||
    (status === "jatuh_tempo" ? isOverdue(t) : t.status === status);

  const shown = transactions
    .filter((t) => t.type === tab)
    .filter((t) => matchesStatus(t))
    .filter((t) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        t.party_name.toLowerCase().includes(q) ||
        (t.party_contact ?? "").toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q)
      );
    });

  const shownTotal = shown.reduce((sum, t) => sum + t.total_amount, 0);

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      await api.exportTransactionsExcel();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal ekspor transaksi.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Keuangan</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {shown.length} transaksi · {formatRupiah(shownTotal)}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => router.push("/keuangan/tambah")}>
          Catat Hutang/Piutang
        </Button>
        <Button variant="secondary" onClick={() => void handleExport()} disabled={exporting}>
          {exporting ? "Mengunduh..." : "Ekspor Excel"}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      {summary ? (
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-xs text-slate-500">Sisa hutang</p>
            <p className="mt-1 text-lg font-bold text-danger">{formatRupiah(summary.hutang)}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500">Sisa piutang</p>
            <p className="mt-1 text-lg font-bold text-success">{formatRupiah(summary.piutang)}</p>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setTab("hutang")}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
            tab === "hutang"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border-soft bg-surface text-slate-500"
          }`}
        >
          Hutang
        </button>
        <button
          type="button"
          onClick={() => setTab("piutang")}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
            tab === "piutang"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border-soft bg-surface text-slate-500"
          }`}
        >
          Piutang
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatus("semua")}
          className="rounded-xl border border-border-soft bg-surface px-3 py-2 text-xs font-semibold"
        >
          Semua
        </button>
        <button
          type="button"
          onClick={() => setStatus("belum_lunas")}
          className="rounded-xl border border-border-soft bg-surface px-3 py-2 text-xs font-semibold"
        >
          Belum Lunas
        </button>
        <button
          type="button"
          onClick={() => setStatus("lunas")}
          className="rounded-xl border border-border-soft bg-surface px-3 py-2 text-xs font-semibold"
        >
          Lunas
        </button>
        <button
          type="button"
          onClick={() => setStatus("jatuh_tempo")}
          className="rounded-xl border border-border-soft bg-surface px-3 py-2 text-xs font-semibold"
        >
          Jatuh Tempo
        </button>
      </div>

      <label className="block">
        <span className="sr-only">Cari transaksi</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, kontak, atau keterangan..."
          className="h-12 w-full rounded-xl border border-border-soft bg-surface px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </label>

      {loading ? (
        <Loading label="Memuat transaksi..." />
      ) : shown.length === 0 ? (
        <Card>
          <EmptyState
            title={status === "jatuh_tempo" ? "Tidak ada transaksi jatuh tempo" : "Belum ada transaksi"}
            hint="Gunakan tombol Catat Hutang/Piutang untuk mencatat transaksi baru."
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {shown.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => router.push(`/keuangan/detail?id=${t.id}`)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-surface p-4 text-left shadow-sm ring-1 ring-border-soft active:bg-slate-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {t.party_name}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    {isOverdue(t) ? "Jatuh tempo · " : ""}
                    {formatDateTime(t.created_at)}
                  </span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <Badge tone={t.type === "hutang" ? "danger" : "success"}>
                    {t.type === "hutang" ? "Hutang" : "Piutang"}
                  </Badge>
                  <span className="font-mono text-sm font-semibold">
                    {formatRupiah(t.total_amount)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
