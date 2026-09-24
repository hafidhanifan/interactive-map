"use client";

import { useState } from "react";
import { MapContainer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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

export function BaseMap() {
  const [basemap, setBasemap] = useState<BasemapId>(DEFAULT_BASEMAP);

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
      </MapContainer>

      {/*
        The switcher sits above the map in plain DOM.
        z-[500] clears Leaflet's own layers, which top out around 400 for
        overlays, while staying below marker popups at 700.
      */}
      <div className="absolute right-3 top-3 z-500">
        <BasemapSwitcher value={basemap} onChange={setBasemap} />
      </div>
    </div>
  );
}
