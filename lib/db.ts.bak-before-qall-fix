"use client";

// Lapisan DB lokal (SQLite) — pengganti backend FastAPI + Supabase.
// DB file disimpan di app data dir app via @capacitor-community/sqlite
// (v8: API options-object, `CapacitorSQLite` = instance singleton).
// Tidak ada satu pun panggilan jaringan.
//
// LIFECYCLE v8 (connection-based, terverifikasi dari native Java plugin):
//   createConnection → open → query/run → begin/commit/rollback →
//   close → closeConnection
// Tiap method native lookup koneksi di registry `dbDict`; bila koneksi
// tak terdaftar, native melempang "No available connection". Koneksi
// HARUS didaftarkan via `createConnection` SEBELUM `open`.
//
// Pola: ensureDb() lazy + singleton per sesi webview. Init sekali &
// idempoten: createConnection → open → PRAGMA foreign_keys →
// CREATE TABLE IF NOT EXISTS (batch) → cek/set meta.db_version
// (strategi migrasi, 04-SCHEMA-DB.md).
//
// Helper query:
//   run(sql, params)      — eksekusi statement tunggal (INSERT/UPDATE/
//                           DELETE/DDL/PRAGMA), values di-bind via `?`
//   qAll(table, sql)      — SELECT * dari table → array Record (nama kolom)
//   qRows(sql, params)    — SELECT bebas → array array nilai (tanpa mapping)
//   tx(fn)               — fn dalam satu transaksi native (begin/commit/rollback)
//
// CATATAN: helper publik memanggil ensureDb() dulu. Di dalam ensureDb()
// kita memakai helper raw* (tanpa ensure) agar bebas rekursi/deadlock.

import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite } from "@capacitor-community/sqlite";
import { DB_NAME, DB_VERSION, SCHEMA_DDL } from "@/lib/schema";
import { genSalt, hashPassword } from "@/lib/hash";

// Akun awal (keputusan terkunci 01-SPEK #3): mastaufiq / admin, role owner.
// (Bukan asumsi admin/admin123 di teks tugas T02 — keputusan STATE.md menang.)
const SEED_USERNAME = "mastaufiq";
const SEED_PASSWORD = "admin";
const SEED_ROLE = "owner";

export { DB_NAME, DB_VERSION };

/** Satu baris hasil query (nama kolom → nilai). */
export type Row = Record<string, string | number | null>;

type Param = string | number | null;

const DB = DB_NAME;

function nativeGuard(): void {
  if (!Capacitor.isNativePlatform()) {
    throw new Error("DB lokal hanya tersedia di dalam APK (platform native).");
  }
}

// ——— helper raw (internal; TANPA ensureDb — dipakai oleh ensureDb) ———

async function rawRun(sql: string, params: Param[] = []): Promise<void> {
  await CapacitorSQLite.run({ database: DB, statement: sql, values: params });
}

async function rawQuery(sql: string, params: Param[] = []): Promise<Param[][]> {
  const res = await CapacitorSQLite.query({
    database: DB,
    statement: sql,
    values: params,
  });
  return (res.values ?? []) as Param[][];
}

// ——— state ———

let ready: Promise<void> | null = null;
const tableCols = new Map<string, string[]>();

/**
 * Inisialisasi DB (idempoten, aman dipanggil berulang).
 * createConnection → open → PRAGMA foreign_keys → DDL →
 * meta.db_version. Koneksi didaftarkan SELESAI dulu (createConnection)
 * lalu dibuka (open) — pola v8 connection-based.
 */
