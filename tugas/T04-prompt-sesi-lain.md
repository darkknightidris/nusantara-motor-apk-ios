# T04 — Prompt untuk Sesi Lain (Seeding + Verifikasi)

Repo: `C:\Users\idris\Desktop\nusantara-motor-apk-full-offline`
Posisi: T01 ✅, T02 ✅, T03 ✅. Ini T04 — **sisa inti** = seeding + verifikasi.

## Konteks arsitektur
- App = native Android/Capacitor. Lapisan data (SQLite native) **hanya jalan di
  dalam APK**. Verifikasi E2E = emulator `emulator-5554` (app `com.nusantaramotor.apk`).
- Data per-perangkat, full offline. **TIDAK ada cloud/SaaS**, **tanpa database
  cloud**, **tanpa signup**. Backup = JSON bundle (bukan zip).
- File dev: `lib/db.ts` (qAll/qRows/toProduct), `lib/localApi.ts`,
  `lib/backup.ts` (backup/restore), `app/(app)/profil/page.tsx`.
- Emulator: `emulator-5554`. APK debug di
  `android/app/build/outputs/apk/debug/app-debug.apk`.

## Yang SUDAH (jangan diulang)
- Backup/restore UI di halaman Profil (`app/(app)/profil/page.tsx`) —
  `backupNow()` + `restoreFrom()` sudah ter-commit.
- Import xlsx (`doImportProductsExcel`) sudah ter-commit (T02/T03).
- `lib/backup.ts` (190 baris) ter-commit.
- E2E sesi 11: app ter-launch di emulator; dashboard render (banner OFFLINE,
  sapaan, kartu ringkasan, bottom nav 5 item).

## Yang BELUM (inti T04)
1. **Seeding A** — bake DB ter-seed (file `.db` dengan data katalog lama).
   Ini satu-satunya bagian inti yang belum dibangun.
2. **Verifikasi E2E** di emulator (fresh install → data muncul; backup →
   file ter-share; restore → data utuh).

## Tugas T04 (urutan)
1. Seeding A+B — DB ter-seed di-bake + verifikasi acceptance di emulator.
2. Verifikasi E2E lengkap di emulator (`emulator-5554`): login → dashboard
   → semua modul (katalog, jual, keuangan, panduan, profil, users).

## Aturan (WAJIB)
- Jangan mengulang sub-task yang sudah ✅; cek `git log --oneline` + `tugas/T0x`.
- Tiap checkpoint: update `STATE.md` + `06-LOG-SESI.md` + `git commit`.
- Batas retry: sub-task yang sama maksimal 3x; gagal terus → catat di
  `07-EROR.md` + tandai ⚠ BLOCKED + laporkan ke pengguna.
- Di awal sesi: `git log --oneline` + cocokkan dengan checklist.
- Environment: shell = cmd.exe; helper Python di `.audit/` (bukan di repo).
- Jangan matikan/restart llama-server untuk pekerjaan yang tidak berhubungan
  langsung dengan inference.

## Bug terpisah (bukan T04)
- Fix bug data dashboard: bagian "Stok menipis" tampil "undefined"
  (`p.name` = "undefined", `p.stock` = 0). Akar: `db.ts` → `qAll`
  memetakan posisi kolom hasil ≠ posisi kolom DDL. Fix = perbaiki mapping
  di `db.ts` lalu verifikasi di emulator.
