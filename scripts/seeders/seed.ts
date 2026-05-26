// scripts/seed.ts
import { db } from "../../src/bun/db/client";
import { watchedFolders, videos, activityLog } from "../../src/bun/db/schema";

async function seed() {
  const now = Date.now();

  // Add a test folder
  const folder = db
    .insert(watchedFolders)
    .values({
      path: "/Users/khaingmyel/Movies/Test",
      name: "Test Movies",
      isActive: true,
      totalVideos: 3,
      totalSize: 6442450944,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  // Add test videos
  const testVideos = [
    {
      path: "/Users/khaingmyel/Movies/Test/Los.Tigres.2025.720p.BluRay.mp4",
      type: "movie",
      title: "Los Tigres",
      year: 2025,
      quality: "720p",
      source: "BluRay",
      size: 2147483648,
      extension: "mp4",
      lastModified: now,
      folderId: folder.id,
      scannedAt: now,
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
      playCount: 0,
    },
    {
      path: "/Users/khaingmyel/Movies/Test/Breaking.Bad.S01E01.Pilot.1080p.BluRay.x264.mp4",
      type: "tv",
      title: "Breaking Bad",
      season: 1,
      episode: JSON.stringify([1]),
      episodeTitle: "Pilot",
      quality: "1080p",
      source: "BluRay",
      codec: "x264",
      size: 3221225472,
      extension: "mp4",
      lastModified: now,
      folderId: folder.id,
      scannedAt: now,
      createdAt: now,
      updatedAt: now,
      isFavorite: true,
      playCount: 3,
    },
    {
      path: "/Users/khaingmyel/Movies/Test/Breaking.Bad.S01E02.Cats.in.the.Bag.1080p.BluRay.x264.mp4",
      type: "tv",
      title: "Breaking Bad",
      season: 1,
      episode: JSON.stringify([2]),
      episodeTitle: "Cats in the Bag",
      quality: "1080p",
      source: "BluRay",
      codec: "x264",
      size: 2147483648,
      extension: "mp4",
      lastModified: now,
      folderId: folder.id,
      scannedAt: now,
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
      playCount: 1,
    },
  ];

  for (const video of testVideos) {
    db.insert(videos).values(video).run();
  }

  // Add activity logs
  db.insert(activityLog)
    .values({
      level: "info",
      category: "scan",
      message: "Initial scan completed: found 3 videos",
      createdAt: now,
    })
    .run();

  db.insert(activityLog)
    .values({
      level: "info",
      category: "server",
      message: "Server started on port 8080",
      createdAt: now - 300000,
    })
    .run();

  console.log("✅ Database seeded successfully!");
  console.log(`   - 1 folder`);
  console.log(`   - ${testVideos.length} videos`);
  console.log(`   - 2 activity logs`);
}

seed().catch(console.error);
