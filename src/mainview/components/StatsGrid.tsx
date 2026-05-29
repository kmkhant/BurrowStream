import { Film, HardDrive, FolderOpen } from "lucide-react";

import { formatBytes } from "../lib/utils";

import { FolderResponse } from "../../shared/rpc/definitions";

interface StatsGridProps {
  totalVideos: number;
  totalSize: number;
  folders: FolderResponse[];
}

const StatsGrid = ({ totalVideos, totalSize, folders }: StatsGridProps) => {
  return null;

  // TODO: Implement StatsGrid

  return (
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
    </div>
  );
};

export default StatsGrid;
