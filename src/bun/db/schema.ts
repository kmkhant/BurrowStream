// src/bun/db/schema.ts
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

// ──────────────────────────────────────────────
// Watched Folders
// ──────────────────────────────────────────────

export const watchedFolders = sqliteTable(
  "watched_folders",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    path: text("path").notNull().unique(),
    name: text("name"), // Display name (folder name by default)
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    scanInterval: integer("scan_interval"), // Minutes between auto-scans (null = manual only)
    lastScanAt: integer("last_scan_at"), // Unix timestamp (milliseconds)
    lastScanDuration: integer("last_scan_duration"), // Milliseconds
    totalVideos: integer("total_videos").default(0),
    totalSize: integer("total_size").default(0), // Bytes
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("folder_path_idx").on(table.path),
    index("folder_active_idx").on(table.isActive),
  ],
);

// ──────────────────────────────────────────────
// Media Files (Videos)
// ──────────────────────────────────────────────

export const videos = sqliteTable(
  "videos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    path: text("path").notNull().unique(),

    // Core metadata (from filename)
    type: text("type").notNull(), // "movie" | "tv" | "unknown"
    title: text("title").notNull(),

    // Movie-specific
    year: integer("year"), // Release year

    // TV-specific
    season: integer("season"), // Season number
    episode: text("episode"), // JSON array: "[1]" or "[17,18]" for multi-part
    episodeTitle: text("episode_title"), // Episode name

    // Technical metadata
    quality: text("quality"), // "720p", "1080p", "2160p", "4K"
    source: text("source"), // "BluRay", "WEB-DL", "WEBRip", etc.
    codec: text("codec"), // "x264", "x265", "HEVC", "AV1"

    // File metadata
    size: integer("size").notNull(), // Bytes
    extension: text("extension").notNull(), // "mp4", "mkv", etc.
    lastModified: integer("last_modified").notNull(), // Filesystem timestamp

    // Relations
    folderId: integer("folder_id").references(() => watchedFolders.id, {
      onDelete: "cascade",
    }),

    // Scan metadata
    scannedAt: integer("scanned_at").notNull(), // When this record was created/updated
    scanId: integer("scan_id"), // Groups videos from same scan

    // User metadata (editable)
    customTitle: text("custom_title"), // User override for title
    isFavorite: integer("is_favorite", { mode: "boolean" }).default(false),
    playCount: integer("play_count").default(0),
    lastPlayedAt: integer("last_played_at"),

    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("video_path_idx").on(table.path),
    index("video_type_idx").on(table.type),
    index("video_folder_idx").on(table.folderId),
    index("video_title_idx").on(table.title),
    index("video_year_idx").on(table.year),
    index("video_recent_idx").on(table.scannedAt),
    index("video_tv_idx").on(
      table.type,
      table.title,
      table.season,
      table.episode,
    ),
  ],
);

// ──────────────────────────────────────────────
// Scan History
// ──────────────────────────────────────────────

export const scanHistory = sqliteTable(
  "scan_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    folderId: integer("folder_id").references(() => watchedFolders.id, {
      onDelete: "cascade",
    }),
    phase: text("phase").notNull(), // "started" | "completed" | "cancelled" | "error"
    totalFiles: integer("total_files"),
    videoFiles: integer("video_files"),
    newVideos: integer("new_videos"), // Newly discovered
    updatedVideos: integer("updated_videos"), // Modified since last scan
    removedVideos: integer("removed_videos"), // Files no longer exist
    totalSize: integer("total_size"), // Bytes
    duration: integer("duration"), // Milliseconds
    error: text("error"), // Error message if failed
    startedAt: integer("started_at").notNull(),
    completedAt: integer("completed_at"),
  },
  (table) => [
    index("scan_folder_idx").on(table.folderId),
    index("scan_started_idx").on(table.startedAt),
  ],
);

// ──────────────────────────────────────────────
// Playlists
// ──────────────────────────────────────────────

export const playlists = sqliteTable("playlists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  isSystem: integer("is_system", { mode: "boolean" }).default(false), // "Recently Added", "Favorites"
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const playlistVideos = sqliteTable(
  "playlist_videos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playlistId: integer("playlist_id").references(() => playlists.id, {
      onDelete: "cascade",
    }),
    videoId: integer("video_id").references(() => videos.id, {
      onDelete: "cascade",
    }),
    position: integer("position").notNull(),
    addedAt: integer("added_at").notNull(),
  },
  (table) => [
    uniqueIndex("playlist_video_unique").on(table.playlistId, table.videoId),
    index("playlist_position_idx").on(table.playlistId, table.position),
  ],
);

// ──────────────────────────────────────────────
// Streaming Server Configuration
// ──────────────────────────────────────────────

export const serverConfig = sqliteTable("server_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// ──────────────────────────────────────────────
// Activity Log
// ──────────────────────────────────────────────

export const activityLog = sqliteTable(
  "activity_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    level: text("level").notNull(), // "info" | "warn" | "error"
    category: text("category").notNull(), // "scan" | "server" | "system" | "user"
    message: text("message").notNull(),
    metadata: text("metadata"), // JSON for additional data
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index("log_level_idx").on(table.level),
    index("log_category_idx").on(table.category),
    index("log_created_idx").on(table.createdAt),
  ],
);

// ──────────────────────────────────────────────
// Subtitle Files
// ──────────────────────────────────────────────

export const subtitles = sqliteTable(
  "subtitles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    videoId: integer("video_id").references(() => videos.id, {
      onDelete: "cascade",
    }),
    path: text("path").notNull(),
    language: text("language"), // "en", "es", "fr", etc.
    format: text("format"), // "srt", "vtt", "ass"
    isExternal: integer("is_external", { mode: "boolean" }).default(true),
  },
  (table) => [
    uniqueIndex("subtitle_video_lang_idx").on(table.videoId, table.language),
  ],
);

// ──────────────────────────────────────────────
// Connected Devices
// ──────────────────────────────────────────────

export const connectedDevices = sqliteTable(
  "connected_devices",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ip: text("ip").notNull(),
    userAgent: text("user_agent"),
    deviceName: text("device_name"),
    lastSeenAt: integer("last_seen_at").notNull(),
    totalStreamed: integer("total_streamed").default(0), // Bytes
  },
  (table) => [index("device_ip_idx").on(table.ip)],
);
