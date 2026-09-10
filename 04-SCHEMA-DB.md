# 04 — Skema DB Lokal (SQLite)

Draft berdasarkan `lib/types.ts` PWA (yang dipetakan dari backend lama).
Verifikasi akhir dilakukan di fase 2 (T02).

## users
| Kolom | Tipe | Catatan |
|---|---|---|
| id | TEXT PK | uuid |
| username | TEXT UNIQUE NOT NULL | |
| password_hash | TEXT NOT NULL | SHA-256(salt + password) |
| salt | TEXT NOT NULL | |
| role | TEXT NOT NULL | `owner` \| `kasir` |
| created_at | TEXT | ISO |

## products
| Kolom | Tipe | Catatan |
|---|---|---|
| id | TEXT PK | |
| name | TEXT NOT NULL | |
| sku | TEXT NULL | |
| category | TEXT NULL | |
| brand | TEXT NULL | |
| unit | TEXT NOT NULL | |
| qty_per_box | INTEGER NOT NULL | |
| price_modal_pcs / price_modal_box | INTEGER/REAL | |
| price_grosir_pcs / price_grosir_box | INTEGER/REAL | |
| price_eceran_pcs / price_eceran_box | INTEGER/REAL | |
| stock | INTEGER NOT NULL | |
| stock_min | INTEGER NOT NULL | ambang low-stock |
| kelebihan | TEXT NULL | |
| notes | TEXT NULL | |

## sales
| Kolom | Tipe | Catatan |
|---|---|---|
| id | TEXT PK | |
| customer_name | TEXT NULL | |
| customer_contact | TEXT NULL | |
| notes | TEXT NULL | |
| total_amount | REAL NOT NULL | |
| created_at | TEXT | ISO |

## sale_items
| Kolom | Tipe | Catatan |
|---|---|---|
| id | TEXT PK | |
| sale_id | TEXT FK→sales.id | |
| product_id | TEXT FK→products.id | |
| product_name | TEXT | denormalisasi |
| qty | INTEGER | |
| price_type | TEXT | `modal` \| `grosir` \| `eceran` |
| unit_price | REAL | |
| subtotal | REAL | |

## transactions
| Kolom | Tipe | Catatan |
|---|---|---|
| id | TEXT PK | |
| type | TEXT | `hutang` \| `piutang` |
| party_name | TEXT NOT NULL | |
| party_contact | TEXT NULL | |
| description | TEXT NULL | |
| total_amount | REAL | |
| paid_amount | REAL DEFAULT 0 | |
| status | TEXT | `lunas` \| `belum_lunas` (di-derive dari paid/total) |
| due_date | TEXT NULL | |
| notes | TEXT NULL | |
| created_at | TEXT | |

## payments
| Kolom | Tipe | Catatan |
|---|---|---|
| id | TEXT PK | |
| transaction_id | TEXT FK | |
| amount | REAL | |
| notes | TEXT NULL | |
| paid_at | TEXT | |

## guides (panduan kegunaan kendaraan per produk)
| Kolom | Tipe | Catatan |
|---|---|---|
| id | TEXT PK | |
| product_id | TEXT FK | |
| vehicle_brand | TEXT | |
| vehicle_model | TEXT | |
| vehicle_year | TEXT NULL | |
| vehicle_cc | TEXT NULL | |
| notes | TEXT NULL | |

## attachments
| Kolom | Tipe | Catatan |
|---|---|---|
| id | TEXT PK | |
| transaction_id | TEXT FK | (juga sale_id bila perlu) |
| file_name | TEXT | |
| file_path | TEXT | path lokal Filesystem (bukan URL) |
| file_type | TEXT | mime |
| uploaded_at | TEXT | |

## meta
| Kolom | Tipe | Catatan |
|---|---|---|
| key | TEXT PK | `db_version`, `seeded_at`, dll. |
| value | TEXT | |

## Strategi Migrasi
- `db.ts` menjalankan `CREATE TABLE IF NOT EXISTS` saat init.
- Kolom `meta.db_version` untuk upgrade skema antar versi app.
- Backup = copy file SQLite (+ folder attachments) ke satu file
  (zip) → export/import di UI.
