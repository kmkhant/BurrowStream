import type { RPCSchema } from "electrobun/bun";

export interface Folder {
  id: number;
  path: string;
  name: string | null;
  isActive: boolean;
  lastScanAt: number | null;
  totalVideos: number;
  totalSize: number;
}

export interface Video {
  id: number;
  path: string;
  type: "movie" | "tv" | "unknown";
  title: string;
  year?: number;
  season?: number;
  episode?: string;
  episodeTitle?: string;
  quality?: string;
  source?: string;
  codec?: string;
  size: number;
  extension: string;
  folderId: number;
  isFavorite: boolean;
  playCount: number;
  lastPlayedAt?: number;
  scannedAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface ScanProgress {
  folderId?: number;
  processed: number;
  total: number;
  currentFile?: string;
  phase: "discovering" | "processing" | "complete" | "error";
  error?: string;
  newVideos?: number;
  updatedVideos?: number;
}

export interface ActivityLog {
  id: number;
  level: "info" | "warn" | "error";
  category: "scan" | "server" | "system" | "user";
  message: string;
  metadata?: string;
  createdAt: number;
}

export interface ServerStatus {
  running: boolean;
  port: number;
  uptime: number;
  url?: string;
}

export interface SystemStats {
  cpu: number;
  memory: number;
  uptime: number;
}

export type MainRPC = {
  bun: RPCSchema<{
    requests: {
      ping: {
        params: Record<string, never>;
        response: string;
      };
      selectFolder: {
        params: Record<string, never>;
        response: { canceled: boolean; path: string | null };
      };
    };
    messages: {
      log: { msg: string };
      scanProgress: { phase: string; processed: number; total: number };
    };
  }>;
  webview: RPCSchema<{
    requests: Record<string, never>;
    messages: Record<string, never>;
  }>;
};
