# STATE — Source of Truth

Update: 2026-09-11 (sesi 6)
**Posisi sekarang: FASE 3 (T03 adaptasi modul) — app-blank FIXED & terverifikasi di :3100**.
- Bug "app blank" (app :3100 tampil blank di browser) SELESAI: akar = `RequireAuth` di `app/(app)/layout.tsx` membungkus SEMUA halaman termasuk `/login` → guard render `null` → blank, dan `/login` pun blank (tak bisa login). Fix: `/login` jadi rute PUBLIK (`app/login/`) + `Shell` komponen bersama; group `(app)` = dashboard/katalog/penjualan/keuangan/panduan/profil/users (di-guard). Commit `1bf8685`.
- Sisa T03: `lib/backup.ts` (backup/restore) + verifikasi end-to-end (login → dashboard) di browser + build final.
Log sesi ini: diagnosis app-blank + restructure auth (lihat `06-LOG-SESI.md`).

## Checklist Fase

| # | Fase | Status | Detail |
|---|------|--------|--------|
| 0 | Spesifikasi & keputusan | ✅ | 7/7 terjawab & dikunci (lihat `01-SPEK.md`) |
| 1 | Scaffolding + Capacitor | ✅ | Acceptance tercapai: `next build` → `out/`, `android/` ter-generate, 3 plugin (sqlite 8.1.1, filesystem 8.1.3, share 8.0.1) + core/android/cli, `cap sync` OK, commit ada (lihat `tugas/T01-scaffolding.md`) |
| 2 | Lapisan DB lokal (SQLite) | 🟡 | sub-task 1–7/8 ✅ (init DB+DDL 30/30 PASS; seed mastaufiq/admin owner; hash 20/20 PASS; localApi lengkap + logika bisnis; 6 halaman + session.ts import `localApi` via alias; `lib/api.ts` dihapus, 0 sisa fetch/API_BASE, tsc bersih, build OK 12 halaman) — sub-task 8 uji runtime → FASE 5 (T05)
| 3 | Adaptasi modul UI + xlsx/pdf | 🔄 | `tugas/T03-adaptasi-modul.md` — done: closeDb (db.ts), localApi.listGuides, desain backup/restore final (JSON bundle). Sisa: lib/backup.ts + 6 halaman (keuangan x3, panduan, profil, users) + BottomNav 5 item + OnlineStatus OFFLINE/LOKAL + komentar login |
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

- FASE 3 (T03) — BERJALAN. Sisa (urutan):
  1. `lib/backup.ts` (baru, BELUM dibuat): `backupNow()` = dump 9 tabel (qAll
     per tabel) + attachment (Filesystem.readFile → base64) → JSON bundle
     {app:"nusantara-company", db_version, exported_at, tables, attachments[]}
     → Filesystem writeFile ke Documents `nm-backup-<stamp>.json` →
     Share.share (uri via Capacitor.convertFileSrc). `restoreFrom(file)` =
     validasi app + db_version≤DB_VERSION → closeDb() → ensureDb() → tx:
     DELETE order FK-safe [sale_items, payments, guides, attachments, sales,
     transactions, users, products, meta] lalu INSERT reverse [products,
     users, sales, transactions, guides, sale_items, payments, attachments,
     meta] (kolom dinamis dari kunci objek baris) → tulis ulang file
     attachment dari base64.
  2. Enam halaman baru (gaya PWA: Card/Badge/Loading/ErrorState/EmptyState,
     formatRupiah, import `{ localApi as api, ApiError }`; halaman detail
     pakai Suspense + `?id=` — pola ada di `penjualan/nota/page.tsx`):
     - `app/(app)/keuangan/page.tsx`: tab hutang/piutang; filter status
       semua/belum_lunas/lunas/jatuh_tempo (jatuh_tempo = filter client:
       due_date<=hari_ini && belum_lunas); cari party; summary
       getTransactionSummary; exportTransactionsExcel; Tambah→/keuangan/tambah;
       kartu→/keuangan/detail?id=
     - `app/(app)/keuangan/tambah/page.tsx`: form createTransaction (type,
       party_name, party_contact, total_amount>0, due_date, description, notes)
     - `app/(app)/keuangan/detail/page.tsx`: getTransactionDetail + form
       payTransaction (max=sisa) + riwayat payments + attachment
       (listAttachments/uploadAttachment via <input type=file>/deleteAttachment)
       + deleteTransaction (owner)
     - `app/(app)/panduan/page.tsx`: api.listGuides() (method baru, sudah ada)
       → kartu per guide + link /katalog/produk?id=
     - `app/(app)/profil/page.tsx`: info user (username/role), kartu app +
       OFFLINE/LOKAL, backup/restore (lib/backup.ts), link Users (owner),
       logout
     - `app/(app)/users/page.tsx`: guard owner (role≠owner → kartu terlarang);
       listUsers/createUser/updateUser(role|password)/deleteUser; role hanya
       owner|kasir (skema baru TIDAK punya role finance)
  3. `components/layout/BottomNav.tsx`: 5 item → Beranda /dashboard, Katalog
     /katalog, Jual /penjualan, Keuangan /keuangan, Profil /profil
     (menggantikan Akun→/login)
  4. `components/pwa/OnlineStatus.tsx`: ganti jadi banner statis
     "OFFLINE / LOKAL — semua data tersimpan di perangkat ini"
  5. `app/(app)/login/page.tsx`: fix komentar header (FastAPI→hash lokal)
  6. Verifikasi: tsc + next build + grep; lalu lanjut T04.
- T04 RESCOPE: backup/restore diimplementasikan di T03 (desain di atas) →
  T04 = seeded DB bake + meta.db_version + uji acceptance.
- Dev server: batch `C:\temp\nusantara_dev.cmd` (next dev -p 3100, log
  `C:\temp\nusantara_dev.log`). PERINGATAN: port 3000 = server project PWA
  LAMA (bukan repo ini) — cek app kita di :3100.
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
