import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import app from "./src/api/index";

const server = new Hono();

// API routes
server.route("/", app);

// Static files from dist
server.use("/*", serveStatic({ root: "./dist" }));

// SPA fallback
server.get("*", serveStatic({ root: "./dist", path: "/index.html" }));

const port = parseInt(process.env.PORT || "3000");
console.log(`🚀 JP Barbearia running on port ${port}`);

export default {
  port,
  fetch: server.fetch,
};
