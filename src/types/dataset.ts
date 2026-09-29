import type { PointFeature } from "./geojson";

// the six categories currently published. roads and brigdes will join later. */
export type DatasetId =
  | "umkm"
  | "fasum"
  | "kebun"
  | "ternak"
  | "rtlh"
  | "jamban";

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
};

export type MapPoint = PointFeature<PointProperties>;
