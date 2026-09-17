"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  STREET_TILE,
} from "@/lib/map-config";

export function BaseMap() {
  return (
    <MapContainer
      center={[...DEFAULT_CENTER]}
      zoom={DEFAULT_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        url={STREET_TILE.url}
        attribution={STREET_TILE.attribution}
        maxZoom={STREET_TILE.maxZoom}
      />
    </MapContainer>
  );
}
