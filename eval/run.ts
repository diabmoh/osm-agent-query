import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { handleGeocode } from "../src/tools/geocode.js";
import { handleReverseGeocode } from "../src/tools/reverse-geocode.js";
import { handleSearchNearby } from "../src/tools/search-nearby.js";
import { handleSearchInArea } from "../src/tools/search-in-area.js";
import { handleRoute } from "../src/tools/route.js";
import { handleExplainTags } from "../src/tools/explain-tags.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes("--dry-run");

type Task = {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  expect: Record<string, unknown>;
};

const handlers: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
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
};

function checkExpect(result: unknown, expect: Record<string, unknown>): boolean {
  if (expect.mock && dryRun) return true;
  const r = result as Record<string, unknown>;
  if (expect.results_min && Array.isArray(r.results)) {
    return r.results.length >= (expect.results_min as number);
  }
  if (expect.has_display_name) return typeof r.display_name === "string";
  if (expect.has_description) return typeof r.description === "string";
  if (expect.categories_min && Array.isArray(r.categories)) {
    return r.categories.length >= (expect.categories_min as number);
  }
  return true;
}

async function run() {
  const tasks: Task[] = JSON.parse(
    readFileSync(join(__dirname, "tasks.json"), "utf8"),
  ).tasks;

  let passed = 0;
  let skipped = 0;

  for (const task of tasks) {
    const handler = handlers[task.tool];
    if (!handler) {
      console.error(`Unknown tool: ${task.tool}`);
      process.exit(1);
    }
    if (dryRun && task.expect.mock) {
      console.log(`SKIP (dry-run) ${task.id}`);
      skipped++;
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

  console.log(`\n${passed}/${tasks.length} passed (${skipped} skipped in dry-run)`);
  if (passed < tasks.length) process.exit(1);
}

run();
