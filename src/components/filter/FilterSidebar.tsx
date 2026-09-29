"use client";

import type { ComponentProps } from "react";

import { FilterContent } from "./FilterContent";

type FilterSidebarProps = ComponentProps<typeof FilterContent>;

const SIDEBAR_WIDTH = "280px";

/** Wide screen layout: always open along the left edge of the map. */
export function FilterSidebar(props: FilterSidebarProps) {
  return (
    <aside
      className="absolute bottom-3 left-3 top-3 z-500 hidden overflow-y-auto rounded-(--panel-radius) border border-border bg-surface p-4 md:block"
      style={{ width: SIDEBAR_WIDTH, boxShadow: "var(--panel-shadow)" }}
      aria-label="Filter data"
    >
      <FilterContent {...props} />
    </aside>
  );
}
