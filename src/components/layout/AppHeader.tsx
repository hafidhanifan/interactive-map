import { DISTRICT_NAME, VILLAGE_NAME } from "@/lib/map-config";

export function AppHeader() {
  return (
    <header
      className="relative z-10 -mb-px flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4"
      style={{
        height: "var(--header-height)",
        // asks the browser for a dedicated layer, so the boundary does not have to be recomposited on every frame of a pan.
        transform: "translateZ(0)",
      }}
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
