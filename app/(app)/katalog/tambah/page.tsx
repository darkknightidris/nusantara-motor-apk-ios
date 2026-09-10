"use client";

// Tambah produk baru: form 3 bagian (informasi, harga, catatan).
// Khusus owner — kasir tidak punya akses tambah produk di backend.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { ProductPayload } from "@/lib/types";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Field, SelectField, TextAreaField } from "@/components/ui/Field";

const UNITS = ["pcs", "liter", "kaleng", "dus", "botol", "set", "buah"];

interface FormState {
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
  stock: string;
  stock_min: string;
  kelebihan: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  category: "",
  brand: "",
  unit: "pcs",
  qty_per_box: "1",
  price_modal_pcs: "",
  price_modal_box: "",
  price_grosir_pcs: "",
  price_grosir_box: "",
  price_eceran_pcs: "",
  price_eceran_box: "",
  stock: "0",
  stock_min: "5",
  kelebihan: "",
  notes: "",
};

const num = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) && v.trim() !== "" ? n : 0;
};

export default function TambahProdukPage() {
  const router = useRouter();
  const { user } = useSession();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isOwner = user?.role === "owner";

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      stock: Math.max(0, num(form.stock)),
      stock_min: Math.max(0, num(form.stock_min) || 5),
      kelebihan: form.kelebihan.trim() || null,
      notes: form.notes.trim() || null,
    };
    try {
      await api.createProduct(payload);
      router.push("/katalog");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan produk.");
      setSaving(false);
    }
  }

  if (!isOwner) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Tambah Produk</h1>
        <p className="rounded-xl border border-border-soft bg-surface p-4 text-sm text-slate-600">
          Hanya owner yang dapat menambah produk. Hubungi pemilik toko untuk
          menambahkan produk baru.
        </p>
        <Link href="/katalog" className="text-sm font-semibold text-primary underline">
          Kembali ke katalog
        </Link>
      </div>
    );
  }

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
        <div>
          <h1 className="text-lg font-bold">Tambah Produk Baru</h1>
          <p className="text-xs text-slate-500">Isi informasi produk yang ingin ditambahkan.</p>
        </div>
      </header>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Card title="1 · Informasi Produk">
          <div className="space-y-3">
            <Field
              label="Nama Produk *"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Contoh: Oli Fastron 10W-40"
              required
            />
            <Field
              label="Kategori"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="Contoh: Oli, Aki, Ban, Filter"
            />
            <Field
              label="Brand / Merek"
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
              placeholder="Contoh: Pertamina, GS Astra"
            />
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Satuan"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </SelectField>
              <Field
                label="Isi per Dus"
                type="number"
                inputMode="numeric"
                min={1}
                value={form.qty_per_box}
                onChange={(e) => set("qty_per_box", e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card title="2 · Harga Jual">
          <p className="mb-3 text-xs text-slate-500">
            Kosongkan jika tidak dipakai. Kolom kiri per pcs, kolom kanan per dus.
          </p>
          <div className="space-y-3">
            {(
              [
                ["Modal", "price_modal_pcs", "price_modal_box"],
                ["Grosir", "price_grosir_pcs", "price_grosir_box"],
                ["Eceran", "price_eceran_pcs", "price_eceran_box"],
              ] as const
            ).map(([label, pcsKey, boxKey]) => (
              <div key={label} className="grid grid-cols-3 items-center gap-2">
                <span className="text-sm font-semibold">{label}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="0"
                  aria-label={`Harga ${label} per pcs`}
                  value={form[pcsKey]}
                  onChange={(e) => set(pcsKey, e.target.value)}
                  className="h-12 w-full rounded-xl border border-border-soft bg-surface px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="0"
                  aria-label={`Harga ${label} per dus`}
                  value={form[boxKey]}
                  onChange={(e) => set(boxKey, e.target.value)}
                  className="h-12 w-full rounded-xl border border-border-soft bg-surface px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                />
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2">
              <span />
              <span className="text-center text-xs text-slate-400">Per Pcs</span>
              <span className="text-center text-xs text-slate-400">Per Dus</span>
            </div>
          </div>
        </Card>

        <Card title="3 · Stok & Catatan (Opsional)">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Stok Awal"
                type="number"
                inputMode="numeric"
                min={0}
                value={form.stock}
                onChange={(e) => set("stock", e.target.value)}
              />
              <Field
                label="Stok Minimum"
                type="number"
                inputMode="numeric"
                min={0}
                value={form.stock_min}
                onChange={(e) => set("stock_min", e.target.value)}
              />
            </div>
            <TextAreaField
              label="Kelebihan Produk (satu per baris)"
              rows={3}
              value={form.kelebihan}
              onChange={(e) => set("kelebihan", e.target.value)}
              placeholder={"Anti slip kopling terbaik\nLebih bertenaga"}
            />
            <TextAreaField
              label="Catatan"
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Catatan tambahan tentang produk ini..."
            />
          </div>
        </Card>

        <div className="flex gap-3 pb-4">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "Menyimpan..." : "Simpan Produk"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/katalog")}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
