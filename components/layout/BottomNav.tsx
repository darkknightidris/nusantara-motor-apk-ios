"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Beranda", icon: "⌂" },
  { href: "/katalog", label: "Katalog", icon: "▦" },
  { href: "/penjualan", label: "Jual", icon: "＋" },
  { href: "/keuangan", label: "Keuangan", icon: "◔" },
  { href: "/profil", label: "Profil", icon: "●" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft/80 bg-white/90 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-[68px] max-w-md items-stretch px-2 sm:max-w-lg">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all duration-200 ${
                active ? "text-primary" : "text-slate-400"
              }`}
            >
              <span
                className={`flex h-8 w-12 items-center justify-center rounded-2xl text-xl transition-all duration-200 ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "group-active:scale-90"
                }`}
              >
                {item.icon}
              </span>

              <span>{item.label}</span>

              {active && (
                <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
