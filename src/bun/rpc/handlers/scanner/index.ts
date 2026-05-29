// src/bun/rpc/handlers/scan.ts
import { eq, sql } from "drizzle-orm";
import { db } from "../../../db/client";
import {
  activityLog,
  scanHistory,
  videos,
  watchedFolders,
} from "../../../db/schema";
import { MediaParser } from "../../../media/parser";
import { MediaScanner } from "../../../media/scanner";

import { mainWindowRpc } from "../../../../shared/rpc";
import type { SuccessResponse } from "../../../../shared/rpc/definitions";

const scanner = new MediaScanner();
const parser = new MediaParser();

export async function startScan(
  _params: Record<string, never>,
): Promise<SuccessResponse> {
  const folders = db
    .select()
    .from(watchedFolders)
    .where(eq(watchedFolders.isActive, true))
    .all();

  if (folders.length === 0) {
    // @ts-ignore
    mainWindowRpc.send.scanProgress({
      processed: 0,
      total: 0,
      phase: "complete",
    });
    return { success: true };
  }

  for (const folder of folders) {
    const scanStart = Date.now();

    const scanEntry = db
      .insert(scanHistory)
      .values({
        folderId: folder.id,
        phase: "started",
        startedAt: scanStart,
      })
      .returning()
      .get();

    // Establish strict event subscription wrapper with type mapping
    const onProgress = (p: {
      processed: number;
      total: number;
      currentFile?: string;
      phase: any;
    }) => {
      // @ts-ignore
      mainWindowRpc.send.scanProgress({
        folderId: folder.id,
        folderName: folder.name ?? undefined,
        processed: p.processed,
        total: p.total,
        currentFile: p.currentFile,
        phase: p.phase,
      });
    };

    scanner.on("progress", onProgress);

    try {
      // @ts-ignore
      mainWindowRpc.send.scanProgress({
        folderId: folder.id,
        folderName: folder.name ?? undefined,
        phase: "starting",
        processed: 0,
        total: 0,
      });

      const result = await scanner.scanDirectory(folder.path);

      // Fetch existing media directory state upfront to eliminate N+1 inline queries
      const existingVideos = db
        .select({ id: videos.id, path: videos.path })
        .from(videos)
        .where(eq(videos.folderId, folder.id))
        .all();

      const existingVideoMap = new Map<string, number>(
        existingVideos.map((v) => [v.path, v.id]),
      );

      let newVideos = 0;
      let updatedVideos = 0;
      const now = Date.now();

      // Batch or execute operational updates leveraging the local identifier cache
      for (const videoFile of result.videos) {
        const existingId = existingVideoMap.get(videoFile.path);

        if (existingId) {
          db.update(videos)
            .set({
              size: videoFile.size,
              lastModified: videoFile.lastModified,
              scannedAt: now,
              updatedAt: now,
            })
            .where(eq(videos.id, existingId))
            .run();
          updatedVideos++;
        } else {
          const parsed = parser.parse(videoFile.name);
          db.insert(videos)
            .values({
              path: videoFile.path,
              type: parsed.type,
              title: parsed.title,
              year: parsed.year,
              season: parsed.season,
              episode: parsed.episode ? JSON.stringify(parsed.episode) : null,
              episodeTitle: parsed.episodeTitle,
              quality: parsed.quality,
              source: parsed.source,
              codec: parsed.codec,
              size: videoFile.size,
              extension: videoFile.extension,
              lastModified: videoFile.lastModified,
              folderId: folder.id,
              scanId: scanEntry.id,
              scannedAt: now,
              createdAt: now,
              updatedAt: now,
            })
            .run();
          newVideos++;
        }
      }

      // Compute structural totals with optimized DB aggregation instead of array iteration
      const [metrics] = db
        .select({
          count: sql<number>`count(${videos.id})`,
          size: sql<number>`sum(${videos.size})`,
        })
        .from(videos)
        .where(eq(videos.folderId, folder.id))
        .all();

      const totalVideosCount = metrics?.count || 0;
      const totalVideosSize = metrics?.size || 0;

      db.update(watchedFolders)
        .set({
          lastScanAt: scanStart,
          lastScanDuration: Date.now() - scanStart,
          totalVideos: totalVideosCount,
          totalSize: totalVideosSize,
          updatedAt: Date.now(),
        })
        .where(eq(watchedFolders.id, folder.id))
        .run();

      db.update(scanHistory)
        .set({
          phase: "completed",
          totalFiles: result.videos.length,
          videoFiles: result.videos.length,
          newVideos,
          updatedVideos,
          totalSize: totalVideosSize,
          duration: Date.now() - scanStart,
          completedAt: Date.now(),
        })
        .where(eq(scanHistory.id, scanEntry.id))
        .run();

      // @ts-ignore
      mainWindowRpc.send.scanProgress({
        folderId: folder.id,
        folderName: folder.name ?? undefined,
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
        .where(eq(scanHistory.id, scanEntry.id))
        .run();

      // @ts-ignore
      mainWindowRpc.send.scanProgress({
        folderId: folder.id,
        folderName: folder.name ?? undefined,
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
    } finally {
      // Guarantees event unbinding regardless of try block exceptions
      scanner.off("progress", onProgress);
    }
  }

  // Removed "allComplete" to strictly follow ScanProgressResponse enum specs
  // @ts-ignore
  mainWindowRpc.send.scanProgress({
    phase: "complete",
    processed: 0,
    total: 0,
  });

  return { success: true };
}

export async function cancelScan(
  _params: Record<string, never>,
): Promise<SuccessResponse> {
  scanner.cancelScan();
  return { success: true };
}
