import type { OverpassElement } from "../clients/overpass.js";
import type { NominatimResult } from "../clients/nominatim.js";
import { haversineM } from "../geo/haversine.js";
import { linksForPlace, osmMapUrl } from "../osm/links.js";
import { extractHighlights } from "../osm/tag-highlights.js";

const MAX_TAGS_PER_PLACE = 12;

export type OutputFormat = "compact" | "full";

export type PlaceSummary = {
  name: string;
  lat: number;
  lon: number;
  distance_m?: number;
  osm_id?: number;
  osm_type?: string;
  links?: { map: string; osm?: string; directions_from?: string };
  highlights?: Record<string, string>;
  tags?: Record<string, string>;
};

export type GeocodeSummary = {
  query: string;
  results: Array<{
    name: string;
    lat: number;
    lon: number;
    bbox?: { south: number; west: number; north: number; east: number };
    type?: string;
    map_link: string;
  }>;
};

function trimTags(tags: Record<string, string>): Record<string, string> {
  const keys = Object.keys(tags).slice(0, MAX_TAGS_PER_PLACE);
  return Object.fromEntries(keys.map((k) => [k, tags[k]]));
}

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
        map_link: osmMapUrl(lat, lon),
      };
    }),
  };
}

export function summarizeReverse(r: NominatimResult): {
  lat: number;
  lon: number;
  display_name: string;
  address?: Record<string, string>;
  links: { map: string };
} {
  const addr = (r as NominatimResult & { address?: Record<string, string> })
    .address;
  const lat = Number(r.lat);
  const lon = Number(r.lon);
  return {
    lat,
    lon,
    display_name: r.display_name,
    address: addr,
    links: { map: osmMapUrl(lat, lon) },
  };
}

export function summarizeSearch(
  elements: OverpassElement[],
  categoryLabel: string,
  opts?: {
    centerLat?: number;
    centerLon?: number;
    format?: OutputFormat;
  },
): { category: string; count: number; places: PlaceSummary[] } {
  const format = opts?.format ?? "compact";
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

    const place: PlaceSummary = { name, lat, lon };

    if (el.id && el.type) {
      place.osm_id = el.id;
      place.osm_type = el.type;
    }

    if (opts?.centerLat !== undefined && opts?.centerLon !== undefined) {
      place.distance_m = haversineM(
        opts.centerLat,
        opts.centerLon,
        lat,
        lon,
      );
    }

    place.links = linksForPlace(
      lat,
      lon,
      el.type,
      el.id,
      opts?.centerLat !== undefined && opts?.centerLon !== undefined
        ? { lat: opts.centerLat, lon: opts.centerLon }
        : undefined,
    );

    const highlights = extractHighlights(tags);
    if (highlights) place.highlights = highlights;

    if (format === "full" && Object.keys(tags).length) {
      place.tags = trimTags(tags);
    }

    places.push(place);
  }

  if (places.some((p) => p.distance_m !== undefined)) {
    places.sort(
      (a, b) => (a.distance_m ?? Infinity) - (b.distance_m ?? Infinity),
    );
  }

  return { category: categoryLabel, count: places.length, places };
}
