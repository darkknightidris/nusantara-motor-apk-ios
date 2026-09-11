"use client";

// Detail transaksi hutang/piutang: rincian, pelunasan (form pembayaran),
// riwayat pembayaran, dan lampiran. Semua data dari SQLite lokal.
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { localApi as api, ApiError } from "@/lib/localApi";
import { useSession } from "@/lib/session";
import { formatDateTime, formatRupiah } from "@/lib/format";
import type { Payment, Transaction } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import { Field, TextAreaField } from "@/components/ui/Field";

interface TransactionDetail extends Transaction {
  payments: Payment[];
}

function DetailKeuanganPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const { token, user } = useSession();

  const [data, setData] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [payAmount, setPayAmount] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setData(await api.getTransactionDetail(id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat transaksi.");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
  }, [load]);

  const sisa = data ? Math.max(0, data.total_amount - data.paid_amount) : 0;

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(payAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Jumlah pembayaran harus lebih dari 0.");
      return;
    }
    if (amount > sisa + 1e-9) {
      setError(`Pembayaran melebihi sisa tagihan (${formatRupiah(sisa)}).`);
      return;
    }
    setPaying(true);
    setError(null);
    try {
      await api.payTransaction({
        transaction_id: id,
        amount,
        notes: payNotes.trim() || null,
      });
      setPayAmount("");
      setPayNotes("");
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mencatat pelunasan.");
    } finally {
      setPaying(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Yakin hapus transaksi ini? Tindakan tidak dapat dibatalkan.")) return;
    try {
      await api.deleteTransaction(id);
      router.push("/keuangan");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus transaksi.");
    }
  }

  if (loading) return <Loading label="Memuat transaksi..." />;
  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Detail Transaksi</h1>
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {error ?? "Transaksi tidak ditemukan."}
        </p>
      </div>
    );
  }

  const isOwner = user?.role === "owner";
  const payments = data.payments ?? [];

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <Link
          href="/keuangan"
          aria-label="Kembali ke keuangan"
          className="grid h-10 w-10 place-items-center rounded-xl border border-border-soft bg-surface text-lg active:bg-slate-100"
        >
          ←
        </Link>
        <h1 className="text-lg font-bold">Detail Transaksi</h1>
      </header>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Badge tone={data.type === "hutang" ? "danger" : "success"}>
            {data.type === "hutang" ? "Hutang" : "Piutang"}
          </Badge>
          <p className="mt-2 text-sm font-semibold">{data.party_name}</p>
          <p className="text-xs text-slate-400">
            {data.party_contact || "-"} · {formatDateTime(data.created_at)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total</p>
          <p className="text-lg font-bold">{formatRupiah(data.total_amount)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-600">Sisa tagihan</span>
        <span className="text-xl font-bold text-success">{formatRupiah(sisa)}</span>
      </div>

      {(data.notes ? (
        <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">{data.notes}</p>
      ) : null)}

      {sisa > 0 && isOwner ? (
        <form onSubmit={handlePay} className="space-y-3 rounded-xl bg-slate-50 p-3">
          <Field
            label="Jumlah Pelunasan (Rp)"
            type="number"
            inputMode="numeric"
            min={0}
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder="0"
          />
          <TextAreaField
            label="Catatan (opsional)"
            rows={2}
            value={payNotes}
            onChange={(e) => setPayNotes(e.target.value)}
            placeholder="Contoh: Cicilan tahap 1"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={paying || !payAmount}>
              {paying ? "Menyimpan..." : "Pelunasi"}
            </Button>
          </div>
        </form>
      ) : null}

      <div className="flex gap-3">
        {isOwner ? (
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => void handleDelete()}
          >
            Hapus
          </Button>
        ) : null}
      </div>

      <div>
        <h2 className="text-sm font-semibold">Riwayat Pembayaran</h2>
        {payments.length === 0 ? (
          <EmptyState
            title="Belum ada pembayaran"
            hint="Pelunasi akan tercatat di sini."
          />
        ) : (
          <ul className="space-y-2">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-surface p-3 text-sm shadow-sm ring-1 ring-border-soft">
                <span className="min-w-0 truncate">{p.notes || "Pembayaran"}</span>
                <span className="shrink-0 font-mono font-semibold">{formatRupiah(p.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// output: export tidak mendukung route dinamis [id]; id kini lewat query string.
export default function Page() {
  return (
    <Suspense fallback={<Loading label="Memuat..." />}>
      <DetailKeuanganPage />
    </Suspense>
  );
}
