import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { handleGeocode } from "../src/tools/geocode.js";
import { handleReverseGeocode } from "../src/tools/reverse-geocode.js";
import { handleSearchNearby } from "../src/tools/search-nearby.js";
import { handleSearchInArea } from "../src/tools/search-in-area.js";
import { handleRoute } from "../src/tools/route.js";
import { handleExplainTags } from "../src/tools/explain-tags.js";
import { handlePreviewQuery } from "../src/tools/preview-query.js";
import { handleMapLinks } from "../src/tools/map-links.js";
import { handleCompareRoutes } from "../src/tools/compare-routes.js";
import { handleSearchOpenNow } from "../src/tools/search-open-now.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes("--dry-run");

type Task = {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  expect: Record<string, unknown>;
};

const handlers: Record<
  string,
  (args: Record<string, unknown>) => Promise<{ ok: boolean; data?: unknown }>
> = {
  geocode: (a) => handleGeocode(a as Parameters<typeof handleGeocode>[0]),
  reverse_geocode: (a) =>
    handleReverseGeocode(a as Parameters<typeof handleReverseGeocode>[0]),
  search_nearby: (a) =>
    handleSearchNearby(a as Parameters<typeof handleSearchNearby>[0]),
  search_in_area: (a) =>
    handleSearchInArea(a as Parameters<typeof handleSearchInArea>[0]),
  route: (a) => handleRoute(a as Parameters<typeof handleRoute>[0]),
  explain_osm_tags: (a) =>
    handleExplainTags(a as Parameters<typeof handleExplainTags>[0]),
  preview_query: (a) =>
    handlePreviewQuery(a as Parameters<typeof handlePreviewQuery>[0]),
  map_links: (a) => handleMapLinks(a as Parameters<typeof handleMapLinks>[0]),
  compare_routes: (a) =>
    handleCompareRoutes(a as Parameters<typeof handleCompareRoutes>[0]),
  search_open_now: (a) =>
    handleSearchOpenNow(a as Parameters<typeof handleSearchOpenNow>[0]),
};

function checkExpect(
  result: { ok: boolean; data?: unknown },
  expect: Record<string, unknown>,
): boolean {
  if (expect.mock && dryRun) return true;
  if (!result.ok) return false;
  const data = result.data as Record<string, unknown>;

  if (expect.results_min) {
    const results = data.results as unknown[] | undefined;
    return (results?.length ?? 0) >= (expect.results_min as number);
  }
  if (expect.has_display_name) {
    return typeof data.display_name === "string";
  }
  if (expect.has_description) {
    return typeof data.description === "string";
  }
  if (expect.categories_min) {
    const categories = data.categories as unknown[] | undefined;
    return (categories?.length ?? 0) >= (expect.categories_min as number);
  }
  if (expect.has_overpass_preview) {
    return typeof data.overpass_preview === "string";
  }
  if (expect.has_map_link) {
    const links = data.links as { map?: string } | undefined;
    return typeof links?.map === "string" && links.map.includes("openstreetmap");
  }
  if (expect.options_min) {
    const options = data.options as unknown[] | undefined;
    return (options?.length ?? 0) >= (expect.options_min as number);
  }
  return true;
}

async function run() {
  const tasks: Task[] = JSON.parse(
    readFileSync(join(__dirname, "tasks.json"), "utf8"),
  ).tasks;

  let passed = 0;

  for (const task of tasks) {
    const handler = handlers[task.tool];
    if (!handler) {
      console.error(`Unknown tool: ${task.tool}`);
      process.exit(1);
    }
    if (dryRun && task.expect.mock) {
      console.log(`SKIP (dry-run) ${task.id}`);
      passed++;
      continue;
    }
    try {
      const result = await handler(task.args);
      if (checkExpect(result, task.expect)) {
        console.log(`PASS ${task.id}`);
        passed++;
      } else {
        console.error(`FAIL ${task.id} expectation not met`);
      }
    } catch (e) {
      console.error(`FAIL ${task.id}`, e);
    }
  }

  console.log(`\n${passed}/${tasks.length} passed`);
  if (passed < tasks.length) process.exit(1);
}

run();
