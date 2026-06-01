import { z } from "zod";
import { explainTag } from "../clients/taginfo.js";
import { listCategories } from "../ontology/tags.js";

export const explainTagsSchema = z.object({
  tag_key: z.string().describe("OSM tag key, e.g. amenity"),
  tag_value: z.string().optional().describe("OSM tag value, e.g. restaurant"),
  list_categories: z
    .boolean()
    .optional()
    .describe("If true, return supported search categories instead"),
});

export async function handleExplainTags(
  args: z.infer<typeof explainTagsSchema>,
) {
  if (args.list_categories) {
    return { categories: listCategories() };
  }
  return explainTag(args.tag_key, args.tag_value);
}
