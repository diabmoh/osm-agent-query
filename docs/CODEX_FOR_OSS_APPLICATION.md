# Codex for Open Source — application notes

Apply at: https://openai.com/form/codex-for-oss/

**When:** After 2–4 weeks of real usage (releases, issues, docs). Do not apply with an empty or single-commit repo.

## Why does this repository qualify? (≤500 chars)

Primary maintainer of osm-agent-query: a TypeScript MCP server giving coding agents safe, structured read access to OpenStreetMap. OSM powers maps for millions of apps; agents currently struggle with raw OverpassQL and fragmented geospatial tools. This project provides validated query planning, tag intelligence, and agent skills so Codex/Cursor/Cline can use OSM reliably in real workflows.

## How will you use API credits? (≤500 chars)

API credits fund CI eval runs against live Overpass (weekly, rate-limited), automated issue triage/release notes, and expanding the tag ontology from Taginfo. Goal: keep agent-facing OSM tooling tested and maintained as MCP hosts and models evolve—reducing bad queries load on public OSM infrastructure.

## Anything else?

Solo maintainer building agent infrastructure at the intersection of MCP and open geodata. Project ships agent skills, eval tasks, and policy guardrails—not a thin API wrapper.

## Checklist before submit

- [ ] Public repo: https://github.com/diabmoh/osm-agent-query
- [ ] Working `npx osm-agent-query`
- [ ] 6 tools documented in README
- [ ] Agent skill in `skills/`
- [ ] CI green
- [ ] 10+ eval tasks (`npm run eval:dry`)
