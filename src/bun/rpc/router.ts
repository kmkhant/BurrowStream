// src/shared/rpc/router.ts
import { z } from "zod";
import {
  AddFolderRequest,
  RemoveFolderRequest,
  ToggleFolderActiveRequest,
  GetVideosRequest,
  GetVideoRequest,
  UpdateVideoRequest,
  StartServerRequest,
  GetActivityLogsRequest,
  GetScanHistoryRequest,
  SelectFolderRequest,
} from "../../shared/rpc/definitions";

import type {
  FolderResponse,
  VideoResponse,
  ScanProgressResponse,
  ServerStatusResponse,
  SystemStatsResponse,
  VideoStatsResponse,
  ScanHistoryResponse,
  ActivityLogResponse,
  SuccessResponse,
  PaginatedResponse,
} from "../../shared/rpc/definitions";

// ── RPC Method Map ──
// Maps method names to their request/response types

export interface RPCMethods {
  // Ping
  ping: {
    request: void;
    response: string;
  };

  // Folder Management
  getFolders: {
    request: void;
    response: FolderResponse[];
  };
  selectFolder: {
    request: void;
    response: { canceled: boolean; path: string | null };
  };
  addFolder: {
    request: z.infer<typeof AddFolderRequest>;
    response: SuccessResponse & { folder?: FolderResponse };
  };
  removeFolder: {
    request: z.infer<typeof RemoveFolderRequest>;
    response: SuccessResponse;
  };
  toggleFolderActive: {
    request: z.infer<typeof ToggleFolderActiveRequest>;
    response: SuccessResponse & { isActive?: boolean };
  };

  // Video Management
  getVideos: {
    request: z.infer<typeof GetVideosRequest>;
    response: PaginatedResponse<VideoResponse>;
  };
  getVideo: {
    request: z.infer<typeof GetVideoRequest>;
    response: VideoResponse | undefined;
  };
  updateVideo: {
    request: z.infer<typeof UpdateVideoRequest>;
    response: SuccessResponse;
  };
  getVideoStats: {
    request: void;
    response: VideoStatsResponse;
  };

  // Scanning
  startScan: {
    request: void;
    response: SuccessResponse;
  };
  cancelScan: {
    request: void;
    response: SuccessResponse;
  };
  getScanHistory: {
    request: z.infer<typeof GetScanHistoryRequest>;
    response: ScanHistoryResponse[];
  };

  // Server Management
  getServerStatus: {
    request: void;
    response: ServerStatusResponse;
  };
  startServer: {
    request: z.infer<typeof StartServerRequest>;
    response: SuccessResponse & { port?: number };
  };
  stopServer: {
    request: void;
    response: SuccessResponse;
  };

  // Activity Logs
  getActivityLogs: {
    request: z.infer<typeof GetActivityLogsRequest>;
    response: ActivityLogResponse[];
  };
  clearActivityLogs: {
    request: void;
    response: SuccessResponse;
  };

  // System
  getSystemStats: {
    request: void;
    response: SystemStatsResponse;
  };

  // Events (server → client)
  scanProgress: {
    request: ScanProgressResponse;
    response: void;
  };
}

// ── Request Schemas Map (for validation) ──

export const RequestSchemas = {
  addFolder: AddFolderRequest,
  selectFolder: SelectFolderRequest,
  removeFolder: RemoveFolderRequest,
  toggleFolderActive: ToggleFolderActiveRequest,
  getVideos: GetVideosRequest,
  getVideo: GetVideoRequest,
  updateVideo: UpdateVideoRequest,
  startServer: StartServerRequest,
  getActivityLogs: GetActivityLogsRequest,
  getScanHistory: GetScanHistoryRequest,
} as const;

export type RPCMethodName = keyof RPCMethods;
