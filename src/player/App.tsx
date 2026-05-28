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

export default function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState("");
  const [currentSrc, setCurrentSrc] = useState("");

  const fetchVideos = async (type = "") => {
    const params = type ? `?type=${type}` : "";
    const res = await fetch(`/api/videos${params}`);
    const data = await res.json();
    setVideos(data);
  };

  useEffect(() => {
    fetchVideos(filter);
  }, [filter]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4">
      <h1 className="text-xl mb-4">📺 BurrowStream</h1>
      <video
        src={currentSrc}
        controls
        className="w-full max-h-[70vh] bg-black rounded-lg mb-4"
      />

      <div className="flex gap-2 mb-4">
        {["", "movie", "tv"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 rounded text-sm ${
              filter === type
                ? "bg-white/20 text-white"
                : "bg-white/5 text-zinc-400"
            }`}
          >
            {type || "All"}
          </button>
        ))}
      </div>

      <div className="grid gap-2">
        {videos.map((v) => (
          <div
            key={v.id}
            onClick={() => setCurrentSrc(`/stream/${v.id}`)}
            className="flex justify-between items-center p-2 bg-white/5 rounded cursor-pointer hover:bg-white/10"
          >
            <span>{v.title}</span>
            <span className="text-sm text-zinc-400">
              {v.quality}
              {v.season && ` S${String(v.season).padStart(2, "0")}`}
              {v.episode &&
                `E${JSON.parse(v.episode)[0].toString().padStart(2, "0")}`}
              {" · "}
              {(v.size / 1024 / 1024).toFixed(0)} MB
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
