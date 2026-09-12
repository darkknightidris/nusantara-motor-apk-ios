"use client";

// Rute PUBLIK (di luar group (app), tidak di-guard RequireAuth) — daftar
// akun baru. App full-offline: data tersimpan di perangkat ini.
// Role boleh owner|kasir (permintaan owner 2026-09-12: "daftar akun baru
// admin"); akun seed mastaufiq/admin tetap owner pertama.
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/session";
import type { Role } from "@/lib/types";
import Button from "@/components/ui/Button";
import Field, { SelectField } from "@/components/ui/Field";

export default function DaftarPage() {
  const router = useRouter();
  const { register } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [role, setRole] = useState<Role>("owner");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await register(username, password, role);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mendaftar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm pt-10">
      <h1 className="text-xl font-bold">Daftar Akun Nusantara Motor</h1>
      <p className="mt-1 text-sm text-slate-500">
        Buat akun baru. App berjalan offline — data tersimpan di perangkat ini.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
        <Field
          label="Ulangi Password"
          type="password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          autoComplete="new-password"
          required
        />
        <SelectField
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          <option value="owner">owner (admin — akses penuh)</option>
          <option value="kasir">kasir (transaksi &amp; stok)</option>
        </SelectField>
        {error ? (
          <p className="text-sm font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy || !username || !password || !password2}>
          {busy ? "Memproses..." : "Daftar"}
        </Button>
        <p className="text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-medium text-primary">
            Masuk
          </Link>
        </p>
      </form>
    </div>
  );
}
