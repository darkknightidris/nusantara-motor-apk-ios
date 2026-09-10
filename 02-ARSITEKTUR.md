# 02 — Arsitektur

## Diagram

```
[ Android Device ]
 └─ APK (Capacitor 7)
     └─ WebView (assets lokal — bukan jaringan)
         └─ Next.js static export (salinan nusantara-motor-pwa)
             ├─ UI React 19 + Tailwind 4 (sama persis dengan PWA)
             ├─ lib/localApi.ts   ← pengganti lib/api.ts (fetch ke FastAPI)
             │     └─ CRUD langsung ke DB lokal
             └─ lib/db.ts
                   └─ @capacitor-community/sqlite  (SQLite di app data dir)
     └─ @capacitor/filesystem  ← attachment + file export (xlsx/pdf)
     └─ @capacitor/share       ← share file ke app lain
```

## Alur Data
- Semua CRUD (produk, penjualan, keuangan, panduan, users) →
  langsung tulis/baca SQLite lokal. Tidak ada fetch.
- Auth: login membandingkan username + hash password (SHA-256 + salt)
  dari tabel `users`; session disimpan di localStorage
  (pola `useSyncExternalStore` dari PWA dipertahankan).
- Stock produk otomatis berkurang saat transaksi penjualan
  tersimpan (logika yang di backend FastAPI lama dipindah ke klien).
- Export xlsx: SheetJS di dalam WebView → Filesystem → Share.
- Export PDF (katalog harga): jsPDF.
- Import xlsx: SheetJS parse → tulis ke DB.
- Attachment transaksi: simpan sebagai file di Filesystem
  (path disimpan di kolom DB), bukan base64 (hemat DB).
- SW (`public/sw.js`) **dihapus** — aset di-serve dari bundle app,
  SW tidak diperlukan dan bisa jadi sumber masalah di WebView.

## Log Keputusan
| # | Keputusan | Alasan |
|---|-----------|--------|
| D1 | Capacitor 7 (bukan RN/Flutter) | Reuse 100% UI PWA; waktu build ±30–40% dari rewrite; "APK biasa" |
| D2 | SQLite via @capacitor-community/sqlite | DB file lokal di app data dir; portable; cocok backup/restore |
| D3 | Next.js static export (output: 'export') | PWA sudah terbukti bisa di-export; WebView Capacitor load dari bundle |
| D4 | Auth lokal hash+salt | Tanpa auth provider; role owner/kasir tetap ada |
| D5 | SheetJS + jsPDF di klien | Gantikan openpyxl/reportlab backend; tanpa server |
| D6 | Attachment via Filesystem | DB tidak membengkak; file bisa di-share |
| D7 | SW dihapus | Aset sudah lokal; SW di WebView flaky |
| D8 | Salin PWA sebagai basis (bukan web desktop) | Layout mobile yang sudah dikenali klien |

## Risiko & Mitigasi
| Risiko | Mitigasi |
|---|---|
| React 19 + Capacitor edge case | Capacitor 7 sudah support; fallback: downgrade React 18 |
| `<input type=file>` di WebView | Capacitor mendukung; jika gagal → Filesystem picker API |
| Build Android pertama lambat/gagal | SDK via cmdline-tools non-interaktif; log error ke `07-EROR.md` |
| Data Supabase lama tidak bisa diakses langsung | Seeding: export dari Supabase → file .db ter-seed (fase 4) |
| Kualitas model Q3_K_L di sesi panjang | Checkpoint per fase + state file + kompresi |
