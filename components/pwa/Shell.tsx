"use client";

import OnlineStatus from "@/components/pwa/OnlineStatus";
import BottomNav from "@/components/layout/BottomNav";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <OnlineStatus />
      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-4 sm:max-w-lg">{children}</main>
      <BottomNav />
    </div>
  );
}
