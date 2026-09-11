"use client";

// Indikator mode aplikasi: Nusantara Company 100% offline/lokal.
// Semua data tersimpan di perangkat ini — tidak ada jaringan.
export default function OnlineStatus() {
  return (
    <div className="bg-primary px-4 py-2 text-center text-xs font-semibold text-white">
      OFFLINE / LOKAL — semua data tersimpan di perangkat ini.
    </div>
  );
}
