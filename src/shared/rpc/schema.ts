// src/shared/rpc/schema.ts
import { RPCSchema } from "electrobun";
import { z } from "zod";

// ── Shared RPC Definitions Imports ──
import {
  AddFolderRequest,
  GetActivityLogsRequest,
  GetScanHistoryRequest,
  GetVideoRequest,
  GetVideosRequest,
  RemoveFolderRequest,
  StartServerRequest,
  ToggleFolderActiveRequest,
  UpdateVideoRequest,
} from "../../shared/rpc/definitions";

import type {
  ActivityLogResponse,
  FolderResponseSchema,
  PaginatedResponse,
  ScanHistoryResponse,
  ScanProgressResponse,
  ServerStatusResponse,
  StartStreamingServerResponse,
  SuccessResponse,
  SystemStatsResponse,
  VideoResponse,
  VideoStatsResponse,
} from "../../shared/rpc/definitions";

// ── 1. Zod Validation Schemas (Runtime) ──

// System / Ping Schemas
export const TestScanMessageSchema = z.object({});

// Folder Schemas
export const AddFolderSchema = AddFolderRequest;
export const GetFoldersSchema = z.object({});
export const RemoveFolderSchema = RemoveFolderRequest;
export const ToggleFolderActiveSchema = ToggleFolderActiveRequest;

// Video Schemas
export const GetVideoSchema = GetVideoRequest;
export const GetVideosSchema = GetVideosRequest;
export const GetVideoStatsSchema = z.object({});
export const UpdateVideoSchema = UpdateVideoRequest;

// Scan Schemas
export const CancelScanSchema = z.object({});
export const GetScanHistorySchema = GetScanHistoryRequest;
export const StartScanSchema = z.object({});

// Server Schemas
export const GetServerStatusSchema = z.object({});
export const StartServerSchema = StartServerRequest;
export const StopServerSchema = z.object({});

// Activity Log Schemas
export const ClearActivityLogsSchema = z.object({});
export const GetActivityLogsSchema = GetActivityLogsRequest;

// ── 2. Request Schemas Map (Runtime Registry) ──

export const RequestSchemas = {
  // System / Ping
  testScanMessage: TestScanMessageSchema,

  // Folder Management
  addFolder: AddFolderSchema,
  getFolders: GetFoldersSchema,
  removeFolder: RemoveFolderSchema,
  toggleFolderActive: ToggleFolderActiveSchema,

  // Video Management
  getVideo: GetVideoSchema,
  getVideos: GetVideosSchema,
  getVideoStats: GetVideoStatsSchema,
  updateVideo: UpdateVideoSchema,

  // Scanning
  cancelScan: CancelScanSchema,
  getScanHistory: GetScanHistorySchema,
  startScan: StartScanSchema,

  // Server Management
  getServerStatus: GetServerStatusSchema,
  startServer: StartServerSchema,
  stopServer: StopServerSchema,

  // Activity Logs
  clearActivityLogs: ClearActivityLogsSchema,
  getActivityLogs: GetActivityLogsSchema,
} as const;

// ── 3. Pure Static Types (Compile-time) ──

export interface RPCMethods {
  // System / Ping
  ping: {
    request: void;
    response: string;
  };
  testScanMessage: {
    request: void;
    response: { success: boolean };
  };
  getSystemStats: {
    request: void;
    response: SystemStatsResponse;
  };

  // Folder Management
  addFolder: {
    request: z.infer<typeof AddFolderSchema>;
    response: SuccessResponse & {
      folder?: z.infer<typeof FolderResponseSchema>;
    };
  };
  getFolders: {
    request: void;
    response: z.infer<typeof FolderResponseSchema>[];
  };
  removeFolder: {
    request: z.infer<typeof RemoveFolderSchema>;
    response: SuccessResponse;
  };
  toggleFolderActive: {
    request: z.infer<typeof ToggleFolderActiveSchema>;
  };

