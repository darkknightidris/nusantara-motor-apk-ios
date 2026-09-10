"use client";

// Indikator online/offline. Saat offline, aplikasi tetap terbuka (shell UI)
// tetapi data tidak bisa dimuat — status ditampilkan jelas ke pengguna.
import { useEffect, useState } from "react";

export default function OnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) return null;

  return (
    <div className="bg-warning px-4 py-2 text-center text-xs font-semibold text-white print:hidden">
      Koneksi terputus — data tidak dapat dimuat sampai online kembali.
    </div>
  );
}
