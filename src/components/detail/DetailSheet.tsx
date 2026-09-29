"use client";

import type { MapPoint } from "@/types/dataset";
import { DetailContent } from "./DetailContent";

type DetailSheetProps = {
  feature: MapPoint;
  onClose: () => void;
};

/**
 * Phone layout: the detail rises from the bottom edge.
 *
 * Capped at 60dvh so the map stays visible above it, and scrolls inside
 * itself rather than pushing the page. Hidden from md upwards, where the
 * sidebar takes over.
 */
export function DetailSheet({ feature, onClose }: DetailSheetProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-500 md:hidden">
      <section
        className="pointer-events-auto mx-3 mb-3 max-h-[60dvh] overflow-y-auto rounded-(--panel-radius) border border-border bg-surface p-4"
        style={{ boxShadow: "var(--panel-shadow)" }}
        aria-label="Detail titik"
      >
        <DetailContent feature={feature} onClose={onClose} />
      </section>
    </div>
  );
}
