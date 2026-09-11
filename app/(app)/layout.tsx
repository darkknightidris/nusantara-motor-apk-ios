import type { ReactNode } from "react";
import Shell from "@/components/pwa/Shell";
import RequireAuth from "@/components/auth/RequireAuth";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Shell>
      <RequireAuth>{children}</RequireAuth>
    </Shell>
  );
}
