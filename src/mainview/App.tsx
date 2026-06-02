// src/views/admin/components/AdminPanel.tsx
import { useEffect, useState } from "react";
import {
  CirclePlay,
  CircleStop,
  FolderOpen,
  Film,
  Scan,
  Trash2,
  Plus,
  Moon,
  Sun,
} from "lucide-react";

import { toast } from "sonner";
import QRCode from "react-qr-code";

import { useTheme } from "./hooks/useTheme";
import { useRPC } from "./hooks/useRpc";

import { cn, formatBytes } from "./utils";

import StatsGrid from "./components/StatsGrid";
import { ServerStatus } from "./components/ServerStats";
import { CheckUpdateButton } from "./components/CheckUpdateButton";

export default function App() {
  // Theme State
  const { theme, resolved, toggleTheme } = useTheme();

  const isDark = resolved === "dark";

  // RPC State
  const {
    folders,
    // pingWebview,
    videoStats,
    isScanning,
    scanProgress,
    systemStats,
    addFolder,
    removeFolder,
    startScan,
    cancelScan,
    updateStatus,
    checkForUpdates,
    applyUpdate,
    startServer,
    stopServer,
    streamingServerStatus,
    refreshAll,
  } = useRPC();

  // refresh the app
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // const handlePingWebview = async () => {
  //   const result = await pingWebview();
  //   console.log("Pinged webview", result);
  // };

  // Stats
  const totalVideos = videoStats.total;
  const totalSize = videoStats.totalSize;

  // server on/off toggle
  const streamingServerUrl = `http://${streamingServerStatus.ip}:${streamingServerStatus.port}`;

  const handleToggleServer = async () => {
    if (streamingServerStatus.running) {
      await stopServer();
    } else {
      await startServer();
    }
  };

  const handleCopyStreamlink = () => {
    navigator.clipboard.writeText(streamingServerUrl);

    toast.success("Copied to clipboard");
  };

  const [isAdding, setIsAdding] = useState(false);

  // Folder Select Handlers
  const handleAddFolder = async () => {
    setIsAdding(true);
    try {
      const result = await addFolder();
      console.log(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-zinc-100 font-sans antialiased">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Film className="size-4 text-[var(--text-secondary)]" />
              <span className="text-xs font-medium text-[var(--text-primary)]">
                BurrowStream
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.04] text-[var(--text-primary)] border border-[var(--border-subtle)]">
              v0.0.1
            </span>
          </div>
          {/* <button
            onClick={handlePingWebview}
            className="text-[11px] px-2 py-1.5 rounded-md bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-colors"
          >
            Ping Webview
          </button> */}

          {/* Server Status */}
          <div className="flex shrink-0 items-center justify-center">
            <ServerStatus systemStats={systemStats} isDark={isDark} />
          </div>

          <div className="flex items-center gap-2">
            {/* ── UPDATE STATUS INDICATOR ── */}
            <CheckUpdateButton
              status={updateStatus}
              onCheck={checkForUpdates}
              onApply={applyUpdate}
              isDark={isDark}
            />

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

            {/* <button className="text-[11px] px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-colors text-[var(--text-tertiary)]">
              Docs
            </button>
            <button className="text-[11px] px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)] transition-colors text-[var(--text-tertiary)]">
              Settings
            </button> */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-6 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <StatsGrid
            totalVideos={totalVideos}
            totalSize={totalSize}
            folders={folders}
          />

          {/* Server Control */}
          <div className="col-span-2 bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-medium text-[var(--text-primary)]">
                  Streaming Server
                </h3>
                <div>
                  <p
                    className="text-[11px] text-[var(--text-secondary)] mt-0.5 cursor-pointer"
                    onClick={handleCopyStreamlink}
                  >
                    {streamingServerStatus.running
                      ? `Streaming at ${streamingServerUrl}`
                      : "Host your videos on the local network"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleServer}
                className={`flex items-center gap-2 text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors ${
                  streamingServerStatus.running
                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10"
                    : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/10"
                }`}
              >
                {streamingServerStatus.running ? (
                  <CircleStop className="size-4" />
                ) : (
                  <CirclePlay className="size-4" />
                )}
                {streamingServerStatus.running ? "Stop Server" : "Start Server"}
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
        {/* <div className="flex items-center gap-2">
          {["all", "movie", "tv"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type as "all" | "movie" | "tv")}
              className={`text-[11px] px-3 py-1.5 rounded-md transition-colors ${
                selectedType === type
                  ? "bg-white/[0.06] text-[var(--text-primary)] border border-white/[0.08]"
                  : "bg-white/[0.02] text-[var(--text-secondary)] border border-white/[0.04] hover:bg-white/[0.04]"
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
        </div> */}

        {/* Watched Folders */}

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/[0.04]">
            <div>
              <div className="flex items-center gap-2">
                <FolderOpen className="size-3.5 text-zinc-500 shrink-0" />
                <h3
                  className={cn(
                    isDark ? "text-zinc-200" : "text-zinc-600",
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
              disabled={isAdding}
              className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-colors ${isDark ? "text-zinc-200" : "text-zinc-600"}`}
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
                      {folder.name || folder.path.split("/").pop() || "Unknown"}
                    </p>
                    <p
                      className={`text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-600"} truncate`}
                    >
                      {folder.path || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {folder.totalVideos || 0} videos
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)]">
                    {formatBytes(folder.totalSize || 0)}
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

        {/** QR Scan */}
        {streamingServerStatus.running && (
          <div className="flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/[0.04] rounded-lg max-w-sm mx-auto animate-fade-in shadow-xl mt-4">
            {/* Clean, High-Contrast Shield Matrix Canvas */}
            <div className="p-4 bg-white rounded-xl shadow-2xl border border-zinc-200/10">
              <QRCode
                size={200} // Refined sizing footprint for clear desktop-to-mobile focus mapping
                value={streamingServerUrl}
                viewBox="0 0 256 256"
                fgColor="#09090b" // Dark zinc contrast matrix ink
                bgColor="#ffffff" // Safe absolute canvas background mapping
                level="H" // High error correction headroom capacity
              />
            </div>

            {/* Metadata Sub-Label Block */}
            <div className="text-center mt-4 space-y-1">
              <h4 className="text-xs font-semibold tracking-wider text-[var(--text-primary)] lowercase">
                {streamingServerUrl}
              </h4>
              <p className="text-[10px] text-[var(--text-secondary)] max-w-[240px]">
                Scan with a phone or tablet on the same Wi-Fi network to
                instantly stream your video library.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
