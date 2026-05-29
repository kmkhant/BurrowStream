import { useCallback, useEffect, useRef, useState } from "react";
import { electrobun } from "../lib/electrobun";

// ── Types & Core Definitions ──
import type {
  ActivityLogResponse,
  FolderResponse,
  ScanProgressResponse,
  SystemStatsResponse,
  VideoResponse,
  VideoStatsResponse,
} from "../../shared/rpc/definitions";
import type { RPCMethodName, RPCMethods } from "../../shared/rpc/schema";

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

// ── Generic RPC Call Engine Helpers ──
type RPCRequest<T extends RPCMethodName> = RPCMethods[T] extends {
  request: infer R;
}
  ? R
  : void;

type RPCResponse<T extends RPCMethodName> = RPCMethods[T] extends {
  response: infer P;
}
  ? P
  : void;

async function rpcCall<T extends RPCMethodName>(
  method: T,
  params?: RPCRequest<T>,
): Promise<RPCResponse<T>> {
  // @ts-ignore
  return electrobun.rpc.request[method](params);
}

// ── Primary Hook ──
export function useRPC() {
  // ── State Grouping ──
  const [loading, setLoading] = useState(true);
  const [activityLogs, setActivityLogs] = useState<ActivityLogResponse[]>([]);

  // Folder & Video States
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [videos, setVideos] = useState<VideoResponse[]>([]);
  const [videoStats, setVideoStats] = useState<VideoStatsResponse>({
    total: 0,
    movies: 0,
    tvShows: 0,
    totalSize: 0,
    favorites: 0,
  });

  // Scan States
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgressResponse | null>(
    null,
  );

  // Server States
  const [streamingServerStatus, setStreamingServerStatus] = useState({
    running: false,
    port: 8080,
    ip: "localhost",
  });

  // System States
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

  // ── Core Orchestration Actions (Loading/Lifecycle) ──
  const loadAll = useCallback(async () => {
    try {
      const [foldersData] = await Promise.all([rpcCall("getFolders")]);
      setFolders(foldersData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllRef = useRef(loadAll);
  useEffect(() => {
    loadAllRef.current = loadAll;
  }, [loadAll]);

  // ── Unidirectional Message Subscriptions & Polling ──
  useEffect(() => {
    const unsubscribe = electrobun.rpc?.addMessageListener(
      "scanProgress",
      (progress: ScanProgressResponse) => {
        setScanProgress(progress);
        if (progress.phase === "complete" || progress.phase === "error") {
          setIsScanning(false);
          loadAllRef.current();
        }
      },
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const stats = await rpcCall("getSystemStats");
        setSystemStats(stats);
      } catch {
        // Suppress polling connection noise
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Domain Actions (Sorted Alphabetically by Context) ──

  // Activity Logs
  const clearLogs = useCallback(async () => {
    await rpcCall("clearActivityLogs");
    setActivityLogs([]);
  }, []);

  // Folder Management
  const addFolder = useCallback(async () => {
    const result = await rpcCall("addFolder");
    await loadAll();
    return result;
  }, [loadAll]);

  const getFolders = useCallback(async () => {
    const result = await rpcCall("getFolders");
    console.log("Folders:", result);
    return [];
  }, []);

  const removeFolder = useCallback(
    async (id: number) => {
      const result = await rpcCall("removeFolder", { id });
      await loadAll();
      return result;
    },
    [loadAll],
  );

  // Diagnostics / Ping
  const ping = useCallback(async () => {
    return await rpcCall("ping");
  }, []);

  // Scanning Operations
  const cancelScan = useCallback(async () => {
    await rpcCall("cancelScan");
    setIsScanning(false);
    setScanProgress(null);
  }, []);

  const startScan = useCallback(async () => {
    setIsScanning(true);
    setScanProgress({ processed: 0, total: 0, phase: "starting" });
    await rpcCall("startScan");
  }, []);

  // Server Management
  const getServerStatus = useCallback(async () => {
    return await rpcCall("getServerStatus");
  }, []);

  const startServer = useCallback(async (port?: number) => {
    const targetPort = port || 8080;
    const result = await rpcCall("startServer", { port: targetPort });
    setStreamingServerStatus({
      running: result.success,
      port: result.port || targetPort,
      ip: (result.ip as string) || "localhost",
    });
  }, []);

  const stopServer = useCallback(async () => {
    try {
      await rpcCall("stopServer");
    } catch (error) {
      console.error("Failed to stop server:", error);
    }
    setStreamingServerStatus({
      running: false,
      port: 8080,
      ip: "localhost",
    });
  }, []);

  // Video Management
  const toggleFavorite = useCallback(
    async (id: number, isFavorite: boolean) => {
      await rpcCall("updateVideo", { id, isFavorite: !isFavorite });
      await loadAll();
    },
    [loadAll],
  );

  // ── Return Payload ──
  return {
    activityLogs,
    addFolder,
    cancelScan,
    clearLogs,
    folders,
    getFolders,
    getServerStatus,
    isScanning,
    loading,
    ping,
    refreshAll: loadAll,
    removeFolder,
    scanProgress,
    setVideos,
    startScan,
    startServer,
    stopServer,
    streamingServerStatus,
    systemStats,
    toggleFavorite,
    videos,
    videoStats,
  };
}
