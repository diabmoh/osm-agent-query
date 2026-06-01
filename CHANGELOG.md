# Changelog

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