export function ensureDb(): Promise<void> {
  if (ready) return ready;
  ready = (async () => {
    nativeGuard();
    // createConnection mendaftarkan koneksi di registry native (dbDict).
    // Idempoten: koneksi yang sudah terdaftar tak dibuat ulang.
    await CapacitorSQLite.createConnection({
      database: DB,
      version: DB_VERSION,
    });
    // open membuka koneksi (re-open aman).
    await CapacitorSQLite.open({ database: DB });
    // PRAGMA foreign_keys harus di luar transaksi (no-op di dalam tx).
    await rawRun("PRAGMA foreign_keys = ON");
    // DDL idempoten (semua IF NOT EXISTS) — aman utk app yang sudah pernah jalan.
    await CapacitorSQLite.execute({
      database: DB,
      statements: SCHEMA_DDL.join(";\n"),
    });
    // Versi skema (meta.db_version)
    const v = await rawQuery("SELECT value FROM meta WHERE key = 'db_version'");
    const cur = v.length ? String(v[0][0]) : null;
    if (cur === null) {
      await rawRun("INSERT INTO meta (key, value) VALUES ('db_version', ?)", [
        String(DB_VERSION),
      ]);
    } else if (Number(cur) < DB_VERSION) {
      // TODO(fase 4): upgrade skema antar versi app.
      await rawRun("UPDATE meta SET value = ? WHERE key = 'db_version'", [
        String(DB_VERSION),
      ]);
    }
    // Seed user default (01-SPEK #3). Idempoten & self-healing:
    // di-insert hanya bila username-nya tidak ada (mis. kehapus user).
    const seeded = await rawQuery(
      "SELECT id FROM users WHERE username = ?",
      [SEED_USERNAME]
    );
    if (seeded.length === 0) {
      const salt = genSalt();
      const hash = await hashPassword(SEED_PASSWORD, salt);
      await rawRun(
        "INSERT INTO users (id, username, password_hash, salt, role, created_at) VALUES (?,?,?,?,?,?)",
        [uuid(), SEED_USERNAME, hash, salt, SEED_ROLE, nowISO()]
      );
      await rawRun("INSERT OR REPLACE INTO meta (key, value) VALUES ('seeded_at', ?)", [
        nowISO(),
      ]);
    }
  })();
  ready.catch(() => {
    ready = null; // init gagal → beri kesempatan dicoba lagi
  });
  return ready;
}

/**
 * Tutup koneksi DB (dipakai restore backup: close → ganti isi → open).
 * Tutup koneksi (close) lalu hapus dari registry (closeConnection).
 * Setelah ini ensureDb() akan menginisialisasi ulang dari nol.
 */
export async function closeDb(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await CapacitorSQLite.close({ database: DB });
  } catch {
    // koneksi mungkin sudah tertutup — abaikan.
  }
  try {
    await CapacitorSQLite.closeConnection({ database: DB });
  } catch {
    // koneksi mungkin sudah terhapus dari registry — abaikan.
  }
  ready = null;
}

// ——— helper publik (selalu memastikan DB siap) ———

/** Eksekusi statement tunggal; `params` di-bind dengan placeholder `?`. */
export async function run(sql: string, params: Param[] = []): Promise<void> {
  await ensureDb();
  await rawRun(sql, params);
}

/** SELECT bebas; mengembalikan array nilai per baris (tanpa mapping kolom). */
export async function qRows(
  sql: string,
  params: Param[] = []
): Promise<Param[][]> {
  await ensureDb();
  return rawQuery(sql, params);
}

/**
 * `SELECT *` dari `table` yang dipetakan ke Record per nama kolom.
 * `sql` harus memilih kolom-kolom dari `table` itu (tanpa join).
 */
export async function qAll(
  table: string,
  sql: string,
  params: Param[] = []
): Promise<Row[]> {
  await ensureDb();
  const cols = await tableColumns(table);
  const values = await rawQuery(sql, params);
  return values.map((vals) => {
    const row: Row = {};
    cols.forEach((name, i) => {
      row[name] = (vals[i] ?? null) as string | number | null;
    });
    return row;
  });
}

async function tableColumns(table: string): Promise<string[]> {
  const hit = tableCols.get(table);
  if (hit) return hit;
  const rows = await rawQuery(`PRAGMA table_info(${table})`);
  const names = rows.map((v) => String(v[1]));
  tableCols.set(table, names);
  return names;
}

/**
 * Jalankan `fn` dalam satu transaksi native (begin/commit/rollback).
 * Semua `run`/`qAll`/`qRows` di dalam `fn` memakai koneksi yang sama.
 */
export async function tx(fn: () => Promise<void>): Promise<void> {
  await ensureDb();
  await CapacitorSQLite.beginTransaction({ database: DB });
  try {
    await fn();
    await CapacitorSQLite.commitTransaction({ database: DB });
  } catch (e) {
    try {
      await CapacitorSQLite.rollbackTransaction({ database: DB });
    } catch {
      // abaikan — rollback gagal biasanya karena transaksi sudah tutup
    }
    throw e;
  }
}

/** UUID v4 (fallback manual bila crypto.randomUUID tak tersedia). */
export function uuid(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = c.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const h = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(
    16,
    20
  )}-${h.slice(20)}`;
}

/** Timestamp ISO 8601 (konsisten dengan kolom created_at dsb.). */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Derivasi status transaksi dari paid/total (logika yang tadinya di
 * backend FastAPI — dipindah ke klien sesuai T02).
 */
export function deriveStatus(
  paidAmount: number,
  totalAmount: number
): "lunas" | "belum_lunas" {
  return paidAmount >= totalAmount ? "lunas" : "belum_lunas";
}
