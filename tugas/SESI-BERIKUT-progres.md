# Sesi Berikut — Peta Progres & Lanjutan Kerja

Repo: `C:\Users\idris\Desktop\nusantara-motor-apk-full-offline`
Posisi: **T01 ✅, T02 ✅, T03 ✅, T04 (inti) — sisa = seeding + verifikasi**.
Lanjut ke T05 (build+uji) dan T06 (rilis+serah terima).

---

## KETETAPAN POSISI (jangan bingung)

Urutan kerja yang SUDAH ter-commit (cek `git log --oneline`):
- **T01** scaffolding ✅ — shell Capacitor Android (commit `01b198d`)
- **T02** lapis DB lokal ✅ — schema, db.ts, localApi, hash, seed, 6 halaman (commit `bfda5be`→`93a7c11`)
- **T03** adaptasi modul UI ✅ — keuangan, panduan, profil, users, Shell, lib/backup.ts (commit `1bf8685`, `63af0a6`)
- **Sesi 9–11** — Beranda hub + E2E emulator (commit `dc30dd5`→`bf1144a`)
  - `dashboard/page.tsx` redesign = hub BYON (grid aksi cepat + kartu data)
  - `/daftar` rute publik
  - E2E sesi 11: app `com.nusantaramotor.apk` launch & render di emulator

**Yang SUDAH (jangan diulang):**
- Backup/restore UI di Profil (`backupNow` + `restoreFrom`) — ter-commit
- Import xlsx (`doImportProductsExcel`) — ter-commit
- `lib/backup.ts` (190 baris) — ter-commit
- Beranda (dashboard) hub — ter-commit
- E2E sesi 11: app launch & render di emulator

**Yang BELUM (inti T04 + T05 + T06):**
1. **Seeding A** — bake DB ter-seed (file `.db` dengan data katalog lama)
2. **Verifikasi E2E** di emulator `emulator-5554`
3. **T05** — build + uji (APK + checklist uji manual lengkap)
4. **T06** — release + signing + serah terima (keystore, DOKUMENTASI.md)

---

## TUGAS YANG HARUS DILANJUTKAN (urutan)

### 1. T04 inti — Seeding + Verifikasi E2E
- Bake file `.db` ter-seed (data katalog lama: produk, sales, transactions, guides, users)
- Verifikasi E2E di emulator `emulator-5554`:
  - fresh install → data muncul
  - backup → file ter-share
  - restore → data utuh (termasuk attachment)

### 2. T05 — Build & Uji
- Build APK (debug) di emulator
- Jalankan checklist uji manual lengkap (CRUD, export, import, keuangan, panduan, users, backup→restore, persisten, offline)

### 3. T06 — Rilis & Serah Terima
- Keystore + signing release
- `DOKUMENTASI.md` (cara install, akun default, backup/restore, FAQ)
- Serah terima: file APK release + DOKUMENTASI.md + keystore info

---

## KETETAPAN ARSITEKTUR (PENTING)
- App = **native Android/Capacitor**. Lapisan data (SQLite native) **hanya jalan di
  dalam APK**. Verifikasi E2E = emulator `emulator-5554` (app `com.nusantaramotor.apk`).
- Data per-perangkat, full offline. **TIDAK ada cloud/SaaS**, **tanpa database
  cloud**, **tanpa signup**. Backup = JSON bundle (bukan zip).
- Kredensial: `mastaufiq` / `admin`.
- Dev server: port `:3100` (bukan :3000).
- Emulator: `emulator-5554`. APK debug di
  `android/app/build/outputs/apk/debug/app-debug.apk`.

---

## KETETAPAN LINGKUNGAN
- Shell = `cmd.exe`. Helper Python di `C:\Users\idris\Desktop\.audit\` (bukan di repo).
- Jangan matikan/restart `llama-server` untuk pekerjaan yang tidak berhubungan
  langsung dengan inference.
- Kredensial & kredensial emulator: cek `06-LOG-SESI.md` + `STATE.md`.

---

## ATURAN (WAJIB)
- Jangan mengulang sub-task yang sudah ✅; cek `git log --oneline` + `tugas/T0x`.
- Tiap checkpoint: update `STATE.md` + `06-LOG-SESI.md` + `git commit`.
- Batas retry: sub-task yang sama maksimal 3x; gagal terus → catat di
  `07-EROR.md` + tandai ⚠ BLOCKED + laporkan ke pengguna.
- Di awal sesi: `git log --oneline` + cocokkan dengan checklist.

---

## LANJUTKAN
Mulai dari **inti T04** (seeding + verifikasi E2E), lalu T05, T06 sampai
proyek Nusantara Motor APK selesai & ter-verifikasi.
