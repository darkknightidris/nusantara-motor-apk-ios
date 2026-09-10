// Hash password lokal: SHA-256(salt + password), salt acak per user.
// (01-SPEK #D4 + T02 sub-task 3; strategi 03-TEKNOLOGI: WebCrypto,
// fallback js-sha256 bila crypto.subtle tak tersedia di context WebView.)
//
// File ini murni (tanpa dependensi native) agar bisa diuji di Node.

import { sha256 } from "js-sha256";

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

/**
 * SHA-256 hex dari string `input`.
 * Primary: WebCrypto (crypto.subtle); fallback: js-sha256 (pure JS).
 */
export async function sha256Hex(input: string): Promise<string> {
  const c = globalThis.crypto;
  if (c && c.subtle) {
    try {
      const buf = await c.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(input)
      );
      return bytesToHex(new Uint8Array(buf));
    } catch {
      // context non-secure → fallback di bawah
    }
  }
  return sha256(input);
}

/** Salt acak hex (16 byte = 32 karakter hex) — acak per user. */
export function genSalt(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(arr);
  return bytesToHex(arr);
}

/** Hash password untuk disimpan di kolom password_hash. */
export async function hashPassword(
  password: string,
  salt: string
): Promise<string> {
  return sha256Hex(salt + password);
}
