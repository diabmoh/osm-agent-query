import type { OverpassElement } from "../clients/overpass.js";
import type { PlaceSummary } from "../summarize/results.js";
import {
  evaluateOpeningHours,
  parseAtTime,
  type LocationContext,
  type OpenStatus,
} from "./evaluate.js";

export type OpenNowFilterMode = "open_only" | "open_and_unknown" | "all_with_status";

export type OpenNowOptions = {
  at_time?: string;
  mode?: OpenNowFilterMode;
  location?: LocationContext;
};

export type PlaceWithHours = PlaceSummary & {
  open_status: OpenStatus;
  opening_hours?: string;
  hours_prettified?: string;
  next_change_iso?: string;
  hours_comment?: string;
};

export function filterElementsOpenNow(
  elements: OverpassElement[],
  opts: OpenNowOptions,
): {
  at_iso: string;
  places: PlaceWithHours[];
  stats: {
    candidates: number;
    open: number;
    closed: number;
    unknown: number;
    no_hours_tag: number;
    invalid_hours: number;
  };
} {
  const at = parseAtTime(opts.at_time);
  const mode = opts.mode ?? "open_only";

  const places: PlaceWithHours[] = [];
  const stats = {
    candidates: 0,
    open: 0,
    closed: 0,
    unknown: 0,
    no_hours_tag: 0,
    invalid_hours: 0,
  };

  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat === undefined || lon === undefined) continue;

    stats.candidates++;
    const tags = el.tags ?? {};
    const ohRaw = tags.opening_hours;
    const loc: LocationContext = opts.location ?? { lat, lon };

    const evalResult = evaluateOpeningHours(ohRaw, at, loc);
    bumpStat(stats, evalResult.status);

    const include = shouldInclude(evalResult.status, mode);
    if (!include) continue;

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
      open_status: evalResult.status,
      opening_hours: evalResult.opening_hours,
      hours_prettified: evalResult.prettified,
      next_change_iso: evalResult.next_change_iso,
      hours_comment: evalResult.comment,
    });
  }

  return { at_iso: at.toISOString(), places, stats };
}

function bumpStat(
  stats: {
    candidates: number;
    open: number;
    closed: number;
    unknown: number;
    no_hours_tag: number;
    invalid_hours: number;
  },
  status: OpenStatus,
): void {
  switch (status) {
    case "open":
      stats.open++;
      break;
    case "closed":
      stats.closed++;
      break;
    case "unknown":
      stats.unknown++;
      break;
    case "no_hours_tag":
      stats.no_hours_tag++;
      break;
    case "invalid_hours":
      stats.invalid_hours++;
      break;
  }
}

function shouldInclude(status: OpenStatus, mode: OpenNowFilterMode): boolean {
  if (mode === "all_with_status") return true;
  if (mode === "open_and_unknown") {
    return (
      status === "open" ||
      status === "unknown" ||
      status === "no_hours_tag"
    );
  }
  return status === "open";
}
