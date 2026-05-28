import { useState, useEffect, useCallback, useRef } from "react";
import { electrobun } from "../lib/electrobun";

import type {
  FolderResponse,
  VideoResponse,
  ScanProgressResponse,
  ServerStatusResponse,
  SystemStatsResponse,
  ActivityLogResponse,
  VideoStatsResponse,
} from "../../shared/rpc/definitions";

import type { RPCMethods, RPCMethodName } from "../../bun/rpc/router";

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

  const [activityLogs, setActivityLogs] = useState<ActivityLogResponse[]>([]);

  // streaming server status
  const [streamingServerStatus, setStreamingServerStatus] = useState({
    running: false,
    port: 8080,
    ip: "localhost",
  });

  const startServer = useCallback(async (port?: number) => {
    const result = await rpcCall("startServer", { port: port || 8080 });

    // set the status
    setStreamingServerStatus({
      running: result.success,
      port: result.port || 8080,
      ip: (result.ip as string) || "localhost",
    });
  }, []);

  const stopServer = useCallback(async () => {
    try {
      await rpcCall("stopServer");
    } catch (error) {
      console.error("Failed to stop server:", error);
    }

    // reset the status
    setStreamingServerStatus({
      running: false,
      port: 8080,
      ip: "localhost",
    });
  }, []);

  const getServerStatus = useCallback(async () => {
    return await rpcCall("getServerStatus");
  }, []);

  // System stats
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

  // Loading state
  const [loading, setLoading] = useState(true);

  // Load all data
  const loadAll = useCallback(async () => {
    try {
      const [foldersData] = await Promise.all([rpcCall("getFolders")]);

      setFolders(foldersData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, [folders.length]);

  const loadAllRef = useRef(loadAll);
  useEffect(() => {
    loadAllRef.current = loadAll;
  }, [loadAll]);

  // Subscribe to scan progress
  useEffect(() => {
    const unsubscribe = electrobun.rpc?.addMessageListener(
      "scanProgress",
      (progress: ScanProgressResponse) => {
        setScanProgress(progress);
        if (progress.phase === "complete" || progress.phase === "error") {
          setIsScanning(false);
          loadAllRef.current(); // always calls the latest loadAll
        }
      },
    );
    return unsubscribe;
  }, []);

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

  // Folder Actions
  const getFolders = useCallback(async () => {
    const result = await rpcCall("getFolders");

    console.log("Folders:", result);
    return [];
  }, []);

  const addFolder = useCallback(async () => {
    const result = await rpcCall("addFolder");
    // Reload folders
    await loadAll();
    return result;
  }, [folders.length]);

  const removeFolder = useCallback(
    async (id: number) => {
      const result = await rpcCall("removeFolder", { id });

      // Reload folders
      await loadAll();
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

  const toggleFavorite = useCallback(
    async (id: number, isFavorite: boolean) => {
      await rpcCall("updateVideo", { id, isFavorite: !isFavorite });
      await loadAll();
    },
    [loadAll],
  );

  const clearLogs = useCallback(async () => {
    await rpcCall("clearActivityLogs");
    setActivityLogs([]);
  }, []);

  return {
    ping,
    folders,
    videos,
    setVideos,
    videoStats,
    isScanning,
    scanProgress,
    activityLogs,
    systemStats,
    loading,
    getFolders,
    addFolder,
    removeFolder,
    startScan,
    cancelScan,
    startServer,
    stopServer,
    streamingServerStatus,
    getServerStatus,
    toggleFavorite,
    clearLogs,
    refreshAll: loadAll,
  };
}
