// map center on first load
export const DEFAULT_CENTER: readonly [number, number] = [-7.7167, 110.2];

// initial zoom level. higher means closer
export const DEFAULT_ZOOM = 13;

// zoom bounds so users dont get lost far away from village
export const MIN_ZOOM = 11;
export const MAX_ZOOM = 19;

// administrative names, shown in headings and attribution
export const VILLAGE_NAME = "Banjaroyo";
export const DISTRICT_NAME = "Kalibawang";
export const REGENCY_NAME = "Kulon Progo";

// street basemap from OpenStreetMap
export const STREET_TILE = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
} as const;
