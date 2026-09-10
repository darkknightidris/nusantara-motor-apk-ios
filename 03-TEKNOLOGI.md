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

## Tooling Vixz (harness)
- 9 tool: read_file, write_file, edit_file, grep_search, file_glob_search,
  exec_shell_command (cmd), get_info, get_datetime, read_media — semua terverifikasi.
- Browser publik interaktif: `bu.exe` (browser-use) di
  `C:\Users\idris\AppData\Local\hermes\bin\` — pola: launch Chrome profil
  khusus (port CDP 9222) → set `BU_CDP_WS` → warmup call → eksekusi Python.
  Sudah terbukti buka google.com & hackerone.com (sesi 1).
- Hermes TUI (v0.21.1): 20 tools + 54 skills — tersedia sebagai eksekutor
  alternatif (delegation, kanban, image_gen, dsb.).
- Jendela konteks: 150.016 token (llama-server `-c 150016`,
  Qwen3.8-27B Q3_K_L, Vulkan).

## Estimasi (dari sesi 1)
- Total token proyek: ±150rb–250rb (kumulatif).
- Wall-clock: 3–5 jam (kasus buruk ±1 hari).
- Sesi: 2–3 (checkpoint per fase).
