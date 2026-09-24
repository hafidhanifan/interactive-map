"use client";

import { BASEMAP_OPTIONS, type BasemapId } from "@/lib/map-config";

type BasemapSwitcherProps = {
  value: BasemapId;
  onChange: (next: BasemapId) => void;
};

/**
 * Two small buttons floating over the map, one per basemap mode.
 * Kept outside BaseMap so it renders as ordinary DOM instead of a
 * Leaflet control, which makes it far easier to style.
 */
export function BasemapSwitcher({ value, onChange }: BasemapSwitcherProps) {
  return (
    <div
      className="flex overflow-hidden rounded-(--panel-radius) border border-border bg-surface"
      style={{ boxShadow: "var(--panel-shadow)" }}
      role="group"
      aria-label="Mode tampilan peta"
    >
      {BASEMAP_OPTIONS.map((option) => {
        const isActive = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={isActive}
            className="px-3 py-2 text-xs font-semibold transition-colors cursor-pointer"
            style={{
              backgroundColor: isActive ? "var(--brand)" : "transparent",
              color: isActive ? "var(--surface)" : "var(--ink-muted)",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
