CREATE TABLE `activity_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`level` text NOT NULL,
	`category` text NOT NULL,
	`message` text NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `log_level_idx` ON `activity_log` (`level`);--> statement-breakpoint
CREATE INDEX `log_category_idx` ON `activity_log` (`category`);--> statement-breakpoint
CREATE INDEX `log_created_idx` ON `activity_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `connected_devices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ip` text NOT NULL,
	`user_agent` text,
	`device_name` text,
	`last_seen_at` integer NOT NULL,
	`total_streamed` integer DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX `device_ip_idx` ON `connected_devices` (`ip`);--> statement-breakpoint
CREATE TABLE `playlist_videos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlist_id` integer,
	`video_id` integer,
	`position` integer NOT NULL,
	`added_at` integer NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `playlist_video_unique` ON `playlist_videos` (`playlist_id`,`video_id`);--> statement-breakpoint
CREATE INDEX `playlist_position_idx` ON `playlist_videos` (`playlist_id`,`position`);--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_system` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scan_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`folder_id` integer,
	`phase` text NOT NULL,
	`total_files` integer,
	`video_files` integer,
	`new_videos` integer,
	`updated_videos` integer,
	`removed_videos` integer,
	`total_size` integer,
	`duration` integer,
	`error` text,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`folder_id`) REFERENCES `watched_folders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `scan_folder_idx` ON `scan_history` (`folder_id`);--> statement-breakpoint
CREATE INDEX `scan_started_idx` ON `scan_history` (`started_at`);--> statement-breakpoint
CREATE TABLE `server_config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subtitles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`video_id` integer,
	`path` text NOT NULL,
	`language` text,
	`format` text,
	`is_external` integer DEFAULT true,
	FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subtitle_video_lang_idx` ON `subtitles` (`video_id`,`language`);--> statement-breakpoint
CREATE TABLE `videos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`year` integer,
	`season` integer,
	`episode` text,
	`episode_title` text,
	`quality` text,
	`source` text,
	`codec` text,
	`size` integer NOT NULL,
	`extension` text NOT NULL,
	`last_modified` integer NOT NULL,
	`folder_id` integer,
	`scanned_at` integer NOT NULL,
	`scan_id` integer,
	`custom_title` text,
	`is_favorite` integer DEFAULT false,
	`play_count` integer DEFAULT 0,
	`last_played_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`folder_id`) REFERENCES `watched_folders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `videos_path_unique` ON `videos` (`path`);--> statement-breakpoint
CREATE UNIQUE INDEX `video_path_idx` ON `videos` (`path`);--> statement-breakpoint
CREATE INDEX `video_type_idx` ON `videos` (`type`);--> statement-breakpoint
CREATE INDEX `video_folder_idx` ON `videos` (`folder_id`);--> statement-breakpoint
CREATE INDEX `video_title_idx` ON `videos` (`title`);--> statement-breakpoint
CREATE INDEX `video_year_idx` ON `videos` (`year`);--> statement-breakpoint
CREATE INDEX `video_recent_idx` ON `videos` (`scanned_at`);--> statement-breakpoint
CREATE INDEX `video_tv_idx` ON `videos` (`type`,`title`,`season`,`episode`);--> statement-breakpoint
CREATE TABLE `watched_folders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`name` text,
	`is_active` integer DEFAULT true,
	`scan_interval` integer,
	`last_scan_at` integer,
	`last_scan_duration` integer,
	`total_videos` integer DEFAULT 0,
	`total_size` integer DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `watched_folders_path_unique` ON `watched_folders` (`path`);--> statement-breakpoint
CREATE UNIQUE INDEX `folder_path_idx` ON `watched_folders` (`path`);--> statement-breakpoint
CREATE INDEX `folder_active_idx` ON `watched_folders` (`is_active`);