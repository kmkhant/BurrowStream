// src/bun/streaming/server.ts
import { join } from "node:path";
import { existsSync } from "node:fs";
import { eq, sql } from "drizzle-orm";
import { db } from "../db/client";
import { videos } from "../db/schema";
import logger from "../logger";

// ── Shared Configuration Context ──
const PLAYER_DEV_PORT = parseInt(process.env.PLAYER_DEV_PORT || "5174", 10);
const playerDevUrl = `http://localhost:${PLAYER_DEV_PORT}`;

async function checkViteRunning(url: string): Promise<boolean> {
  try {
    // Timeout quickly to prevent hanging the engine startup chain
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1000);

    await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(id);
    return true;
  } catch {
    return false;
  }
}

function getPlayerDir(): string {
  // 1. Development Boundary
  const devPath = join(process.cwd(), "src", "player", "dist-player");
  if (existsSync(devPath)) return devPath;

  // 2. Production Bundle Boundary
  const prodPath = join(import.meta.dir, "..", "views", "player-dist");
  if (existsSync(prodPath)) return prodPath;

  throw new Error("Player build not found. Run 'bun run build:player' first.");
}

// ── Primary Factory Export ──
export function createServer(port: number = 8080) {
  const playerDir = getPlayerDir();
  let useDevServer = false;

  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      // Unified CORS Headers
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
      }

      // ── Route 1: API Video Catalog ──
      if (url.pathname === "/api/videos") {
        const type = url.searchParams.get("type");
        let query = db.select().from(videos).$dynamic();

        if (type) {
          query = query.where(eq(videos.type, type));
        }

        const data = query.orderBy(videos.title).all();
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      // High-Performance Media Streaming ──
      if (url.pathname.startsWith("/stream/")) {
        const id = parseInt(url.pathname.split("/").pop() || "", 10);

        // check if id is a number
        if (isNaN(id)) {
          return new Response("Invalid Video ID", {
            status: 400,
            headers: corsHeaders,
          });
        }

        // get video from database
        const video = db.select().from(videos).where(eq(videos.id, id)).get();
        if (!video) {
          return new Response("Video not found", {
            status: 404,
            headers: corsHeaders,
          });
        }

        // get file from disk
        const file = Bun.file(video.path);
        if (!(await file.exists())) {
          return new Response("File missing on host disk", {
            status: 404,
            headers: corsHeaders,
          });
        }

        // Register operational metrics asynchronously
        db.update(videos)
          .set({ playCount: sql`play_count + 1`, lastPlayedAt: Date.now() })
          .where(eq(videos.id, id))
          .run();

        const fileSize = file.size;
        const rangeHeader = req.headers.get("range");
        const contentType = `video/${video.extension}`;

        if (rangeHeader) {
          // Parse standard 'bytes=start-end' request strings
          const parts = rangeHeader.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          // If browser omitted end range, default to end of file boundaries
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

          // Handle edge case where request exceeds file bounds
          if (start >= fileSize || end >= fileSize) {
            return new Response("Requested range not satisfiable", {
              status: 416,
              headers: {
                "Content-Range": `bytes */${fileSize}`,
                ...corsHeaders,
              },
            });
          }

          const chunkSize = end - start + 1;

          // PHYSICALLY slice the BunFile handle down to the requested chunk pointer
          const slicedChunk = file.slice(start, end + 1);

          return new Response(slicedChunk, {
            status: 206,
            headers: {
              "Content-Type": contentType,
              "Accept-Ranges": "bytes",
              "Content-Range": `bytes ${start}-${end}/${fileSize}`,
              "Content-Length": String(chunkSize),
              ...corsHeaders,
            },
          });
        }

        // Fallback pattern for non-chunked download requests
        return new Response(file, {
          headers: {
            "Content-Type": contentType,
            "Accept-Ranges": "bytes",
            "Content-Length": String(fileSize),
            "Content-Disposition": `inline; filename="${encodeURIComponent(video.title)}.${video.extension}"`,
            ...corsHeaders,
          },
        });
      }

      // Frontend Asset Delivery Pipeline ──
      const filePath = url.pathname === "/" ? "/index.html" : url.pathname;

      if (useDevServer) {
        try {
          const proxyUrl = new URL(filePath + url.search, playerDevUrl);

          const sanitizedHeaders = new Headers();
          const headersToForward = [
            "accept",
            "accept-language",
            "content-type",
            "sec-ch-ua",
          ];

          // Enforce clean connection lifecycle states
          sanitizedHeaders.set("Connection", "close");

          req.headers.forEach((value, key) => {
            if (headersToForward.includes(key.toLowerCase())) {
              sanitizedHeaders.set(key, value);
            }
          });

          const response = await fetch(proxyUrl, {
            method: req.method,
            headers: sanitizedHeaders,
          });

          const proxyHeaders = new Headers(response.headers);
          proxyHeaders.set("Access-Control-Allow-Origin", "*");

          return new Response(response.body, {
            status: response.status,
            headers: proxyHeaders,
          });
        } catch {
          logger.warn(
            "Proxy to Vite failed, falling back to local file context",
          );
        }
      }

      // Serve static build from disk
      const fullPath = join(playerDir, filePath);
      const staticFile = Bun.file(fullPath);

      if (await staticFile.exists()) {
        return new Response(staticFile, {
          headers: {
            "Content-Type": staticFile.type, // Leverage Bun's accurate automatic mime detection
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      return new Response("Not found", { status: 404 });
    },
  });

  // Safe Runtime Initialization: Evaluate Dev Mode proxy binding right after instance creation
  checkViteRunning(playerDevUrl).then((running) => {
    useDevServer = running;
    if (useDevServer) {
      logger.info(`📡 Proxying player requests to Vite at ${playerDevUrl}`);
    }
  });

  return server;
}
