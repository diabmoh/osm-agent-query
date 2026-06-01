# Changelog

## [0.4.0] - 2026-06-01

### Added

- `search_open_now` tool with OSM `opening_hours` evaluation via [opening_hours.js](https://github.com/opening-hours/opening_hours.js)
- `at_time` (ISO 8601 + timezone), `include_unknown`, `country_code` for holiday-aware parsing
- Overpass pre-filter for elements with `opening_hours` tag

## [0.3.0] - 2026-06-01

### Added

- `map_links` and `compare_routes` tools
- OpenStreetMap URLs on geocode, search, and route results (`links`, `highlights`)
- MCP resources: `osm-agent://guide`, `osm-agent://categories`
- MCP prompts: `plan_local_outing`, `neighborhood_amenity_audit`, `commute_comparison`
- `format: compact | full` on search tools
- Geocode response cache (5 min) and Overpass retry on 5xx/429
- Seven more categories; `docs/USE_CASES.md` and README banner

### Changed

- Search results include phone, hours, website in `highlights` when tagged in OSM
- Version 0.3.0

## [0.2.0] - 2026-06-01

### Added

- `preview_query` tool for debugging planned Overpass (no network)
- Structured responses: `{ ok, summary, data }` on all tools
- MCP `isError` payloads with error codes
- Distance sorting (`distance_m`) for `search_nearby` results
- Eight new search categories (library, museum, dentist, bakery, atm, post_office, bar, cinema)
- `registerTool` registration with richer descriptions
- `--version` CLI flag
- Architecture docs, expanded README, additional unit tests

### Changed

- Centralized tool registration in `src/mcp/register-tools.ts`
- Improved `NOT_FOUND` errors for geocoding and place search

## [0.1.0] - 2026-06-01

- Initial MCP server with six tools, planner, guardrails, eval harness, and agent skill
