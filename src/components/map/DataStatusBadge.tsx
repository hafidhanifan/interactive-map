"use client";

type DataStatusBadgeProps = {
  status: "loading" | "ready" | "error";
  count: number;
  message?: string;
};

export function DataStatusBadge({
  status,
  count,
  message,
}: DataStatusBadgeProps) {
  const text =
    status === "loading"
      ? "Memuat data UMKM..."
      : status === "error"
        ? (message ?? "Data gagal dimuat")
        : `${count} UMKM`;

  return (
    <div
      className="rounded-(--panel-radius) border border-border bg-surface px-3 py-2 text-xs font-medium"
      style={{ boxShadow: "var(--panel-shadow)" }}
    >
      {text}
    </div>
  );
}
