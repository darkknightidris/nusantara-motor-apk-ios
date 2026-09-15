"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-hover hover:shadow-md active:scale-[0.97]",
  secondary:
    "border border-border-soft bg-surface text-foreground shadow-sm hover:bg-surface-soft active:bg-slate-100",
  ghost:
    "text-foreground hover:bg-surface-soft active:bg-slate-100",
  danger:
    "bg-danger text-white shadow-sm hover:opacity-90 active:scale-[0.97]",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] px-4 text-sm font-semibold tracking-[-0.01em] transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
