"use client";

import { useState } from "react";
import { MapContainer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { useUmkmData } from "@/hooks/use-umkm-data";
import {
  DEFAULT_BASEMAP,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  type BasemapId,
} from "@/lib/map-config";
import { BasemapLayer } from "./BasemapLayer";
import { BasemapSwitcher } from "./BasemapSwitcher";
import { DataStatusBadge } from "./DataStatusBadge";
import { UmkmMarker } from "./UmkmMarker";

export function BaseMap() {
  const [basemap, setBasemap] = useState<BasemapId>(DEFAULT_BASEMAP);
  const umkm = useUmkmData();

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[...DEFAULT_CENTER]}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
      >
        <BasemapLayer basemap={basemap} />

        {umkm.status === "ready"
          ? umkm.features.map((feature) => (
              <UmkmMarker key={feature.id} feature={feature} />
            ))
          : null}
      </MapContainer>

      {/*
        Controls sit above the map in plain DOM.
        z-[500] clears Leaflet's own layers, which top out around 400 for
        overlays, while staying below marker popups at 700.
      */}
      <div className="absolute right-3 top-3 z-500 flex flex-col items-end gap-2">
        <BasemapSwitcher value={basemap} onChange={setBasemap} />
        <DataStatusBadge
          status={umkm.status}
          count={umkm.status === "ready" ? umkm.features.length : 0}
          message={umkm.status === "error" ? umkm.message : undefined}
        />
      </div>
    </div>
  );
}
