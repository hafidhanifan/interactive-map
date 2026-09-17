import type { ReactNode } from "react";

type BottomPanelProps = {
  title: string;
  children: ReactNode;
};

export function BottomPanel({ title, children }: BottomPanelProps) {
  return (
    <section
      className="mx-3 mb-3 rounded-[var(--panel-radius)] border border-border bg-surface p-4"
      style={{ boxShadow: "var(--panel-shadow)" }}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-2 text-xs text-ink-muted">{children}</div>
    </section>
  );
}
