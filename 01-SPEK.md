# 01 — Spesifikasi

## Tujuan
Aplikasi Android APK full offline untuk internal Nusantara Motor:
- Bisa di-install seperti APK biasa (bukan PWA/add-to-home-screen).
- Tampilan & fitur mirip web lama + PWA yang sudah dibangun.
- **Full offline**: semua data & logika di perangkat; tanpa internet;
  tanpa cloud/SaaS; tanpa database cloud; tanpa auth provider; tanpa signup.

## Sumber Rujukan (sudah diaudit sesi 1)
- Web asli: `C:\Users\idris\nusantara-motor`
  - Backend: FastAPI + JWT + **Supabase (Postgres cloud)** ← akan dihapus
  - Frontend: Next.js 16.2.7 + React 19 + Tailwind 4 + TS
  - Modul: login, dashboard, katalog, penjualan, keuangan, panduan, profil, users
- PWA: `C:\Users\idris\nusantara-motor-pwa`
  - Next.js 16.3.4 + React 19.2.8 + Tailwind 4, static export terbukti
    (`export-marker.json` ada di `.next`)
  - Modul: login, dashboard, katalog, penjualan (subset)
  - Session: `useSyncExternalStore` + localStorage

## Cakupan Modul (baseline = modul web lama)
1. Login (auth lokal)
2. Dashboard (ringkasan: penjualan hari ini, sisa stok, stok menipis)
3. Katalog (CRUD produk, kategori, brand, harga modal/grosir/eceran per pcs/box,
   low-stock, export xlsx/pdf, import xlsx)
4. Penjualan (CRUD transaksi + item, export xlsx)
5. Keuangan (hutang/piutang, payments, status lunas/belum_lunas, summary)
6. Panduan (kegunaan kendaraan per produk)
7. Profil
8. Users (kelola user, khusus owner)

## Constraint
- Runtime: 0 ketergantungan jaringan/cloud.
- Download pihak ketiga hanya build-time: npm, Gradle, Android SDK
  (semua tanpa akun/signup).
- Eksekusi build: Node 24 + JDK 21 + Gradle wrapper + Android SDK.

## Pertanyaan Terbuka (MENUNGGU JAWABAN PENGGUNA)
1. **Cakupan modul**: subset ala PWA (dashboard, katalog, penjualan)
   atau full-set ala web lama (+ keuangan, panduan, profil, users)?
2. **Seeding data**: (a) embed file DB ter-seed di APK, atau
   (b) import xlsx saat first-run?
3. **Akun default**: username/password admin awal?
4. **Tanda tangan APK**: debug dulu untuk uji, atau langsung
   release + keystore klien?
5. **Nama & ikon app**: sama dengan PWA ("Nusantara") atau nama lain?
6. **Backup data**: setujui fitur export/import file database
   (perpindahan antar perangkat)?
7. **Multi-perangkat**: konfirmasi tiap perangkat punya DB sendiri
   (tanpa sync antar HP) — konsekuensi logis full offline?

## Asumsi (bisa dibatalkan pengguna)
- Ikon: pakai ikon PWA yang ada (`public/icons/`).
- Default akun: `admin` / `admin123` (role owner), bisa diganti di modul Users.
- Seeding: opsi (a) diutamakan (file DB ter-seed dari data Supabase lama),
  ditambah fitur import xlsx sebagai fallback.
- Signing: debug dulu, release setelah uji manual OK.
- Backup: fitur export/import file DB disertakan.
- Multi-perangkat: DB independen per perangkat (tanpa sync).
