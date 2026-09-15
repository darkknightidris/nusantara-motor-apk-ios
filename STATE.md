# STATE — Source of Truth

Update: 2026-09-12 (sesi 11)
**Posisi sekarang: T07 (Beranda) — E2E verifikasi di emulator `emulator-5554`; dashboard render; build hijau; komit `e3bd5bc` (fix dashboard JSX) & `dc30dd5` (hub BYON)**.
- T07 (Beranda): halaman `app/(app)/dashboard/page.tsx` redesigned = hub semua fitur — grid aksi cepat + header section + kartu data. Komit `dc30dd5`.
- Fix dashboard JSX (komentari `{/* */` tanpa tutup) terkunci di `e3bd5bc`; build hijau (19 rute).
- E2E di emulator: app `com.nusantaramotor.apk` ter-launch & render (banner OFFLINE, sapaan, kartu ringkasan, bottom nav). Temuan: bug data — bagian "Stok menipis" tampil "undefined" (2 item; `p.name` undefined) → bug runtime di `getLowStock`/`toProduct` yang masih perlu difix.
- **Catatan arsitektur PENTING:** app = native Android/Capacitor. Lapisan data (SQLite native) hanya jalan di dalam APK. Di browser desktop hanya UI shell yang bisa diverifikasi; data (login, dashboard, dsb.) butuh lingkungan Android native. Detail di `06-LOG-SESI.md` + `07-EROR.md`.
Log sesi ini: E2E verifikasi di emulator + fix dashboard JSX + komit (lihat `06-LOG-SESI.md`).

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

