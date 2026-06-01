/** Max search radius in meters. */
export const MAX_RADIUS_M = 5000;

/** Min search radius in meters. */
export const MIN_RADIUS_M = 10;

/** Max results returned per search. */
export const MAX_RESULTS = 50;

/** Default results cap. */
export const DEFAULT_RESULTS = 20;

/** Max bbox span in degrees (roughly ~55km at equator). */
export const MAX_BBOX_SPAN_DEG = 0.5;

/** Overpass query timeout in seconds. */
export const OVERPASS_TIMEOUT_S = 25;

export type LatLon = { lat: number; lon: number };

export type Bbox = {
  south: number;
  west: number;
  north: number;
  east: number;
};

export function validateCoordinates(lat: number, lon: number): void {
  if (lat < -90 || lat > 90) {
    throw new Error(`Invalid latitude: ${lat} (must be -90..90)`);
  }
  if (lon < -180 || lon > 180) {
    throw new Error(`Invalid longitude: ${lon} (must be -180..180)`);
  }
}

export function validateRadius(radiusM: number): void {
  if (radiusM < MIN_RADIUS_M || radiusM > MAX_RADIUS_M) {
    throw new Error(
      `Radius must be between ${MIN_RADIUS_M}m and ${MAX_RADIUS_M}m`,
    );
  }
}

export function validateBbox(bbox: Bbox): void {
  if (bbox.south >= bbox.north) {
    throw new Error("bbox south must be less than north");
  }
  if (bbox.west >= bbox.east && bbox.west * bbox.east > 0) {
    throw new Error("bbox west must be less than east (non-antimeridian)");
  }
  const latSpan = bbox.north - bbox.south;
  const lonSpan = Math.abs(bbox.east - bbox.west);
  if (latSpan > MAX_BBOX_SPAN_DEG || lonSpan > MAX_BBOX_SPAN_DEG) {
    throw new Error(
      `Bbox too large (max ${MAX_BBOX_SPAN_DEG}° per side). Use a smaller area or search_nearby.`,
    );
  }
}

export function clampLimit(limit?: number): number {
  const n = limit ?? DEFAULT_RESULTS;
  return Math.min(Math.max(1, Math.floor(n)), MAX_RESULTS);
}

/** Build a bbox around a point with given radius in meters. */
export function bboxAroundPoint(lat: number, lon: number, radiusM: number): Bbox {
  validateCoordinates(lat, lon);
  validateRadius(radiusM);
  const dLat = radiusM / 111_320;
  const dLon = radiusM / (111_320 * Math.cos((lat * Math.PI) / 180));
  const bbox: Bbox = {
    south: lat - dLat,
    north: lat + dLat,
    west: lon - dLon,
    east: lon + dLon,
  };
  validateBbox(bbox);
  return bbox;
}
