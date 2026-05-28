import { db } from "../db/client";
import { videos } from "../db/schema";
import { eq, sql } from "drizzle-orm";

export function createServer(port: number = 8080) {
  const server = Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      // CORS for local network access
      const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };
      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
      }

      // API: list videos
      if (url.pathname === "/api/videos") {
        const type = url.searchParams.get("type"); // optional filter
        let query = db.select().from(videos).$dynamic();
        if (type) {
          query = query.where(eq(videos.type, type));
        }
        const data = query.orderBy(videos.title).all();
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json", ...headers },
        });
      }

      // API: stream a video by ID
      if (url.pathname.startsWith("/stream/")) {
        const id = parseInt(url.pathname.split("/").pop()!);
        const video = db.select().from(videos).where(eq(videos.id, id)).get();

        if (!video) {
          return new Response("Video not found", { status: 404, headers });
        }

        // Update play count
        db.update(videos)
          .set({
            playCount: sql`play_count + 1`,
            lastPlayedAt: Date.now(),
          })
          .where(eq(videos.id, id))
          .run();

        const file = Bun.file(video.path);
        if (!(await file.exists())) {
          return new Response("File not found on disk", {
            status: 404,
            headers,
          });
        }

        return new Response(file, {
          headers: {
            "Content-Type": `video/${video.extension}`,
            "Accept-Ranges": "bytes",
            "Content-Disposition": `inline; filename="${video.title}.${video.extension}"`,
            ...headers,
          },
        });
      }

      // Serve the web player
      if (url.pathname === "/" || url.pathname === "/index.html") {
        return new Response(getPlayerHTML(), {
          headers: { "Content-Type": "text/html", ...headers },
        });
      }

      return new Response("Not found", { status: 404, headers });
    },
  });

  return server;
}

function getPlayerHTML(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>BurrowStream</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; color: #e4e4e7; font-family: system-ui; }
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    video { width: 100%; max-height: 70vh; background: #000; border-radius: 8px; margin-bottom: 20px; }
    h1 { font-size: 1.4rem; margin-bottom: 1rem; color: #a1a1aa; }
    .grid { display: grid; gap: 6px; }
    .item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px; background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.04); border-radius: 8px;
      cursor: pointer; transition: background 0.15s;
    }
    .item:hover { background: rgba(255,255,255,0.06); }
    .item-title { font-size: 0.875rem; }
    .item-meta { font-size: 0.75rem; color: #71717a; }
    .filter { display: flex; gap: 10px; margin-bottom: 15px; }
    .filter button {
      padding: 6px 12px; background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06); border-radius: 6px;
      color: #a1a1aa; font-size: 0.75rem; cursor: pointer;
    }
    .filter button.active { background: rgba(255,255,255,0.1); color: white; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📺 BurrowStream</h1>
    <video id="player" controls></video>
    <div class="filter">
      <button onclick="loadVideos('', this)" class="active">All</button>
      <button onclick="loadVideos('movie', this)">Movies</button>
      <button onclick="loadVideos('tv', this)">TV Shows</button>
    </div>
    <div class="grid" id="list"></div>
  </div>
  <script>
    async function loadVideos(type, button) {
      // Update active button only if called from a click
      if (button) {
        document.querySelectorAll('.filter button').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
      }

      const params = type ? '?type=' + type : '';
      const res = await fetch('/api/videos' + params);
      const videos = await res.json();
      const list = document.getElementById('list');
      list.innerHTML = '';
      videos.forEach(v => {
        const item = document.createElement('div');
        item.className = 'item';
        item.innerHTML =
          '<span class="item-title">' + v.title + '</span>' +
          '<span class="item-meta">' +
          (v.quality || '') +
          (v.season ? ' S' + String(v.season).padStart(2, '0') : '') +
          (v.episode ? 'E' + JSON.parse(v.episode)[0].toString().padStart(2, '0') : '') +
          ' · ' + (v.size / 1024 / 1024).toFixed(0) + ' MB' +
          '</span>';
        item.onclick = () => {
          const player = document.getElementById('player');
          player.src = '/stream/' + v.id;
          player.play();
        };
        list.appendChild(item);
      });
    }

    // Initial load – no button clicked yet, so don't pass one
    loadVideos('');
  </script>
</body>
</html>`;
}
