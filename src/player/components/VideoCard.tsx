import React, { useMemo } from "react";
import { Film, Tv } from "lucide-react";
import { cn } from "../utils"; // Fallback to raw templates if classnames utility isn't used

import { Video } from "../types";

interface VideoCardProps {
  video: Video;
  isActive: boolean;
  onClick: (video: Video) => void;
  formatSize: (bytes: number) => string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isActive,
  onClick,
  formatSize,
}) => {
  const { title, type, year, quality, size, season, episode, episodeTitle } =
    video;

  // Compute standard parsing bounds deterministically
  const episodeMeta = useMemo(() => {
    if (!season) return null;

    let episodeString = "";
    if (episode) {
      try {
        // Safe deserialization of dynamic array-backed strings
        const parsedEpisodes =
          typeof episode === "string" ? JSON.parse(episode) : episode;
        if (Array.isArray(parsedEpisodes) && parsedEpisodes.length > 0) {
          episodeString = `E${String(parsedEpisodes[0]).padStart(2, "0")}`;
        }
      } catch (e) {
        // Fallback for fallback parsing anomalies
        episodeString = "";
      }
    }

    return `S${String(season).padStart(2, "0")}${episodeString}`;
  }, [season, episode]);

  return (
    <button
      type="button"
      onClick={() => onClick(video)}
      className={cn(
        "min-w-0 px-2 group aspect-square flex flex-col rounded-lg overflow-hidden border transition-all duration-150 text-left w-full",
        isActive
          ? "bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/20 shadow-md"
          : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-medium)] hover:shadow-sm",
      )}
    >
      {/* Thumbnail Layer / Asset Preview Wrapper */}
      <div className="flex-1 w-full flex items-center justify-center bg-black/10 relative">
        {type === "movie" ? (
          <Film
            className="text-[var(--text-quaternary)] transition-transform group-hover:scale-105"
            size={64}
          />
        ) : (
          <Tv
            className="w-10 h-10 text-[var(--text-quaternary)] transition-transform group-hover:scale-105"
            size={64}
          />
        )}

        {/* Egress Broadcast Status Indicator */}
        {isActive && (
          <span
            className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--accent-emerald)] shadow-[0_0_8px_var(--accent-emerald)]"
            title="Currently Selected Resource"
          />
        )}
      </div>

      {/* Meta Content Metadata Information Layer */}
      <div className="flex justify-center items-center flex-col space-y-3 w-full p-2 border-t border-[var(--border-subtle)]">
        <p className="text-xs font-semibold text-[var(--text-primary)] truncate leading-tight">
          {title}{" "}
          {year && (
            <span className="text-[var(--text-secondary)]">({year})</span>
          )}
        </p>

        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[var(--text-quaternary)] font-medium">
          {quality && (
            <span className="uppercase tracking-wider px-1 bg-black/5 dark:bg-white/5 rounded-sm">
              {quality}
            </span>
          )}
          <span>{formatSize(size)}</span>
        </div>

        {/* TV Context Subheadings */}
        {season && (
          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[var(--text-tertiary)] font-mono truncate">
            <span>{episodeMeta}</span>
            {year && !episodeTitle && <span>{year}</span>}
            {episodeTitle && (
              <span className="truncate text-[var(--text-quaternary)] before:content-['•'] before:mx-0.5">
                {episodeTitle}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
};
