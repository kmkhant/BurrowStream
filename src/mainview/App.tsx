// src/views/admin/components/AdminPanel.tsx
import { useState } from "react";
import {
  CirclePlay,
  CircleStop,
  FolderOpen,
  Film,
  Scan,
  Trash2,
  HardDrive,
  Clock,
  Plus,
  Moon,
  Sun,
} from "lucide-react";

import { useTheme } from "./hooks/useTheme";
import { useRPC } from "./hooks/useRpc";
import { cn } from "./lib/utils";

export default function App() {
  // Theme State
  const { theme, resolved, toggleTheme } = useTheme();

  const isDark = resolved === "dark";

  // RPC State
  const {
    folders,
    videoStats,
    isScanning,
    scanProgress,
    serverStatus,
    activityLogs,
    systemStats,
    addFolder,
    removeFolder,
    startScan,
    cancelScan,
    startServer,
    stopServer,
  } = useRPC();

  // Stats
  const totalVideos = videoStats.total;
  const totalSize = videoStats.totalSize;
  const movieCount = videoStats.movies;
  const tvCount = videoStats.tvShows;
  const uptime = serverStatus.uptime;

  // server on/off toggle
  const toggleServer = () => {
    serverStatus.running ? stopServer() : startServer();
  };

  // Library select state
  const [selectedType, setSelectedType] = useState<"all" | "movie" | "tv">(
    "all",
  );

  const [showActivity, setShowActivity] = useState(false);

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Format time ago
  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Folder Select Handlers
  const handleAddFolder = async () => {
    const result = await addFolder();

    console.log(result);

    // if (path) {
    //   const result = await addFolder(path);
    //   if (!result.success) {
    //     console.error(result.error);
    //   }
    // }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-zinc-100 font-sans antialiased">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Film className="size-4 text-[var(--text-secondary)]" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                BurrowStream
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.04] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
              v0.0.1
            </span>
          </div>

          {/* Server Status */}
          <div className="flex items-center gap-2 text-xs">
            <div
              className={cn(
                isDark ? "text-zinc-400" : "text-zinc-600",
                "text-xs",
              )}
            >
              CPU: {systemStats.cpu.toFixed(2)}%
            </div>
            <div
              className={cn(
                isDark ? "text-zinc-400" : "text-zinc-600",
                "text-xs",
              )}
            >
              Memory: {systemStats.memory}MB
            </div>
            <div
              className={cn(
                isDark ? "text-zinc-400" : "text-zinc-600",
                "text-xs",
              )}
            >
              Uptime: {Math.floor(systemStats.uptime / 3600)}h{" "}
              {Math.floor((systemStats.uptime % 3600) / 60)}m
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="text-[11px] px-2 py-1.5 rounded-md bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-colors"
              title={`Theme: ${theme}`}
            >
              {resolved === "dark" ? (
                <Moon className="size-3.5 text-[var(--text-secondary)]" />
              ) : (
                <Sun className="size-3.5 text-[var(--text-secondary)]" />
              )}
            </button>

            <button className="text-[11px] px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-colors text-[var(--text-tertiary)]">
              Docs
            </button>
            <button className="text-[11px] px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-colors text-[var(--text-tertiary)]">
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 space-y-4">
        {/* Stats Grid - Example of updated card */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 hover:bg-[var(--bg-hover)] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-[var(--bg)]">
                <Film className="size-3.5 text-[var(--text-secondary)]" />
              </div>
              <div>
                <div className="text-xs font-medium text-[var(--text-primary)]">
                  {totalVideos}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">
                  Total Videos
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-white/[0.03]">
                <HardDrive className="size-3.5 text-zinc-400" />
              </div>
              <div>
                <div className="text-xs font-medium text-[var(--text-primary)]">
                  {formatBytes(totalSize)}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">
                  Library Size
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-white/[0.03]">
                <FolderOpen className="size-3.5 text-zinc-400" />
              </div>
              <div>
                <div className="text-xs font-medium text-[var(--text-primary)]">
                  {folders.length}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">
                  Folders
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-white/[0.03]">
                <Clock className="size-3.5 text-zinc-400" />
              </div>
              <div>
                <div className="text-xs font-medium text-[var(--text-primary)]">
                  {Math.floor(uptime / 3600)}h{" "}
                  {Math.floor((uptime % 3600) / 60)}m
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">
                  Uptime
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {/* Server Control */}
          <div className="col-span-2 bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-medium text-[var(--text-primary)]">
                  Streaming Server
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {serverStatus.running
                    ? `Streaming at ${serverStatus.url}`
                    : "Host your videos on the local network"}
                </p>
              </div>
              <button
                onClick={toggleServer}
                className={`flex items-center gap-2 text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors ${
                  serverStatus.running
                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10"
                    : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/10"
                }`}
              >
                {serverStatus.running ? (
                  <CircleStop className="size-4" />
                ) : (
                  <CirclePlay className="size-4" />
                )}
                {serverStatus.running ? "Stop Server" : "Start Server"}
              </button>
            </div>
          </div>

          {/* Scan Control */}
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-medium text-[var(--text-primary)]">
                  {isScanning ? "Scanning..." : "Library Scan"}
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {isScanning
                    ? `${scanProgress?.processed || 0} / ${scanProgress?.total || 0} files`
                    : `${folders.length} folder${folders.length !== 1 ? "s" : ""} watched`}
                </p>
              </div>
              <button
                onClick={isScanning ? cancelScan : startScan}
                // disabled={folders.length === 0 && !isScanning}
                className={`flex items-center gap-2 text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors ${
                  isScanning
                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10"
                    : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/10"
                }`}
              >
                <Scan className="size-4" />
                {isScanning ? "Cancel" : "Scan Now"}
              </button>
            </div>
          </div>
        </div>

        {/* Scan Progress Bar */}
        {scanProgress &&
          (scanProgress.phase === "discovering" ||
            scanProgress.phase === "processing") && (
            <div className="bg-blue-500/[0.02] border border-blue-500/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-zinc-400">
                  {scanProgress.phase === "discovering"
                    ? "Discovering files..."
                    : "Processing videos..."}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {scanProgress.processed} / {scanProgress.total}
                </span>
              </div>
              <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500/50 rounded-full transition-all duration-300"
                  style={{
                    width: `${scanProgress.total > 0 ? (scanProgress.processed / scanProgress.total) * 100 : 0}%`,
                  }}
                />
              </div>
              {scanProgress.currentFile && (
                <p className="text-[10px] text-zinc-500 mt-2 truncate">
                  {scanProgress.currentFile.split("/").pop()}
                </p>
              )}
            </div>
          )}

        {/* Media Type Filter */}
        <div className="flex items-center gap-2">
          {["all", "movie", "tv"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type as "all" | "movie" | "tv")}
              className={`text-[11px] px-3 py-1.5 rounded-md transition-colors ${
                selectedType === type
                  ? "bg-white/[0.06] text-[var(--text-primary)] border border-white/[0.08]"
                  : "bg-white/[0.02] text-[var(--text-tertiary)] border border-white/[0.04] hover:bg-white/[0.04]"
              }`}
            >
              {type === "all"
                ? "All"
                : type === "movie"
                  ? "Movies"
                  : "TV Shows"}
              {type !== "all" && (
                <span className="ml-1 text-zinc-600">
                  {type === "movie" ? movieCount : tvCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Watched Folders */}
        {
          <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
              <div>
                <div className="flex items-center gap-2">
                  <FolderOpen className="size-3.5 text-zinc-500 shrink-0" />
                  <h3
                    className={cn(
                      isDark ? "text-zinc-400" : "text-zinc-600",
                      "text-xs font-medium",
                    )}
                  >
                    Watched Folders
                  </h3>
                </div>
                <p
                  className={cn(
                    isDark ? "text-zinc-400" : "text-zinc-600",
                    "text-[10px] mt-0.5",
                  )}
                >
                  {folders.length} folder{folders.length !== 1 ? "s" : ""} being
                  monitored
                </p>
              </div>
              <button
                onClick={handleAddFolder}
                className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-colors"
              >
                <Plus className="size-3" />
                Add Folder
              </button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FolderOpen className="size-3.5 text-zinc-500 shrink-0" />
                    <div className="min-w-0">
                      <p
                        className={cn(
                          isDark ? "text-zinc-400" : "text-zinc-600",
                          "text-xs truncate",
                        )}
                      >
                        {folder.name || folder.path.split("/").pop()}
                      </p>
                      <p
                        className={`text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-600"} truncate`}
                      >
                        {folder.path}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-500">
                      {folder.totalVideos} videos
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {formatBytes(folder.totalSize)}
                    </span>
                    <button
                      onClick={() => removeFolder(folder.id)}
                      className="p-1 rounded hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        }

        {/* Activity Log */}
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between p-4 border-b border-white/[0.04] cursor-pointer"
            onClick={() => setShowActivity(!showActivity)}
          >
            <div>
              <h3 className="text-xs font-medium text-[var(--text-primary)]">
                Activity
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                Recent server events
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-600">
                {showActivity ? "Hide" : "Show"}
              </span>
              <button className="text-[10px] text-zinc-500 hover:text-zinc-400 transition-colors">
                Clear all
              </button>
            </div>
          </div>
          {showActivity && (
            <div className="divide-y divide-white/[0.04] max-h-48 overflow-y-auto">
              {activityLogs.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-[11px] text-zinc-500">No activity yet</p>
                </div>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="p-1 rounded bg-white/[0.03] mt-0.5">
                        <div
                          className={`size-1.5 rounded-full ${
                            log.level === "error"
                              ? "bg-red-500"
                              : log.level === "warn"
                                ? "bg-amber-500"
                                : "bg-zinc-700"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="text-[11px] text-zinc-500">
                          {log.message}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">
                          {timeAgo(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
