/*
  Explicit GeoJSON types for this project.

  These follow RFC 7946, the GeoJSON specification, but only cover the
  parts we actually use: points for the six point categories, and line
  strings for roads and bridges.
*/

/**
 * A single coordinate pair.
 *
 * GeoJSON orders this as longitude first, latitude second, which is the
 * opposite of what Leaflet expects. The tuple labels below are there so
 * the editor shows the correct order while typing.
 */
export type Position = readonly [longitude: number, latitude: number];

/** One location on the map, used by every category except roads. */
export type PointGeometry = {
  readonly type: "Point";
  readonly coordinates: Position;
};

/** A connected run of coordinates, used for road and bridge segments. */
export type LineStringGeometry = {
  readonly type: "LineString";
  readonly coordinates: readonly Position[];
};

export type Geometry = PointGeometry | LineStringGeometry;

/**
 * A geometry plus the data attached to it.
 *
 * G is the shape, P is the payload. Keeping them separate means one
 * definition serves every category instead of one Feature type each.
 */
export type Feature<G extends Geometry, P> = {
  readonly type: "Feature";
  /** Stable identifier, taken from the Kobo submission id. */
  readonly id: string;
  readonly geometry: G;
  readonly properties: P;
};

/** Shorthand for the two combinations this project uses. */
export type PointFeature<P> = Feature<PointGeometry, P>;
export type LineFeature<P> = Feature<LineStringGeometry, P>;

/** The top level container of a .geojson file. */
export type FeatureCollection<F extends Feature<Geometry, unknown>> = {
  readonly type: "FeatureCollection";
  readonly features: readonly F[];
};

/**
 * Converts a GeoJSON position into the order Leaflet wants.
 *
 * Every place where coordinates cross from data into Leaflet should go
 * through this function, so the swap happens in exactly one spot instead
 * of being remembered correctly at a dozen call sites.
 */
export function toLeafletPosition(
  position: Position,
): [latitude: number, longitude: number] {
  const [longitude, latitude] = position;
  return [latitude, longitude];
}
