"use client";

// Login terhadap DB lokal (hash SHA-256 + salt). Token sesi disimpan di
// localStorage — tidak ada jaringan / Bearer JWT. Ini halaman PUBLIK (tidak
// di-guard RequireAuth) — satu-satunya rute yang bisa diakses tanpa sesi.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session";
import Button from "@/components/ui/Button";
import Field from "@/components/ui/Field";

export default function LoginPage() {
  const router = useRouter();
  const { token, user, login } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (token && user) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium">Sudah masuk sebagai</p>
        <p className="text-lg font-bold">{user.username}</p>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
          {user.role}
        </span>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(username, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm pt-10">
      <h1 className="text-xl font-bold">Masuk Nusantara Motor</h1>
      <p className="mt-1 text-sm text-slate-500">
        Gunakan akun yang terdaftar di sistem.
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
          autoComplete="current-password"
          required
        />
        {error ? (
          <p className="text-sm font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={busy || !username || !password}>
          {busy ? "Memproses..." : "Masuk"}
        </Button>
      </form>
    </div>
  );
}
