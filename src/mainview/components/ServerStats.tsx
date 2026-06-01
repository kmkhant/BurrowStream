import React from "react";
import { cn } from "../utils";
import {
  CpuIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MemoryStickIcon,
  RouterIcon,
} from "lucide-react";

interface NetworkStats {
  interface: string;
  uploadMbps: number;
  downloadMbps: number;
}

interface SystemStats {
  cpu: number;
  memory: number;
  uptime: number;
  network: NetworkStats;
}

interface ServerStatusProps {
  systemStats: SystemStats;
  isDark: boolean;
}

export const ServerStatus: React.FC<ServerStatusProps> = ({
  systemStats,
  isDark,
}) => {
  const textColor = isDark ? "text-zinc-400" : "text-zinc-600";

  // Format uptime into a concise string format (e.g., "2h 14m")
  const hours = Math.floor(systemStats.uptime / 3600);
  const minutes = Math.floor((systemStats.uptime % 3600) / 60);
  const uptimeString = `${hours}h ${minutes}m`;

  return (
    <div
      className={cn(
        "flex items-center gap-4 text-xs font-medium tracking-tight",
        textColor,
      )}
    >
      {/* CPU Utilization Metric */}
      <span className="flex items-center gap-1">
        <CpuIcon size={12} className="opacity-80" />
        <span>{systemStats.cpu.toFixed(1)}%</span>
      </span>

      <span
        className="h-3 w-px bg-zinc-300 dark:bg-zinc-700"
        aria-hidden="true"
      />

      {/* Network Interface Throughput I/O */}
      <span className="flex items-center gap-2">
        <span className="text-zinc-500 font-mono text-[10px] uppercase">
          {systemStats.network.interface}
        </span>
        <span className="flex items-center gap-0.5">
          <ArrowUpIcon size={12} className="text-emerald-500" />
          <span>{systemStats.network.uploadMbps.toFixed(2)} Mbps</span>
        </span>
        <span className="flex items-center gap-0.5">
          <ArrowDownIcon size={12} className="text-blue-500" />
          <span>{systemStats.network.downloadMbps.toFixed(2)} Mbps</span>
        </span>
      </span>

      <span
        className="h-3 w-px bg-zinc-300 dark:bg-zinc-700"
        aria-hidden="true"
      />

      {/* RSS Memory Footprint Allocation */}
      <span className="flex items-center gap-1">
        <MemoryStickIcon size={12} className="opacity-80" />
        <span>{systemStats.memory} MB</span>
      </span>

      <span
        className="h-3 w-px bg-zinc-300 dark:bg-zinc-700"
        aria-hidden="true"
      />

      {/* Process Runtime Uptime Clock */}
      <span className="flex items-center gap-1">
        <RouterIcon size={12} className="opacity-80" />
        <span>{uptimeString}</span>
      </span>
    </div>
  );
};
