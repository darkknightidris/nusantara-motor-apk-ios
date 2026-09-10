# T02 — Lapisan DB Lokal (SQLite)

Status: ⬜ belum mulai

## Tujuan
`lib/db.ts` + `lib/localApi.ts` siap dipakai semua modul; auth lokal jalan.

## Langkah
- [ ] Inisialisasi DB (file di app data dir) + `CREATE TABLE IF NOT EXISTS`
      sesuai `04-SCHEMA-DB.md`
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
