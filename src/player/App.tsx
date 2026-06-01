import { useEffect, useState } from "react";

import { API_BASE } from "./constants";

import { Video } from "./types";

import VideoPlayer from "./components/VideoPlayer";
import { VideoCard } from "./components/VideoCard";

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
            <VideoCard
              key={video.id}
              video={video}
              formatSize={formatSize}
              isActive={currentVideo?.id === video.id}
              onClick={setCurrentVideo}
            />
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
