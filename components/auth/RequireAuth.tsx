"use client";

// Guard rute terlindungi: jika belum ada sesi, arahkan pengguna ke /login.
// Sesi dibaca sinkron via useSyncExternalStore sehingga tidak ada jeda render.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "@/lib/session";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { token } = useSession();

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  // Jangan render konten sensitif sebelum sesi terkonfirmasi.
  if (!token) return null;
  return <>{children}</>;
}
