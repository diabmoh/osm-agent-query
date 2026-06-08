<p align="center">
  <img src="https://raw.githubusercontent.com/diabmoh/osm-agent-query/main/docs/banner.svg" alt="osm-agent-query" width="640"/>
</p>

<h1 align="center">osm-agent-query</h1>

<p align="center">
  <strong>The OpenStreetMap MCP server built for AI agents</strong><br/>
  Safe queries · Clickable map links · Ready-made workflows · Zero OverpassQL
</p>

<p align="center">
  <a href="https://github.com/diabmoh/osm-agent-query/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/diabmoh/osm-agent-query/ci.yml?branch=main&label=CI" alt="CI"/></a>
  <a href="https://www.npmjs.com/package/osm-agent-query"><img src="https://img.shields.io/npm/v/osm-agent-query?label=npm" alt="npm"/></a>
  <img src="https://img.shields.io/node/v/osm-agent-query?label=node%2020%2B" alt="node"/>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue" alt="License"/></a>
</p>

<p align="center">
  <a href="#-why-agents-love-it">Why</a> ·
  <a href="#-tools">Tools</a> ·
  <a href="#-quick-start">Quick start</a> ·
  <a href="#-prompts--resources">Prompts</a> ·
  <a href="#-example-output">Example</a> ·
  <a href="docs/USE_CASES.md">Use cases</a> ·
  <a href="docs/ARCHITECTURE.md">Architecture</a>
</p>

---

## 🌍 Why agents love it

OpenStreetMap is the world's largest **open** geodata commons—but agents break when they:

- Write invalid **OverpassQL** (syntax errors, timeouts, huge downloads)
- Choke on **raw OSM JSON** (thousands of tags per response)
- Can't give users **clickable map links**
- Pick the wrong tool from a **30+ tool** MCP buffet

**osm-agent-query** fixes that with **10 focused tools**, an internal query planner, guardrails, and responses agents can actually use.

| | osm-agent-query | Typical OSM MCP |
|--|-----------------|-----------------|
| Tools | 10 + 3 workflow prompts | Often 20–30+ |
| Open now | `search_open_now` + opening_hours.js | Manual tag guessing |
| OverpassQL | Hidden (structured planner) | Often exposed |
| User links | `map`, `osm`, `directions` on every POI | Rare |
| POI extras | `phone`, `hours`, `website` highlights | Raw tags only |
| Workflows | MCP prompts + resources | DIY |
| Reliability | Nominatim cache, Overpass retry | Varies |

## ✨ Highlights (v0.3)

- **Clickable links** on geocode, search, and route results (OpenStreetMap directions included)
- **`compare_routes`** — foot + driving + cycling in one call
- **`map_links`** — shareable URLs for any coordinate
- **MCP resources** — `osm-agent://guide`, `osm-agent://categories`
- **MCP prompts** — outing planner, amenity audit, commute comparison
- **`format: compact | full`** on search tools
- **Geocode cache** (5 min) + **Overpass retry** on transient errors
- **27 POI categories** (pharmacy → subway → marketplace)

## 🛠 Tools

| Tool | What you get |
|------|----------------|
| `geocode` | Coordinates, bbox, **map link** |
| `reverse_geocode` | Address + map link |
| `search_nearby` | POIs by category, **sorted by distance**, links & highlights |
| `search_open_now` | Same as nearby but **only open now** (evaluates `opening_hours`) |
| `search_in_area` | POIs in a named place or bbox |
| `route` | Distance, duration, polyline, **directions URL** |
| `compare_routes` | Foot / drive / bike side-by-side + links |
| `map_links` | Map, element, directions URLs for any point |
| `explain_osm_tags` | Tag docs + category list |
| `preview_query` | Debug Overpass plan (no network) |

Every success response:

```json
{
  "ok": true,
  "summary": "Found 8 Cafe(s) within 600m.",
  "data": { }
}
```

## 🚀 Quick start

```bash
npx -y osm-agent-query@latest
```

**Cursor** — `.cursor/mcp.json`:

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

Restart Cursor. Ask: *"Find cafes within 10 minutes walk of the Eiffel Tower and link me on OpenStreetMap."*

**From source:**

