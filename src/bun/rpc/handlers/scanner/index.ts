import { MediaScanner } from "../../../media/scanner";
import { MediaParser } from "../../../media/parser";
import { db } from "../../../db/client";
import {
  watchedFolders,
  videos,
  scanHistory,
  activityLog,
} from "../../../db/schema";
import { eq } from "drizzle-orm";

import { mainWindowRpc } from "../../../../shared/rpc";

// Initiate scanner and parser instances
const scanner = new MediaScanner();
const parser = new MediaParser();

export async function startScan(
  params: Record<string, never>,
): Promise<{ success: boolean }> {
  const folders = db
    .select()
    .from(watchedFolders)
    .where(eq(watchedFolders.isActive, true))
    .all();

  if (folders.length === 0) {
    // @ts-ignore
    mainWindowRpc.send.scanProgress({
      processed: 0,
      total: folders.length,
      phase: "complete",
      error: undefined,
    });
    return { success: true };
  }

  // Scan each folder sequentially (you could also run in parallel if desired)
  for (const folder of folders) {
    const scanStart = Date.now();

    // Create scan history record
    const scanEntry = db
      .insert(scanHistory)
      .values({
        folderId: folder.id,
        phase: "started",
        startedAt: scanStart,
      })
      .returning()
      .get();

    // Notify UI that we're starting this folder
    // context.send("scanProgress", {
    //   folderId: folder.id,
    //   folderName: folder.name,
    //   phase: "starting",
    //   processed: 0,
    //   total: 0,
    // });

    // Forward scanner progress events to the frontend
    const onProgress = (p: any) => {
      // context.send("scanProgress", {
      //   folderId: folder.id,
      //   folderName: folder.name,
      //   processed: p.processed,
      //   total: p.total,
      //   currentFile: p.currentFile,
      //   phase: p.phase,
      // });
    };
    scanner.on("progress", onProgress);

    try {
      const result = await scanner.scanDirectory(folder.path);
      scanner.off("progress", onProgress); // clean up listener

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
          // Update existing record
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
          // Insert new video
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
        .where(eq(scanHistory.id, scanEntry.id))
        .run();

      // Final progress for this folder
      // context.send("scanProgress", {
      //   folderId: folder.id,
      //   folderName: folder.name,
      //   phase: "complete",
      //   processed: result.videos.length,
      //   total: result.videos.length,
      //   newVideos,
      //   updatedVideos,
      // });

      // Log activity
      db.insert(activityLog)
        .values({
          level: "info",
          category: "scan",
          message: `Scan completed: ${folder.name} (${newVideos} new, ${updatedVideos} updated)`,
          createdAt: Date.now(),
        })
        .run();
    } catch (error: any) {
      scanner.off("progress", onProgress);

      // Mark scan history as error
      db.update(scanHistory)
        .set({
          phase: "error",
          error: error.message,
          completedAt: Date.now(),
        })
        .where(eq(scanHistory.id, scanEntry.id))
        .run();

      // context.send("scanProgress", {
      //   folderId: folder.id,
      //   folderName: folder.name,
      //   phase: "error",
      //   error: error.message,
      // });

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

  // Inform UI that all folders have been processed
  // context.send("scanProgress", { phase: "allComplete" });
  return { success: true };
}

export async function cancelScan(params: Record<string, never>) {
  scanner.cancelScan();
  return { success: true };
}
