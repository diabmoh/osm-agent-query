#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerOsmTools } from "./mcp/register-tools.js";
import { SERVER_NAME, VERSION } from "./version.js";

const args = process.argv.slice(2);
if (args.includes("--version") || args.includes("-v")) {
  console.log(`${SERVER_NAME} v${VERSION}`);
  process.exit(0);
}

const server = new McpServer({
  name: SERVER_NAME,
  version: VERSION,
});

registerOsmTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
