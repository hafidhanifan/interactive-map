import { DatasetId } from "@/types/dataset";

export type DatasetInfo = {
  id: DatasetId;
  label: string;
  shortLabel: string;
  colorVariable: string;
  facetTitle: string | null;
  file: string;
};

export const DATASETS: readonly DatasetInfo[] = [
  {
    id: "umkm",
    label: "UMKM",
    shortLabel: "UMKM",
    colorVariable: "--category-umkm",
    facetTitle: "Jenis usaha",
    file: "/data/umkm.geojson",
  },
  {
    id: "fasum",
    label: "Fasilitas Umum",
    shortLabel: "Fasum",
    colorVariable: "--category-public-facility",
    facetTitle: "Jenis fasilitas",
    file: "/data/fasum.geojson",
  },
  {
    id: "kebun",
    label: "Perkebunan",
    shortLabel: "Kebun",
    colorVariable: "--category-plantation",
    facetTitle: "Komoditas",
    file: "/data/kebun.geojson",
  },
  {
    id: "ternak",
    label: "Peternakan dan Perikanan",
    shortLabel: "Ternak",
    colorVariable: "--category-livestock",
    facetTitle: "Jenis usaha",
    file: "/data/ternak.geojson",
  },
  {
    id: "rtlh",
    label: "Rumah Tidak Layak Huni",
    shortLabel: "RTLH",
    colorVariable: "--category-rtlh",
    facetTitle: null,
    file: "/data/rtlh.geojson",
  },
  {
    id: "jamban",
    label: "Jamban Kurang Standar",
    shortLabel: "Jamban",
    colorVariable: "--category-sanitation",
    facetTitle: null,
    file: "/data/jamban.geojson",
  },
];

export const DEFAULT_ACTIVE_DATASETS: readonly DatasetId[] = ["umkm"];

const BY_ID = new Map(DATASETS.map((item) => [item.id, item]));

export function getDataset(id: DatasetId): DatasetInfo {
  const found = BY_ID.get(id);
  if (!found) {
    throw new Error("Kategori tidak dikenal: " + id);
  }
  return found;
}
