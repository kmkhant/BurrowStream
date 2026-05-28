import { z } from "zod";

// System handlers
import { getSystemStats } from "./handlers/system";

// Folder handlers
import { getFolders, addFolder, removeFolder } from "./handlers/folder";

// Scanner handlers
import { cancelScan, startScan } from "./handlers/scanner";

import type {
  RemoveFolderRequest,
  GetVideosRequest,
} from "../../shared/rpc/definitions";

import { db } from "../db/client";
import { watchedFolders, videos, scanHistory, activityLog } from "../db/schema";
import { MediaScanner } from "../media/scanner";
import { MediaParser } from "../media/parser";
import { eq, desc, like, sql } from "drizzle-orm";
import { cpuMonitor } from "../utils/cpu";
import { RequestSchemas } from "./router";

const scanner = new MediaScanner();
const parser = new MediaParser();

// Track server state
let streamingServer: any = null;
let serverStartTime: number | null = null;

// test functions
async function ping() {
  return "pong";
}

export const rpcHandlers = {
  // test handlers
  ping,

  // system handlers
  getSystemStats,

  // folder handlers
  getFolders,
  addFolder,
  removeFolder,

  // folder scanners
  startScan,
  cancelScan,
};

export function registerHandlers(router: any) {
  // Start CPU monitoring
  cpuMonitor.start(2000); // Update every 2 seconds

  router.handle(
    "removeFolder",
    async (params: z.infer<typeof RemoveFolderRequest>) => {
      const { id } = RequestSchemas.removeFolder.parse(params);

      const folder = db
        .select()
        .from(watchedFolders)
        .where(eq(watchedFolders.id, id))
        .get();

      if (!folder) {
        return { success: false, error: "Folder not found" };
      }

      db.delete(videos).where(eq(videos.folderId, id)).run();
      db.delete(scanHistory).where(eq(scanHistory.folderId, id)).run();
      db.delete(watchedFolders).where(eq(watchedFolders.id, id)).run();

      db.insert(activityLog)
        .values({
          level: "info",
          category: "user",
          message: `Removed folder: ${folder.name}`,
          createdAt: Date.now(),
        })
        .run();

      return { success: true };
    },
  );

  router.handle("toggleFolderActive", async (params: { id: number }) => {
    const folder = db
      .select()
      .from(watchedFolders)
      .where(eq(watchedFolders.id, params.id))
      .get();

    if (!folder) {
      return { success: false, error: "Folder not found" };
    }

    db.update(watchedFolders)
      .set({ isActive: !folder.isActive, updatedAt: Date.now() })
      .where(eq(watchedFolders.id, params.id))
      .run();

    return { success: true, isActive: !folder.isActive };
  });

  // ═══════════════════════════════════════════
  // Video Management
  // ═══════════════════════════════════════════

  router.handle(
    "getVideos",
    async (params: z.infer<typeof GetVideosRequest>) => {
      const parsed = RequestSchemas.getVideos.parse(params || {});

      let query = db.select().from(videos).$dynamic();

      if (parsed.type && parsed.type !== "all") {
        query = query.where(eq(videos.type, parsed.type));
      }

      if (parsed.folderId) {
        query = query.where(eq(videos.folderId, parsed.folderId));
      }

      if (parsed.search) {
        query = query.where(like(videos.title, `%${parsed.search}%`));
      }

      const total = query.all().length;

      const data = query
        .orderBy(desc(videos.scannedAt))
        .limit(parsed.limit)
        .offset(parsed.offset)
        .all();

      return {
        data,
        total,
        limit: parsed.limit,
        offset: parsed.offset,
      };
    },
  );

  router.handle("getVideoStats", async () => {
    const all = db.select().from(videos).all();
    const totalSize = all.reduce((sum, v) => sum + v.size, 0);

    return {
      total: all.length,
      movies: all.filter((v) => v.type === "movie").length,
      tvShows: all.filter((v) => v.type === "tv").length,
      totalSize,
      favorites: all.filter((v) => v.isFavorite).length,
    };
  });

  router.handle("getVideo", async (params: { id: number }) => {
    return db.select().from(videos).where(eq(videos.id, params.id)).get();
  });

  router.handle(
    "updateVideo",
    async (params: {
      id: number;
      customTitle?: string;
      isFavorite?: boolean;
    }) => {
      const updates: any = { updatedAt: Date.now() };

      if (params.customTitle !== undefined) {
        updates.customTitle = params.customTitle;
      }
      if (params.isFavorite !== undefined) {
        updates.isFavorite = params.isFavorite;
      }

      db.update(videos).set(updates).where(eq(videos.id, params.id)).run();

      return { success: true };
    },
  );

  router.handle("getVideoStats", async () => {
    const total = db.select().from(videos).all().length;
    const movies = db
      .select()
      .from(videos)
      .where(eq(videos.type, "movie"))
      .all().length;
    const tvShows = db
      .select()
      .from(videos)
      .where(eq(videos.type, "tv"))
      .all().length;
    const totalSize = db
      .select({ sum: sql<number>`SUM(${videos.size})` })
      .from(videos)
      .get();
    const favorites = db
      .select()
      .from(videos)
      .where(eq(videos.isFavorite, true))
      .all().length;

    return {
      total,
      movies,
      tvShows,
      totalSize: totalSize?.sum || 0,
      favorites,
    };
  });

  // ═══════════════════════════════════════════
  // Scanning
  // ═══════════════════════════════════════════
  router.handle("startScan", async (_: any, context: any) => {
    const folders = db
      .select()
      .from(watchedFolders)
      .where(eq(watchedFolders.isActive, true))
      .all();

    if (folders.length === 0) {
      return { success: false, error: "No active folders to scan" };
    }

    // Scan asynchronously
    (async () => {
      for (const folder of folders) {
        const scanStart = Date.now();

        context.send("scanProgress", {
          folderId: folder.id,
          folderName: folder.name,
          phase: "starting",
          processed: 0,
          total: 0,
        });

        const scan = db
          .insert(scanHistory)
          .values({
            folderId: folder.id,
            phase: "started",
            startedAt: scanStart,
          })
          .returning()
          .get();

        try {
          const result = await scanner.scanDirectory(folder.path);
          let newVideos = 0;
          let updatedVideos = 0;

          for (const videoFile of result.videos) {
            const parsed = parser.parse(videoFile.name);
            const now = Date.now();

            const existing = db
              .select({ id: videos.id })
              .from(videos)
              .where(eq(videos.path, videoFile.path))
              .get();

            if (existing) {
              db.update(videos)
                .set({
                  size: videoFile.size,
                  lastModified: videoFile.lastModified,
                  scannedAt: now,
                  updatedAt: now,
                })
                .where(eq(videos.id, existing.id))
                .run();
              updatedVideos++;
            } else {
              db.insert(videos)
                .values({
                  path: videoFile.path,
                  type: parsed.type,
                  title: parsed.title,
                  year: parsed.year,
                  season: parsed.season,
                  episode: parsed.episode
                    ? JSON.stringify(parsed.episode)
                    : null,
                  episodeTitle: parsed.episodeTitle,
                  quality: parsed.quality,
                  source: parsed.source,
                  codec: parsed.codec,
                  size: videoFile.size,
                  extension: videoFile.extension,
                  lastModified: videoFile.lastModified,
                  folderId: folder.id,
                  scanId: scan.id,
                  scannedAt: now,
                  createdAt: now,
                  updatedAt: now,
                })
                .run();
              newVideos++;
            }
          }

          // Update folder stats
          const folderVideos = db
            .select()
            .from(videos)
            .where(eq(videos.folderId, folder.id))
            .all();
          const totalSize = folderVideos.reduce((s, v) => s + v.size, 0);

          db.update(watchedFolders)
            .set({
              lastScanAt: scanStart,
              lastScanDuration: Date.now() - scanStart,
              totalVideos: folderVideos.length,
              totalSize,
              updatedAt: Date.now(),
            })
            .where(eq(watchedFolders.id, folder.id))
            .run();

          // Update scan history
          db.update(scanHistory)
            .set({
              phase: "completed",
              totalFiles: result.videos.length,
              videoFiles: result.videos.length,
              newVideos,
              updatedVideos,
              totalSize,
              duration: Date.now() - scanStart,
              completedAt: Date.now(),
            })
            .where(eq(scanHistory.id, scan.id))
            .run();

          context.send("scanProgress", {
            folderId: folder.id,
            folderName: folder.name,
            phase: "complete",
            processed: result.videos.length,
            total: result.videos.length,
            newVideos,
            updatedVideos,
          });

          db.insert(activityLog)
            .values({
              level: "info",
              category: "scan",
              message: `Scan completed: ${folder.name} (${newVideos} new, ${updatedVideos} updated)`,
              createdAt: Date.now(),
            })
            .run();
        } catch (error: any) {
          db.update(scanHistory)
            .set({
              phase: "error",
              error: error.message,
              completedAt: Date.now(),
            })
            .where(eq(scanHistory.id, scan.id))
            .run();

          context.send("scanProgress", {
            folderId: folder.id,
            folderName: folder.name,
            phase: "error",
            error: error.message,
            processed: 0,
            total: 0,
          });

          db.insert(activityLog)
            .values({
              level: "error",
              category: "scan",
              message: `Scan failed: ${folder.name} - ${error.message}`,
              createdAt: Date.now(),
            })
            .run();
        }
      }
    })();

    return { success: true, message: `Scanning ${folders.length} folder(s)` };
  });

  router.handle("cancelScan", async () => {
    scanner.cancelScan();
    return { success: true };
  });

  router.handle("getScanHistory", async (params?: { limit?: number }) => {
    return db
      .select()
      .from(scanHistory)
      .orderBy(desc(scanHistory.startedAt))
      .limit(params?.limit || 10)
      .all();
  });

  // ═══════════════════════════════════════════
  // Streaming Server
  // ═══════════════════════════════════════════

  router.handle("getServerStatus", async () => {
    return {
      running: streamingServer !== null,
      port: streamingServer?.port || 8080,
      uptime: serverStartTime ? Date.now() - serverStartTime : 0,
    };
  });

  router.handle("startServer", async (params?: { port?: number }) => {
    if (streamingServer) {
      return { success: false, error: "Server already running" };
    }

    const port = params?.port || 8080;
    // streamingServer = createStreamingServer(port);
    serverStartTime = Date.now();

    db.insert(activityLog)
      .values({
        level: "info",
        category: "server",
        message: `Server started on port ${port}`,
        createdAt: Date.now(),
      })
      .run();

    return { success: true, port };
  });

  router.handle("stopServer", async () => {
    if (streamingServer) {
      streamingServer.stop();
      streamingServer = null;
      serverStartTime = null;

      db.insert(activityLog)
        .values({
          level: "info",
          category: "server",
          message: "Server stopped",
          createdAt: Date.now(),
        })
        .run();

      return { success: true };
    }

    return { success: false, error: "Server not running" };
  });

  // ═══════════════════════════════════════════
  // Activity Logs
  // ═══════════════════════════════════════════

  router.handle(
    "getActivityLogs",
    async (params?: { limit?: number; level?: string }) => {
      let query = db.select().from(activityLog).$dynamic();

      if (params?.level) {
        query = query.where(eq(activityLog.level, params.level as any));
      }

      return query
        .orderBy(desc(activityLog.createdAt))
        .limit(params?.limit || 50)
        .all();
    },
  );

  router.handle("clearActivityLogs", async () => {
    db.delete(activityLog).run();
    return { success: true };
  });
}
