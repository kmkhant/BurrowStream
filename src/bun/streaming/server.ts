// src/bun/streaming/server.ts
import { join } from "node:path";
import { db } from "../db/client";
import { videos } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { existsSync } from "node:fs";

async function isViteRunning(url: string): Promise<boolean> {
  try {
    await fetch(url, { method: "HEAD" });
    return true;
  } catch {
    return false;
  }
}

const PLAYER_DEV_PORT = parseInt(process.env.PLAYER_DEV_PORT || "5174");
const playerDevUrl = `http://localhost:${PLAYER_DEV_PORT}`;

function getPlayerDir(): string {
  // 1. Development: project root + src/player/dist-player
  const devPath = join(process.cwd(), "src", "player", "dist-player");
  if (existsSync(devPath)) return devPath;

  // 2. Production: inside the app bundle
  const prodPath = join(import.meta.dir, "..", "views", "player-dist");
  if (existsSync(prodPath)) return prodPath;

  throw new Error("Player build not found. Run 'bun run build:player' first.");
}

const playerDir = getPlayerDir();

export function createServer(port: number = 8080) {
  // Resolve dev mode on startup
  let useDevServer = false;
  (async () => {
    useDevServer = await isViteRunning(playerDevUrl);
    if (useDevServer) {
      console.log(`📡 Proxying player requests to Vite at ${playerDevUrl}`);
    }
  })();

  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      // CORS for local network access
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      if (url.pathname === "/api/videos") {
        // API: list videos
        if (url.pathname === "/api/videos") {
          const type = url.searchParams.get("type"); // optional filter
          let query = db.select().from(videos).$dynamic();
          if (type) {
            query = query.where(eq(videos.type, type));
          }
          const data = query.orderBy(videos.title).all();
          return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json", ...headers },
          });
        }
      }

      if (url.pathname.startsWith("/stream/")) {
        const id = parseInt(url.pathname.split("/").pop()!);
        const video = db.select().from(videos).where(eq(videos.id, id)).get();

        if (!video) {
          return new Response("Video not found", { status: 404, headers });
        }

        // Update play count
        db.update(videos)
          .set({
            playCount: sql`play_count + 1`,
            lastPlayedAt: Date.now(),
          })
          .where(eq(videos.id, id))
          .run();

        const file = Bun.file(video.path);
        if (!(await file.exists())) {
          return new Response("File not found on disk", {
            status: 404,
            headers,
          });
        }

        return new Response(file, {
          headers: {
            "Content-Type": `video/${video.extension}`,
            "Accept-Ranges": "bytes",
            "Content-Disposition": `inline; filename="${video.title}.${video.extension}"`,
            ...headers,
          },
        });
      }

      // Serve the React player build
      const filePath = url.pathname === "/" ? "/index.html" : url.pathname;
      const fullPath = join(playerDir, filePath);

      if (useDevServer) {
        // Proxy to Vite dev server
        try {
          const proxyUrl = new URL(filePath + url.search, playerDevUrl);
          const response = await fetch(proxyUrl, {
            method: req.method,
            headers: req.headers,
          });
          const proxyHeaders = new Headers(response.headers);
          proxyHeaders.set("Access-Control-Allow-Origin", "*");
          return new Response(response.body, {
            status: response.status,
            headers: proxyHeaders,
          });
        } catch {
          // Fallback to static if proxy fails
          console.warn("Proxy failed, serving static file");
        }
      }

      try {
        const file = Bun.file(fullPath);
        if (await file.exists()) {
          return new Response(file, {
            headers: {
              "Content-Type": getContentType(filePath),
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      } catch {}

      return new Response("Not found", { status: 404 });
    },
  });

  return server;
}

function getContentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    html: "text/html",
    js: "application/javascript",
    css: "text/css",
    svg: "image/svg+xml",
    png: "image/png",
    ico: "image/x-icon",
  };
  return types[ext ?? ""] || "application/octet-stream";
}
