"use client";

// Profil: info akun (username/role), kartu aplikasi, aksi backup/restore,
// tautan ke modul Users, dan logout. Semua data dari SQLite lokal.
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session";
import { backupNow, restoreFrom } from "@/lib/backup";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ProfilPage() {
  const router = useRouter();
  const { token, user, logout } = useSession();

  const [busy, setBusy] = useState<"" | "backup" | "restore">("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleBackup() {
    setBusy("backup");
    setError(null);
    setOk(false);
    try {
      await backupNow();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat backup.");
    } finally {
      setBusy("");
    }
  }

  async function handleRestore() {
    if (!window.confirm("Pulihkan backup? Data saat ini akan diganti.")) return;
    setBusy("restore");
    setError(null);
    setOk(false);
    try {
      const file = fileRef.current?.files?.[0];
      if (!file) {
        setError("Pilih file backup terlebih dahulu.");
        return;
      }
      await restoreFrom(file);
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memulihkan backup.");
    } finally {
      setBusy("");
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold">Profil</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {user?.username ?? "-"} · <span className="capitalize">{user?.role}</span>
        </p>
      </header>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
      {ok ? (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-success">
          Backup dipulihkan.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface p-4 text-center shadow-sm ring-1 ring-border-soft">
          <p className="text-xs text-slate-400">Status</p>
          <p className="mt-1 text-sm font-bold">OFFLINE / LOKAL</p>
        </div>
        <div className="rounded-2xl bg-surface p-4 text-center shadow-sm ring-1 ring-border-soft">
          <p className="text-xs text-slate-400">Penyimpanan</p>
          <p className="mt-1 text-sm font-bold">Perangkat ini</p>
        </div>
      </div>

      <Card title="Backup & Pulih">
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Backup menyimpan seluruh database. Pulihkan dari file backup untuk
            memulihkan ke perangkat lain.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => void handleBackup()} disabled={busy !== ""}>
              {busy === "backup" ? "Mencipta..." : "Backup"}
            </Button>
            <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border-soft bg-surface px-4 text-sm font-semibold active:bg-slate-100">
              {busy === "restore" ? "Memulihkan..." : "Pulihkan"}
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                className="hidden"
                disabled={busy !== ""}
                onChange={() => void handleRestore()}
              />
            </label>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/users"
          className="rounded-2xl bg-surface p-4 text-left shadow-sm ring-1 ring-border-soft active:bg-slate-50"
        >
          <p className="text-sm font-semibold">Users</p>
          <p className="text-xs text-slate-400">Kelola akun</p>
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/dashboard");
          }}
          className="rounded-2xl bg-surface p-4 text-left shadow-sm ring-1 ring-border-soft active:bg-slate-50"
        >
          <p className="text-sm font-semibold">Logout</p>
          <p className="text-xs text-slate-400">Tutup sesi</p>
        </button>
      </div>
    </div>
  );
}
