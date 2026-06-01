export type TagFilter = Record<string, string>;

export type CategorySpec = {
  label: string;
  tags: TagFilter[];
  description: string;
};

/** Common categories mapped to OSM tag combinations. */
export const CATEGORY_MAP: Record<string, CategorySpec> = {
  restaurant: {
    label: "Restaurant",
    tags: [{ amenity: "restaurant" }, { amenity: "fast_food" }],
    description: "Places serving food",
  },
  cafe: {
    label: "Cafe",
    tags: [{ amenity: "cafe" }, { shop: "coffee" }],
    description: "Coffee shops and cafes",
  },
  pharmacy: {
    label: "Pharmacy",
    tags: [{ amenity: "pharmacy" }],
    description: "Pharmacies and drugstores",
  },
  supermarket: {
    label: "Supermarket",
    tags: [{ shop: "supermarket" }, { shop: "convenience" }],
    description: "Grocery stores",
  },
  hospital: {
    label: "Hospital",
    tags: [{ amenity: "hospital" }, { amenity: "clinic" }],
    description: "Medical facilities",
  },
  school: {
    label: "School",
    tags: [{ amenity: "school" }, { amenity: "kindergarten" }],
    description: "Educational institutions",
  },
  parking: {
    label: "Parking",
    tags: [{ amenity: "parking" }, { parking: "surface" }],
    description: "Parking areas",
  },
  ev_charging: {
    label: "EV charging",
    tags: [{ amenity: "charging_station" }],
    description: "Electric vehicle charging stations",
  },
  hotel: {
    label: "Hotel",
    tags: [{ tourism: "hotel" }, { tourism: "hostel" }, { tourism: "motel" }],
    description: "Lodging",
  },
  bank: {
    label: "Bank",
    tags: [{ amenity: "bank" }, { amenity: "atm" }],
    description: "Banks and ATMs",
  },
  fuel: {
    label: "Fuel",
    tags: [{ amenity: "fuel" }],
    description: "Gas stations",
  },
  park: {
    label: "Park",
    tags: [{ leisure: "park" }],
    description: "Parks and green spaces",
  },
};

export function resolveCategory(category: string): CategorySpec {
  const key = category.toLowerCase().trim().replace(/\s+/g, "_");
  const spec = CATEGORY_MAP[key];
  if (!spec) {
    const keys = Object.keys(CATEGORY_MAP).sort().join(", ");
    throw new Error(
      `Unknown category "${category}". Use one of: ${keys}, or pass explicit tags via category "custom" with tag_key/tag_value tool args.`,
    );
  }
  return spec;
}

export function listCategories(): string[] {
  return Object.keys(CATEGORY_MAP).sort();
}

/** Parse "amenity=restaurant" or key+value pair. */
export function parseTagPair(
  tagKey?: string,
  tagValue?: string,
): TagFilter | null {
  if (!tagKey) return null;
  if (tagValue !== undefined && tagValue !== "") {
    return { [tagKey]: tagValue };
  }
  return { [tagKey]: "*" };
}

export const TAG_HINTS: Record<string, { description: string; alternatives?: string[] }> = {
  "amenity=restaurant": {
    description: "A sit-down restaurant",
    alternatives: ["amenity=fast_food", "amenity=cafe"],
  },
  "amenity=cafe": {
    description: "A cafe or coffee shop",
    alternatives: ["shop=coffee", "amenity=fast_food"],
  },
  "amenity=fast_food": {
    description: "Quick service food",
    alternatives: ["amenity=restaurant"],
  },
  "amenity=pharmacy": {
    description: "Pharmacy / drugstore",
    alternatives: ["shop=chemist"],
  },
  "amenity=charging_station": {
    description: "EV charging; add socket:type=*, capacity=* when known",
    alternatives: ["amenity=fuel"],
  },
  "shop=supermarket": {
    description: "Large grocery store",
    alternatives: ["shop=convenience", "shop=grocery"],
  },
  "shop=coffee": {
    description: "Coffee-focused shop",
    alternatives: ["amenity=cafe"],
  },
};
