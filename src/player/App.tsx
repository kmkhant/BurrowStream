import { useEffect, useState } from "react";

interface Video {
  id: number;
  title: string;
  type: string;
  quality?: string;
  season?: number;
  episode?: string;
  size: number;
  extension: string;
}

const API_BASE = import.meta.env.DEV ? "http://localhost:8080" : "";

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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    return (bytes / 1024 / 1024).toFixed(0) + " MB";
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg)]/80 backdrop-blur-xl">
        <div className="flex items-center h-12 px-4">
          <h1 className="text-sm font-medium text-[var(--text-secondary)]">
            📺 BurrowStreamX
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Video Player */}
        {currentVideo && (
          <div className="bg-black rounded-xl overflow-hidden border border-[var(--border-subtle)]">
            <video
              src={`${API_BASE}/stream/${currentVideo.id}`}
              controls
              autoPlay
              className="w-full max-h-[50vh]"
            />
            <div className="p-3 border-t border-[var(--border-subtle)]">
              <p className="text-xs font-medium text-[var(--text-primary)]">
                {currentVideo.title}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                {currentVideo.quality}
                {currentVideo.season &&
                  ` · S${String(currentVideo.season).padStart(2, "0")}`}
                {currentVideo.episode &&
                  `E${JSON.parse(currentVideo.episode)[0].toString().padStart(2, "0")}`}
                {" · "}
                {formatSize(currentVideo.size)}
              </p>
            </div>
          </div>
        )}

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
        <div className="space-y-1">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => setCurrentVideo(video)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                currentVideo?.id === video.id
                  ? "bg-[var(--accent-emerald)]/10 border border-[var(--accent-emerald)]/20"
                  : "bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--text-primary)] truncate">
                  {video.title}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                  {video.type === "movie" ? "🎬" : "📺"} {video.quality}
                  {video.season &&
                    ` · S${String(video.season).padStart(2, "0")}`}
                  {video.episode &&
                    `E${JSON.parse(video.episode)[0].toString().padStart(2, "0")}`}
                </p>
              </div>
              <span className="text-[10px] text-[var(--text-quaternary)] ml-3 shrink-0">
                {formatSize(video.size)}
              </span>
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
