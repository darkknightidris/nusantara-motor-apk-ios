# T06 — Rilis, Signing & Serah Terima

Status: ⬜ belum mulai

## Tujuan
APK release signed + dokumentasi; siap dipakai klien.

## Langkah
- [ ] Keystore: `keytool -genkeypair -v -keystore nusantara-motor.keystore
      -alias nusantaramotor -keyalg RSA -keysize 2048 -validity 10000`
      (store/key password dicatat di file aman di luar repo)
- [ ] `gradlew.bat assembleRelease` + signing config di `android/app/build.gradle`
- [ ] Verifikasi signature APK (keytool/adb)
- [ ] Dokumentasi singkat (file `DOKUMENTASI.md`):
      - cara install (enable unknown sources)
      - akun default + cara ganti password
      - cara backup/restore
      - FAQ (data per perangkat, tanpa sync)
- [ ] Serah terima: file APK release + DOKUMENTASI.md + keystore info
- [ ] Update `STATE.md`: FASE SELESAI; entry final `06-LOG-SESI.md`

## Acceptance
APK release ter-install & berfungsi; dokumentasi lengkap; keystore aman.
