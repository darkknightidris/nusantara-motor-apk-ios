"use client";

// Riwayat penjualan + form catat penjualan baru. Item penjualan memakai
// harga per jenis (modal/grosir/eceran) yang terisi otomatis dari data
// produk, namun tetap bisa diubah manual oleh kasir.
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/lib/session";
import { formatDateTime, formatRupiah } from "@/lib/format";
import type { PriceType, Product, Sale, SaleItemInput } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Field, SelectField } from "@/components/ui/Field";
import Loading from "@/components/ui/Loading";

interface SaleItemDraft {
  product_id: string;
  price_type: PriceType;
  qty: string;
  unit_price: string;
}

const EMPTY_ITEM: SaleItemDraft = {
  product_id: "",
  price_type: "eceran",
  qty: "1",
  unit_price: "",
};

function priceFor(p: Product, type: PriceType): number {
  switch (type) {
    case "modal":
      return p.price_modal_pcs;
    case "grosir":
      return p.price_grosir_pcs;
    default:
      return p.price_eceran_pcs;
  }
}

const toNum = (v: string): number => {
  const n = Number(v);
  return v.trim() !== "" && Number.isFinite(n) ? n : 0;
};

export default function PenjualanPage() {
  const router = useRouter();
  const { token } = useSession();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form catat penjualan.
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<SaleItemDraft[]>([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);

  // Filter tanggal (format YYYY-MM-DD, cocok dengan prefix created_at).
  const [searchDate, setSearchDate] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [salesRes, productsRes] = await Promise.all([
        api.listSales(),
        api.listProducts(),
      ]);
      setSales(salesRes);
      setProducts(productsRes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
  }, [load]);

  const productById = (id: string) => products.find((p) => p.id === id);

  function updateItem(idx: number, patch: Partial<SaleItemDraft>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  // Pilih produk: isi harga satuan sesuai jenis harga yang aktif.
  function handleProductSelect(idx: number, productId: string) {
    const p = productById(productId);
    if (!p) return;
    updateItem(idx, {
      product_id: productId,
      unit_price: String(priceFor(p, items[idx].price_type)),
    });
  }

  // Ganti jenis harga: isi ulang harga satuan dari produk terpilih.
  function handlePriceTypeChange(idx: number, type: PriceType) {
    const p = productById(items[idx].product_id);
    updateItem(idx, {
      price_type: type,
      unit_price: p ? String(priceFor(p, type)) : items[idx].unit_price,
    });
  }

  function subtotalOf(item: SaleItemDraft): number {
    return toNum(item.unit_price) * Math.max(1, toNum(item.qty));
  }

  const total = items.reduce((sum, it) => sum + subtotalOf(it), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.some((it) => !it.product_id)) {
      setError("Pilih produk untuk semua item terlebih dahulu.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payloadItems: SaleItemInput[] = items.map((it) => ({
        product_id: it.product_id,
        product_name: productById(it.product_id)?.name ?? "",
        qty: Math.max(1, toNum(it.qty)),
        price_type: it.price_type,
        unit_price: toNum(it.unit_price),
        subtotal: subtotalOf(it),
      }));
      const sale = await api.createSale({
        customer_name: customerName.trim() || null,
        customer_contact: customerContact.trim() || null,
        notes: notes.trim() || null,
        items: payloadItems,
      });
      // Reset form lalu lanjut ke nota penjualan.
      setShowForm(false);
      setCustomerName("");
      setCustomerContact("");
      setNotes("");
      setItems([{ ...EMPTY_ITEM }]);
      void load();
      router.push(`/penjualan/nota?id=${sale.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan penjualan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    setError(null);
    try {
      await api.exportSalesExcel();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengunduh file.");
    }
  }

  const displayed = sales.filter(
    (s) => !searchDate || s.created_at?.startsWith(searchDate)
  );
  const totalDisplayed = displayed.reduce((sum, s) => sum + s.total_amount, 0);

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Penjualan</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {displayed.length} transaksi · {formatRupiah(totalDisplayed)}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Tutup Form" : "Catat Penjualan"}
        </Button>
        <Button variant="secondary" onClick={() => void handleExport()}>
          Ekspor Excel
        </Button>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      {showForm ? (
        <Card title="Catat Penjualan Baru">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Nama Customer"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Kosongkan jika umum"
              />
              <Field
                label="No. HP"
                inputMode="tel"
                value={customerContact}
                onChange={(e) => setCustomerContact(e.target.value)}
                placeholder="Opsional"
              />
            </div>
            <Field
              label="Catatan"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Opsional"
            />

            <div className="space-y-3">
              {items.map((item, idx) => (
                <fieldset key={idx} className="space-y-3 rounded-xl bg-slate-50 p-3">
                  <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Item {idx + 1}
                  </legend>
                  <SelectField
                    label="Produk *"
                    value={item.product_id}
                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                  >
                    <option value="">-- Pilih Produk --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (stok: {p.stock})
                      </option>
                    ))}
                  </SelectField>
                  <div className="grid grid-cols-2 gap-3">
                    <SelectField
                      label="Jenis Harga"
                      value={item.price_type}
                      onChange={(e) => handlePriceTypeChange(idx, e.target.value as PriceType)}
                    >
                      <option value="eceran">Eceran</option>
                      <option value="grosir">Grosir</option>
                      <option value="modal">Modal</option>
                    </SelectField>
                    <Field
                      label="Qty"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateItem(idx, { qty: e.target.value })}
                    />
                  </div>
                  <Field
                    label="Harga Satuan (Rp)"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={item.unit_price}
                    onChange={(e) => updateItem(idx, { unit_price: e.target.value })}
                  />
                  <p className="text-right text-sm font-semibold text-success">
                    Subtotal: {formatRupiah(subtotalOf(item))}
                  </p>
                  {items.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-xs font-semibold text-danger active:underline"
                    >
                      Hapus item ini
                    </button>
                  ) : null}
                </fieldset>
              ))}
            </div>

            <Button type="button" variant="secondary" onClick={() => setItems((prev) => [...prev, { ...EMPTY_ITEM }])}>
              + Tambah Item
            </Button>

            <div className="flex items-center justify-between border-t border-border-soft pt-3">
              <div>
                <p className="text-xs text-slate-500">Total Penjualan</p>
                <p className="text-xl font-bold text-success">{formatRupiah(total)}</p>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan & Lihat Nota"}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="flex items-center gap-2">
        <input
          type="date"
          aria-label="Filter tanggal transaksi"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="h-12 w-full rounded-xl border border-border-soft bg-surface px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
        {searchDate ? (
          <button
            type="button"
            onClick={() => setSearchDate("")}
            className="h-12 rounded-xl border border-border-soft bg-surface px-3 text-sm font-medium active:bg-slate-100"
          >
            Reset
          </button>
        ) : null}
      </div>

      {loading ? (
        <Loading label="Memuat riwayat penjualan..." />
      ) : displayed.length === 0 ? (
        <Card>
          <EmptyState
            title={searchDate ? "Tidak ada transaksi pada tanggal ini" : "Belum ada penjualan"}
            hint="Gunakan tombol Catat Penjualan untuk mencatat transaksi pertama."
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {displayed.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => router.push(`/penjualan/nota?id=${s.id}`)}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-surface p-4 text-left shadow-sm ring-1 ring-border-soft active:bg-slate-50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {s.customer_name || "Customer Umum"}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    {formatDateTime(s.created_at)}
                  </span>
                </span>
                <Badge tone="success" className="shrink-0 font-mono">
                  {formatRupiah(s.total_amount)}
                </Badge>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
