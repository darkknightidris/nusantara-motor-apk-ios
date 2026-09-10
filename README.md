# Nusantara Motor APK — Full Offline

Aplikasi Android (APK) **full offline** untuk operasional Nusantara Motor:
penjualan, katalog/stok, keuangan (hutang/piutang), panduan kegunaan, profil,
dan manajemen user. **100% data & logika di perangkat** — tanpa internet,
tanpa cloud/SaaS, tanpa database cloud, tanpa authentication provider,
tanpa signup.

Tampilan & fitur = replika dari web lama (`C:\Users\idris\nusantara-motor`)
dan PWA (`C:\Users\idris\nusantara-motor-pwa`), dibungkus **Capacitor +
SQLite lokal**. Terpasang seperti APK biasa.

## Protokol Sesi Baru (WAJIB)

Prompt untuk sesi baru:
> Lanjut project Nusantara Motor APK full offline yg ada di C:\Users\idris\Desktop\nusantara-motor-apk-full-offline, baca state file dulu

Langkah agen di awal sesi:
1. Baca `STATE.md` (posisi + checklist fase).
2. Baca `06-LOG-SESI.md` (entry terakhir) + `07-EROR.md` (jangan ulangi kesalahan yang sudah diperbaiki).
3. Lanjut sub-task berikutnya sesuai file `tugas/T0x-*.md`.
4. Di akhir tiap checkpoint: update `STATE.md` + tambahkan entry di `06-LOG-SESI.md`.

## Peta File

| File | Fungsi |
|---|---|
| `README.md` | Entry point (file ini) |
| `STATE.md` | **Source of truth**: posisi saat ini, checklist fase, keputusan terkunci, next action |
| `01-SPEK.md` | Spesifikasi, constraint, cakupan modul, pertanyaan terbuka |
| `02-ARSITEKTUR.md` | Arsitektur + log keputusan + risiko |
| `03-TEKNOLOGI.md` | Semua teknologi: stack lama, stack target, status environment |
| `04-SCHEMA-DB.md` | Skema SQLite lokal (draft dari types.ts backend) |
| `05-ALUR.md` | Pipeline 6 fase + sub-task |
| `06-LOG-SESI.md` | Log progres lintas sesi |
| `07-EROR.md` | Log error & fix (jangan ulangi) |
| `tugas/T01-scaffolding.md` … `tugas/T06-rilis-serah-terima.md` | Detail tugas per fase |

## Fakta Cepat

- Repo: `C:\Users\idris\Desktop\nusantara-motor-apk-full-offline`
- State: `STATE.md` (source of truth)
- Arsitektur: Capacitor 7 + Next.js static export + SQLite lokal
- Auth: lokal (username + hash SHA-256 + salt), role `owner`/`kasir`
- Build: Node 24 + JDK 21 + Android SDK (di-install fase 5) + Gradle wrapper
- Owner: Mohammad Idris Suropati (klien: Nusantara Motor)
