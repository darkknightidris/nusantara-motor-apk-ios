"use client";

// Detail produk: informasi + tabel harga, kelebihan, dan kegunaan kendaraan
// (guides). Owner dapat mengedit data produk, mengelola guides, dan menghapus.
import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { localApi as api, ApiError } from "@/lib/localApi";
import { useSession } from "@/lib/session";
import { formatRupiah } from "@/lib/format";
import type { GuidePayload, Product, ProductGuide, ProductPayload } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import { Field, SelectField, TextAreaField } from "@/components/ui/Field";

const UNITS = ["pcs", "liter", "kaleng", "dus", "botol", "set", "buah"];

interface EditForm {
  name: string;
  category: string;
  brand: string;
  unit: string;
  qty_per_box: string;
  price_modal_pcs: string;
  price_modal_box: string;
  price_grosir_pcs: string;
  price_grosir_box: string;
  price_eceran_pcs: string;
  price_eceran_box: string;
  kelebihan: string;
  notes: string;
}

const EMPTY_GUIDE: GuidePayload = {
  vehicle_brand: "",
  vehicle_model: "",
  vehicle_year: null,
  vehicle_cc: null,
  notes: null,
};

function toEditForm(p: Product): EditForm {
  return {
    name: p.name ?? "",
    category: p.category ?? "",
    brand: p.brand ?? "",
    unit: p.unit,
    qty_per_box: String(p.qty_per_box),
    price_modal_pcs: String(p.price_modal_pcs || ""),
    price_modal_box: String(p.price_modal_box || ""),
    price_grosir_pcs: String(p.price_grosir_pcs || ""),
    price_grosir_box: String(p.price_grosir_box || ""),
    price_eceran_pcs: String(p.price_eceran_pcs || ""),
    price_eceran_box: String(p.price_eceran_box || ""),
    kelebihan: p.kelebihan ?? "",
    notes: p.notes ?? "",
  };
}

const num = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) && v.trim() !== "" ? n : 0;
};

function DetailProdukPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const { user } = useSession();
  const isOwner = user?.role === "owner";

  const [product, setProduct] = useState<Product | null>(null);
  const [guides, setGuides] = useState<ProductGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);

  // State guides
  const [showGuideForm, setShowGuideForm] = useState(false);
  const [guideForm, setGuideForm] = useState<GuidePayload>(EMPTY_GUIDE);
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  const [editGuideForm, setEditGuideForm] = useState<GuidePayload>(EMPTY_GUIDE);

  const loadGuides = useCallback(async () => {
    try {
      setGuides(await api.getGuidesByProduct(id));
    } catch {
      // Kegagalan memuat guides tidak menghalangi halaman detail produk.
    }
  }, [id]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const p = await api.getProduct(id);
      setProduct(p);
      setForm(toEditForm(p));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
    void loadGuides();
  }, [load, loadGuides]);

  function set<K extends keyof EditForm>(key: K, value: string) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSave() {
    if (!form || !product) return;
    if (!form.name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload: ProductPayload = {
      name: form.name.trim(),
      category: form.category.trim() || null,
      brand: form.brand.trim() || null,
      unit: form.unit,
      qty_per_box: Math.max(1, num(form.qty_per_box) || 1),
      price_modal_pcs: num(form.price_modal_pcs),
      price_modal_box: num(form.price_modal_box),
      price_grosir_pcs: num(form.price_grosir_pcs),
      price_grosir_box: num(form.price_grosir_box),
      price_eceran_pcs: num(form.price_eceran_pcs),
      price_eceran_box: num(form.price_eceran_box),
      stock: product.stock,
      stock_min: product.stock_min,
      kelebihan: form.kelebihan.trim() || null,
      notes: form.notes.trim() || null,
    };
    try {
      const updated = await api.updateProduct(id, payload);
      setProduct(updated);
      setForm(toEditForm(updated));
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Yakin hapus produk ini? Tindakan tidak dapat dibatalkan.")) return;
    try {
      await api.deleteProduct(id);
      router.push("/katalog");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus produk.");
    }
  }

  async function handleAddGuide(e: React.FormEvent) {
    e.preventDefault();
    if (!guideForm.vehicle_brand.trim() || !guideForm.vehicle_model.trim()) return;
    try {
      await api.createGuide({ ...guideForm, product_id: id });
      setGuideForm(EMPTY_GUIDE);
      setShowGuideForm(false);
      void loadGuides();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan kegunaan.");
    }
  }

  async function handleUpdateGuide(e: React.FormEvent) {
    e.preventDefault();
    if (!editingGuideId || !editGuideForm.vehicle_brand.trim() || !editGuideForm.vehicle_model.trim()) return;
    try {
      await api.updateGuide(editingGuideId, editGuideForm);
      setEditingGuideId(null);
      setEditGuideForm(EMPTY_GUIDE);
      void loadGuides();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan kegunaan.");
    }
  }

  async function handleDeleteGuide(guideId: string) {
    if (!window.confirm("Hapus data kendaraan ini?")) return;
    try {
      await api.deleteGuide(guideId);
      void loadGuides();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus kegunaan.");
    }
  }

  if (loading) return <Loading label="Memuat produk..." />;
  if (!product || !form) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Detail Produk</h1>
        <ErrorState message={error ?? "Produk tidak ditemukan."} onRetry={() => void load()} />
      </div>
    );
  }

  const kelebihanList = (product.kelebihan ?? "")
    .split("\n")
    .map((k) => k.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <Link
          href="/katalog"
          aria-label="Kembali ke katalog"
          className="grid h-10 w-10 place-items-center rounded-xl border border-border-soft bg-surface text-lg active:bg-slate-100"
        >
          ←
        </Link>
        <h1 className="text-lg font-bold">Detail Produk</h1>
      </header>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      <Card>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-lg font-bold text-white">
              {product.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">{product.name}</h2>
              <p className="text-xs text-slate-500">
                {[product.brand, product.category].filter(Boolean).join(" · ") || "-"}
              </p>
            </div>
          </div>
          {isOwner && !editing ? (
            <div className="flex shrink-0 gap-2">
              <Button variant="secondary" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => void handleDelete()}>
                Hapus
              </Button>
            </div>
          ) : null}
        </div>

        {editing ? (
          <div className="mt-4 space-y-3">
            <Field label="Nama Produk *" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Kategori" value={form.category} onChange={(e) => set("category", e.target.value)} />
              <Field label="Brand / Merek" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Satuan" value={form.unit} onChange={(e) => set("unit", e.target.value)}>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </SelectField>
              <Field label="Isi per Dus" type="number" inputMode="numeric" min={1} value={form.qty_per_box} onChange={(e) => set("qty_per_box", e.target.value)} />
            </div>
            {(
              [
                ["Modal / pcs", "price_modal_pcs"],
                ["Modal / dus", "price_modal_box"],
                ["Grosir / pcs", "price_grosir_pcs"],
                ["Grosir / dus", "price_grosir_box"],
                ["Eceran / pcs", "price_eceran_pcs"],
                ["Eceran / dus", "price_eceran_box"],
              ] as const
            ).map(([label, key]) => (
              <Field
                key={key}
                label={label}
                type="number"
                inputMode="numeric"
                min={0}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            ))}
            <TextAreaField label="Kelebihan Produk (satu per baris)" rows={3} value={form.kelebihan} onChange={(e) => set("kelebihan", e.target.value)} />
            <TextAreaField label="Catatan" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => void handleSave()} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {(
                [
                  ["Kategori", product.category],
                  ["Brand", product.brand],
                  ["Satuan", product.unit],
                  ["Isi per Dus", String(product.qty_per_box)],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-2.5">
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd className="mt-0.5 text-xs font-semibold">{value || "-"}</dd>
                </div>
              ))}
            </dl>

            <table className="mt-4 w-full overflow-hidden rounded-xl border border-border-soft text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Jenis Harga</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Per Pcs</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Per Dus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {(
                  [
                    ["Modal", product.price_modal_pcs, product.price_modal_box],
                    ["Grosir", product.price_grosir_pcs, product.price_grosir_box],
                    ["Eceran", product.price_eceran_pcs, product.price_eceran_box],
                  ] as const
                ).map(([label, pcs, box]) => (
                  <tr key={label}>
                    <td className="px-3 py-2 text-xs font-medium">{label}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs font-semibold">
                      {formatRupiah(pcs)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs font-semibold">
                      {formatRupiah(box)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium">Stok saat ini:</span>
              <Badge tone={product.stock <= product.stock_min ? "warning" : "success"}>
                {product.stock} {product.unit} (min. {product.stock_min})
              </Badge>
            </div>

            {product.notes ? (
              <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">{product.notes}</p>
            ) : null}
          </>
        )}
      </Card>

      {!editing && kelebihanList.length > 0 ? (
        <Card title="Kelebihan Produk">
          <ol className="space-y-1.5">
            {kelebihanList.map((k, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-blue-50 text-[10px] font-bold text-primary">
                  {i + 1}
                </span>
                {k}
              </li>
            ))}
          </ol>
        </Card>
      ) : null}

      <Card
        title="Kegunaan Kendaraan"
        action={
          isOwner ? (
            <Button variant="secondary" onClick={() => setShowGuideForm((v) => !v)}>
              {showGuideForm ? "Tutup" : "Tambah"}
            </Button>
          ) : undefined
        }
      >
        {isOwner && showGuideForm ? (
          <form onSubmit={handleAddGuide} className="mb-3 space-y-3 rounded-xl bg-slate-50 p-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Merek Kendaraan *" value={guideForm.vehicle_brand ?? ""} onChange={(e) => setGuideForm((f) => ({ ...f, vehicle_brand: e.target.value }))} placeholder="Honda, Yamaha..." required />
              <Field label="Model / Tipe *" value={guideForm.vehicle_model ?? ""} onChange={(e) => setGuideForm((f) => ({ ...f, vehicle_model: e.target.value }))} placeholder="Beat, Avanza..." required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tahun (opsional)" value={guideForm.vehicle_year ?? ""} onChange={(e) => setGuideForm((f) => ({ ...f, vehicle_year: e.target.value || null }))} placeholder="2018-2023" />
              <Field label="CC Kendaraan (opsional)" value={guideForm.vehicle_cc ?? ""} onChange={(e) => setGuideForm((f) => ({ ...f, vehicle_cc: e.target.value || null }))} placeholder="125cc, 150cc..." />
            </div>
            <Field label="Catatan" value={guideForm.notes ?? ""} onChange={(e) => setGuideForm((f) => ({ ...f, notes: e.target.value || null }))} placeholder="Tips pemakaian..." />
            <div className="flex gap-2">
              <Button type="submit">Simpan</Button>
              <Button type="button" variant="secondary" onClick={() => setShowGuideForm(false)}>
                Batal
              </Button>
            </div>
          </form>
        ) : null}

        {guides.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">Belum ada data kendaraan.</p>
        ) : (
          <ul className="space-y-2">
            {guides.map((g) => (
              <li key={g.id} className="rounded-xl bg-slate-50 px-3 py-2.5">
                {editingGuideId === g.id ? (
                  <form onSubmit={handleUpdateGuide} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Merek Kendaraan *" value={editGuideForm.vehicle_brand ?? ""} onChange={(e) => setEditGuideForm((f) => ({ ...f, vehicle_brand: e.target.value }))} required />
                      <Field label="Model / Tipe *" value={editGuideForm.vehicle_model ?? ""} onChange={(e) => setEditGuideForm((f) => ({ ...f, vehicle_model: e.target.value }))} required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Tahun" value={editGuideForm.vehicle_year ?? ""} onChange={(e) => setEditGuideForm((f) => ({ ...f, vehicle_year: e.target.value || null }))} />
                      <Field label="CC Kendaraan" value={editGuideForm.vehicle_cc ?? ""} onChange={(e) => setEditGuideForm((f) => ({ ...f, vehicle_cc: e.target.value || null }))} />
                    </div>
                    <Field label="Catatan" value={editGuideForm.notes ?? ""} onChange={(e) => setEditGuideForm((f) => ({ ...f, notes: e.target.value || null }))} />
                    <div className="flex gap-2">
                      <Button type="submit">Simpan</Button>
                      <Button type="button" variant="secondary" onClick={() => setEditingGuideId(null)}>
                        Batal
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Badge tone="info" className="whitespace-normal text-left">
                        {g.vehicle_brand} {g.vehicle_model}
                        {g.vehicle_year ? ` · ${g.vehicle_year}` : ""}
                        {g.vehicle_cc ? ` · ${g.vehicle_cc}` : ""}
                      </Badge>
                      {g.notes ? <p className="mt-1 text-xs text-slate-500">{g.notes}</p> : null}
                    </div>
                    {isOwner ? (
                      <div className="flex shrink-0 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGuideId(g.id);
                            setEditGuideForm({
                              vehicle_brand: g.vehicle_brand,
                              vehicle_model: g.vehicle_model,
                              vehicle_year: g.vehicle_year ?? null,
                              vehicle_cc: g.vehicle_cc ?? null,
                              notes: g.notes ?? null,
                            });
                          }}
                          className="text-xs font-semibold text-primary"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteGuide(g.id)}
                          className="text-xs font-semibold text-danger"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

// output: export tidak mendukung route dinamis [id]; id kini lewat query string.
export default function Page() {
  return (
    <Suspense fallback={<Loading label="Memuat..." />}>
      <DetailProdukPage />
    </Suspense>
  );
}
