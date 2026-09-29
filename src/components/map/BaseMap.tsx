"use client";

import { useCallback, useState } from "react";
import { MapContainer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

import { DetailSheet } from "@/components/detail/DetailSheet";
import { DetailSidebar } from "@/components/detail/DetailSidebar";
import { FilterButton } from "@/components/filter/FilterButton";
import { FilterSheet } from "@/components/filter/FilterSheet";
import { FilterSidebar } from "@/components/filter/FilterSidebar";
import { useDatasets } from "@/hooks/use-datasets";
import { usePointFilter } from "@/hooks/use-point-filter";
import {
  DEFAULT_BASEMAP,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  type BasemapId,
} from "@/lib/map-config";
import type { MapPoint } from "@/types/dataset";
import { BasemapLayer } from "./BasemapLayer";
import { BasemapSwitcher } from "./BasemapSwitcher";
import { ClusterToggle } from "./ClusterToggle";
import { PointLayer } from "./PointLayer";

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
    clustering starts off. On a mid range phone, canvas rendering handled
    thousands of points more smoothly than markercluster did, because the
    plugin regroups every point on each zoom change and rebuilds its
    bubbles as DOM nodes. The toggle stays for now so the call can be
    remade against real survey data instead of synthetic copies.
  */
  const [clustered, setClustered] = useState(false);
  const [selected, setSelected] = useState<MapPoint | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const datasets = useDatasets();
  const filter = usePointFilter(datasets.features, datasets.active);

  /*
    useCallback keeps this the same function between renders. Without it,
    opening the panel would change the identity of onSelect, which is a
    dependency of the marker layer's effect, and every marker would be
    torn down and rebuilt on each click.
  */
  const handleSelect = useCallback((feature: MapPoint) => {
    setSelected(feature);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  const controls = (
    <div className="flex flex-wrap items-center gap-2">
      <BasemapSwitcher value={basemap} onChange={setBasemap} />
      <ClusterToggle value={clustered} onChange={setClustered} />
    </div>
  );

  const filterProps = {
    filter,
    activeDatasets: datasets.active,
    onToggleDataset: datasets.toggle,
    loadedCount: datasets.features.length,
    loadingCount: datasets.loadingCount,
    errors: datasets.errors,
    controls,
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[...DEFAULT_CENTER]}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        // draws shapes onto a single canvas instead of one SVG element
        // per marker, and skips anything outside the viewport entirely.
        preferCanvas
        className="h-full w-full"
      >
        <BasemapLayer basemap={basemap} />

        <PointLayer
          features={filter.filtered}
          clustered={clustered}
          onSelect={handleSelect}
        />
      </MapContainer>

      <div className="absolute left-3 top-3 z-500 md:hidden">
        <FilterButton
          activeCount={filter.activeCount}
          onClick={() => setFilterOpen(true)}
        />
      </div>

      <FilterSidebar {...filterProps} />

      <FilterSheet
        {...filterProps}
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
          <DetailSheet feature={selected} onClose={handleClose} />
          <DetailSidebar feature={selected} onClose={handleClose} />
        </>
      ) : null}
    </div>
  );
}
