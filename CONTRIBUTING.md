# Contributing

Thanks for helping improve agent-facing OSM tooling.

## Setup

```bash
npm install
npm run build
npm test
```

## Pull requests

- Keep the MCP surface small; prefer extending the query planner over adding many tools.
- Do not expose raw OverpassQL execution to agents in v1.
- Add tests for planner, guardrails, and tag ontology changes.
- Run `npm run eval:dry` before opening a PR.

## OSM etiquette

- Use a descriptive `OSM_USER_AGENT` when testing heavily.
- Avoid hammering public Overpass/Nominatim instances in CI; use `--dry-run` for network-heavy tasks.
