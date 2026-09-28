"use client";

import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet.markercluster";

import { getCategoryColor } from "@/lib/category-style";
import { readCssVariable } from "@/lib/css-variables";
import { buildUmkmPopup } from "@/lib/popup-content";
import { toLeafletPosition } from "@/types/geojson";
import type { UmkmFeature } from "@/types/umkm";

type UmkmClusterLayerProps = {
  features: readonly UmkmFeature[];
  clustered: boolean;
};

const MARKER_RADIUS = 6;

/** thresholds used to size the cluster bubble. */
const MEDIUM_CLUSTER = 25;
const LARGE_CLUSTER = 100;

function createClusterIcon(cluster: L.MarkerCluster): L.DivIcon {
  const count = cluster.getChildCount();
  const size =
    count >= LARGE_CLUSTER
      ? "large"
      : count >= MEDIUM_CLUSTER
        ? "medium"
        : "small";

  return L.divIcon({
    html: `<span>${count}</span>`,
    className: `umkm-cluster umkm-cluster-${size}`,
    iconSize: L.point(40, 40),
  });
}

export function UmkmClusterLayer({
  features,
  clustered,
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

      // popup content is built only when the marker is actually opened, so thousands of unopened popups cost nothing.
      marker.bindPopup(() => buildUmkmPopup(feature.properties));
      return marker;
    });

    const group = clustered
      ? L.markerClusterGroup({
          iconCreateFunction: createClusterIcon,
          // adds markers in batches so the browser stays responsive while a large dataset is being placed.
          chunkedLoading: true,
          // stop clustering once the user is close enough to see detail.
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

    // removing the layer here is what stops duplicates from piling up every time the data or the toggle changes.
    return () => {
      map.removeLayer(group);
      group.clearLayers();
    };
  }, [map, features, clustered]);

  return null;
}
