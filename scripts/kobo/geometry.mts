const EARTH_RADIUS_METRES = 6_371_000;

/** [longitude, latitude], the order GeoJSON uses. */
export type LngLat = readonly [longitude: number, latitude: number];

export type ParsedTrace =
  | {
      ok: true;
      /** Rounded, ready to publish. */
      coordinates: LngLat[];
      /** Measured along the recorded points, before rounding. */
      lengthMetres: number;
      /** Worst accuracy the device reported, null when it reported none. */
      worstAccuracy: number | null;
    }
  | { ok: false; reason: string };

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Great circle distance between two points, in metres. */
export function distanceMetres(from: LngLat, to: LngLat): number {
  const [fromLon, fromLat] = from;
  const [toLon, toLat] = to;

  const dLat = toRadians(toLat - fromLat);
  const dLon = toRadians(toLon - fromLon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.sqrt(a));
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Reads a geotrace cell into coordinates, a length and an accuracy. */
export function parseTrace(raw: string, decimals: number): ParsedTrace {
  const entries = raw
    .split(";")
    .map((entry) => entry.trim())
    .filter((entry) => entry !== "");

  if (entries.length < 2) {
    return { ok: false, reason: "garis kurang dari dua titik" };
  }

  const points: LngLat[] = [];
  let worstAccuracy = 0;

  for (const entry of entries) {
    const [latText, lonText, , accuracyText] = entry.split(/\s+/);

    // Number("") is 0, so a missing value has to be caught before parsing.
    if (latText === undefined || lonText === undefined) {
      return { ok: false, reason: "ada titik tanpa koordinat lengkap" };
    }

    const latitude = Number(latText);
    const longitude = Number(lonText);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return { ok: false, reason: "ada titik dengan koordinat bukan angka" };
    }
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return {
        ok: false,
        reason: "ada titik di luar rentang koordinat yang sah",
      };
    }

    points.push([longitude, latitude]);

    const accuracy = Number(accuracyText);
    if (Number.isFinite(accuracy) && accuracy > worstAccuracy) {
      worstAccuracy = accuracy;
    }
  }

  let lengthMetres = 0;
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    if (previous && current) {
      lengthMetres += distanceMetres(previous, current);
    }
  }

  return {
    ok: true,
    coordinates: points.map(
      ([longitude, latitude]): LngLat => [
        roundTo(longitude, decimals),
        roundTo(latitude, decimals),
      ],
    ),
    lengthMetres,
    worstAccuracy: worstAccuracy > 0 ? worstAccuracy : null,
  };
}

/** 485 becomes "485 m", 1100 becomes "1,1 km", in Indonesian notation. */
export function formatLength(metres: number): string {
  if (metres < 1000) {
    return Math.round(metres).toLocaleString("id-ID") + " m";
  }
  return (
    (metres / 1000).toLocaleString("id-ID", { maximumFractionDigits: 2 }) +
    " km"
  );
}
