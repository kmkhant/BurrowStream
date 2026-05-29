// src/shared/rpc/definitions.ts
import { z } from "zod";

// ==========================================
// REQUEST SCHEMAS & TYPES ──
// ==========================================

export const GetFoldersRequest = z.object({});
export type GetFoldersRequest = z.infer<typeof GetFoldersRequest>;

export const AddFolderRequest = z.object({});
export type AddFolderRequest = z.infer<typeof AddFolderRequest>;

export const RemoveFolderRequest = z.object({
  id: z.number(),
});
export type RemoveFolderRequest = z.infer<typeof RemoveFolderRequest>;

export const ToggleFolderActiveRequest = z.object({
  id: z.number(),
});
export type ToggleFolderActiveRequest = z.infer<
  typeof ToggleFolderActiveRequest
>;

export const GetVideosRequest = z.object({
  type: z.enum(["movie", "tv", "unknown", "all"]).optional(),
  folderId: z.number().optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  search: z.string().optional(),
});
export type GetVideosRequest = z.infer<typeof GetVideosRequest>;

export const GetVideoRequest = z.object({
  id: z.number(),
});
export type GetVideoRequest = z.infer<typeof GetVideoRequest>;

export const UpdateVideoRequest = z.object({
  id: z.number(),
  customTitle: z.string().optional(),
  isFavorite: z.boolean().optional(),
});
export type UpdateVideoRequest = z.infer<typeof UpdateVideoRequest>;

export const StartServerRequest = z.object({
  port: z.number().min(1024).max(65535).optional().default(8080),
});
export type StartServerRequest = z.infer<typeof StartServerRequest>;

export const GetActivityLogsRequest = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  level: z.enum(["info", "warn", "error"]).optional(),
});
export type GetActivityLogsRequest = z.infer<typeof GetActivityLogsRequest>;

export const GetScanHistoryRequest = z.object({
  limit: z.number().min(1).max(50).optional().default(10),
});
export type GetScanHistoryRequest = z.infer<typeof GetScanHistoryRequest>;

// ==========================================
// ── RESPONSE SCHEMAS & TYPES ──
// ==========================================

export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;

export const FolderResponseSchema = z.object({
  id: z.number(),
  path: z.string(),
  name: z.string().nullable(),
  isActive: z.boolean().nullable(),
  scanInterval: z.number().nullable(),
  lastScanAt: z.number().nullable(),
  lastScanDuration: z.number().nullable(),
  totalVideos: z.number().nullable(),
  totalSize: z.number().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type FolderResponse = z.infer<typeof FolderResponseSchema>;

export const VideoResponseSchema = z.object({
  id: z.number(),
  path: z.string(),
  type: z.enum(["movie", "tv", "unknown"]),
  title: z.string(),
  year: z.number().optional(),
  season: z.number().optional(),
  episode: z.string().optional(),
  episodeTitle: z.string().optional(),
  quality: z.string().optional(),
  source: z.string().optional(),
  codec: z.string().optional(),
  size: z.number(),
  extension: z.string(),
  folderId: z.number(),
  isFavorite: z.boolean(),
  playCount: z.number(),
  lastPlayedAt: z.number().optional(),
  scannedAt: z.number(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type VideoResponse = z.infer<typeof VideoResponseSchema>;

export const ScanProgressResponseSchema = z.object({
  folderId: z.number().optional(),
  folderName: z.string().optional(),
  processed: z.number(),
  total: z.number(),
  currentFile: z.string().optional(),
  phase: z.enum(["starting", "discovering", "processing", "complete", "error"]),
  error: z.string().optional(),
  newVideos: z.number().optional(),
  updatedVideos: z.number().optional(),
});
export type ScanProgressResponse = z.infer<typeof ScanProgressResponseSchema>;

export const ServerStatusResponseSchema = z.object({
  running: z.boolean(),
  port: z.number().nullable().optional(),
  uptime: z.number(),
  url: z.string().nullable(),
  ip: z.string().nullable(),
});
export type ServerStatusResponse = z.infer<typeof ServerStatusResponseSchema>;

export const StartStreamingServerResponseSchema = z.object({
  success: z.boolean(),
  port: z.number(),
  ip: z.string(),
});
export type StartStreamingServerResponse = z.infer<
  typeof StartStreamingServerResponseSchema
>;

export const SystemStatsResponseSchema = z.object({
  cpu: z.number(),
  memory: z.number(),
  totalMemory: z.number(),
  uptime: z.number(),
  platform: z.string(),
  bunVersion: z.string(),
  cpuCores: z.number(),
  cpuModel: z.string(),
});
export type SystemStatsResponse = z.infer<typeof SystemStatsResponseSchema>;

export const VideoStatsResponseSchema = z.object({
  total: z.number(),
  movies: z.number(),
  tvShows: z.number(),
  totalSize: z.number(),
  favorites: z.number(),
});
export type VideoStatsResponse = z.infer<typeof VideoStatsResponseSchema>;

export const ScanHistoryResponseSchema = z.object({
  id: z.number(),
  folderId: z.number(),
  phase: z.string(),
  totalFiles: z.number().nullable(),
  videoFiles: z.number().nullable(),
  newVideos: z.number().nullable(),
  updatedVideos: z.number().nullable(),
  removedVideos: z.number().nullable(),
  totalSize: z.number().nullable(),
  duration: z.number().nullable(),
  error: z.string().nullable(),
  startedAt: z.number(),
  completedAt: z.number().nullable(),
});
export type ScanHistoryResponse = z.infer<typeof ScanHistoryResponseSchema>;

export const ActivityLogResponseSchema = z.object({
  id: z.number(),
  level: z.enum(["info", "warn", "error"]),
  category: z.enum(["scan", "server", "system", "user"]),
  message: z.string(),
  metadata: z.string().optional(),
  createdAt: z.number(),
});
export type ActivityLogResponse = z.infer<typeof ActivityLogResponseSchema>;

// Generics can remain as native TS types since they are dynamic wrappers
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
