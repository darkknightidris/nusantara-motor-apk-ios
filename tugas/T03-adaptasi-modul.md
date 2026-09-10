# T03 — Adaptasi Modul UI + xlsx/pdf

Status: ⬜ belum mulai

## Tujuan
Semua modul (sesuai jawaban #1) berfungsi penuh di WebView tanpa jaringan.

## Langkah
- [ ] Login: pakai `localApi.login` (hash lokal); simpan session
      (pola `useSyncExternalStore` PWA dipertahankan)
- [ ] Dashboard: angka dari DB lokal
- [ ] Katalog: CRUD + low-stock + **export xlsx (SheetJS)** +
      **export PDF (jsPDF)** + **import xlsx (SheetJS parse)**
- [ ] Penjualan: CRUD + item + **export xlsx**
- [ ] Keuangan (jika full-set): CRUD hutang/piutang + payments +
      summary + **export xlsx**
- [ ] Panduan (jika full-set): CRUD kegunaan per produk
- [ ] Profil (jika full-set)
- [ ] Users (jika full-set, khusus owner): CRUD user + reset password
      (hash lokal)
- [ ] Attachment: pick file via Filesystem → simpan → tampilkan via path lokal;
      hapus = hapus file + baris DB
- [ ] Hasil export: tulis ke Filesystem → `Share` (bagikan ke app lain)
      atau simpan di folder yang bisa diakses
- [ ] Ganti `OnlineStatus` (PWA) → indikator "OFFLINE / LOKAL" statis

## Acceptance
Setiap modul: CRUD persisten; export xlsx/pdf berhasil & bisa dibuka;
import xlsx PWA-lama berhasil; attachment bisa di-attach & dilihat.

## Catatan
- SheetJS di WebView: bundle via import biasa (tidak perlu CDN).
- Jika `<input type=file>` bermasalah di WebView → pakai Filesystem picker.
