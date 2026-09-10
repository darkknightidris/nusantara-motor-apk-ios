# 07 — Log Error & Fix

Catat SEMUA error build/eksekusi yang muncul (sebab + fix) agar sesi baru
tidak mengulang kesalahan yang sama.

| # | Tanggal | Error | Penyebab | Fix |
|---|---|---|---|---|
| 1 | 2026-09-10 | `head` tidak dikenal di shell cmd | cmd bukan bash | Ganti pipeline dengan PowerShell / batasi via parameter tool |
| 2 | 2026-09-10 | String PowerShell via `powershell -Command "..."` kehilangan variabel `$x` | Quoting antar-shell | Tulis script `.ps1` lalu `powershell -File` (pola terbukti) |
| 3 | 2026-09-10 | `if exist "C:\Program Files\..."` (path ber-spasi) tidak stabil di cmd | Quoting cmd | Gunakan `Test-Path` di .ps1 |
| 4 | 2026-09-10 | bu.exe: daemon lama tidak pakai `BU_CDP_WS` baru | Daemon persisten | `bu.exe --reload` lalu warmup call |
| 5 | 2026-09-10 | bu.exe: IPC `Page.navigate` timeout 5s saat daemon baru start | Race daemon↔CDP | Warmup call + sleep, lalu eksekusi nyata |
| 6 | 2026-09-10 | Env `BU_CDP_WS` via `set ... && powershell` tidak terwariskan | Propagasi env cmd→PS | Set `$env:` DI DALAM .ps1 |
| 7 | 2026-09-10 | Chrome profil khusus (CDP 9222) kadang mati | Instance terpisah profil | Launch via `Start-Process` + profil `C:\temp\chrome-bu-profile`; cek `/json/version` dulu; bersihkan setelahnya |
| 8 | 2026-09-10 | duckduckgo.com query page → chrome-error (di profil baru) | Kemungkinan blocking/redirect site | Ganti ke host lain (example.com OK); tidak menghambat |
| 9 | 2026-09-10 | STATE.md mengklaim T01 "⏳ berjalan di background" padahal 0 artefak (tak ada log/status di C:\temp, tak ada node_modules, capacitor.config.ts, android/); scaffolding belum ter-commit | Script background sesi 2 tak pernah benar-benar tereksekusi/terpersist; disiplin commit dilanggar | Catat inkonsistensi; commit scaffolding dulu; restart T01 via `C:\temp\nusantara_t01b.ps1` (log `C:\temp\nusantara_t01b.log`, status `C:\temp\nusantara_t01_status.txt`); verifikasi artefak per langkah; TIDAK boleh klaim "berjalan" tanpa artefak |
| 10 | 2026-09-10 | `next build`: `@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node is not a valid Win32 application`; reinstall `npm i --no-save` tak mempan (file hasil install identik rusak) | Tarball di cache npm korup (header PE valid 4D 5A + machine x64, tapi isi file rusak) | Download tarball resmi langsung dari registry.npmjs.org → ekstrak → `node -e require()` OK (60 keys) → salin ke node_modules; asuransi di script T01b: setelah `npm install` selalu tes load SWC, gagal → auto re-copy dari `C:\temp\swc_extract` |
| 11 | 2026-09-10 | `next build` (output:export) gagal: `/penjualan/[id]` & `/katalog/[id]` "missing generateStaticParams()" | output:export tak mendukung route dinamis `[id]`; data runtime-lokal tak bisa di-list saat build | Konversi ke route statis + query string: `/penjualan/nota?id=...` & `/katalog/produk?id=...` (`useSearchParams` + wrapper `<Suspense>`); update 3 link (list katalog, list penjualan, push pasca-transaksi) |
| 12 | 2026-09-10 | `move`/`dir` (cmd) dan Move-Item/Test-Path (PS) tak menemukan folder bernama `[id]` | cmd & PowerShell memperlakukan `[id]` sebagai wildcard (karakter i|d), bukan nama literal | Operasi file via .ps1 dengan `-LiteralPath` / `[System.IO.File]`; hindari `powershell -Command "..."` (quoting) — selalu `powershell -File` |
| 13 | 2026-09-10 | `next build` type check gagal: `.next/dev/types/validator.ts` merujuk route `[id]` lama (residu `next dev` sebelumnya) | Direktori `.next` tak dibersihkan sebelum build ulang | Tambah langkah di script T01b: hapus `.next` sebelum `next build` |
| 14 | 2026-09-10 | (a) `next build`: route `/manifest.webmanifest` butuh `force-static` di output:export; (b) `android.exe` crash (0xC0000409) saat dijalankan via `Start-Process -WindowStyle Hidden` (tanpa console) | (a) webmanifest = route handler, wajib statis saat export; (b) crash native binary tanpa console (fastfail) | (a) `export const dynamic = "force-static"` di `app/manifest.ts`; (b) fallback manual: download zip resmi build-tools (SHA1 terverifikasi) → extract → `build-tools\35.0.0` |
