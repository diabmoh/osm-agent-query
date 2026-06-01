import type { OverpassElement } from "../clients/overpass.js";
import type { NominatimResult } from "../clients/nominatim.js";

export type PlaceSummary = {
  name: string;
  lat: number;
  lon: number;
  osm_id?: number;
  osm_type?: string;
  tags?: Record<string, string>;
  address_hint?: string;
};

export type GeocodeSummary = {
  query: string;
  results: Array<{
    name: string;
    lat: number;
    lon: number;
    bbox?: { south: number; west: number; north: number; east: number };
    type?: string;
  }>;
};

export function summarizeGeocode(
  query: string,
  results: NominatimResult[],
): GeocodeSummary {
  return {
    query,
    results: results.map((r) => {
      const lat = Number(r.lat);
      const lon = Number(r.lon);
      let bbox: GeocodeSummary["results"][0]["bbox"];
      if (r.boundingbox?.length === 4) {
        bbox = {
          south: Number(r.boundingbox[0]),
          north: Number(r.boundingbox[1]),
          west: Number(r.boundingbox[2]),
          east: Number(r.boundingbox[3]),
        };
      }
      return {
        name: r.display_name,
        lat,
        lon,
        bbox,
        type: r.type,
      };
    }),
  };
}

export function summarizeReverse(r: NominatimResult): {
  lat: number;
  lon: number;
  display_name: string;
  address?: Record<string, string>;
} {
  const addr = (r as NominatimResult & { address?: Record<string, string> })
    .address;
  return {
    lat: Number(r.lat),
    lon: Number(r.lon),
    display_name: r.display_name,
    address: addr,
  };
}

export function summarizeSearch(
  elements: OverpassElement[],
  categoryLabel: string,
): { category: string; count: number; places: PlaceSummary[] } {
  const places: PlaceSummary[] = [];
  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat === undefined || lon === undefined) continue;
    const tags = el.tags ?? {};
    const name =
      tags.name ??
      tags["addr:street"] ??
      tags.amenity ??
      tags.shop ??
      `${el.type}/${el.id}`;
    places.push({
      name,
      lat,
      lon,
      osm_id: el.id,
      osm_type: el.type,
      tags: Object.keys(tags).length ? tags : undefined,
    });
  }
  return {
    category: categoryLabel,
    count: places.length,
    places,
  };
}
