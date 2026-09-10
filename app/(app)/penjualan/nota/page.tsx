"use client";

// Nota penjualan: rincian item, total, dan tombol cetak (window.print).
// Saat dicetak, hanya area nota yang tampil (lihat aturan @media print di globals.css).
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/lib/session";
import { formatDateTime, formatRupiah } from "@/lib/format";
import type { Sale } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";

function DetailPenjualanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const { user } = useSession();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setSale(await api.getSale(id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat transaksi.");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
  }, [load]);

  async function handleDelete() {
    if (!window.confirm("Yakin hapus transaksi ini? Tindakan tidak dapat dibatalkan.")) return;
    setDeleting(true);
    setError(null);
    try {
      await api.deleteSale(id);
      router.push("/penjualan");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus transaksi.");
      setDeleting(false);
    }
  }

  if (loading) return <Loading label="Memuat nota..." />;

  if (!sale) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Nota Penjualan</h1>
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {error ?? "Transaksi tidak ditemukan."}
        </p>
      </div>
    );
  }

  const items = sale.items ?? [];

  return (
    <div className="space-y-4">
      {/* Header aksi — disembunyikan saat mencetak. */}
      <header className="flex items-center gap-3 print:hidden">
        <Link
          href="/penjualan"
          aria-label="Kembali ke penjualan"
          className="grid h-10 w-10 place-items-center rounded-xl border border-border-soft bg-surface text-lg active:bg-slate-100"
        >
          ←
        </Link>
        <h1 className="flex-1 text-lg font-bold">Nota Penjualan</h1>
      </header>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger print:hidden">
          {error}
        </p>
      ) : null}

      {/* Area nota — satu-satunya yang tercetak. */}
      <div className="overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border-soft print:rounded-none print:shadow-none print:ring-0">
        <div className="bg-slate-900 p-5 text-white print:bg-white print:text-black">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Nusantara Motor</h2>
              <p className="text-xs text-slate-400 print:text-slate-500">Nota Penjualan</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-bold">{sale.id.slice(-8).toUpperCase()}</p>
              <p className="mt-1 text-xs text-slate-400 print:text-slate-500">
                {formatDateTime(sale.created_at)}
              </p>
            </div>
          </div>
          {(sale.customer_name || sale.customer_contact) ? (
            <div className="mt-3 border-t border-white/20 pt-3 print:border-slate-200">
              {sale.customer_name ? (
                <p className="text-sm font-semibold">{sale.customer_name}</p>
              ) : null}
              {sale.customer_contact ? (
                <p className="text-xs text-slate-400 print:text-slate-500">{sale.customer_contact}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="p-5">
          {items.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">Tidak ada item.</p>
          ) : (
            <table className="w-full overflow-hidden rounded-xl border border-border-soft text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Produk</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500">Jenis</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500">Qty</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2 text-xs font-medium">{item.product_name}</td>
                    <td className="px-3 py-2 text-center">
                      <Badge tone="info" className="capitalize">{item.price_type}</Badge>
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-slate-600">{item.qty}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs font-semibold">
                      {formatRupiah(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-border-soft pt-3">
            <span className="text-sm font-semibold text-slate-600">Total</span>
            <span className="text-xl font-bold text-success">{formatRupiah(sale.total_amount)}</span>
          </div>

          {sale.notes ? (
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">Catatan: {sale.notes}</p>
          ) : null}

          <p className="mt-4 border-t border-border-soft pt-3 text-center text-xs text-slate-400">
            Terima kasih atas kepercayaan Anda · Nusantara Motor
          </p>
        </div>
      </div>

      {/* Aksi bawah — disembunyikan saat mencetak. */}
      <div className="flex gap-2 print:hidden">
        <Button className="flex-1" onClick={() => window.print()}>
          Cetak Nota
        </Button>
        <Button variant="danger" className="flex-1" disabled={deleting} onClick={() => void handleDelete()}>
          {deleting ? "Menghapus..." : "Hapus"}
        </Button>
      </div>
    </div>
  );
}

// output: export tidak mendukung route dinamis [id]; id kini lewat query string.
export default function Page() {
  return (
    <Suspense fallback={<Loading label="Memuat..." />}>
      <DetailPenjualanPage />
    </Suspense>
  );
}
