"use client";

// Catat transaksi hutang/piutang baru: jenis, pihak, jumlah, jatuh tempo,
// dan keterangan. Semua data tersimpan di SQLite lokal.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { localApi as api, ApiError } from "@/lib/localApi";
import { useSession } from "@/lib/session";
import { Field, SelectField, TextAreaField } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

type Tab = "hutang" | "piutang";

export default function TambahKeuanganPage() {
  const router = useRouter();
  const { token } = useSession();

  const [type, setType] = useState<Tab>("hutang");
  const [partyName, setPartyName] = useState("");
  const [partyContact, setPartyContact] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!partyName.trim()) {
      setError("Nama pihak wajib diisi.");
      return;
    }
    const amount = Number(totalAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Jumlah harus lebih dari 0.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.createTransaction({
        type,
        party_name: partyName.trim(),
        party_contact: partyContact.trim() || null,
        description: description.trim() || null,
        total_amount: amount,
        due_date: dueDate || null,
        notes: notes.trim() || null,
      });
      router.push("/keuangan");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan transaksi.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/keuangan")}
          aria-label="Kembali ke keuangan"
          className="grid h-10 w-10 place-items-center rounded-xl border border-border-soft bg-surface text-lg active:bg-slate-100"
        >
          ←
        </button>
        <div>
          <h1 className="text-lg font-bold">Catat Hutang/Piutang</h1>
          <p className="text-xs text-slate-500">
            Hutang = kamu berutang ke pihak lain. Piutang = pihak lain berutang ke kamu.
          </p>
        </div>
      </header>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("hutang")}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
              type === "hutang"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border-soft bg-surface text-slate-500"
            }`}
          >
            Hutang
          </button>
          <button
            type="button"
            onClick={() => setType("piutang")}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
              type === "piutang"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border-soft bg-surface text-slate-500"
            }`}
          >
            Piutang
          </button>
        </div>

        <Card>
          <div className="space-y-3">
            <Field
              label="Nama Pihak *"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="Contoh: Toko Kawan"
              required
            />
            <Field
              label="Kontak (opsional)"
              value={partyContact}
              onChange={(e) => setPartyContact(e.target.value)}
              placeholder="No. HP atau kontak lain"
              inputMode="tel"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Jumlah (Rp) *"
                type="number"
                inputMode="numeric"
                min={0}
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0"
                required
              />
              <Field
                label="Jatuh Tempo (opsional)"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <Field
              label="Keterangan"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Pelunasan cicilan"
            />
            <TextAreaField
              label="Catatan"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan tambahan (opsional)"
            />
          </div>
        </Card>

        <div className="flex gap-3 pb-4">
          <Button type="submit" disabled={saving || !token}>
            {saving ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/keuangan")}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
