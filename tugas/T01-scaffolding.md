# T01 — Scaffolding + Capacitor

Status: ⬜ belum mulai

## Tujuan
Project `nusantara-motor-apk-full-offline` siap build sebagai shell Capacitor
yang berisi static export dari PWA.

## Langkah
- [ ] Salin `nusantara-motor-pwa` → isi repo ini (kecuali `node_modules`, `.next`, `node_modules`)
- [ ] Hapus `public/sw.js` + `components/pwa/ServiceWorkerRegister.tsx` (SW tidak diperlukan)
- [ ] `next.config.ts`: pastikan `output: 'export'`
- [ ] `npx cap init "Nusantara" com.nusantaramotor.apk --web-dir=out`
  (web-dir sesuai hasil `next build` export)
- [ ] `npx cap add android`
- [ ] Plugin: `@capacitor/community-sqlite` (atau `@capacitor-community/sqlite`),
      `@capacitor/filesystem`, `@capacitor/share`
- [ ] `npx cap sync android`
- [ ] Smoke: `npx next build` sukses menghasilkan `out/`
- [ ] `git init` + commit pertama (state file ikut)

## Acceptance
`npx next build` sukses; `android/` ter-generate; plugin terpasang;
commit awal ada.

## Catatan
- Nama package/app final menunggu jawaban pertanyaan #5.
- Ikon: pakai `public/icons/` yang ada.
