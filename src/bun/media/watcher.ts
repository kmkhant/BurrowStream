// src/bun/media/watcher.ts
import { watch } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { EventEmitter } from "node:events";

const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mkv",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".webm",
  ".m4v",
  ".mpg",
  ".mpeg",
]);

export class FileWatcher extends EventEmitter {
  private watchers: Map<string, any> = new Map();

  watchFolder(folderPath: string): void {
    if (this.watchers.has(folderPath)) return;

    try {
      const watcher = watch(
        folderPath,
        { recursive: true },
        async (eventType, filename) => {
          if (!filename) return;

          const fullPath = join(folderPath, filename);
          const ext = fullPath.split(".").pop()?.toLowerCase();

          // Only care about video files
          if (!ext || !VIDEO_EXTENSIONS.has(`.${ext}`)) return;

          if (eventType === "rename") {
            // Check if file was added or removed
            try {
              await stat(fullPath);
              this.emit("fileAdded", { path: fullPath, folderPath });
            } catch {
              this.emit("fileRemoved", { path: fullPath, folderPath });
            }
          }
        },
      );

      this.watchers.set(folderPath, watcher);
    } catch (error) {
      console.error(`Failed to watch folder ${folderPath}:`, error);
    }
  }

  unwatchFolder(folderPath: string): void {
    const watcher = this.watchers.get(folderPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(folderPath);
    }
  }

  unwatchAll(): void {
    for (const [path, watcher] of this.watchers) {
      watcher.close();
      this.watchers.delete(path);
    }
  }
}
