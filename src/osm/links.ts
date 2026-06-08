export function osmBrowseUrl(
  type: "node" | "way" | "relation",
  id: number,
): string {
  return `https://www.openstreetmap.org/${type}/${id}`;
}

export function osmMapUrl(lat: number, lon: number, zoom = 17): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=${zoom}/${lat}/${lon}`;
}

export function osmDirectionUrl(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  profile: "foot" | "car" | "bike" = "foot",
): string {
  const mode =
    profile === "car" ? "car" : profile === "bike" ? "bicycle" : "foot";
  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_${mode}&route=${from.lat}%2C${from.lon}%3B${to.lat}%2C${to.lon}`;
}

export type PlaceLinks = {
  map: string;
  osm?: string;
  directions_from?: string;
};

export function linksForPlace(
  lat: number,
  lon: number,
  osmType?: string,
  osmId?: number,
  from?: { lat: number; lon: number },
): PlaceLinks {
  const out: PlaceLinks = { map: osmMapUrl(lat, lon) };
  if (osmType && osmId && ["node", "way", "relation"].includes(osmType)) {
    out.osm = osmBrowseUrl(osmType as "node" | "way" | "relation", osmId);
  }
  if (from) {
    out.directions_from = osmDirectionUrl(from, { lat, lon }, "foot");
  }
  return out;
}
