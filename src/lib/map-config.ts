/*
  Fixed values for the Banjaroyo map.
  Kept in one file so they never end up as magic numbers inside components.
*/

/** Map center on first load, taken from the kalurahan office area. */
export const DEFAULT_CENTER: readonly [number, number] = [
  -7.6596534, 110.2155825,
];

/** Initial zoom level. Higher means closer. */
export const DEFAULT_ZOOM = 13;

/** Zoom bounds so users do not get lost far away from the village. */
export const MIN_ZOOM = 11;
export const MAX_ZOOM = 19;

/** Administrative names, shown in headings and attribution. */
export const VILLAGE_NAME = "Banjaroyo";
export const DISTRICT_NAME = "Kalibawang";
export const REGENCY_NAME = "Kulon Progo";

/** The two basemap modes the user can switch between. */
export type BasemapId = "street" | "satellite";

type TileSource = {
  url: string;
  attribution: string;
  maxZoom: number;
  highDensity?: boolean;
};

type BasemapOption = {
  id: BasemapId;
  label: string;
  base: TileSource;
  labels?: TileSource;
};

const OSM_TILE: TileSource = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
  highDensity: false,
};

const ESRI_IMAGERY_TILE: TileSource = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution:
    "Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  maxZoom: 19,
  highDensity: true,
};

const ESRI_BOUNDARIES_TILE: TileSource = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
  attribution: "Labels &copy; Esri",
  maxZoom: 19,
  highDensity: true,
};

export const BASEMAP_OPTIONS: readonly BasemapOption[] = [
  {
    id: "street",
    label: "Peta",
    base: OSM_TILE,
  },
  {
    id: "satellite",
    label: "Satelit",
    base: ESRI_IMAGERY_TILE,
    labels: ESRI_BOUNDARIES_TILE,
  },
];

export const DEFAULT_BASEMAP: BasemapId = "street";
