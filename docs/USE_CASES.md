# Use cases

## Travel & outings

**Goal:** “What’s walkable near the Eiffel Tower?”

1. `geocode` → `Tour Eiffel, Paris`
2. `search_nearby` → `cafe`, radius 800m, `format: compact`
3. `compare_routes` → hotel coordinates → top cafe
4. Share `data.places[].links` and `highlights.opening_hours` with the user

**MCP prompt:** `plan_local_outing` (built-in)

## Real estate / relocation

**Goal:** “Does this neighborhood have schools and pharmacies?”

1. `geocode` the address
2. `search_nearby` for `school`, `pharmacy`, `supermarket` at 1–2 km
3. Summarize counts and nearest `distance_m`

**MCP prompt:** `neighborhood_amenity_audit`

## Commute planning

**Goal:** “Walk vs drive from home to office?”

1. `geocode` both addresses
2. `compare_routes` once (foot + driving + cycling)
3. Present `options` table and `links.directions_*`

**MCP prompt:** `commute_comparison`

## Agent debugging

**Goal:** “Why did search return nothing?”

1. `preview_query` with same args as `search_nearby`
2. Check bbox and tag filters in `overpass_preview`
3. `explain_osm_tags` for category validation

## End-user map links

**Goal:** Give the user something to click

- Every search result includes `links.map` and `links.osm`
- `map_links` for arbitrary coordinates
- `route` / `compare_routes` include OSM directions URLs

## Codex / Cursor workflows

- Read resource `osm-agent://categories` before picking a category string
- Read resource `osm-agent://guide` for tool-chaining rules
- Install `skills/osm-agent-query/SKILL.md` for persistent behavior
