"use client";

import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet.markercluster";

import { readCssVariable } from "@/lib/css-variables";
import { getDatasetColor } from "@/lib/marker-style";
import { toLeafletPosition } from "@/types/geojson";
import type { MapPoint } from "@/types/dataset";

type PointLayerProps = {
  features: readonly MapPoint[];
  clustered: boolean;
  onSelect: (feature: MapPoint) => void;
};

const MARKER_RADIUS = 6;

const CLUSTER_SIZES = [
  { minCount: 100, name: "large", pixels: 52 },
  { minCount: 25, name: "medium", pixels: 42 },
  { minCount: 0, name: "small", pixels: 34 },
] as const;

function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount();
  const size =
    CLUSTER_SIZES.find((option) => count >= option.minCount) ??
    CLUSTER_SIZES[CLUSTER_SIZES.length - 1];

  if (!size) {
    throw new Error("Ukuran cluster tidak ditemukan.");
  }

  return L.divIcon({
    html: `<span>${count}</span>`,
    className: `map-cluster map-cluster-${size.name}`,
    iconSize: L.point(size.pixels, size.pixels),
  });
}

export function PointLayer({ features, clustered, onSelect }: PointLayerProps) {
  const map = useMap();

  useEffect(() => {
    const borderColor = readCssVariable("--surface");

    const markers = features.map((feature) => {
      const marker = L.circleMarker(
        toLeafletPosition(feature.geometry.coordinates),
        {
          radius: MARKER_RADIUS,
          color: borderColor,
          weight: 2,
          fillColor: getDatasetColor(feature.properties.dataset),
          fillOpacity: 1,
        },
      );

      marker.on("click", () => onSelect(feature));
      return marker;
    });

    const group = clustered
      ? L.markerClusterGroup({
          iconCreateFunction: createClusterIcon,
          // Animation is off on purpose. Markers are painted onto a single
          // canvas, and animating a cluster apart repaints that whole
          // canvas on every frame, which stutters even on small datasets.
          animate: false,
          animateAddingMarkers: false,
          chunkedLoading: true,
          disableClusteringAtZoom: 18,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          maxClusterRadius: 60,
        })
      : L.layerGroup();

    for (const marker of markers) {
      group.addLayer(marker);
    }

    map.addLayer(group);

    // Removing the layer here is what stops duplicates from piling up
    // every time the data or the toggle changes.
    return () => {
      map.removeLayer(group);
      group.clearLayers();
    };
  }, [map, features, clustered, onSelect]);

  return null;
}
