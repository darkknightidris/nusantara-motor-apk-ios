export default function Loading({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-border-soft border-t-primary" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
