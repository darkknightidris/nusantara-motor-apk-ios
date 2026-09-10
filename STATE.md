# STATE — Source of Truth

Update: 2026-09-10 (sesi 1)
**Posisi sekarang: FASE 0 (spesifikasi)** — menunggu jawaban 7 pertanyaan
(di `01-SPEK.md`) + kata "eksekusi" dari pengguna.

## Checklist Fase

| # | Fase | Status | Detail |
|---|------|--------|--------|
| 0 | Spesifikasi & keputusan | ⏳ berjalan | 7 pertanyaan di `01-SPEK.md` belum dijawab |
| 1 | Scaffolding + Capacitor | ⬜ | `tugas/T01-scaffolding.md` |
| 2 | Lapisan DB lokal (SQLite) | ⬜ | `tugas/T02-db-lokal.md` |
| 3 | Adaptasi modul UI + xlsx/pdf | ⬜ | `tugas/T03-adaptasi-modul.md` |
| 4 | Seeding + backup/restore | ⬜ | `tugas/T04-seeding-backup.md` |
| 5 | Build & uji (Android SDK, Gradle) | ⬜ | `tugas/T05-build-gradle.md` |
| 6 | Rilis, signing, serah terima | ⬜ | `tugas/T06-rilis-serah-terima.md` |

## Keputusan Terkunci (jangan berubah tanpa izin pengguna)

- Repo utama: `C:\Users\idris\nusantara-motor-apk-full-offline`
- Arsitektur: **Capacitor 7 + Next.js static export + SQLite lokal**
  (bukan React Native / Flutter — alasannya di `02-ARSITEKTUR.md`)
- UI: salin dari `nusantara-motor-pwa` (tampilan yang sudah dikenali klien)
- Auth: lokal (username + hash SHA-256 + salt), role `owner`/`kasir` dipertahankan
- State file: `STATE.md` di dalam repo ini
- Protokol sesi baru: lihat `README.md`
- Constraint: runtime 100% lokal; download pihak ketiga hanya boleh
  build-time (npm, Gradle, Android SDK) — tanpa akun/signup

## Next Action

- Menunggu: jawaban 7 pertanyaan (`01-SPEK.md`) + kata **"eksekusi"**
- Setelah itu: mulai `tugas/T01-scaffolding.md`

## Ringkasan Estimasi (dari sesi 1)

- Total token proyek: ±150rb–250rb (kumulatif semua sesi)
- Jendela konteks: 150.016 token (llama-server `-c 150016`)
- Estimasi wall-clock: 3–5 jam (kasus buruk ±1 hari)
- Sesi yang dibutuhkan: 2–3 (checkpoint per fase)
