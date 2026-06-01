# osm-agent-query

Structured OpenStreetMap access for AI coding agents via the [Model Context Protocol](https://modelcontextprotocol.io).

Agents call **small, typed tools**—never raw OverpassQL. Queries are planned, validated, and summarized for token-efficient responses.

## Tools

| Tool | Description |
|------|-------------|
| `geocode` | Place name or address → coordinates + bbox |
| `reverse_geocode` | Coordinates → place name |
| `search_nearby` | Category + point + radius → POIs |
| `search_in_area` | Category + named place or bbox → POIs |
| `route` | A→B routing via OSRM (foot / driving / cycling) |
| `explain_osm_tags` | Tag help + supported search categories |

## Install

```bash
npm install -g osm-agent-query
# or from source:
git clone https://github.com/diabmoh/osm-agent-query.git
cd osm-agent-query && npm install && npm run build
```

## Cursor

Add to `.cursor/mcp.json` (or global MCP settings):

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

For local development:

```json
{
  "mcpServers": {
    "osm-agent-query": {
      "command": "node",
      "args": ["/Users/moh/Documents/windsurf_projects/osm-agent-query/dist/index.js"]
    }
  }
}
```

## Codex CLI

See [examples/codex-agents.md](examples/codex-agents.md).

## Agent skill

Copy or link [skills/osm-agent-query/SKILL.md](skills/osm-agent-query/SKILL.md) into your agent skills directory so Codex/Cursor know when and how to use OSM safely.

## Configuration

| Variable | Default |
|----------|---------|
| `OSM_USER_AGENT` | `osm-agent-query/0.1.0 (...)` |
| `NOMINATIM_URL` | `https://nominatim.openstreetmap.org` |
| `OVERPASS_URL` | `https://overpass-api.de/api/interpreter` |
| `OSRM_URL` | `https://router.project-osrm.org` |
| `TAGINFO_URL` | `https://taginfo.openstreetmap.org/api/4` |

Respect the [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/): this server rate-limits to ~1 req/s. For production, self-host Nominatim and Overpass.

## Development

```bash
npm install
npm run build
npm test
npm run eval:dry   # CI-safe eval (skips live Overpass/OSRM)
npm run eval       # Live eval against public APIs
```

## License

Apache-2.0
