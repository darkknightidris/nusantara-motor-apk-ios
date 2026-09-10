# STATE — Source of Truth

Update: 2026-09-10 (sesi 4)
**Posisi sekarang: FASE 2 (T02 lapisan DB lokal SQLite) — sub-task 6/8 selesai** — FASE 1 SELESAI & terverifikasi.
Log: `C:\temp\nusantara_t01b.log` · Status: `C:\temp\nusantara_t01_status.txt`
(nilai: `T01_RUNNING` / `T01_DONE` / `T01_FAIL_<langkah>`)

## Checklist Fase

| # | Fase | Status | Detail |
|---|------|--------|--------|
| 0 | Spesifikasi & keputusan | ✅ | 7/7 terjawab & dikunci (lihat `01-SPEK.md`) |
| 1 | Scaffolding + Capacitor | ✅ | Acceptance tercapai: `next build` → `out/`, `android/` ter-generate, 3 plugin (sqlite 8.1.1, filesystem 8.1.3, share 8.0.1) + core/android/cli, `cap sync` OK, commit ada (lihat `tugas/T01-scaffolding.md`) |
| 2 | Lapisan DB lokal (SQLite) | 🔄 | sub-task 1–4,6/8 ✅ (init DB+DDL 30/30 PASS; seed mastaufiq/admin owner; hash 20/20 PASS; localApi lengkap + logika bisnis) — sisa: 5 ganti import halaman, 7 hapus fetch, 8 uji runtime (fase 5) |
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
- Cakupan: full 8 modul web lama, layout mobile ala PWA (#1)
- Seeding: A+B — DB ter-seed di-bake + menu import xlsx (#2)
- Akun awal: `mastaufiq` / `admin`, role owner (#3)
- Signing: debug dulu, release + keystore di fase 6 (#4)
- Nama app: "Nusantara Company" (#5)
- Multi-perangkat: full offline dulu; sync antar perangkat = fase lanjutan (#7)

## Next Action

- Lanjut `tugas/T02-db-lokal.md` → sub-task 5: **ganti import di semua
  halaman: `api` → `localApi`** (6 halaman di app/(app): dashboard, katalog,
  produk, tambah, penjualan, nota + `lib/session.ts` yang dynamic-import
  `@/lib/api` utk login → ganti `@/lib/localApi`). Setelah itu sub-task 7:
  grep `fetch(`, `API_BASE`, `NEXT_PUBLIC_API_URL` → hapus `lib/api.ts` &
  env yang tak terpakai. Catatan utk sesi baru: `lib/api.ts` TIDAK boleh
  dihapus sebelum sub-task 5 selesai (masih diimport halaman). Keputusan
  behavior yang disengaja: low-stock = stock<=stock_min (bukan <10 hardcoded);
  oversell di-clamp 0 (sama dgn backend lama); subtotal sale direkomputasi.
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
