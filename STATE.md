# STATE — Source of Truth

Update: 2026-09-11 (sesi 7)
**Posisi sekarang: FASE 3 (T03) SELESAI — verifikasi E2E di browser + build final (commit sesi 7)**.
- T03 SELESAI: semua modul (dashboard/katalog/penjualan/keuangan/panduan/profil/users) + `lib/backup.ts` (backup/restore JSON bundle) + `Shell`/`BottomNav`/`OnlineStatus` + login rute publik — semua ter-commit di `1bf8685`.
- Verifikasi sesi ini: E2E di browser (app :3100) — app render (login page + 5-tab nav + banner OFFLINE/LOKAL); semua rute group redirect ke `/login` saat belum sesi; `next build` → `out/` 18 rute; `tsc --noEmit` bersih.
- **Catatan arsitektur PENTING:** app = native Android/Capacitor. Lapisan data (SQLite native) hanya jalan di dalam APK. Di browser desktop hanya UI shell yang bisa diverifikasi; data (login, dashboard, dsb.) butuh lingkungan Android native. Detail di `06-LOG-SESI.md` + `07-EROR.md`.
Log sesi ini: E2E browser + build final + verifikasi (lihat `06-LOG-SESI.md`).

## Checklist Fase

| # | Fase | Status | Detail |
|---|------|--------|--------|
| 0 | Spesifikasi & keputusan | ✅ | 7/7 terjawab & dikunci (lihat `01-SPEK.md`) |
| 1 | Scaffolding + Capacitor | ✅ | Acceptance tercapai: `next build` → `out/`, `android/` ter-generate, 3 plugin (sqlite 8.1.1, filesystem 8.1.3, share 8.0.1) + core/android/cli, `cap sync` OK, commit ada (lihat `tugas/T01-scaffolding.md`) |
| 2 | Lapisan DB lokal (SQLite) | 🟡 | sub-task 1–7/8 ✅ (init DB+DDL 30/30 PASS; seed mastaufiq/admin owner; hash 20/20 PASS; localApi lengkap + logika bisnis; 6 halaman + session.ts import `localApi` via alias; `lib/api.ts` dihapus, 0 sisa fetch/API_BASE, tsc bersih, build OK 12 halaman) — sub-task 8 uji runtime → FASE 5 (T05)
| 3 | Adaptasi modul UI + xlsx/pdf | ✅ | `tugas/T03-adaptasi-modul.md` — SEMUA modul ter-commit (`1bf8685`): keuangan x3, panduan, profil, users, Shell/BottomNav/OnlineStatus, `lib/backup.ts` (190 baris), login rute publik; E2E browser + build final di sesi 7 |
| 4 | Seeding + backup/restore | ⬜ | `tugas/T04-seeding-backup.md` |
| 5 | Build & uji (Android SDK, Gradle) | ⬜ | `tugas/T05-build-gradle.md` |
| 6 | Rilis, signing, serah terima | ⬜ | `tugas/T06-rilis-serah-terima.md` |

## Keputusan Terkunci (jangan berubah tanpa izin pengguna)

- Repo utama: `C:\Users\idris\Desktop\nusantara-motor-apk-full-offline`
- Arsitektur: **Capacitor 7 + Next.js static export + SQLite lokal**
  (bukan React Native / Flutter — alasannya di `02-ARSITEKTUR.md`)
- UI: salin dari `nusantara-motor-pwa` (tampilan yang sudah dikenali klien)
- Auth: lokal (username + hash SHA-256 + salt), role `owner`/`kasir` dipertahankan
- State file: `STATE.md` di dalam repo ini
- Protokol sesi baru: lihat `README.md`
- Cakupan: full 8 modul web lama, layout mobile ala PWA (#1)
- Seeding: A+B — DB ter-seed di-bake + menu import xlsx (#2)
- Akun awal: `mastaufiq` / `admin`, role owner (#3)
- Signing: debug dulu, release + keystore di fase 6 (#4)
- Nama app: "Nusantara Company" (#5)
- Multi-perangkat: full offline dulu; sync antar perangkat = fase lanjutan (#7)

## Next Action

- **FASE 3 (T03) SELESAI** — semua modul ter-commit (`1bf8685`),
  verifikasi E2E di browser + build final + tsc selesai di sesi 7.
- **Posisi:** T01 ✅, T02 ✅, T03 ✅. Berikutnya = **FASE 4 (T04)** —
  seeding + backup/restore diuji di lingkungan native (Android APK).
- **T04 (T04-seeding-backup.md):** bake DB ter-seed (A+B) + verifikasi
  acceptance di emulator/device Android. Ini butuh lingkungan Android
  native — BUKAN browser desktop (lihat catatan arsitektur di atas).
- **Catatan arsitektur (PENTING):** app = native Android/Capacitor.
  Lapisan data (SQLite native) hanya jalan di dalam APK. Di browser
  desktop hanya UI shell yang bisa diverifikasi. Full E2E (login →
  dashboard data) butuh emulator/device Android.
- Dev server: `C:\temp\nusantara_dev.cmd` (next dev -p 3100). PERINGATAN:
  port 3000 = server project PWA LAMA (bukan repo ini) — cek app kita di :3100.
- Keputusan behavior yang disengaja: low-stock = stock<=stock_min; oversell
  di-clamp 0; subtotal sale direkomputasi; backup = JSON bundle (bukan zip —
  portabel, bebas masalah path, tanpa dependensi tambahan); role hanya
  owner|kasir; profil tak bisa diedit di app (aman utk offline).
- Checkpoint: update STATE + log + git commit di tiap sub-task selesai.

## Disiplin Checkpoint & Anti-Loop (WAJIB semua sesi)
1. Urutan kerja = sub-task PERTAMA yang belum dicentang di file `tugas/T0x` aktif.
   Sub-task yang sudah ✅ TIDAK boleh dikerjakan ulang.
2. ✅ hanya boleh jika **acceptance criteria** sub-task itu terpenuhi
   (lihat bagian Acceptance di file tugasnya).
3. Tiap sub-task/fase selesai: update `STATE.md` + `06-LOG-SESI.md` +
   `git commit`. **Tanpa commit = pekerjaan dianggap belum selesai**
   (agar sesi baru bisa cross-check via `git log --oneline`).
4. Batas retry: sub-task yang sama maksimal 3x percobaan. Gagal terus →
   catat penyebab + opsi solusi di `07-EROR.md`, tandai ⚠ BLOCKED,
   BERHENTI, dan laporkan ke pengguna (jangan retry tanpa batas).
5. Di awal sesi: jalankan `git log --oneline` dan cocokkan dengan checklist.
   Jika log menunjukkan pekerjaan yang belum tercatat → perbaiki catatan,
   jangan ulang pekerjaannya.

## Ringkasan Estimasi (dari sesi 1)

- Total token proyek: ±150rb–250rb (kumulatif semua sesi)
- Jendela konteks: 150.016 token (llama-server `-c 150016`)
- Estimasi wall-clock: 3–5 jam (kasus buruk ±1 hari)
- Sesi yang dibutuhkan: 2–3 (checkpoint per fase)
