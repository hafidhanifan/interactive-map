"use client";

import { useCallback, useState } from "react";
import { MapContainer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

import { UmkmDetailPanel } from "@/components/detail/UmkmDetailPanel";
import { useUmkmData } from "@/hooks/use-umkm-data";
import {
  DEFAULT_BASEMAP,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  type BasemapId,
} from "@/lib/map-config";
import type { UmkmFeature } from "@/types/umkm";
import { BasemapLayer } from "./BasemapLayer";
import { BasemapSwitcher } from "./BasemapSwitcher";
import { ClusterToggle } from "./ClusterToggle";
import { DataStatusBadge } from "./DataStatusBadge";
import { UmkmClusterLayer } from "./UmkmClusterLayer";

/**
 * The Leaflet map itself.
 *
 * This component must never be rendered on the server: Leaflet touches
 * window and document as soon as it is imported. MapLoader is responsible
 * for keeping it browser only.
 */
export function BaseMap() {
  const [basemap, setBasemap] = useState<BasemapId>(DEFAULT_BASEMAP);

  /*
    Clustering starts off. On a mid range phone, canvas rendering handled
    thousands of points more smoothly than markercluster did, because the
    plugin regroups every point on each zoom change and rebuilds its
    bubbles as DOM nodes. The toggle stays for now so the call can be
    remade against real survey data instead of synthetic copies.
  */
  const [clustered, setClustered] = useState(false);
  const [selected, setSelected] = useState<UmkmFeature | null>(null);

  const umkm = useUmkmData();

  /*
    useCallback keeps this the same function between renders. Without it,
    opening the panel would change the identity of onSelect, which is a
    dependency of the marker layer's effect, and every marker would be
    torn down and rebuilt on each click.
  */
  const handleSelect = useCallback((feature: UmkmFeature) => {
    setSelected(feature);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[...DEFAULT_CENTER]}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        // Draws shapes onto a single canvas instead of one SVG element
        // per marker, and skips anything outside the viewport entirely.
        preferCanvas
        className="h-full w-full"
      >
        <BasemapLayer basemap={basemap} />

        {umkm.status === "ready" ? (
          <UmkmClusterLayer
            features={umkm.features}
            clustered={clustered}
            onSelect={handleSelect}
          />
        ) : null}
      </MapContainer>

      {/*
        Controls sit above the map in plain DOM.
        z-[500] clears Leaflet's own layers, which top out around 400 for
        overlays, while staying below marker popups at 700.
      */}
      <div className="absolute right-3 top-3 z-500 flex flex-col items-end gap-2">
        <BasemapSwitcher value={basemap} onChange={setBasemap} />
        <ClusterToggle value={clustered} onChange={setClustered} />
        <DataStatusBadge
          status={umkm.status}
          count={umkm.status === "ready" ? umkm.features.length : 0}
          message={umkm.status === "error" ? umkm.message : undefined}
        />
      </div>

      {selected ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-500">
          <div className="pointer-events-auto">
            <UmkmDetailPanel feature={selected} onClose={handleClose} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
