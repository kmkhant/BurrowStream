// src/shared/rpc/schema.ts
import { z } from "zod";

// ── Folder Schemas ──
export const AddFolderSchema = z.object({
  path: z.string().min(1),
});

export const RemoveFolderSchema = z.object({
  id: z.number(),
});

// ── Scan Schemas ──
export const StartScanSchema = z.object({});
export const CancelScanSchema = z.object({});

// ── Video Schemas ──
export const GetVideosSchema = z.object({
  type: z.enum(["movie", "tv", "unknown", "all"]).optional(),
  folderId: z.number().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  search: z.string().optional(),
});

export const GetVideoSchema = z.object({
  id: z.number(),
});

export const UpdateVideoSchema = z.object({
  id: z.number(),
  customTitle: z.string().optional(),
  isFavorite: z.boolean().optional(),
});

// ── Server Schemas ──
export const StartServerSchema = z.object({
  port: z.number().optional(),
});

export const StopServerSchema = z.object({});

// ── Activity Log Schemas ──
export const GetActivityLogsSchema = z.object({
  limit: z.number().optional(),
  level: z.enum(["info", "warn", "error"]).optional(),
});

export const ClearActivityLogsSchema = z.object({});
