# T05 — Build & Uji (Android SDK + Gradle)

Status: ⬜ belum mulai

## Tujuan
APK debug ter-install di HP dan lulus uji manual.

## Langkah
- [ ] Download Android cmdline-tools (zip) → `C:\Android\cmdline-tools`
- [ ] `sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"`
      (versi final mengikuti kebutuhan AGP Capacitor 7)
- [ ] Set `ANDROID_HOME` (user env) — script .ps1, non-interaktif
- [ ] Terima license: `sdkmanager --licenses` (pipe `y`)
- [ ] `npx next build` (final)
- [ ] `npx cap sync android`
- [ ] `cd android && .\gradlew.bat assembleDebug` (wrapper auto-download)
      — output log ke file (jangan ke konteks)
- [ ] APK → `build\apk\debug\app-debug.apk`
- [ ] Install ke HP pengguna (ADB atau salin file)
- [ ] Uji manual (checklist):
      - [ ] Install & launch
      - [ ] Login (default & user kasir)
      - [ ] CRUD produk + stok menipis muncul di dashboard
      - [ ] Transaksi penjualan → stok berkurang + total benar
      - [ ] Export xlsx & pdf → terbuka
      - [ ] Import xlsx → data masuk
      - [ ] Keuangan: tambah hutang/piutang + pembayaran → status berubah
      - [ ] Panduan: tambah/lihat per produk
      - [ ] Users: tambah kasir (khusus owner)
      - [ ] Backup → restore
      - [ ] Tutup app → buka lagi → data persisten
      - [ ] Matikan WiFi/HP offline → semua berfungsi
- [ ] Bug → perbaiki → build ulang → catat di `07-EROR.md`

## Acceptance
Semua checklist uji lolos; APK debug stabil.

## Catatan
- Build panjang → jalan background + log ke file; cek berkala.
- JDK 21 tersedia (memenuhi AGP 8.x).
