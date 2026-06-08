import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CATEGORY_MAP, listCategories } from "../ontology/tags.js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function registerOsmResources(server: McpServer): void {
  server.registerResource(
    "agent-guide",
    "osm-agent://guide",
    {
      title: "OSM agent usage guide",
      description: "When and how agents should use osm-agent-query tools",
      mimeType: "text/markdown",
    },
    async () => {
      const path = join(__dirname, "../../skills/osm-agent-query/SKILL.md");
      const text = readFileSync(path, "utf8");
      return {
        contents: [{ uri: "osm-agent://guide", mimeType: "text/markdown", text }],
      };
    },
  );

  server.registerResource(
    "search-categories",
    "osm-agent://categories",
    {
      title: "Supported POI search categories",
      description: "Category keys accepted by search_nearby and search_in_area",
      mimeType: "application/json",
    },
    async () => {
      const categories = listCategories().map((key) => ({
        key,
        ...CATEGORY_MAP[key],
      }));
      const text = JSON.stringify({ categories }, null, 2);
      return {
        contents: [
          { uri: "osm-agent://categories", mimeType: "application/json", text },
        ],
      };
    },
  );
}
