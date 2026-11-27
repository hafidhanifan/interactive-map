import L from "leaflet";

import { readCssVariable } from "./css-variables";
import { getRoadStyle } from "./road-style";
import { toLeafletPosition } from "@/types/geojson";
import type { MapLine } from "@/types/dataset";

/** Width of the coloured line a person sees. */
const LINE_WEIGHT = 5;

/** The white edge that keeps a line readable over busy map imagery. */
const CASING_WEIGHT = 9;

const HIT_WEIGHT = 28;

export function createRoadLayer(
  map: L.Map,
  lines: readonly MapLine[],
  onSelect: (feature: MapLine) => void,
): L.LayerGroup {
  const casingColor = readCssVariable("--surface");

  const hits: L.Polyline[] = [];
  const casings: L.Polyline[] = [];
  const strokes: L.Polyline[] = [];
  const group = L.layerGroup();

  for (const feature of lines) {
    const path = feature.geometry.coordinates.map(toLeafletPosition);
    const style = getRoadStyle(feature.properties.variant);

    const hit = L.polyline(path, {
      weight: HIT_WEIGHT,
      opacity: 0,
      lineCap: "round",
      lineJoin: "round",
      interactive: true,
    });
    hit.on("click", () => onSelect(feature));

    const casing = L.polyline(path, {
      weight: CASING_WEIGHT,
      color: casingColor,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
      interactive: false,
    });

    const stroke = L.polyline(path, {
      weight: LINE_WEIGHT,
      color: style.color,
      opacity: 1,
      dashArray: style.dashArray ?? undefined,
      lineCap: style.dashArray ? "butt" : "round",
      lineJoin: "round",
      interactive: false,
    });

    hits.push(hit);
    casings.push(casing);
    strokes.push(stroke);
    group.addLayer(hit).addLayer(casing).addLayer(stroke);
  }

  map.addLayer(group);

  // Each call sends a layer behind everything already there, so the group
  // sent last ends up furthest back: strokes first, tap targets last.
  for (const layer of strokes) layer.bringToBack();
  for (const layer of casings) layer.bringToBack();
  for (const layer of hits) layer.bringToBack();

  return group;
}
