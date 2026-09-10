"use client";

// Komponen form dasar: input, select, dan textarea dengan label.
// Kelas input diseragamkan agar semua form punya tampilan konsisten.
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const inputClass =
  "h-12 w-full rounded-xl border border-border-soft bg-surface px-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/30";

export function Field({
  label,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input {...rest} className={inputClass} />
    </label>
  );
}

export function SelectField({
  label,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <select {...rest} className={inputClass}>
        {children}
      </select>
    </label>
  );
}

export function TextAreaField({
  label,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <textarea
        {...rest}
        className={`w-full rounded-xl border border-border-soft bg-surface px-3 py-2.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/30`}
      />
    </label>
  );
}

export default Field;
