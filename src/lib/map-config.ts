// map center on first load
export const DEFAULT_CENTER: readonly [number, number] = [
  -7.6596534, 110.2155825,
];

// initial zoom level. higher means closer
export const DEFAULT_ZOOM = 13;

// zoom bounds so users dont get lost far away from village
export const MIN_ZOOM = 11;
export const MAX_ZOOM = 19;

// administrative names, shown in headings and attribution
export const VILLAGE_NAME = "Banjaroyo";
export const DISTRICT_NAME = "Kalibawang";
export const REGENCY_NAME = "Kulon Progo";

// the two basemap modes the user can switch between
export type BasemapId = "street" | "satellite";

type TileSource = {
  url: string;
  attribution: string;
  maxZoom: number;
};

type BasemapOption = {
  id: BasemapId;
  /** Shown on the switcher button, so Indonesian. */
  label: string;
  base: TileSource;
  /**
   * Optional transparent layer drawn on top of the base.
   * Satellite imagery carries no place names, so labels come from here.
   */
  labels?: TileSource;
};

const OSM_TILE: TileSource = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
};

const ESRI_IMAGERY_TILE: TileSource = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  attribution:
    "Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  maxZoom: 19,
};

const ESRI_BOUNDARIES_TILE: TileSource = {
  url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
  attribution: "Labels &copy; Esri",
  maxZoom: 19,
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
