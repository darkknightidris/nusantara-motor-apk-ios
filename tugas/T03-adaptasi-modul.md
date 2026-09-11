# T03 — Adaptasi Modul UI + xlsx/pdf

Status: ✅ SELESAI (commit `1bf8685` + sesi ini: E2E browser + build final)

## Tujuan
Semua modul (sesuai jawaban #1) berfungsi penuh di WebView tanpa jaringan.

## Langkah
- [x] Login: pakai `localApi.login` (hash lokal); simpan session
      (pola `useSyncExternalStore` PWA dipertahankan)
- [x] Dashboard: angka dari DB lokal
- [x] Katalog: CRUD + low-stock + **export xlsx (SheetJS)** +
      **export PDF (jsPDF)** + **import xlsx (SheetJS parse)**
- [x] Penjualan: CRUD + item + **export xlsx**
- [x] Keuangan (jika full-set): CRUD hutang/piutang + payments +
      summary + **export xlsx**
- [x] Panduan (jika full-set): CRUD kegunaan per produk
- [x] Profil (jika full-set)
- [x] Users (jika full-set, khusus owner): CRUD user + reset password
      (hash lokal)
- [x] Attachment: pick file via Filesystem → simpan → tampilkan via path lokal;
      hapus = hapus file + baris DB
- [x] Hasil export: tulis ke Filesystem → `Share` (bagikan ke app lain)
      atau simpan di folder yang bisa diakses
- [x] Ganti `OnlineStatus` (PWA) → indikator "OFFLINE / LOKAL" statis

## Verifikasi (sesi ini — E2E di browser :3100)
- App render di browser desktop: `/login` form (Username/Password/Masuk),
  banner "OFFLINE / LOKAL", nav 5 item (Beranda/Katalog/Jual/Keuangan/Profil).
- Semua rute group `(app)` redirect ke `/login` saat belum sesi (requireAuth
  bekerja): `/dashboard`, `/keuangan`, `/panduan`, `/profil`, `/users` →
  `/login` (200, shell + nav tampil).
- `next build` → `out/` 18 rute (dashboard, katalog, produk, tambah,
  keuangan x3, penjualan, nota, panduan, profil, users, login, not-found).
- `tsc --noEmit` bersih.
- **Catatan arsitektur (PENTING):** app = native Android/Capacitor. Lapisan
  data (SQLite native) hanya jalan di dalam APK. Di browser desktop hanya
  UI shell yang bisa diverifikasi; data (login sukses, dashboard, dsb.)
  butuh lingkungan Android native. Lihat 06-LOG-SESI + 07-EROR.

## Acceptance
Setiap modul: CRUD persisten; export xlsx/pdf berhasil & bisa dibuka;
import xlsx PWA-lama berhasil; attachment bisa di-attach & dilihat.

## Catatan
- SheetJS di WebView: bundle via import biasa (tidak perlu CDN).
- Jika `<input type=file>` bermasalah di WebView → pakai Filesystem picker.
