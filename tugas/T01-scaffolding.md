# T01 — Scaffolding + Capacitor

Status: ✅ SELESAI (2026-09-10, sesi 3)

## Tujuan
Project `nusantara-motor-apk-full-offline` siap build sebagai shell Capacitor
yang berisi static export dari PWA.

## Langkah
- [x] Salin `nusantara-motor-pwa` → isi repo ini (kecuali `node_modules`, `.next`, `node_modules`)
- [x] Hapus `public/sw.js` + `components/pwa/ServiceWorkerRegister.tsx` (SW tidak diperlukan)
- [x] `next.config.ts`: pastikan `output: 'export'`
- [x] `npx cap init "Nusantara Company" com.nusantaramotor.apk --web-dir=out`
      (nama app mengikuti keputusan terkunci #5; T01 asli tertulis "Nusantara" —
      keputusan terkunci yang menang; web-dir = `out` sesuai hasil `next build`)
- [x] `npx cap add android`
- [x] Plugin: `@capacitor-community/sqlite` (8.1.1), `@capacitor/filesystem` (8.1.3),
      `@capacitor/share` (8.0.1) + `@capacitor/core`/`@capacitor/android`/`@capacitor/cli`
- [x] `npx cap sync android`
- [x] Smoke: `npx next build` sukses menghasilkan `out/`
- [x] `git init` + commit (state file ikut)

## Acceptance (tercapai)
- [x] `npx next build` sukses
- [x] `android/` ter-generate
- [x] Plugin terpasang (3 plugin + core/android/cli)
- [x] Commit awal ada

## Catatan Eksekusi (bug yang dijumpai & di-fix — detail di `07-EROR.md` #9–14)
1. Route dinamis `[id]` tidak kompatibel `output: export` → dikonversi ke
   route statis + query string: `/penjualan/nota?id=...` & `/katalog/produk?id=...`
   (`useSearchParams` + wrapper `<Suspense>`); 3 link navigasi di-update.
2. `app/manifest.ts` → tambah `export const dynamic = "force-static"`.
3. Binary SWC native korup dari cache npm → tarball resmi dari registry.
4. `sdkmanager.bat` CLI baru memecah nama paket di `;` → pakai `android.exe`
   (binary asli) / fallback manual zip build-tools (SHA1 terverifikasi).
5. `app/[id]` folder: opsinya wildcard → wajib `-LiteralPath` di PowerShell.

## Catatan
- Nama package/app final menunggu jawaban pertanyaan #5.
- Ikon: pakai `public/icons/` yang ada.
