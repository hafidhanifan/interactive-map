import { DISTRICT_NAME, VILLAGE_NAME } from "@/lib/map-config";

export function AppHeader() {
  return (
    <header
      className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4"
      style={{ height: "var(--header-height)" }}
    >
      <div className="min-w-0">
        <h1 className="truncate text-sm font-bold leading-tight">
          Peta Digital Kalurahan {VILLAGE_NAME}
        </h1>
        <p className="truncate text-xs leading-tight text-ink-muted">
          Kapanewon {DISTRICT_NAME}, Kulon Progo
        </p>
      </div>
    </header>
  );
}
