---
name: osm-agent-query
description: OpenStreetMap MCP for agents—geocode, search POIs with map links, compare routes, audit neighborhoods. Never write OverpassQL; use summaries and share links with users.
---

# osm-agent-query

## When to use OSM tools

- Addresses, coordinates, **what's nearby**, routes, neighborhood amenities
- User needs **OpenStreetMap links** to open in a browser
- Validating tags (`explain_osm_tags`)

Skip for: reviews, traffic, indoor maps, non-geographic facts.

## Read first (MCP resources)

- `osm-agent://categories` — valid `category` values for search tools
- `osm-agent://guide` — this skill in full

## Best tools by task

| Task | Tools |
|------|--------|
| Resolve a place name | `geocode` |
| What's near a point | `search_nearby` (compact) |
| **Open right now** | `search_open_now` (not `search_nearby`) |
| Survey a neighborhood | `search_in_area` or prompt `neighborhood_amenity_audit` |
| Walk vs drive | `compare_routes` |
| Single mode route | `route` |
| Share map URL | `map_links` or use `links` on search results |
| Debug empty search | `preview_query` |

## Response contract

Always read `summary` first, then `data`. Tell the user:

- Names, **distance_m**, **highlights** (hours, phone, website)
- **`links.map`** and **`links.directions_from`** when relevant

## Workflows (MCP prompts)

- `plan_local_outing` — place + optional interest category
- `neighborhood_amenity_audit` — area name
- `commute_comparison` — from_place, to_place

## search_open_now

Use when the user says **open now**, **still open**, **open late**, **24h**, etc.

- Pass `at_time` with timezone if not "now" (e.g. `2026-12-24T22:00:00+01:00`)
- Optional `country_code` (`de`, `fr`) for public holidays
- Default returns only **open** POIs; set `include_unknown: true` to include missing/ambiguous hours
- Read `stats` in `data` for how many candidates were evaluated

## Rules

1. Never write OverpassQL
2. Prefer `format: compact` unless you need full tags
3. One geocode at a time (rate limit); repeated lookups are cached briefly
4. OSM coverage varies—say when data may be incomplete
