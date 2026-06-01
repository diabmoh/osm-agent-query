# Codex CLI integration

## MCP server

Add to your Codex MCP configuration (path may vary by install):

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

## Example workflows

### Travel planning

1. `geocode` — "Shibuya Station, Tokyo"
2. `search_nearby` — category `hotel`, radius 1500m
3. `route` — hotel → landmark, profile `foot`

### Local business lookup

1. `geocode` — neighborhood or address
2. `search_nearby` — category `pharmacy` or `supermarket`
3. Present results with names and distances; note OSM may be incomplete

### Urban analysis

1. `search_in_area` — category `park`, place "Brooklyn, New York"
2. `explain_osm_tags` — `amenity=parking` alternatives
3. Summarize counts and gaps in coverage

## Skill

Install the agent skill from `skills/osm-agent-query/SKILL.md` so Codex chains tools correctly and respects OSM usage policy.
