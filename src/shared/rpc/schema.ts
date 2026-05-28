// src/shared/rpc/schema.ts
import { RPCSchema } from "electrobun";
import { z } from "zod";
import { Folder, SystemStats } from "./types";

// ── Folder Schemas ──
export const AddFolderSchema = z.object({});

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

export type MainRPC = {
  bun: RPCSchema<{
    requests: {
      ping: {
        params: Record<string, never>;
        response: string;
      };
      getSystemStats: {
        params: Record<string, never>;
        response: SystemStats;
      };

      // folder handlers
      getFolders: {
        params: Record<string, never>;
        response: Folder[];
      };
      addFolder: {
        params: Record<string, never>;
        response: { success: boolean; folder?: Folder };
      };
      removeFolder: {
        params: { id: number };
        response: { success: boolean };
      };

      // scanner handlers
      startScan: {
        params: Record<string, never>;
        response: { success: boolean };
      };
      cancelScan: {
        params: Record<string, never>;
        response: { success: boolean };
      };

      // streaming handlers
      startServer: {
        params: { port?: number };
        response: {
          success: boolean;
          error?: string;
          port?: number;
          ip?: string;
        };
      };
      stopServer: {
        params: Record<string, never>;
        response: { success: boolean; error?: string };
      };
      getServerStatus: {
        params: Record<string, never>;
        response: {
          running: boolean;
          port: number | null;
          uptime: number;
        };
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
