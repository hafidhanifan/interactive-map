"use client";

import type { UmkmFeature } from "@/types/umkm";
import { UmkmDetailContent } from "./UmkmDetailContent";

type UmkmDetailSheetProps = {
  feature: UmkmFeature;
  onClose: () => void;
};

export function UmkmDetailSheet({ feature, onClose }: UmkmDetailSheetProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-500 md:hidden">
      <section
        className="pointer-events-auto mx-3 mb-3 max-h-[60dvh] overflow-y-auto rounded-(--panel-radius) border border-border bg-surface p-4"
        style={{ boxShadow: "var(--panel-shadow)" }}
        aria-label="Detail usaha"
      >
        <UmkmDetailContent feature={feature} onClose={onClose} />
      </section>
    </div>
  );
}
