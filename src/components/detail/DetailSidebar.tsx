"use client";

import type { MapPoint } from "@/types/dataset";
import { DetailContent } from "./DetailContent";

type DetailSidebarProps = {
  feature: MapPoint;
  onClose: () => void;
};

/** Fixed width of the floating panel on wide screens. */
const SIDEBAR_WIDTH = "360px";

export function DetailSidebar({ feature, onClose }: DetailSidebarProps) {
  return (
    <aside
      className="absolute bottom-3 right-3 top-3 z-500 hidden overflow-y-auto rounded-(--panel-radius) border border-border bg-surface p-4 md:block"
      style={{ width: SIDEBAR_WIDTH, boxShadow: "var(--panel-shadow)" }}
      aria-label="Detail titik"
    >
      <DetailContent feature={feature} onClose={onClose} />
    </aside>
  );
}
