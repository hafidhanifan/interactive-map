"use client";

import { useCallback, useState } from "react";
import { MapContainer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

import { UmkmDetailSheet } from "@/components/detail/UmkmDetailSheet";
import { UmkmDetailSidebar } from "@/components/detail/UmkmDetailSidebar";
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

export function BaseMap() {
  const [basemap, setBasemap] = useState<BasemapId>(DEFAULT_BASEMAP);

  const [clustered, setClustered] = useState(false);
  const [selected, setSelected] = useState<UmkmFeature | null>(null);

  const umkm = useUmkmData();

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
        // draws shapes onto a single canvas instead of one SVG element per marker, and skips anything outside the viewport entirely.
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
        <>
          <UmkmDetailSheet feature={selected} onClose={handleClose} />
          <UmkmDetailSidebar feature={selected} onClose={handleClose} />
        </>
      ) : null}
    </div>
  );
}
