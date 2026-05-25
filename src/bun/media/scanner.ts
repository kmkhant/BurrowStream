import { readdir, stat } from "node:fs/promises";
import { join, extname } from "node:path";
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

interface ScanProgress {
  processed: number;
  total: number;
  currentFile?: string;
  phase: "discovering" | "processing" | "complete" | "error";
}

interface VideoFile {
  path: string;
  name: string;
  size: number;
  extension: string;
  lastModified: number;
}

interface ScanResult {
  videos: VideoFile[];
  totalSize: number;
  duration: number;
  errors: string[];
}

export class MediaScanner extends EventEmitter {
  private isScanning = false;
  private abortController: AbortController | null = null;

  async scanDirectory(dirPath: string): Promise<ScanResult> {
    if (this.isScanning) {
      throw new Error("Scan already in progress");
    }

    // Verify directory exists before starting
    try {
      const dirStat = await stat(dirPath);
      if (!dirStat.isDirectory()) {
        throw new Error(`Path is not a directory: ${dirPath}`);
      }
    } catch (error: any) {
      if (error.code === "ENOENT") {
        throw new Error(`Directory not found: ${dirPath}`);
      }
      if (error.message?.startsWith("Path is not a directory")) {
        throw error;
      }
      throw new Error(`Cannot access directory: ${error.message}`);
    }

    this.isScanning = true;
    this.abortController = new AbortController();
    const startTime = Date.now();
    const videos: VideoFile[] = [];
    const errors: string[] = [];

    try {
      this.emitProgress({ processed: 0, total: 0, phase: "discovering" });

      const allFiles = await this.discoverFiles(dirPath);

      // Check for cancellation after discovery
      if (this.abortController.signal.aborted) {
        throw new Error("Scan cancelled");
      }

      const totalFiles = allFiles.length;

      this.emitProgress({
        processed: 0,
        total: totalFiles,
        phase: "processing",
      });

      for (let i = 0; i < allFiles.length; i++) {
        // Check cancellation before each file
        if (this.abortController.signal.aborted) {
          throw new Error("Scan cancelled");
        }

        const filePath = allFiles[i];

        try {
          const fileStat = await stat(filePath);

          if (fileStat.isFile()) {
            const ext = extname(filePath).toLowerCase();

            if (VIDEO_EXTENSIONS.has(ext)) {
              videos.push({
                path: filePath,
                name: filePath.split("/").pop() || "unknown",
                size: fileStat.size,
                extension: ext,
                lastModified: fileStat.mtimeMs,
              });
            }
          }

          this.emitProgress({
            processed: i + 1,
            total: totalFiles,
            currentFile: filePath,
            phase: "processing",
          });
        } catch (error) {
          errors.push(`Error processing ${filePath}: ${error}`);
        }

        // Yield to event loop periodically
        if (i % 10 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      const duration = Date.now() - startTime;

      this.emitProgress({
        processed: totalFiles,
        total: totalFiles,
        phase: "complete",
      });

      return {
        videos,
        totalSize: videos.reduce((sum, v) => sum + v.size, 0),
        duration,
        errors,
      };
    } catch (error: any) {
      this.emitProgress({
        processed: 0,
        total: 0,
        phase: "error",
      });
      throw error;
    } finally {
      this.isScanning = false;
      this.abortController = null;
    }
  }

  private async discoverFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.name.startsWith(".")) continue;

        if (entry.isDirectory()) {
          // Check cancellation during discovery
          if (this.abortController?.signal.aborted) {
            return files;
          }
          const subFiles = await this.discoverFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
    }

    return files;
  }

  cancelScan(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private emitProgress(progress: ScanProgress): void {
    this.emit("progress", progress);
  }
}
