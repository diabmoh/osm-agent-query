# Codex CLI integration

## MCP configuration

```json
{
  "mcpServers": {
    "osm-agent-query": {
      "command": "npx",
      "args": ["-y", "osm-agent-query"]
    }
  }
}
```

## Example: evening plans near a landmark

**User:** “Find cafes within 10 minutes walk of the Eiffel Tower.”

**Agent steps:**

1. `geocode` → `{ "query": "Tour Eiffel, Paris" }`  
   Read `data.results[0].lat` / `lon` from the response.

2. `search_nearby` → `{ "category": "cafe", "lat": …, "lon": …, "radius_m": 800 }`  
   Tell the user the `summary` and top entries from `data.places` (use `distance_m`).

3. Optionally `route` to one cafe for exact walk time.

## Example: neighborhood amenities

1. `search_in_area` → `{ "category": "pharmacy", "place": "Brooklyn, New York", "limit": 10 }`
2. Report `summary` and list named pharmacies from `data.places`.

## Skill

Install `skills/osm-agent-query/SKILL.md` in your agent skills path.
