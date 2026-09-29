"use client";

import type { ReactNode } from "react";

import type { UmkmFilterResult } from "@/hooks/use-umkm-filter";
import { UmkmFilterContent } from "./UmkmFilterContent";

type UmkmFilterSidebarProps = {
  filter: UmkmFilterResult;
  totalCount: number;
  controls: ReactNode;
};

const SIDEBAR_WIDTH = "280px";

/** Wide screen layout: always open along the left edge of the map. */
export function UmkmFilterSidebar({
  filter,
  totalCount,
  controls,
}: UmkmFilterSidebarProps) {
  return (
    <aside
      className="absolute bottom-3 left-3 top-3 z-500 hidden overflow-y-auto rounded-(--panel-radius) border border-border bg-surface p-4 md:block"
      style={{ width: SIDEBAR_WIDTH, boxShadow: "var(--panel-shadow)" }}
      aria-label="Filter data"
    >
      <UmkmFilterContent
        filter={filter}
        totalCount={totalCount}
        controls={controls}
      />
    </aside>
  );
}
