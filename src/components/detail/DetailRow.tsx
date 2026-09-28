import type { ReactNode } from "react";

type DetailRowProps = {
  label: string;
  children: ReactNode;
};

/** One labelled line inside the detail panel. */
export function DetailRow({ label, children }: DetailRowProps) {
  return (
    <div className="flex gap-3 py-1.5">
      <span className="w-24 shrink-0 text-xs text-ink-muted">{label}</span>
      <span className="min-w-0 flex-1 text-xs">{children}</span>
    </div>
  );
}
