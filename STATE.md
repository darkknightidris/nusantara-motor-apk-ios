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

- Repo utama: `C:\Users\idris\Desktop\nusantara-motor-apk-full-offline`
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
