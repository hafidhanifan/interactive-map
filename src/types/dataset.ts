import type { LineFeature, PointFeature } from "./geojson";

// the 7 categories currently published. roads and brigdes will join later. */
export type DatasetId =
  | "umkm"
  | "fasum"
  | "kebun"
  | "ternak"
  | "rtlh"
  | "jamban"
  | "jalan";

// one labelled line in the detail panel
export type DetailItem = {
  readonly label: string;
  readonly value: string;
};

export type PointProperties = {
  readonly dataset: DatasetId;
  readonly name: string;
  readonly subtitle: string | null;
  readonly padukuhan: string | null;
  readonly address: string | null;
  readonly facets: readonly string[];
  readonly details: readonly DetailItem[];
  readonly phone: string | null;
  readonly photos: readonly string[];
  readonly gpsPrecision: number | null;
  readonly variant?: string | null;
};

export type MapPoint = PointFeature<PointProperties>;
export type MapLine = LineFeature<PointProperties>;

/** Anything the map can draw: a point or a road segment. */
export type MapFeature = MapPoint | MapLine;

export function isPointFeature(feature: MapFeature): feature is MapPoint {
  return feature.geometry.type === "Point";
}

export function isLineFeature(feature: MapFeature): feature is MapLine {
  return feature.geometry.type === "LineString";
}
