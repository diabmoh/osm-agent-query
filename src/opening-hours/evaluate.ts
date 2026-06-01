import opening_hours from "opening_hours";

export type OpenStatus =
  | "open"
  | "closed"
  | "unknown"
  | "no_hours_tag"
  | "invalid_hours";

export type OpeningHoursEvaluation = {
  status: OpenStatus;
  opening_hours?: string;
  comment?: string;
  next_change_iso?: string;
  prettified?: string;
  parse_warning?: string;
};

export type LocationContext = {
  lat: number;
  lon: number;
  country_code?: string;
};

function nominatimStub(loc: LocationContext) {
  return {
    lat: loc.lat,
    lon: loc.lon,
    address: {
      country_code: loc.country_code ?? "us",
      state: "",
    },
  };
}

/** Evaluate OSM opening_hours tag at a given instant (use ISO strings with timezone). */
export function evaluateOpeningHours(
  raw: string | undefined,
  at: Date,
  location?: LocationContext,
): OpeningHoursEvaluation {
  if (!raw?.trim()) {
    return { status: "no_hours_tag" };
  }

  const value = raw.trim();
  try {
    const oh = location
      ? new opening_hours(value, nominatimStub(location))
      : new opening_hours(value);

    const warnings = oh.getWarnings();
    const parseWarning =
      warnings.length > 0 ? warnings.join("; ") : undefined;

    if (oh.getUnknown(at)) {
      return {
        status: "unknown",
        opening_hours: value,
        comment: oh.getComment(at),
        parse_warning: parseWarning,
        prettified: safePrettify(oh),
      };
    }

    const isOpen = oh.getState(at);
    const next = oh.getNextChange(at);
    return {
      status: isOpen ? "open" : "closed",
      opening_hours: value,
      comment: oh.getComment(at),
      next_change_iso: next?.toISOString(),
      prettified: safePrettify(oh),
      parse_warning: parseWarning,
    };
  } catch (e) {
    return {
      status: "invalid_hours",
      opening_hours: value,
      parse_warning: e instanceof Error ? e.message : String(e),
    };
  }
}

function safePrettify(oh: opening_hours): string | undefined {
  try {
    return oh.prettifyValue();
  } catch {
    return undefined;
  }
}

export function parseAtTime(at_time?: string): Date {
  if (!at_time) return new Date();
  const d = new Date(at_time);
  if (Number.isNaN(d.getTime())) {
    throw new Error(
      `Invalid at_time: use ISO 8601 with timezone, e.g. 2026-06-01T14:00:00+02:00`,
    );
  }
  return d;
}
