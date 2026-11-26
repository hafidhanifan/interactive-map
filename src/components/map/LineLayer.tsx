"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

import { createRoadLayer } from "@/lib/road-layers";
import type { MapLine } from "@/types/dataset";

type LineLayerProps = {
  features: readonly MapLine[];
  onSelect: (feature: MapLine) => void;
};

/**
 * Draws road segments and reports taps back to the map.
 *
 * All the drawing lives in createRoadLayer so it can be exercised without
 * React; this component only ties it to the map's lifetime.
 */
export function LineLayer({ features, onSelect }: LineLayerProps) {
  const map = useMap();

  useEffect(() => {
    const group = createRoadLayer(map, features, onSelect);

    return () => {
      map.removeLayer(group);
      group.clearLayers();
    };
  }, [map, features, onSelect]);

  return null;
}
