# T02 — Lapisan DB Lokal (SQLite)

Status: 🔄 berjalan — sub-task 5/8 selesai (sisa: 7 hapus fetch/lib/api.ts, 8 uji runtime fase 5)

## Tujuan
`lib/db.ts` + `lib/localApi.ts` siap dipakai semua modul; auth lokal jalan.

## Langkah
- [x] Inisialisasi DB (file di app data dir) + `CREATE TABLE IF NOT EXISTS`
      sesuai `04-SCHEMA-DB.md`
      ✅ (2026-09-10, sesi 4): `lib/schema.ts` (DDL murni data, 9 tabel + 9 indeks,
      sesuai 04-SCHEMA-DB.md) + `lib/db.ts` (ensureDb: open → PRAGMA
      foreign_keys → batch DDL idempoten → meta.db_version; helper run/qRows/
      qAll/tx/uuid/nowISO/deriveStatus; transaksi native begin/commit/rollback).
      Verifikasi: `node scripts/verify-schema.mjs` = 30/30 PASS (DDL, tabel,
      indeks, FK cascade, CHECK constraint, UNIQUE, CRUD, meta). `tsc --noEmit`
      bersih, `next build` OK (12 halaman). Catatan: API plugin v8 =
      options-object (`CapacitorSQLite.open/run/query/execute`, instance
      singleton — BUKAN class + connect()). Verifikasi runtime (WebView) → fase 5.
- [x] Seed user default (sesuai jawaban #3; asumsi `admin`/`admin123`, role owner)
      ✅ (2026-09-10, sesi 4): dalam `ensureDb()` di `lib/db.ts` — idempoten &
      self-healing (re-insert jika username terhapus): seed `mastaufiq`/`admin`,
      role `owner` (keputusan terkunci 01-SPEK #3 — menggantikan asumsi
      `admin`/`admin123` di teks tugas ini; STATE.md menang), + `meta.seeded_at`.
- [x] Implementasi hash: SHA-256(salt+password), salt acak per user
      ✅ (2026-09-10, sesi 4): `lib/hash.ts` — sha256Hex (WebCrypto primary,
      fallback js-sha256 pure-JS utk context non-secure), genSalt (16 byte acak
      = 32 hex, unik per user), hashPassword = SHA-256(salt+password).
      Verifikasi: `node scripts/verify-hash.mjs` = 20/20 PASS (primary & fallback
      identik dgn node:crypto utk 7 sampel incl. unicode; salt unik x100;
      deterministik per salt; hash 64 hex).
- [x] `lib/localApi.ts`: tiru SELURUH signature `lib/api.ts` PWA
      (login, me, CRUD products, CRUD sales+items, CRUD transactions+payments,
      CRUD guides, CRUD users, export/import hooks)
      ✅ (2026-09-10, sesi 4): `lib/localApi.ts` ±35KB — semua signature api.ts
      PWA + tambahan web lama: getTransactionDetail, createTransaction,
      payTransaction, deleteTransaction (owner), exportTransactionsExcel,
      listUsers/createUser/updateUser/deleteUser (owner, mastaufiq dilindungi),
      listAttachments/uploadAttachment/deleteAttachment (Filesystem+convertFileSrc).
      Export xlsx: SheetJS → Filesystem(Documents) → Share.share; pdf: jsPDF
      (xlsx & jspdf di-npm). Role enforcement & validasi payload tiru backend
      lama (per pesan error). `tsc --noEmit` bersih, `next build` OK. Bug yang
      di-fix saat penulisan: import genSalt di atas, UPDATE columns via
      PRODUCT_COLS_ARR (bukan string.slice), getGuidesByProduct & listUsers via
      qRows (qAll hanya valid utk SELECT * tanpa join), Blob utk writeFile, Share
      tanpa mimeType.
- [x] Ganti import di semua halaman: `api` → `localApi`
      ✅ (2026-09-10, sesi 5): 6 halaman app/(app) (dashboard, katalog, produk,
      tambah, penjualan, nota) + `lib/session.ts` (dynamic import login) kini
      import dari `@/lib/localApi`. Pola: `import { localApi as api, ApiError }
      from "@/lib/localApi"` (alias — 21 call-site `api.*` tak perlu diubah,
      diff minimal & stabil utk re-sync dari source PWA di T03). Komentari
      header dashboard & session.ts disesuaikan (backend nyata → SQLite
      lokal; token JWT → token lokal "local-<user_id>"). Verifikasi:
      `tsc --noEmit` bersih, `next build` OK (12 halaman), grep `@/lib/api`
      di app/ & lib/ = 0 sisa. Catatan: `lib/api.ts` masih ada (dihapus di
      sub-task 7).
- [x] Logika business yang tadinya di backend dipindah ke klien:
      - stock produk berkurang saat sale tersimpan
      - `status` transaksi di-derive dari `paid_amount`/`total_amount`
      - validasi payload (harga, qty, dll.)
      ✅ (2026-09-10, sesi 4): terealisasi di dalam `lib/localApi.ts`:
      createSale (tx: insert sale+items+kurangi stok clamp≥0 — perilaku sama
      dgn backend lama), deriveStatus utk createTransaction/payTransaction
      (toleransi 1e-9 sama dgn backend), validasi payload (validateProductPayload,
      qty/price/total/username/role), subtotal sale direkomputasi qty×price.
- [ ] Hapus panggilan fetch/`API_BASE_URL` tersisa (grep `fetch(`, `apiBase`)
- [ ] Unit-check manual via WebView console (atau uji di fase 5)

## Acceptance
Login lokal berhasil (role owner & kasir); CRUD semua entitas persisten
setelah app di-restart; tidak ada satu pun panggilan jaringan.

## Catatan
- Verifikasi skema akhir terhadap `types.ts` PWA (sudah dicatat di
  `04-SCHEMA-DB.md`).
