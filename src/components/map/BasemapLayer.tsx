"use client";

import { TileLayer } from "react-leaflet";

import { BASEMAP_OPTIONS, type BasemapId } from "@/lib/map-config";

type BasemapLayerProps = {
  basemap: BasemapId;
};

/**
 * Draws the tiles for the selected basemap, plus its label overlay when
 * the mode has one.
 *
 * The key props matter: they force React to drop the old tile layer and
 * build a new one on switch, instead of mutating the existing layer and
 * leaving stale tiles behind.
 */
export function BasemapLayer({ basemap }: BasemapLayerProps) {
  const option =
    BASEMAP_OPTIONS.find((item) => item.id === basemap) ?? BASEMAP_OPTIONS[0];

  if (!option) {
    return null;
  }

  return (
    <>
      <TileLayer
        key={`base-${option.id}`}
        url={option.base.url}
        attribution={option.base.attribution}
        maxZoom={option.base.maxZoom}
      />

      {option.labels ? (
        <TileLayer
          key={`labels-${option.id}`}
          url={option.labels.url}
          attribution={option.labels.attribution}
          maxZoom={option.labels.maxZoom}
        />
      ) : null}
    </>
  );
}
