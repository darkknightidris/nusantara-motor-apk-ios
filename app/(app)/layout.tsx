import type { ReactNode } from "react";
import OnlineStatus from "@/components/pwa/OnlineStatus";
import BottomNav from "@/components/layout/BottomNav";
import RequireAuth from "@/components/auth/RequireAuth";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <OnlineStatus />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4 sm:max-w-lg">
        <RequireAuth>{children}</RequireAuth>
      </main>
      <BottomNav />
    </div>
  );
}
