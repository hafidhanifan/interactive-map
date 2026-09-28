"use client";

import type { UmkmFeature } from "@/types/umkm";
import { UmkmDetailContent } from "./UmkmDetailContent";

type UmkmDetailSidebarProps = {
  feature: UmkmFeature;
  onClose: () => void;
};

// fixed width of the floating panel on wide screens
const SIDEBAR_WIDTH = "360px";

export function UmkmDetailSidebar({
  feature,
  onClose,
}: UmkmDetailSidebarProps) {
  return (
    <aside
      className="absolute right-3 top-3 bottom-3 z-500 hidden overflow-y-auto rounded-(--panel-radius) border border-border bg-surface p-4 md:block"
      style={{ width: SIDEBAR_WIDTH, boxShadow: "var(--panel-shadow)" }}
      aria-label="Detail usaha"
    >
      <UmkmDetailContent feature={feature} onClose={onClose} />
    </aside>
  );
}
