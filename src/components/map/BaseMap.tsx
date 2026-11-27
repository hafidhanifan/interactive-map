"use client";

import { useCallback, useMemo, useState } from "react";
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
import {
  isLineFeature,
  isPointFeature,
  type MapFeature,
} from "@/types/dataset";
import { BasemapLayer } from "./BasemapLayer";
import { BasemapSwitcher } from "./BasemapSwitcher";
import { ClusterToggle } from "./ClusterToggle";
import { LineLayer } from "./LineLayer";
import { PointLayer } from "./PointLayer";

export function BaseMap() {
  const [basemap, setBasemap] = useState<BasemapId>(DEFAULT_BASEMAP);

  const [clustered, setClustered] = useState(false);
  const [selected, setSelected] = useState<MapFeature | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  const datasets = useDatasets();
  const filter = usePointFilter(datasets.features, datasets.active);

  // Points and road segments are drawn by different layers.
  const points = useMemo(
    () => filter.filtered.filter(isPointFeature),
    [filter.filtered],
  );
  const lines = useMemo(
    () => filter.filtered.filter(isLineFeature),
    [filter.filtered],
  );

  const handleSelect = useCallback((feature: MapFeature) => {
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
        <LineLayer features={lines} onSelect={handleSelect} />
        <PointLayer
          features={points}
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

      {selected ? (
        <>
          <DetailSheet feature={selected} onClose={handleClose} />
          <DetailSidebar feature={selected} onClose={handleClose} />
        </>
      ) : null}
    </div>
  );
}
