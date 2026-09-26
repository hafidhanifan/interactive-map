import type { FeatureCollection, PointFeature } from "./geojson";

export type UmkmCategory =
  | "toko-kelontong"
  | "kuliner"
  | "rumah-produksi"
  | "jasa"
  | "pengepul-hasil-kebun"
  | "bengkel"
  | "konter"
  | "lainnya";

export const UMKM_CATEOGRY_LABELS: Record<UmkmCategory, string> = {
  "toko-kelontong": "Toko Kelontong",
  kuliner: "Kuliner",
  "rumah-produksi": "Rumah Produksi",
  jasa: "Jasa",
  "pengepul-hasil-kebun": "Pengepul / Penjual Hasil Kebun",
  bengkel: "Bengkel",
  konter: "Konter",
  lainnya: "Lainnya",
};

export type UmkmProperties = {
  readonly category: UmkmCategory; // slug used for filtering and marker colour
  readonly categoryLabel: string;
  readonly name: string;
  readonly ownerName: string | null;
  readonly products: readonly string[];
  readonly padukuhan: string;
  readonly rt: string;
  readonly rw: string;
  readonly detail: string | null;
  readonly phone: string | null;
  readonly pirtNumber: string | null;
  readonly halalCertified: boolean;
  readonly halalNumber: string | null;
  readonly photos: readonly string[];
  readonly gpsPrecision: number | null;
};

export type UmkmFeature = PointFeature<UmkmProperties>;
export type UmkmCollection = FeatureCollection<UmkmFeature>;
