import { API_BASE } from "../constants";

import { Video } from "../types";

import { formatSize } from "../utils";

function VideoPlayer({ currentVideo }: { currentVideo: Video | null }) {
  if (!currentVideo) {
    return null;
  }

  return (
    <div className="w-full max-h-[60vh] bg-black rounded-xl overflow-hidden border border-[var(--border-subtle)]">
      <div className="w-full flex-1 relative bg-neutral-950 flex items-center justify-center min-h-[200px]">
        <video
          src={`${API_BASE}/stream/${currentVideo.id}`}
          controls
          autoPlay
          className="w-full h-full object-contain"
        />
      </div>

      {/* Meta Details Strip: Stays firmly locked at the bottom edge */}
      <div className="p-2 border-t border-[var(--border-subtle)] bg-neutral-900/50 shrink-0">
        <p className="text-xs font-medium text-[var(--text-primary)] truncate">
          {currentVideo.title} {currentVideo.year && `(${currentVideo.year})`}
        </p>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 truncate">
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
  );
}

export default VideoPlayer;
