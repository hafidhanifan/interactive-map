"use client";

import { useUmkmData } from "@/hooks/use-umkm-data";
import { UmkmMarker } from "./UmkmMarker";

/**
 * draws every UMKM point currently loaded.
 *
 * deliberately has no clustering yet: the next step adds it, and seeing
 * the difference on real data is more convincing than reading about it.
 */

export function UmkmLayer() {
  const state = useUmkmData();

  if (state.status !== "ready") {
    return null;
  }

  return (
    <>
      {state.features.map((feature) => (
        <UmkmMarker key={feature.id} feature={feature} />
      ))}
    </>
  );
}
