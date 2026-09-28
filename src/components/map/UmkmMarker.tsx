"use client";

import { CircleMarker, Popup } from "react-leaflet";

import { getCategoryColor } from "@/lib/category-style";
import { readCssVariable } from "@/lib/css-variables";
import { toLeafletPosition } from "@/types/geojson";
import type { UmkmFeature } from "@/types/umkm";

type UmkmMarkerProps = {
  feature: UmkmFeature;
};

const MARKER_RADIUS = 6;

export function UmkmMarker({ feature }: UmkmMarkerProps) {
  const { properties } = feature;
  const position = toLeafletPosition(feature.geometry.coordinates);

  return (
    <CircleMarker
      center={position}
      radius={MARKER_RADIUS}
      pathOptions={{
        color: readCssVariable("--surface"),
        weight: 2,
        fillColor: getCategoryColor(properties.category),
        fillOpacity: 1,
      }}
    >
      <Popup>
        <div className="min-w-40">
          <p className="text-sm font-semibold">{properties.name}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {properties.categoryLabel}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Padukuhan {properties.padukuhan}, RT {properties.rt} RW{" "}
            {properties.rw}
          </p>
        </div>
      </Popup>
    </CircleMarker>
  );
}
