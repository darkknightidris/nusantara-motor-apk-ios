# 01 — Spesifikasi

## Tujuan
Aplikasi Android APK full offline untuk internal Nusantara Company:
- Bisa di-install seperti APK biasa (bukan PWA/add-to-home-screen).
- Tampilan & fitur mirip web lama + PWA yang sudah dibangun.
- **Full offline**: semua data & logika di perangkat; tanpa internet;
  tanpa cloud/SaaS; tanpa database cloud, tanpa auth provider, tanpa signup.

## Keputusan Spesifik (sudah dijawab pengguna — KUNCI, jangan berubah)
| # | Item | Jawaban |
|---|------|---------|
| 1 | Cakupan modul | **Full semua modul lama** (dashboard, katalog, penjualan, keuangan, panduan, profil, users) dengan **layout ala PWA/mobile** |
| 2 | Seeding data | **A+B**: file DB ter-seed di-bake ke APK (data lama langsung ada saat install) + menu import xlsx tetap tersedia di UI |
| 4 | Signing APK | **debug dulu** untuk iterasi pengujian; **release + keystore klien** di fase 6 untuk versi final |
| 3 | Akun awal | username **`mastaufiq`**, password **`admin`**, role `owner` |
| 5 | Nama & ikon app | **`Nusantara Company`** (ikon pakai aset PWA yang ada) |
| 6 | Backup/restore | **Ya, disetujui** — awalnya 1 tablet, nanti akan dipakai banyak karyawan |
| 7 | Multi-perangkat | **Full offline dulu** (1 tablet). Sinkronisasi antar perangkat = fase NANTINYA (belum sekarang) |

## Sumber Rujukan (sudah diaudit sesi 1)
- Web asli: `C:\Users\idris\nusantara-motor`
  - Backend: FastAPI + JWT + **Supabase (Postgres cloud)** ← akan dihapus
  - Frontend: Next.js 16.2.7 + React 19 + Tailwind 4 + TS
- PWA: `C:\Users\idris\nusantara-motor-pwa`
  - Next.js 16.3.4 + React 19.2.8 + Tailwind 4, static export terbukti
  - Session: `useSyncExternalStore` + localStorage

## Cakupan Modul (full — layout mobile)
1. Login (auth lokal)
2. Dashboard (penjualan hari ini, sisa stok, stok menipis)
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
- Build: Node 24 + JDK 21 + Gradle wrapper + Android SDK.

## Status Pertanyaan
**7/7 terjawab & dikunci** (lihat tabel "Keputusan Spesifik" di atas).
