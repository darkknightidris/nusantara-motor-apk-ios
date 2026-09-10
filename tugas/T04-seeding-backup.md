# T04 — Seeding & Backup/Restore

Status: ⬜ belum mulai

## Tujuan
Data lama (Supabase) masuk ke DB lokal; backup/restore antar perangkat
bisa dilakukan dari UI.

## Langkah
- [ ] Ekspor data Supabase lama (produk, sales, transactions, guides, users
      non-sekret) → file `.db` ter-seed (dibuat via script Python +
      sqlite3)
- [ ] Embed file `.db` ke assets APK (atau download satu kali build-time
      jika terlalu besar)
- [ ] First-run: jika DB kosong → copy file seed → `meta.seeded_at`
- [ ] Fallback: import xlsx produk dari sistem lama (jika jawaban #2 = b)
- [ ] Fitur BACKUP di UI (modul Users/Profil): zip file DB + folder
      attachment → Filesystem → Share
- [ ] Fitur RESTORE: pick file backup → validasi skema/versi → replace DB
      (konfirmasi ganda)
- [ ] `meta.db_version` untuk kompatibilitas restore

## Acceptance
- Fresh install → data seed muncul.
- Backup → file ter-share; restore di perangkat lain → data utuh
  (termasuk attachment).

## Catatan
- Password user lama TIDAK bisa dipindah (Supabase auth) → user dibuat
  ulang dengan password default + instruksi ganti.
