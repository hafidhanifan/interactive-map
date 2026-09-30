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
 * detectRetina is set per source rather than globally. OpenStreetMap
 * draws its standard tiles for one device pixel per CSS pixel and has
 * no higher density version, so asking for a deeper zoom level there
 * only quadruples the number of requests without adding detail. Esri
 * imagery comes from high resolution photography, so the extra level
 * genuinely shows more.
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
        detectRetina={option.base.highDensity ?? false}
      />

      {option.labels ? (
        <TileLayer
          key={`labels-${option.id}`}
          url={option.labels.url}
          attribution={option.labels.attribution}
          maxZoom={option.labels.maxZoom}
          detectRetina={option.labels.highDensity ?? false}
        />
      ) : null}
    </>
  );
}
