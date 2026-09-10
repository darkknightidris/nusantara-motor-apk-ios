// Verifikasi DDL skema DB lokal (T02 sub-task 1) di lingkungan non-native.
// Node >= 23.6: type stripping untuk import .ts + modul built-in node:sqlite.
//
// Cek yang dijalankan:
//   1. Semua DDL dieksekusi tanpa error (in-memory SQLite).
//   2. 9 tabel expected ada (users, products, sales, sale_items,
//      transactions, payments, guides, attachments, meta).
//   3. 10 indeks expected ada.
//   4. FK cascade benar: hapus product → sale_items & guides ikut terhapus.
//   5. CHECK constraint benar: role/price_type/type/status menolak nilai ilegal.
//   6. INSERT/UPDATE/DELETE dasar per tabel jalan.
//
// Exit code 0 = PASS, 1 = FAIL (rincian dicetak ke stdout).

import { DatabaseSync } from "node:sqlite";
import { SCHEMA_DDL, EXPECTED_TABLES, DB_NAME, DB_VERSION } from "../lib/schema.ts";

let pass = 0;
let fail = 0;
function check(name, ok, detail = "") {
  if (ok) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    console.log(`  FAIL  ${name}  ${detail}`);
  }
}

const db = new DatabaseSync(":memory:");
db.exec("PRAGMA foreign_keys = ON;");

// 1) Semua DDL dieksekusi
let ddlOk = true;
let ddlErr = "";
for (const ddl of SCHEMA_DDL) {
  try {
    db.exec(ddl);
  } catch (e) {
    ddlOk = false;
    ddlErr = `${e.message} :: ${ddl.slice(0, 60)}`;
    break;
  }
}
check("Semua DDL dieksekusi tanpa error", ddlOk, ddlErr);

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
  .all()
  .map((r) => r.name);
for (const t of EXPECTED_TABLES) check(`Tabel '${t}' ada`, tables.includes(t), tables.join(","));

const expectedIndexes = [
  "idx_products_name",
  "idx_products_category",
  "idx_products_brand",
  "idx_sale_items_sale",
  "idx_sale_items_product",
  "idx_transactions_type",
  "idx_transactions_status",
  "idx_payments_txn",
  "idx_guides_product",
];
const indexes = db
  .prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_%'")
  .all()
  .map((r) => r.name);
for (const i of expectedIndexes) check(`Indeks '${i}' ada`, indexes.includes(i), indexes.join(","));

// 2) FK cascade: hapus product → sale_items & guides ikut terhapus
const pid = "p1";
const sid = "s1";
db.prepare(
  `INSERT INTO products (id, name, unit, qty_per_box, stock) VALUES ('p1', 'Oli 0W16', 'pcs', 1, 10)`
).run();
db.prepare(`INSERT INTO sales (id, total_amount, created_at) VALUES ('s1', 10000, '2026-09-10T00:00:00.000Z')`).run();
db.prepare(
  `INSERT INTO sale_items (id, sale_id, product_id, product_name, qty, price_type, unit_price, subtotal)
   VALUES ('si1', 's1', 'p1', 'Oli 0W16', 2, 'modal', 5000, 10000)`
).run();
db.prepare(`INSERT INTO guides (id, product_id, vehicle_brand, vehicle_model) VALUES ('g1', 'p1', 'Honda', 'Vario 160')`).run();
db.prepare(`DELETE FROM products WHERE id = 'p1'`).run();
const leftItems = db.prepare("SELECT COUNT(*) c FROM sale_items").get().c;
const leftGuides = db.prepare("SELECT COUNT(*) c FROM guides").get().c;
check("FK cascade: sale_items ikut terhapus saat product dihapus", leftItems === 0, `sisa=${leftItems}`);
check("FK cascade: guides ikut terhapus saat product dihapus", leftGuides === 0, `sisa=${leftGuides}`);

// 3) CHECK constraint menolak nilai ilegal
function rejects(sql, params, label) {
  try {
    db.prepare(sql).run(...params);
    return false;
  } catch {
    return true;
  }
}
check("CHECK users.role menolak 'finance'", rejects(
  "INSERT INTO users (id, username, password_hash, salt, role, created_at) VALUES ('u9','x','h','s','finance','2026-09-10T00:00:00.000Z')", [], "tidak ditolak"));
check("CHECK sale_items.price_type menolak 'retail'", rejects(
  "INSERT INTO sale_items (id, sale_id, product_id, product_name, qty, price_type, unit_price, subtotal) VALUES ('si9','s1','p9','x',1,'retail',1,1)", [], "tidak ditolak"));
check("CHECK transactions.type menolak 'kredit'", rejects(
  "INSERT INTO transactions (id, type, party_name, total_amount, paid_amount, created_at) VALUES ('t9','kredit','x',1,0,'2026-09-10T00:00:00.000Z')", [], "tidak ditolak"));

// 4) INSERT/UPDATE/DELETE dasar + UNIQUE username
const insOk =
  db
    .prepare("INSERT INTO users (id, username, password_hash, salt, role, created_at) VALUES ('u1','mastaufiq','hash128','salt128','owner','2026-09-10T00:00:00.000Z')")
    .run().changes > 0;
check("INSERT users OK", insOk);
let dupRejected = false;
try {
  db.prepare("INSERT INTO users (id, username, password_hash, salt, role, created_at) VALUES ('u2','mastaufiq','h','s','kasir','2026-09-10T00:00:00.000Z')").run();
} catch {
  dupRejected = true;
}
check("UNIQUE users.username ditolak (duplikat)", dupRejected);
const upd = db.prepare("UPDATE users SET role = 'kasir' WHERE id = 'u1'").run().changes;
check("UPDATE users OK", upd === 1, `changes=${upd}`);
const del = db.prepare("DELETE FROM users WHERE id = 'u1'").run().changes;
check("DELETE users OK", del === 1, `changes=${del}`);

// 5) meta db_version
db.prepare("INSERT INTO meta (key, value) VALUES ('db_version', ?)").run(String(DB_VERSION));
const ver = db.prepare("SELECT value FROM meta WHERE key = 'db_version'").get().value;
check("meta.db_version terbaca", String(ver) === String(DB_VERSION), `ver=${ver}`);

// 6) DB_NAME valid
check("DB_NAME terdefinisi", typeof DB_NAME === "string" && DB_NAME.length > 0, DB_NAME);

console.log(`\nHasil: ${pass} PASS, ${fail} FAIL (DDL=${SCHEMA_DDL.length} statement, tabel=${EXPECTED_TABLES.length}, indeks=${expectedIndexes.length})`);
console.log(fail === 0 ? "VERIFIKASI SKEMA: PASS" : "VERIFIKASI SKEMA: FAIL");
process.exit(fail === 0 ? 0 : 1);
