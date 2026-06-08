# Architecture

## Design goals

1. **Agents must not write OverpassQL** — models frequently produce invalid or expensive queries ([Text-to-OverpassQL](https://aclanthology.org/2024.tacl-1.31.pdf)).
2. **Small tool surface** — benchmarks such as MCP-Universe show failure rates rise with large, overlapping tool catalogs.
3. **Respect public infrastructure** — rate limits, bbox caps, timeouts, and an identifiable User-Agent.
4. **Token-efficient outputs** — every tool returns a one-line `summary` plus compact `data`.

## Request flow

```
MCP tool call
  → Zod validation
  → guardrails (coordinates, bbox size, result limit)
  → ontology (category → tag filters) [search tools]
  → planner (SearchIntent → Overpass QL) [search tools]
  → HTTP client (Nominatim / Overpass / OSRM / Taginfo)
  → summarizer (trim tags, distance sort, human summary)
  → JSON { ok, summary, data }
```

## Modules

| Module | Responsibility |
|--------|----------------|
| `src/tools/` | One handler per MCP tool; orchestrates clients + summarize |
| `src/planner/` | `SearchIntent` and `buildOverpassQuery()` — never exported to agents |
| `src/ontology/tags.ts` | Curated category → OSM tag mappings |
| `src/guardrails/` | `limits.ts` (bbox, radius, result cap), `rate-limiter.ts` (Nominatim) |
| `src/clients/` | Thin `fetch` wrappers with User-Agent and timeouts |
| `src/summarize/` | Shapes API responses for agents |
| `src/mcp/register-tools.ts` | Registers tools; maps errors to MCP `isError` |

## SearchIntent

```typescript
type SearchIntent = {
  tagFilters: TagFilter[];  // e.g. [{ amenity: "pharmacy" }]
  bbox: Bbox;
  limit: number;
};
```

Multiple tag filters are OR’d in Overpass (union of node/way selectors).

## Guardrails (v0.2)

| Limit | Value |
|-------|-------|
| Max radius (`search_nearby`) | 5000 m |
| Max bbox span | 0.5° per side |
| Max results | 50 (default 20) |
| Overpass timeout | 25 s |
| Nominatim interval | ≥ 1100 ms between requests |

## Eval harness

`eval/tasks.json` defines grounded tasks. `npm run eval:dry` skips live Overpass/OSRM in CI; `npm run eval` hits public APIs for maintainer checks.

## Extension points

- Add categories in `ontology/tags.ts`
- Add tools by implementing a handler + registering in `register-tools.ts`
- Point env vars at self-hosted OSM stack for production
