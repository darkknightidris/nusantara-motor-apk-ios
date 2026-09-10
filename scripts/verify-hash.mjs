// Verifikasi implementasi hash password (T02 sub-task 3) di Node 24.
// Cross-check: sha256Hex (WebCrypto primary) dan js-sha256 (fallback)
// harus identik dengan node:crypto SHA-256 untuk semua sampel —
// berarti hasil hash konsisten di WebView dan Node.
import { createHash } from "node:crypto";
import { sha256 as jsSha256 } from "js-sha256";
import { sha256Hex, genSalt, hashPassword } from "../lib/hash.ts";

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

const samples = [
  "admin",
  "",
  "password-123",
  "Halo Nusantara! 12345",
  "üñïçødé-тест-ไทย-🇮🇩",
  "x".repeat(1024),
  "salt123admin",
];
const ref = (s) => createHash("sha256").update(s, "utf8").digest("hex");

// 1) sha256Hex (primary WebCrypto) == node:crypto
for (const s of samples) {
  const got = await sha256Hex(s);
  const want = ref(s);
  check(`sha256Hex == node:crypto  (${JSON.stringify(s.slice(0, 24))}${s.length > 24 ? "…" : ""})`, got === want, `got=${got.slice(0, 16)}… want=${want.slice(0, 16)}…`);
}

// 2) js-sha256 (fallback) == node:crypto
for (const s of samples) {
  const got = jsSha256(s);
  const want = ref(s);
  check(`js-sha256 == node:crypto (${JSON.stringify(s.slice(0, 24))}${s.length > 24 ? "…" : ""})`, got === want);
}

// 3) genSalt: format 32 hex + unik
const salts = Array.from({ length: 100 }, () => genSalt());
const allHex = salts.every((s) => /^[0-9a-f]{32}$/.test(s));
check("genSalt: semua 32 karakter hex", allHex, JSON.stringify(salts.slice(0, 2)));
check("genSalt: 100 nilai unik baru", new Set(salts).size === 100, `unik=${new Set(salts).size}`);

// 4) hashPassword = SHA-256(salt + password), deterministik per salt
const s1 = salts[0];
const h1a = await hashPassword("admin", s1);
const h1b = await hashPassword("admin", s1);
const h1c = await hashPassword("admin", salts[1]);
check("hashPassword == sha256Hex(salt+password)", h1a === await sha256Hex(s1 + "admin"));
check("hashPassword deterministik (salt sama → hash sama)", h1a === h1b);
check("salt berbeda → hash berbeda (acak per user)", h1a !== h1c);
check("hash panjang 64 hex", /^[0-9a-f]{64}$/.test(h1a), h1a.slice(0, 16));

console.log(`\nHasil: ${pass} PASS, ${fail} FAIL (sampel=${samples.length})`);
console.log(fail === 0 ? "VERIFIKASI HASH: PASS" : "VERIFIKASI HASH: FAIL");
process.exit(fail === 0 ? 0 : 1);
