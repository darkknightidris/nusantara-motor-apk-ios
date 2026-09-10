import type { ReactNode } from "react";

export default function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-6 text-center">
      <p className="text-sm font-medium">{title}</p>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {action}
    </div>
  );
}
