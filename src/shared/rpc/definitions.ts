// src/shared/rpc/definitions.ts
import { z } from "zod";

// ── Request Schemas ──

export const AddFolderRequest = z.object({
  path: z.string().min(1),
});

export const RemoveFolderRequest = z.object({
  id: z.number(),
});

export const ToggleFolderActiveRequest = z.object({
  id: z.number(),
});

export const GetVideosRequest = z.object({
  type: z.enum(["movie", "tv", "unknown", "all"]).optional(),
  folderId: z.number().optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  search: z.string().optional(),
});

export const GetVideoRequest = z.object({
  id: z.number(),
});

export const UpdateVideoRequest = z.object({
  id: z.number(),
  customTitle: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

export const StartServerRequest = z.object({
  port: z.number().min(1024).max(65535).optional().default(8080),
});

export const GetActivityLogsRequest = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  level: z.enum(["info", "warn", "error"]).optional(),
});

export const GetScanHistoryRequest = z.object({
  limit: z.number().min(1).max(50).optional().default(10),
});

// ── Response Types ──

export interface FolderResponse {
  id: number;
  path: string;
  name: string | null;
  isActive: boolean;
  lastScanAt: number | null;
  totalVideos: number;
  totalSize: number;
}

export interface VideoResponse {
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

export interface ScanProgressResponse {
  folderId?: number;
  folderName?: string;
  processed: number;
  total: number;
  currentFile?: string;
  phase: "starting" | "discovering" | "processing" | "complete" | "error";
  error?: string;
  newVideos?: number;
  updatedVideos?: number;
}

export interface ServerStatusResponse {
  running: boolean;
  port: number;
  uptime: number;
  url?: string;
}

export interface SystemStatsResponse {
  cpu: number;
  memory: number;
  totalMemory: number;
  uptime: number;
  platform: string;
  bunVersion: string;
  cpuCores: number;
  cpuModel: string;
}

export interface VideoStatsResponse {
  total: number;
  movies: number;
  tvShows: number;
  totalSize: number;
  favorites: number;
}

export interface ScanHistoryResponse {
  id: number;
  folderId: number;
  phase: string;
  totalFiles: number | null;
  videoFiles: number | null;
  newVideos: number | null;
  updatedVideos: number | null;
  removedVideos: number | null;
  totalSize: number | null;
  duration: number | null;
  error: string | null;
  startedAt: number;
  completedAt: number | null;
}

export interface ActivityLogResponse {
  id: number;
  level: "info" | "warn" | "error";
  category: "scan" | "server" | "system" | "user";
  message: string;
  metadata?: string;
  createdAt: number;
}

export interface SuccessResponse {
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
