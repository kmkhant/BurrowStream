import { useState, useEffect, useCallback } from "react";
import { electrobun } from "../lib/electrobun";
import type { RPCMethods, RPCMethodName } from "../../bun/rpc/router";
import type {
  FolderResponse,
  VideoResponse,
  ScanProgressResponse,
  ServerStatusResponse,
  SystemStatsResponse,
  ActivityLogResponse,
  VideoStatsResponse,
} from "../../shared/rpc/definitions";

declare global {
  interface Window {
    Electrobun?: {
      rpc: {
        request: Record<string, (args?: any) => Promise<any>>;
        send: Record<string, (args?: any) => void>;
        handlers: Record<string, Function>;
        messages: Record<string, Function>;
      };
    };
  }
}

// Type-safe RPC caller
async function rpcCall<T extends RPCMethodName>(
  method: T,
  params?: RPCMethods[T]["request"],
): Promise<RPCMethods[T]["response"]> {
  // @ts-ignore
  return electrobun.rpc.request[method](params);
}

export function useRPC() {
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [videos, setVideos] = useState<VideoResponse[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgressResponse | null>(
    null,
  );
  const [serverStatus, setServerStatus] = useState<ServerStatusResponse>({
    running: false,
    port: 8080,
    uptime: 0,
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLogResponse[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStatsResponse>({
    cpu: 0,
    memory: 0,
    totalMemory: 0,
    uptime: 0,
    platform: "",
    bunVersion: "",
    cpuCores: 0,
    cpuModel: "",
  });
  const [videoStats, setVideoStats] = useState<VideoStatsResponse>({
    total: 0,
    movies: 0,
    tvShows: 0,
    totalSize: 0,
    favorites: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [foldersData, videosData, status, logs, stats, vStats] =
        await Promise.all([
          rpcCall("getFolders"),
          rpcCall("getVideos", { limit: 50, offset: 0 }),
          rpcCall("getServerStatus"),
          rpcCall("getActivityLogs", { limit: 20 }),
          rpcCall("getSystemStats"),
          rpcCall("getVideoStats"),
        ]);

      setFolders(foldersData);
      setVideos(videosData.data);
      setServerStatus(status);
      setActivityLogs(logs);
      setSystemStats(stats);
      setVideoStats(vStats);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Subscribe to scan progress
  useEffect(() => {
    if (typeof window !== "undefined" && "electrobun" in window) {
      // @ts-ignore
      const unsubscribe = window.electrobun.rpc.on(
        "scanProgress",
        (progress: ScanProgressResponse) => {
          setScanProgress(progress);
          if (progress.phase === "complete" || progress.phase === "error") {
            setIsScanning(false);
            loadAll();
          }
        },
      );
      return unsubscribe;
    }
  }, [loadAll]);

  // Poll system stats
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const stats = await rpcCall("getSystemStats");
        setSystemStats(stats);
      } catch {
        // Ignore polling errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Ping
  const ping = useCallback(async () => {
    return await rpcCall("ping");
  }, []);

  // Actions
  const addFolder = useCallback(
    async (path: string) => {
      const result = await rpcCall("addFolder", { path });
      if (result.success) await loadAll();
      return result;
    },
    [loadAll],
  );

  const removeFolder = useCallback(
    async (id: number) => {
      const result = await rpcCall("removeFolder", { id });
      if (result.success) await loadAll();
      return result;
    },
    [loadAll],
  );

  const startScan = useCallback(async () => {
    setIsScanning(true);
    setScanProgress({ processed: 0, total: 0, phase: "starting" });
    await rpcCall("startScan");
  }, []);

  const cancelScan = useCallback(async () => {
    await rpcCall("cancelScan");
    setIsScanning(false);
    setScanProgress(null);
  }, []);

  const startServer = useCallback(async (port?: number) => {
    const result = await rpcCall("startServer", { port: port || 8080 });
    if (result.success) {
      setServerStatus((prev) => ({
        ...prev,
        running: true,
        port: result.port || port || 8080,
      }));
    }
    return result;
  }, []);

  const stopServer = useCallback(async () => {
    const result = await rpcCall("stopServer");
    if (result.success) {
      setServerStatus((prev) => ({ ...prev, running: false }));
    }
    return result;
  }, []);

  const toggleFavorite = useCallback(
    async (id: number, isFavorite: boolean) => {
      await rpcCall("updateVideo", { id, isFavorite: !isFavorite });
      await loadAll();
    },
    [loadAll],
  );

  const selectFolder = useCallback(async () => {
    const result = await rpcCall("selectFolder");
    return result;
  }, []);

  const clearLogs = useCallback(async () => {
    await rpcCall("clearActivityLogs");
    setActivityLogs([]);
  }, []);

  return {
    ping,
    folders,
    videos,
    videoStats,
    isScanning,
    scanProgress,
    serverStatus,
    activityLogs,
    systemStats,
    loading,
    selectFolder,
    addFolder,
    removeFolder,
    startScan,
    cancelScan,
    startServer,
    stopServer,
    toggleFavorite,
    clearLogs,
    refresh: loadAll,
  };
}
