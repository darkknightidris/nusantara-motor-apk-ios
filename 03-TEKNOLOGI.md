# 03 — Teknologi

## Stack Lama (rujukan, diaudit sesi 1)
| Project | Teknologi |
|---|---|
| `nusantara-motor` (web) | FastAPI (Python) + JWT HS256 + **Supabase Postgres**; Next.js 16.2.7 + React 19 + Tailwind 4 + TS |
| `nusantara-motor-pwa` | Next.js 16.3.4 + React 19.2.8 + Tailwind 4 + TS; static export; sw.js (cache-first) |

## Stack Target (APK full offline)
| Komponen | Teknologi | Catatan |
|---|---|---|
| Wrapper native | **Capacitor 7** | APK Android, WebView, load assets dari bundle |
| DB lokal | **@capacitor-community/sqlite** | SQLite di app data dir |
| File & share | **@capacitor/filesystem** + **@capacitor/share** | attachment + hasil export |
| Excel | **SheetJS (xlsx)** | export/import di klien (ganti openpyxl) |
| PDF | **jsPDF** | export katalog harga (ganti reportlab) |
| UI | Salinan `nusantara-motor-pwa` (Next 16 static export + React 19 + Tailwind 4) | Tampilan identik dengan yang dikenali klien |
| Hash password | SHA-256 + salt (WebCrypto / npm `crypto-js`) | Auth lokal |
| Lapisan API | `lib/db.ts` + `lib/localApi.ts` (signature sama dengan `lib/api.ts` lama) | Halaman UI nyaris tidak berubah |

## Environment (dicek 2026-09-10)
| Tool | Versi/Status |
|---|---|
| Node.js | ✅ v24.15.0 (2 instalasi: Program Files & hermes\node — pin ke Program Files) |
| npm | ✅ |
| JDK | ✅ 21.0.9 (`C:\JAVA`) |
| keytool | ✅ `C:\JAVA\bin\keytool.exe` (untuk keystore fase 6) |
| git | ✅ |
| Python | ✅ 3.13 |
| curl | ✅ (System32) |
| PowerShell | ✅ (untuk script kompleks — cmd tidak mendukung heredoc) |
| Chromium/Chrome | ✅ `C:\Program Files\Google\Chrome\Application\chrome.exe` (untuk browser-use) |
| VS Code | ✅ di PATH |
| **Android SDK** | ❌ belum ada → install cmdline-tools + `sdkmanager` di fase 5 (non-interaktif) |
| **Keystore** | ❌ dibuat di fase 6 via keytool |
