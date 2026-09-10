# T02 — Lapisan DB Lokal (SQLite)

Status: 🔄 berjalan — sub-task 1/8 selesai

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
- [ ] Seed user default (sesuai jawaban #3; asumsi `admin`/`admin123`, role owner)
- [ ] Implementasi hash: SHA-256(salt+password), salt acak per user
- [ ] `lib/localApi.ts`: tiru SELURUH signature `lib/api.ts` PWA
      (login, me, CRUD products, CRUD sales+items, CRUD transactions+payments,
      CRUD guides, CRUD users, export/import hooks)
- [ ] Ganti import di semua halaman: `api` → `localApi`
- [ ] Logika business yang tadinya di backend dipindah ke klien:
      - stock produk berkurang saat sale tersimpan
      - `status` transaksi di-derive dari `paid_amount`/`total_amount`
      - validasi payload (harga, qty, dll.)
- [ ] Hapus panggilan fetch/`API_BASE_URL` tersisa (grep `fetch(`, `apiBase`)
- [ ] Unit-check manual via WebView console (atau uji di fase 5)

## Acceptance
Login lokal berhasil (role owner & kasir); CRUD semua entitas persisten
setelah app di-restart; tidak ada satu pun panggilan jaringan.

## Catatan
- Verifikasi skema akhir terhadap `types.ts` PWA (sudah dicatat di
  `04-SCHEMA-DB.md`).
