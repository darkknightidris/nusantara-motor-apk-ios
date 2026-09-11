"use client";

// Users (khusus owner): daftar akun, tambah akun baru, ganti role &
// password, dan hapus akun. Kasir tidak punya akses ke modul ini.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { localApi as api, ApiError } from "@/lib/localApi";
import { useSession } from "@/lib/session";
import { formatDateTime } from "@/lib/format";
import type { Role } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Field, SelectField } from "@/components/ui/Field";
import Loading from "@/components/ui/Loading";

interface UserRow {
  id: string;
  username: string;
  role: Role;
  created_at: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { token, user } = useSession();
  const isOwner = user?.role === "owner";

  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form tambah akun.
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("kasir");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setUsers(await api.listUsers());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat daftar akun.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Isi username dan password terlebih dahulu.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.createUser({
        username: username.trim(),
        password,
        role,
      });
      setUsername("");
      setPassword("");
      setRole("kasir");
      setShowForm(false);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menambah akun.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Yakin hapus akun ini? Tindakan tidak dapat dibatalkan."))
      return;
    try {
      await api.deleteUser(id);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus akun.");
    }
  }

  async function handleRoleChange(id: string, newRole: Role) {
    try {
      await api.updateUser(id, { role: newRole });
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengganti role.");
    }
  }

  if (!isOwner) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Users</h1>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-4">
          <p className="text-sm text-slate-600">
            Halaman ini hanya bisa diakses oleh owner. Hubungi pemilik toko untuk
            mengelola akun.
          </p>
          <Link href="/profil" className="text-sm font-semibold text-primary underline">
            Kembali ke profil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Users</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {users?.length ?? 0} akun terdaftar
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Tutup Form" : "Tambah Akun"}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      {showForm ? (
        <Card title="Tambah Akun Baru">
          <form onSubmit={handleCreate} className="space-y-3">
            <Field
              label="Username *"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: kasir_1"
              autoComplete="off"
              required
            />
            <Field
              label="Password *"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
              required
            />
            <SelectField
              label="Role *"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="kasir">kasir</option>
              <option value="owner">owner</option>
            </SelectField>
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Akun"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Batal
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {loading ? (
        <Loading label="Memuat daftar akun..." />
      ) : users?.length === 0 ? (
        <Card>
          <EmptyState
            title="Belum ada akun"
            hint="Tambahkan akun kasir pertama untuk membantu operasional."
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {users?.map((u) => (
            <li key={u.id} className="rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-border-soft">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{u.username}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatDateTime(u.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge tone={u.role === "owner" ? "info" : "neutral"}>
                    {u.role}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-500">Role</label>
                    <select
                      defaultValue={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="h-8 rounded-lg border border-border-soft bg-surface px-2 text-xs font-medium"
                    >
                      <option value="kasir">kasir</option>
                      <option value="owner">owner</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => void handleDelete(u.id)}
                      className="h-8 rounded-lg border border-border-soft bg-surface px-3 text-xs font-semibold text-danger"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button onClick={() => router.push("/profil")}>Kembali ke Profil</Button>
    </div>
  );
}