```bash
git clone https://github.com/diabmoh/osm-agent-query.git
cd osm-agent-query && npm install && npm run build
node dist/index.js --version
```

## 📎 Prompts & resources

| MCP prompt | Use when |
|------------|----------|
| `plan_local_outing` | Geocode → nearby POIs → routes → links |
| `neighborhood_amenity_audit` | Survey schools, pharmacies, parks in an area |
| `commute_comparison` | Foot vs drive vs bike between two places |

| MCP resource | URI |
|--------------|-----|
| Agent skill (markdown) | `osm-agent://guide` |
| Category catalog (JSON) | `osm-agent://categories` |

Install the skill file for Codex: [skills/osm-agent-query/SKILL.md](skills/osm-agent-query/SKILL.md)

## 📦 Example output

`search_nearby` near Paris (compact):

```json
{
  "ok": true,
  "summary": "Found 3 Cafe(s) within 600m.",
  "data": {
    "category": "Cafe",
    "count": 3,
    "places": [
      {
        "name": "Café de Flore",
        "lat": 48.8542,
        "lon": 2.3325,
        "distance_m": 412,
        "links": {
          "map": "https://www.openstreetmap.org/?mlat=48.8542&mlon=2.3325#map=17/...",
          "osm": "https://www.openstreetmap.org/node/123456",
          "directions_from": "https://www.openstreetmap.org/directions?engine=..."
        },
        "highlights": {
          "opening_hours": "Mo-Sa 07:00-23:00",
          "website": "https://example.com"
        }
      }
    ]
  }
}
```

## 🗂 Categories

`restaurant` · `cafe` · `pharmacy` · `supermarket` · `hospital` · `school` · `parking` · `ev_charging` · `hotel` · `bank` · `fuel` · `park` · `library` · `museum` · `dentist` · `bakery` · `atm` · `post_office` · `bar` · `cinema` · `bus_stop` · `subway` · `police` · `fire_station` · `veterinary` · `marketplace`

Custom: `{ "category": "custom", "tag_key": "amenity", "tag_value": "bicycle_rental" }`

## ⚙️ Configuration

| Variable | Default |
|----------|---------|
| `OSM_USER_AGENT` | Identifies your app ([required by Nominatim](https://operations.osmfoundation.org/policies/nominatim/)) |
| `NOMINATIM_URL` | Public Nominatim |
| `OVERPASS_URL` | overpass-api.de |
| `OSRM_URL` | router.project-osrm.org |
| `TAGINFO_URL` | taginfo.openstreetmap.org |

High volume? Self-host and point env vars at your stack.

## 🧪 Development

```bash
npm install && npm run build
npm test              # 15+ unit tests
npm run eval:dry      # CI-safe regression tasks
npm run eval          # Live APIs (be gentle)
```

## ❓ FAQ

**Why not expose OverpassQL?**  
Models generate invalid or expensive queries. We compile from validated intents—see [Text-to-OverpassQL](https://aclanthology.org/2024.tacl-1.31.pdf).

**Can agents edit the map?**  
Not in v0.3 (read-only by design). Editing needs OAuth and changeset review.

**Is public Nominatim OK for production?**  
Fine for demos and agent sessions. Production apps should self-host.

**How is this different from [osm-mcp](https://github.com/GRABOSM/osm-mcp)?**  
We optimize for **agent UX**: fewer tools, summaries, links, prompts, guardrails—not maximum API surface.

### Example: pharmacies open now

```json
{
  "category": "pharmacy",
  "lat": 48.8584,
  "lon": 2.2945,
  "radius_m": 1200,
  "at_time": "2026-06-01T21:00:00+02:00"
}
```

Returns `open_status`, `hours_prettified`, `next_change_iso`, and `stats` (how many OSM objects were evaluated).

## 🗺 Roadmap

- [ ] Optional route geometry stripping for token savings
- [ ] npm publish + MCP registry listing

## 🤝 Contributing

[CONTRIBUTING.md](CONTRIBUTING.md) — PRs welcome.

## 📄 License

Apache-2.0 · Data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)

<p align="center">
  <sub>Built for Codex, Cursor, Cline, and every MCP host that talks to the real world.</sub>
</p>