  // Video Management
  getVideo: {
    request: z.infer<typeof GetVideoSchema>;
    response: VideoResponse | undefined;
  };
  getVideos: {
    request: z.infer<typeof GetVideosSchema>;
    response: PaginatedResponse<VideoResponse>;
  };
  getVideoStats: {
    request: void;
    response: VideoStatsResponse;
  };
  updateVideo: {
    request: z.infer<typeof UpdateVideoSchema>;
    response: SuccessResponse;
  };

  // Scanning
  cancelScan: {
    request: void;
    response: SuccessResponse;
  };
  getScanHistory: {
    request: z.infer<typeof GetScanHistorySchema>;
    response: ScanHistoryResponse[];
  };
  startScan: {
    request: void;
    response: SuccessResponse;
  };

  // Server Management
  getServerStatus: {
    request: void;
    response: ServerStatusResponse;
  };
  startServer: {
    request: z.infer<typeof StartServerSchema>;
    response: StartStreamingServerResponse;
  };
  stopServer: {
    request: void;
    response: SuccessResponse;
  };

  // Activity Logs
  clearActivityLogs: {
    request: void;
    response: SuccessResponse;
  };
  getActivityLogs: {
    request: z.infer<typeof GetActivityLogsSchema>;
    response: ActivityLogResponse[];
  };

  // Events (Unidirectional Server → Client Channels)
  scanProgress: {
    request: ScanProgressResponse;
    response: void;
  };
}

export type RPCMethodName = keyof RPCMethods;

// ── 4. Electrobun Bridge Map (Compile-time) ──

export type MainRPC = {
  bun: RPCSchema<{
    requests: {
      // System / Ping
      ping: {
        params: Record<string, never>;
        response: string;
      };
      getSystemStats: {
        params: Record<string, never>;
        response: SystemStatsResponse;
      };

      // Folder Management
      addFolder: {
        params: z.infer<typeof AddFolderSchema>;
        response: SuccessResponse & {
          folder?: z.infer<typeof FolderResponseSchema>;
        };
      };
      getFolders: {
        params: Record<string, never>;
        response: z.infer<typeof FolderResponseSchema>[];
      };
      removeFolder: {
        params: z.infer<typeof RemoveFolderSchema>;
        response: SuccessResponse;
      };
      toggleFolderActive: {
        params: z.infer<typeof ToggleFolderActiveSchema>;
        response: SuccessResponse & { isActive?: boolean };
      };

      // Video Management
      getVideo: {
        params: z.infer<typeof GetVideoSchema>;
        response: VideoResponse | undefined;
      };
      getVideos: {
        params: z.infer<typeof GetVideosSchema>;
        response: PaginatedResponse<VideoResponse>;
      };
      getVideoStats: {
        params: Record<string, never>;
        response: VideoStatsResponse;
      };
      updateVideo: {
        params: z.infer<typeof UpdateVideoSchema>;
        response: SuccessResponse;
      };

      // Scanning
      cancelScan: {
        params: Record<string, never>;
        response: SuccessResponse;
      };
      getScanHistory: {
        params: z.infer<typeof GetScanHistorySchema>;
        response: ScanHistoryResponse[];
      };
      startScan: {
        params: Record<string, never>;
        response: SuccessResponse;
      };

      // Server Management
      getServerStatus: {
        params: Record<string, never>;
        response: ServerStatusResponse;
      };
      startServer: {
        params: z.infer<typeof StartServerSchema>;
        response: StartStreamingServerResponse;
      };
      stopServer: {
        params: Record<string, never>;
        response: SuccessResponse;
      };

      // Activity Logs
      clearActivityLogs: {
        params: Record<string, never>;
        response: SuccessResponse;
      };
      getActivityLogs: {
        params: z.infer<typeof GetActivityLogsSchema>;
        response: ActivityLogResponse[];
      };
    };
    messages: {
      log: { msg: string };
      scanProgress: ScanProgressResponse;
    };
  }>;
  webview: RPCSchema<{
    requests: Record<string, never>;
    messages: Record<string, never>;
  }>;
};
