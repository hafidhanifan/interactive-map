"use client";

type FilterButtonProps = {
  activeCount: number;
  onClick: () => void;
};

/** Phone only: opens the filter sheet. */
export function FilterButton({ activeCount, onClick }: FilterButtonProps) {
  const label = activeCount > 0 ? `Filter (${activeCount})` : "Filter";

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-(--panel-radius) border border-border bg-surface px-3 py-2 text-xs font-semibold md:hidden"
      style={{ boxShadow: "var(--panel-shadow)" }}
    >
      {label}
    </button>
  );
}
