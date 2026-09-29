"use client";

import { useCallback, useState } from "react";
import { MapContainer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

import { UmkmDetailSheet } from "@/components/detail/UmkmDetailSheet";
import { UmkmDetailSidebar } from "@/components/detail/UmkmDetailSidebar";
import { FilterButton } from "@/components/filter/FilterButton";
import { UmkmFilterSheet } from "@/components/filter/UmkmFilterSheet";
import { UmkmFilterSidebar } from "@/components/filter/UmkmFilterSidebar";
import { useUmkmData } from "@/hooks/use-umkm-data";
import { useUmkmFilter } from "@/hooks/use-umkm-filter";
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
import { UmkmClusterLayer } from "./UmkmClusterLayer";

const EMPTY_FEATURES: readonly UmkmFeature[] = [];

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
  const [filterOpen, setFilterOpen] = useState(false);

  const umkm = useUmkmData();
  const allFeatures = umkm.status === "ready" ? umkm.features : EMPTY_FEATURES;
  const filter = useUmkmFilter(allFeatures);

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

  const activeFilterCount =
    filter.selectedCategories.length + filter.selectedPadukuhan.length;

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      <BasemapSwitcher value={basemap} onChange={setBasemap} />
      <ClusterToggle value={clustered} onChange={setClustered} />
    </div>
  );

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

        <UmkmClusterLayer
          features={filter.filtered}
          clustered={clustered}
          onSelect={handleSelect}
        />
      </MapContainer>

      <div className="absolute left-3 top-3 z-500 md:hidden">
        <FilterButton
          activeCount={activeFilterCount}
          onClick={() => setFilterOpen(true)}
        />
      </div>

      <UmkmFilterSidebar
        filter={filter}
        totalCount={allFeatures.length}
        controls={controls}
      />

      <UmkmFilterSheet
        filter={filter}
        totalCount={allFeatures.length}
        controls={controls}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      />

      {/*
        Both detail panels are always rendered and one is hidden by CSS.
        Choosing between them in JavaScript would mean measuring the
        window, which flickers on the first paint.
      */}
      {selected ? (
        <>
          <UmkmDetailSheet feature={selected} onClose={handleClose} />
          <UmkmDetailSidebar feature={selected} onClose={handleClose} />
        </>
      ) : null}
    </div>
  );
}
