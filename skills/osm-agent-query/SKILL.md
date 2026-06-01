---
name: osm-agent-query
description: Use OpenStreetMap via the osm-agent-query MCP server for geocoding, POI search, routing, and tag validation. Prefer these tools over web search for location-specific facts.
---

# OpenStreetMap for agents

## When to use

- User asks about **places, addresses, POIs, routes, or neighborhoods**
- You need **coordinates**, **what is nearby**, or **walking/driving time**
- You need to **validate OSM tags** before describing map features

Do **not** use for: general news, business reviews, live traffic, or indoor maps.

## Response format

Tools return JSON with:

- `ok: true`
- `summary` — one-line human-readable result (cite this to the user)
- `data` — structured payload (coordinates, places, route stats)

On failure: `{ error: true, code, message }`.

## Tool chain

1. `geocode` — place name → lat/lon (+ bbox)
2. `search_nearby` or `search_in_area` — POIs by category
3. `route` — distance/duration between points
4. `explain_osm_tags` — tag help; `list_categories: true` for supported categories
5. `preview_query` — debug only; shows planned Overpass without running it

## Categories

`restaurant`, `cafe`, `pharmacy`, `supermarket`, `hospital`, `school`, `parking`, `ev_charging`, `hotel`, `bank`, `fuel`, `park`, `library`, `museum`, `dentist`, `bakery`, `atm`, `post_office`, `bar`, `cinema`

Custom: `category: "custom"` + `tag_key` / `tag_value`.

## Tag pitfalls

- Cafes: `amenity=cafe` vs `shop=coffee`
- Fast food: `amenity=fast_food` (not `restaurant`)
- EV: `amenity=charging_station`
- Many nodes lack `name=*` — use `distance_m` and tags from `data.places`

## Rate limits

Nominatim: ~1 req/s (enforced server-side). Avoid rapid geocode loops.

## Never

- Do not write or execute OverpassQL — use structured tools only
- Do not assume complete OSM coverage everywhere
