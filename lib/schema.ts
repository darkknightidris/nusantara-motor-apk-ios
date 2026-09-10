// Skema DB lokal (SQLite) — Nusantara Company APK full offline.
// Sumber kebenaran: 04-SCHEMA-DB.md (dipetakan dari lib/types.ts PWA,
// yang dipetakan dari backend lama FastAPI + Supabase Postgres).
//
// File ini sengaja murni data (tanpa import, tanpa dependensi Capacitor)
// agar DDL-nya bisa diverifikasi di lingkungan non-native (node:sqlite).
// Lihat: scripts/verify-schema.mjs
//
// Strategi migrasi (04-SCHEMA-DB.md): semua DDL bersifat
// `IF NOT EXISTS`; versi skema dilacak di tabel `meta` (key='db_version').

/** Versi skema. Naikkan saat ada perubahan struktur; upgrade di lib/db.ts. */
export const DB_VERSION = 1;

/** Nama database (file di app data dir, dblocation default). */
export const DB_NAME = "nusantara";

/** Urutan DDL: tabel dulu (users … meta), lalu indeks. Idempoten. */
export const SCHEMA_DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'kasir')),
    created_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT,
    brand TEXT,
    unit TEXT NOT NULL,
    qty_per_box INTEGER NOT NULL,
    price_modal_pcs REAL,
    price_modal_box REAL,
    price_grosir_pcs REAL,
    price_grosir_box REAL,
    price_eceran_pcs REAL,
    price_eceran_box REAL,
    stock INTEGER NOT NULL DEFAULT 0,
    stock_min INTEGER NOT NULL DEFAULT 0,
    kelebihan TEXT,
    notes TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_contact TEXT,
    notes TEXT,
    total_amount REAL NOT NULL,
    created_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS sale_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT NOT NULL REFERENCES sales (id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    product_name TEXT,
    qty INTEGER NOT NULL,
    price_type TEXT NOT NULL CHECK (price_type IN ('modal', 'grosir', 'eceran')),
    unit_price REAL NOT NULL,
    subtotal REAL NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('hutang', 'piutang')),
    party_name TEXT NOT NULL,
    party_contact TEXT,
    description TEXT,
    total_amount REAL,
    paid_amount REAL NOT NULL DEFAULT 0,
    status TEXT CHECK (status IN ('lunas', 'belum_lunas')),
    due_date TEXT,
    notes TEXT,
    created_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL REFERENCES transactions (id) ON DELETE CASCADE,
    amount REAL NOT NULL,
    notes TEXT,
    paid_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS guides (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    vehicle_brand TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    vehicle_year TEXT,
    vehicle_cc TEXT,
    notes TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    transaction_id TEXT,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    uploaded_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
  )`,
  // Indeks (akses yang dipakai UI: cari nama, filter kategori/brand,
  // join item penjualan, filter transaksi, riwayat pembayaran, guides).
  `CREATE INDEX IF NOT EXISTS idx_products_name ON products (name)`,
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products (category)`,
  `CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand)`,
  `CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items (sale_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items (product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type)`,
  `CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions (status)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_txn ON payments (transaction_id)`,
  `CREATE INDEX IF NOT EXISTS idx_guides_product ON guides (product_id)`,
];

/** Nama tabel yang diharapkan (untuk verifikasi). */
export const EXPECTED_TABLES: string[] = [
  "users",
  "products",
  "sales",
  "sale_items",
  "transactions",
  "payments",
  "guides",
  "attachments",
  "meta",
];
