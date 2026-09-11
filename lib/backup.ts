"use client";

// Backup & restore DB lokal (JSON bundle) — T03.
//
// backupNow()  : dump 9 tabel + isi file attachment → JSON bundle →
//                Documents `nm-backup-<stamp>.json` → Share.share ke app lain.
// restoreFrom(): pilih file backup (JSON) → validasi app + db_version →
//                closeDb() → ensureDb() → tx: DELETE order FK-safe lalu
//                INSERT reverse → tulis ulang file attachment dari base64.
//
// Bundle JSON (portabel, bebas masalah path, tanpa dependensi tambahan):
//   { app, db_version, exported_at, tables: {...}, attachments: [...] }
//   `attachments` = isi file attachment (base64) agar restore bisa menulis
//   ulang file di perangkat tujuan.
//
// Kapasitan Filesystem: `writeFile` → `{ uri }`; `readFile` →
// `{ data }` (string base64 di native). Konsisten dgn localApi.ts.

import { Capacitor } from "@capacitor/core";
import {
  Filesystem,
  Directory,
} from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import {
  closeDb,
  ensureDb,
  qAll,
  tx,
  run,
  nowISO,
  type Row,
} from "@/lib/db";
import { DB_VERSION } from "@/lib/schema";

export const APP_NAME = "nusantara-company";

// Urutan tabel. DELETE = anak dulu (FK-safe); INSERT = induk dulu (reverse).
const DELETE_ORDER = [
  "sale_items",
  "payments",
  "guides",
  "attachments",
  "sales",
  "transactions",
  "users",
  "products",
  "meta",
] as const;

const INSERT_ORDER = [
  "products",
  "users",
  "sales",
  "transactions",
  "guides",
  "sale_items",
  "payments",
  "attachments",
  "meta",
] as const;

interface BackupAttachment {
  id: string;
  transaction_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  uploaded_at: string;
  base64: string;
}

interface BackupBundle {
  app: string;
  db_version: number;
  exported_at: string;
  tables: Record<string, Row[]>;
  attachments: BackupAttachment[];
}

function stamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(
    d.getDate()
  )}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function toBase64(u8: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < u8.length; i += CHUNK) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(u8.subarray(i, i + CHUNK))
    );
  }
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

export async function backupNow(): Promise<void> {
  await ensureDb();
  const tables: Record<string, Row[]> = {};
  for (const t of DELETE_ORDER) {
    tables[t] = await qAll(t, `SELECT * FROM ${t}`);
  }
  const attachments: BackupAttachment[] = [];
  const attRows = tables.attachments ?? [];
  for (const r of attRows) {
    const path = r.file_path;
    if (!path) continue;
    const full = String(path);
    const res = await Filesystem.readFile({ path: full });
    const b64 = String(res.data);
    attachments.push({
      id: String(r.id),
      transaction_id: String(r.transaction_id),
      file_name: String(r.file_name),
      file_path: full,
      file_type: String(r.file_type ?? "application/octet-stream"),
      uploaded_at: String(r.uploaded_at ?? ""),
      base64: b64,
    });
  }
  const bundle: BackupBundle = {
    app: APP_NAME,
    db_version: DB_VERSION,
    exported_at: nowISO(),
    tables,
    attachments,
  };
  const name = `nm-backup-${stamp()}.json`;
  const written = await Filesystem.writeFile({
    path: name,
    data: toBase64(new TextEncoder().encode(JSON.stringify(bundle))),
    directory: Directory.Documents,
  });
  await Share.share({ files: [written.uri ?? Capacitor.convertFileSrc(name)] });
}

export async function restoreFrom(file: File): Promise<void> {
  if (!/\.(json)$/i.test(file.name)) {
    throw new Error("File bukan backup Nusantara Company.");
  }
  const bin = new TextDecoder().decode(await file.arrayBuffer());
  const bundle: BackupBundle = JSON.parse(bin);
  if (bundle.app !== APP_NAME) {
    throw new Error("File bukan backup Nusantara Company.");
  }
  if (typeof bundle.db_version !== "number" || bundle.db_version > DB_VERSION) {
    throw new Error(
      `db_version ${bundle.db_version} tidak cocok dengan app (${DB_VERSION}).`
    );
  }
  await closeDb();
  await ensureDb();
  await tx(async () => {
    for (const t of DELETE_ORDER) await run(`DELETE FROM ${t}`);
    for (const t of INSERT_ORDER) {
      const rows = bundle.tables[t];
      if (!rows) continue;
      for (const r of rows) {
        const cols = Object.keys(r);
        const vals = cols.map((c) => r[c]);
        await run(
          `INSERT INTO ${t} (${cols.join(", ")}) VALUES (${cols
            .map(() => "?")
            .join(", ")})`,
          vals
        );
      }
    }
    for (const a of bundle.attachments) {
      if (!a.base64) continue;
      const bytes = fromBase64(a.base64);
      await Filesystem.writeFile({
        path: a.file_path,
        data: toBase64(bytes),
        directory: Directory.Documents,
      });
    }
  });
}
