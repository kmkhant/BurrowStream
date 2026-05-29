import { Film, Tv } from "lucide-react";
import { useEffect, useState } from "react";

import { API_BASE } from "./constants";

import { Video } from "./types";

import VideoPlayer from "./components/VideoPlayer";

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 MB";
  return (bytes / 1024 / 1024).toFixed(0) + " MB";
};

export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState("");
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  const fetchVideos = async (type = "") => {
    const params = type ? `?type=${type}` : "";
    const res = await fetch(`${API_BASE}/api/videos${params}`);
    const data = await res.json();
    setVideos(data);
  };

  useEffect(() => {
    fetchVideos(filter);
  }, [filter]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg)]/80">
        <div className="flex items-center justify-center h-14 px-4">
          <h1
            className="font-bold tracking-[0.2em] uppercase select-none"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              color: "#E50914", // Netflix red
            }}
          >
            BurrowStream
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Video Player */}
        <VideoPlayer currentVideo={currentVideo} />

        {/* Filters */}
        <div className="flex gap-2">
          {[
            { label: "All", value: "" },
            { label: "Movies", value: "movie" },
            { label: "TV Shows", value: "tv" },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-md text-[11px] transition-colors ${
                filter === value
                  ? "bg-[var(--accent-emerald)] text-black font-medium"
                  : "bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Video List */}
        <div className="grid grid-cols-2 gap-2">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => setCurrentVideo(video)}
              className={`min-w-0 px-2 group aspect-square flex flex-col rounded-lg overflow-hidden border transition-all duration-150 ${
                currentVideo?.id === video.id
                  ? "bg-[var(--accent-emerald)]/10 border-[var(--accent-emerald)]/20 shadow-md"
                  : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-medium)] hover:shadow-sm"
              }`}
            >
              {/* Thumbnail area – takes most of the space */}
              <div className="flex-1 flex items-center justify-center bg-black/10 relative">
                {video.type === "movie" ? (
                  <Film className="w-10 h-10 text-[var(--text-quaternary)]" />
                ) : (
                  <Tv className="w-10 h-10 text-[var(--text-quaternary)]" />
                )}

                {/* Active indicator – subtle corner badge */}
                {currentVideo?.id === video.id && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--accent-emerald)] shadow-[0_0_8px_var(--accent-emerald)]" />
                )}
              </div>

              {/* Title & meta */}
              <div className="p-2 border-t border-[var(--border-subtle)]">
                <p className="text-xs font-medium text-[var(--text-primary)] truncate leading-tight">
                  {video.title} {video.year && `(${video.year})`}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  {/* Quality badge */}
                  {video.quality && (
                    <span className="text-[10px] text-[var(--text-quaternary)]">
                      {video.quality}
                    </span>
                  )}
                  {/* Size */}
                  <span className="text-[10px] text-[var(--text-quaternary)]">
                    {formatSize(video.size)}
                  </span>
                </div>
                {/* Season / Episode / Year */}
                {video.season && (
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[var(--text-tertiary)] font-mono truncate">
                    {video.season && video.episode && (
                      <span>
                        S{String(video.season).padStart(2, "0")}
                        {video.episode &&
                          `E${JSON.parse(video.episode)[0].toString().padStart(2, "0")}`}
                      </span>
                    )}
                    {video.year && <span>{video.year}</span>}
                    {video.episodeTitle && (
                      <span className="truncate text-[var(--text-quaternary)]">
                        {video.episodeTitle}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {videos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xs text-[var(--text-tertiary)]">
              No videos found
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
