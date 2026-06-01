import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerOsmPrompts(server: McpServer): void {
  server.registerPrompt(
    "plan_local_outing",
    {
      title: "Plan a local outing with OSM",
      description:
        "Workflow: geocode destination, find nearby POIs, compare routes, share map links",
      argsSchema: {
        place: z.string().describe("Where to go (landmark, neighborhood, address)"),
        interest: z
          .string()
          .optional()
          .describe("POI category: cafe, restaurant, park, museum, etc."),
      },
    },
    async ({ place, interest }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Plan a local outing near "${place}"${interest ? ` focused on ${interest}` : ""}.

Use osm-agent-query tools in order:
1. geocode — resolve "${place}"
2. search_nearby — category "${interest ?? "cafe"}" within 800–1200m of the result
3. compare_routes — walking vs driving to the top POI (if user location unknown, pick the closest POI and explain)
4. map_links — give the user clickable OpenStreetMap links

Reply with the tool summaries, distances, opening_hours/website from highlights when present, and map links. Do not invent OverpassQL.`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "neighborhood_amenity_audit",
    {
      title: "Audit neighborhood amenities",
      description: "Survey pharmacies, groceries, schools, parks in an area",
      argsSchema: {
        area: z.string().describe("Neighborhood, suburb, or city district name"),
      },
    },
    async ({ area }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Audit essential amenities in "${area}" using osm-agent-query.

For each category run search_in_area with limit 8: pharmacy, supermarket, school, park, hospital.
Summarize counts, name notable gaps, and note OSM coverage may be incomplete.
Use compact format. Include map links for the area center from geocode.

Do not write OverpassQL.`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "commute_comparison",
    {
      title: "Compare commute options",
      description: "Compare foot, driving, and cycling between two places",
      argsSchema: {
        from_place: z.string(),
        to_place: z.string(),
      },
    },
    async ({ from_place, to_place }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Compare commute from "${from_place}" to "${to_place}".

1. geocode both places
2. compare_routes between the coordinates
3. Present a table: profile, distance_m, duration_min
4. Share links.directions_* from the response

Be concise. Use tool summaries.`,
          },
        },
      ],
    }),
  );
}
