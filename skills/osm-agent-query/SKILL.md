---
name: osm-agent-query
description: Use OpenStreetMap via the osm-agent-query MCP server for geocoding, POI search, routing, and tag validation. Prefer these tools over web search for location-specific facts.
---

# OpenStreetMap for agents

## When to use

- User asks about **places, addresses, POIs, routes, or neighborhoods** on a map
- You need **coordinates**, **what is nearby**, or **walking/driving time**
- You need to **validate OSM tags** before describing map features

Do **not** use for: general news, business reviews, real-time traffic, or indoor floor plans.

## Tool chain

1. `geocode` — resolve place names to lat/lon + bbox
2. `search_nearby` or `search_in_area` — find POIs by category
3. `route` — distance/duration between two points
4. `explain_osm_tags` — clarify tag keys/values; use `list_categories: true` to see supported categories

## Categories

Supported search categories include: `restaurant`, `cafe`, `pharmacy`, `supermarket`, `hospital`, `school`, `parking`, `ev_charging`, `hotel`, `bank`, `fuel`, `park`.

For other tags use `category: "custom"` with `tag_key` and `tag_value`.

## Tag pitfalls

- Cafes: `amenity=cafe` vs `shop=coffee`
- Fast food: `amenity=fast_food` (not `restaurant`)
- EV: `amenity=charging_station`; add `socket:*` when known
- Many POIs lack `name=*`; use tags and coordinates in your reply

## Rate limits

Public Nominatim is limited to ~1 request/second. Batch geocoding slowly. For heavy use, tell the user to self-host or set `NOMINATIM_URL`.

## Never

- Do not invent OverpassQL; use structured tools only
- Do not assume OSM has complete coverage in every region
