"use client";

type ClusterToggleProps = {
  value: boolean;
  onChange: (next: boolean) => void;
};

/**
  switches clustering on and off.
  kept visible rather than hidden behind a developer flag, because comparing the two directly is the fastest way to see what clustering buys on a real device.
*/
export function ClusterToggle({ value, onChange }: ClusterToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      aria-pressed={value}
      className="rounded-(--panel-radius) border border-border px-3 py-2 text-xs font-semibold transition-colors"
      style={{
        boxShadow: "var(--panel-shadow)",
        backgroundColor: value ? "var(--brand)" : "var(--surface)",
        color: value ? "var(--surface)" : "var(--ink-muted)",
      }}
    >
      Kelompokkan
    </button>
  );
}
