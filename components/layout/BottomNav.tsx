"use client";

// Navigasi bawah untuk satu tangan: item besar, area sentuh min 48px.
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Beranda" },
  { href: "/katalog", label: "Katalog" },
  { href: "/penjualan", label: "Jual" },
  { href: "/keuangan", label: "Keuangan" },
  { href: "/profil", label: "Profil" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-surface/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md sm:max-w-lg">
        {items.map((item) => {
          // Sub-rute (mis. /katalog/tambah) tetap menyorot item induknya.
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-16 flex-1 items-center justify-center text-sm font-medium transition-colors ${
                active ? "text-primary" : "text-slate-500"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
