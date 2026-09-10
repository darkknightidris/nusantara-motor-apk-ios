"use client";

// Katalog produk: daftar dikelompokkan per merek, pencarian nama/kategori/
// merek, ekspor Excel/PDF, dan impor Excel (khusus owner). Data dari backend.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useSession } from "@/lib/session";
import { formatRupiah } from "@/lib/format";
import type { Product, ProductImportResult } from "@/lib/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";

export default function KatalogPage() {
  const router = useRouter();
  const { token, user } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const [importResult, setImportResult] = useState<ProductImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isOwner = user?.role === "owner";

  const load = useCallback(
    async (q: string) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        setProducts(await api.listProducts(q ? { search: q } : undefined));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Gagal memuat katalog.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load(search);
  }, [load, search]);

  const handleExport = async (kind: "excel" | "pdf") => {
    setExporting(kind);
    setError(null);
    try {
      if (kind === "excel") await api.exportProductsExcel();
      else await api.exportProductsPdf();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengunduh file.");
    } finally {
      setExporting(null);
    }
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    setError(null);
    try {
      const result = await api.importProductsExcel(file);
      setImportResult(result);
      void load(search);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengimpor file.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // Kelompokkan produk per merek; produk tanpa merek masuk "Tanpa Merek".
  const groups: Record<string, Product[]> = {};
  for (const p of products) {
    const brand = p.brand && p.brand.trim() ? p.brand.trim() : "Tanpa Merek";
    (groups[brand] ??= []).push(p);
  }
  const brandNames = Object.keys(groups).sort((a, b) => a.localeCompare(b, "id"));

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Katalog Produk</h1>
          <p className="mt-0.5 text-sm text-slate-500">{products.length} produk terdaftar</p>
        </div>
      </header>

      {isOwner && (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => void handleExport("excel")} disabled={exporting !== null}>
            {exporting === "excel" ? "Mengunduh..." : "Ekspor Excel"}
          </Button>
          <Button variant="secondary" onClick={() => void handleExport("pdf")} disabled={exporting !== null}>
            {exporting === "pdf" ? "Mengunduh..." : "Ekspor PDF"}
          </Button>
          <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-soft bg-surface px-4 text-sm font-semibold active:bg-slate-100">
            {importing ? "Mengimpor..." : "Impor Excel"}
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              disabled={importing}
              onChange={(e) => void handleImport(e.target.files?.[0])}
            />
          </label>
        </div>
      )}

      {importResult && (
        <p
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm ${
            importResult.skipped > 0
              ? "border-amber-200 bg-amber-50 text-warning"
              : "border-emerald-200 bg-emerald-50 text-success"
          }`}
        >
          Impor selesai: <strong>{importResult.inserted} ditambah</strong>,{" "}
          <strong>{importResult.updated} diperbarui</strong>
          {importResult.skipped > 0 ? `, ${importResult.skipped} dilewati` : ""}.
        </p>
      )}

      <label className="block">
        <span className="sr-only">Cari produk</span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama produk, kategori, merek..."
          className="h-12 w-full rounded-xl border border-border-soft bg-surface px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </label>

      {loading ? (
        <Loading label="Memuat katalog..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load(search)} />
      ) : products.length === 0 ? (
        <Card>
          <EmptyState
            title="Belum ada produk"
            hint={search ? "Tidak ada produk yang cocok dengan pencarian." : "Tambahkan produk pertama dari halaman Tambah Produk."}
            action={
              isOwner && !search ? (
                <Link href="/katalog/tambah" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white active:bg-blue-800">
                  Tambah Produk
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {brandNames.map((brand) => (
            <Card key={brand} title={`${brand} · ${groups[brand].length} produk`}>
              <ul className="divide-y divide-border-soft">
                {groups[brand].map((p) => (
                  <li key={p.id}>
                    <Link href={`/katalog/produk?id=${p.id}`} className="flex items-center justify-between gap-3 py-2.5 active:bg-slate-100/60">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{p.name}</span>
                        {p.category ? (
                          <Badge tone="neutral" className="mt-1">{p.category}</Badge>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-mono text-sm font-semibold">
                          {formatRupiah(p.price_eceran_pcs)}
                          <span className="text-xs font-normal text-slate-400"> /pcs</span>
                        </span>
                        <Badge tone={p.stock <= p.stock_min ? "warning" : "success"} className="mt-1">
                          stok {p.stock}
                        </Badge>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}

      {isOwner && (
        <Button className="w-full" onClick={() => router.push("/katalog/tambah")}>
          Tambah Produk
        </Button>
      )}
    </div>
  );
}
