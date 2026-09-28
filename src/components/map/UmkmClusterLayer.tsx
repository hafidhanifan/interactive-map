"use client";

import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet.markercluster";

import { getCategoryColor } from "@/lib/category-style";
import { readCssVariable } from "@/lib/css-variables";
import { toLeafletPosition } from "@/types/geojson";
import type { UmkmFeature } from "@/types/umkm";

type UmkmClusterLayerProps = {
  features: readonly UmkmFeature[];
  clustered: boolean;
  onSelect: (feature: UmkmFeature) => void;
};

const MARKER_RADIUS = 6;

/**
 * Cluster bubble sizes.
 *
 * The pixel values here must match the widths in globals.css exactly:
 * Leaflet offsets an icon by half of the size it is told, so a mismatch
 * pushes the bubble off the point it represents.
 */
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
    className: `umkm-cluster umkm-cluster-${size.name}`,
    iconSize: L.point(size.pixels, size.pixels),
  });
}

/**
 * Draws the UMKM points and reports clicks back to the map.
 *
 * markercluster is a plain Leaflet plugin with no React wrapper, so the
 * layer is created and torn down by hand inside an effect rather than
 * rendered as JSX.
 */
export function UmkmClusterLayer({
  features,
  clustered,
  onSelect,
}: UmkmClusterLayerProps) {
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
          fillColor: getCategoryColor(feature.properties.category),
          fillOpacity: 1,
        },
      );

      // No bound popup any more: the click opens the React panel instead,
      // which can show photos and does not shift the map to fit itself.
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
