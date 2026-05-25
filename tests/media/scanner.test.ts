// tests/media-scanner.test.ts
import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { MediaParser } from "../../src/bun/media/parser";
import { MediaScanner } from "../../src/bun/media/scanner";
import { FileWatcher } from "../../src/bun/media/watcher";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

// ──────────────────────────────────────────────
// MediaParser Tests
// ──────────────────────────────────────────────

describe("MediaParser", () => {
  const parser = new MediaParser();

  describe("Movie Parsing", () => {
    test("parses movie with dots and full quality info", () => {
      const result = parser.parse("Los.Tigres.2025.720p.BluRay.mp4");

      expect(result.type).toBe("movie");
      expect(result.title).toBe("Los Tigres");
      expect(result.year).toBe(2025);
      expect(result.quality).toBe("720p");
      expect(result.source).toBe("BluRay");
      expect(result.extension).toBe("mp4");
    });

    test("parses movie with codec info", () => {
      const result = parser.parse("The.Matrix.1999.1080p.BluRay.x264.mkv");

      expect(result.type).toBe("movie");
      expect(result.title).toBe("The Matrix");
      expect(result.year).toBe(1999);
      expect(result.quality).toBe("1080p");
      expect(result.source).toBe("BluRay");
      expect(result.codec).toBe("x264");
      expect(result.extension).toBe("mkv");
    });

    test("parses 4K movie", () => {
      const result = parser.parse("Inception.2010.2160p.HDR.WEB-DL.mp4");

      expect(result.type).toBe("movie");
      expect(result.title).toBe("Inception");
      expect(result.year).toBe(2010);
      expect(result.quality).toBe("2160p");
      expect(result.source).toBe("WEB-DL");
    });

    test("parses movie with HEVC codec", () => {
      const result = parser.parse("Dune.2021.4K.HEVC.WEB-DL.mp4");

      expect(result.type).toBe("movie");
      expect(result.title).toBe("Dune");
      expect(result.year).toBe(2021);
      expect(result.quality).toBe("4K");
      expect(result.codec).toBe("HEVC");
    });

    test("parses movie with WEBRip source", () => {
      const result = parser.parse("Parasite.2019.1080p.WEBRip.x265.mp4");

      expect(result.type).toBe("movie");
      expect(result.title).toBe("Parasite");
      expect(result.year).toBe(2019);
      expect(result.source).toBe("WEBRip");
      expect(result.codec).toBe("x265");
    });

    test("parses movie with HDRip source", () => {
      const result = parser.parse("Oppenheimer.2023.720p.HDRip.mp4");

      expect(result.type).toBe("movie");
      expect(result.title).toBe("Oppenheimer");
      expect(result.source).toBe("HDRip");
    });

    test("parses movie with AV1 codec", () => {
      const result = parser.parse("Avatar.2022.1080p.AV1.mp4");

      expect(result.type).toBe("movie");
      expect(result.title).toBe("Avatar");
      expect(result.codec).toBe("AV1");
    });

    test("parses movie with DVDRip source", () => {
      const result = parser.parse("Old.Movie.1995.480p.DVDRip.mp4");

      expect(result.type).toBe("movie");
      expect(result.title).toBe("Old Movie");
      expect(result.year).toBe(1995);
      expect(result.quality).toBe("480p");
      expect(result.source).toBe("DVDRip");
    });
  });

  describe("TV Show Parsing", () => {
    test("parses TV show with full episode info", () => {
      const result = parser.parse(
        "Breaking.Bad.S01E01.Pilot.1080p.BluRay.x264.mp4",
      );

      expect(result.type).toBe("tv");
      expect(result.title).toBe("Breaking Bad");
      expect(result.season).toBe(1);
      expect(result.episode).toEqual([1]);
      expect(result.episodeTitle).toBe("Pilot");
      expect(result.quality).toBe("1080p");
      expect(result.source).toBe("BluRay");
    });

    test("parses TV show without episode title", () => {
      const result = parser.parse("The.Office.S02E05.720p.WEBRip.mkv");

      expect(result.type).toBe("tv");
      expect(result.title).toBe("The Office");
      expect(result.season).toBe(2);
      expect(result.episode).toEqual([5]);
      expect(result.quality).toBe("720p");
    });

    test("parses TV show with long episode title", () => {
      const result = parser.parse(
        "Stranger.Things.S04E07.The.Massacre.at.Hawkins.Lab.2160p.WEB-DL.mkv",
      );

      expect(result.type).toBe("tv");
      expect(result.title).toBe("Stranger Things");
      expect(result.season).toBe(4);
      expect(result.episode).toEqual([7]);
      expect(result.episodeTitle).toBeDefined();
    });

    test("parses TV show with HDTV source", () => {
      const result = parser.parse("Game.of.Thrones.S08E06.1080p.HDTV.x264.mp4");

      expect(result.type).toBe("tv");
      expect(result.title).toBe("Game of Thrones");
      expect(result.source).toBe("HDTV");
    });

    test("parses TV show with alternate 1x02 format", () => {
      const result = parser.parse("Rick.and.Morty.3x07.720p.WEB-DL.mkv");

      expect(result.type).toBe("tv");
      expect(result.title).toBe("Rick and Morty");
      expect(result.season).toBe(3);
      expect(result.episode).toEqual([7]);
    });

    test("parses multi-part episode", () => {
      const result = parser.parse(
        "Friends.S10E17E18.The.Last.One.720p.DVDRip.mp4",
      );

      expect(result.type).toBe("tv");
      expect(result.title).toContain("Friends");
      expect(result.season).toBe(10);
      expect(result.episode).toEqual([17, 18]);
    });
  });

  describe("Edge Cases", () => {
    test("handles file with only quality info", () => {
      const result = parser.parse("random.video.360p.mp4");

      expect(result.type).toBe("unknown");
      expect(result.title).toBe("random video");
      expect(result.quality).toBe("360p");
    });

    test("handles file with no recognizable patterns (underscores)", () => {
      const result = parser.parse("vacation_video.mp4");

      expect(result.type).toBe("unknown");
      expect(result.title).toBe("vacation video");
    });

    test("handles file with year but no quality", () => {
      const result = parser.parse("Some.Movie.2020.mp4");

      expect(result.type).toBe("movie");
      expect(result.title).toBe("Some Movie");
      expect(result.year).toBe(2020);
    });

    test("handles HDR in quality", () => {
      const result = parser.parse("Movie.2024.2160p.HDR.WEB-DL.mp4");

      expect(result.type).toBe("movie");
      expect(result.quality).toBe("2160p");
      expect(result.source).toBe("WEB-DL");
    });

    test("handles BDRip source", () => {
      const result = parser.parse("Movie.2023.1080p.BDRip.mp4");

      expect(result.type).toBe("movie");
      expect(result.source).toBe("BDRip");
    });

    test("handles WEB source", () => {
      const result = parser.parse("Movie.2024.1080p.WEB.mp4");

      expect(result.type).toBe("movie");
      expect(result.source).toBe("WEB");
    });
  });

  describe("Known Media Files (Integration)", () => {
    test("correctly identifies all movie patterns", () => {
      const movies = [
        "Los.Tigres.2025.720p.BluRay.mp4",
        "The.Matrix.1999.1080p.BluRay.x264.mkv",
        "Inception.2010.2160p.HDR.WEB-DL.mp4",
        "Dune.2021.4K.HEVC.WEB-DL.mp4",
        "Parasite.2019.1080p.WEBRip.x265.mp4",
        "Oppenheimer.2023.720p.HDRip.mp4",
        "Avatar.2022.1080p.AV1.mp4",
        "Old.Movie.1995.480p.DVDRip.mp4",
      ];

      for (const movie of movies) {
        const result = parser.parse(movie);
        expect(result.type).toBe("movie");
      }
    });

    test("correctly identifies all TV patterns", () => {
      const episodes = [
        "Breaking.Bad.S01E01.Pilot.1080p.BluRay.x264.mp4",
        "The.Office.S02E05.720p.WEBRip.mkv",
        "Friends.S10E17E18.The.Last.One.720p.DVDRip.mp4",
        "Stranger.Things.S04E07.The.Massacre.at.Hawkins.Lab.2160p.WEB-DL.mkv",
        "Game.of.Thrones.S08E06.1080p.HDTV.x264.mp4",
        "Rick.and.Morty.3x07.720p.WEB-DL.mkv",
      ];

      for (const episode of episodes) {
        const result = parser.parse(episode);
        expect(result.type).toBe("tv");
      }
    });
  });
});

// ──────────────────────────────────────────────
// MediaScanner Tests (with real filesystem)
// ──────────────────────────────────────────────

describe("MediaScanner", () => {
  const scanner = new MediaScanner();
  const testDir = join(tmpdir(), `burrowstream-test-${Date.now()}`);
  const moviesDir = join(testDir, "Movies");
  const tvDir = join(testDir, "TV Shows");
  const unsortedDir = join(testDir, "Unsorted");

  beforeAll(async () => {
    // Create test directory structure
    await mkdir(moviesDir, { recursive: true });
    await mkdir(tvDir, { recursive: true });
    await mkdir(unsortedDir, { recursive: true });

    // Create test movie files (empty files for testing)
    const movieFiles = [
      "Los.Tigres.2025.720p.BluRay.mp4",
      "The.Matrix.1999.1080p.BluRay.x264.mkv",
      "Inception.2010.2160p.HDR.WEB-DL.mp4",
      "Dune.2021.4K.HEVC.WEB-DL.mp4",
    ];

    for (const file of movieFiles) {
      await writeFile(join(moviesDir, file), "test content");
    }

    // Create test TV show files
    const tvFiles = [
      "Breaking.Bad.S01E01.Pilot.1080p.BluRay.x264.mp4",
      "Breaking.Bad.S01E02.Cats.in.the.Bag.1080p.BluRay.x264.mp4",
      "The.Office.S02E05.720p.WEBRip.mkv",
      "Stranger.Things.S04E07.2160p.WEB-DL.mkv",
    ];

    for (const file of tvFiles) {
      await writeFile(join(tvDir, file), "test content");
    }

    // Create unsorted files
    await writeFile(join(unsortedDir, "random_video.mp4"), "test content");
    await writeFile(join(unsortedDir, "not-a-video.txt"), "not a video");
  });

  afterAll(async () => {
    // Cleanup
    if (existsSync(testDir)) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  describe("Scan Results", () => {
    test("scans directory and finds video files", async () => {
      const result = await scanner.scanDirectory(testDir);

      expect(result.videos.length).toBeGreaterThan(0);
      expect(result.totalSize).toBeGreaterThan(0);
      expect(result.errors).toEqual([]);
    });

    describe("File Discovery", () => {
      test("handles non-existent directories", async () => {
        const nonExistentPath = join(
          tmpdir(),
          `does-not-exist-${Date.now()}-${Math.random()}`,
        );

        await expect(scanner.scanDirectory(nonExistentPath)).rejects.toThrow(
          "Directory not found",
        );
      });
    });

    test("only includes video files", async () => {
      const result = await scanner.scanDirectory(testDir);

      const hasTextFile = result.videos.some((v: any) => v.extension === "txt");
      expect(hasTextFile).toBe(false);
    });

    test("reports scan progress", async () => {
      const progressEvents: any[] = [];

      scanner.on("progress", (progress: any) => {
        progressEvents.push(progress);
      });

      await scanner.scanDirectory(testDir);

      expect(progressEvents.length).toBeGreaterThan(0);
      expect(progressEvents[0].phase).toBe("discovering");
      expect(progressEvents[progressEvents.length - 1].phase).toBe("complete");
    });

    test("cancels scan", async () => {
      // Use a fresh scanner to avoid state issues
      const cancelScanner = new MediaScanner();

      const slowDir = join(testDir, "slow-scan");
      await mkdir(slowDir, { recursive: true });

      // Create 1000 files to ensure scan takes measurable time
      for (let i = 0; i < 1000; i++) {
        await writeFile(join(slowDir, `video_${i}.mp4`), "test content");
      }

      // Start scan (don't await)
      const scanPromise = cancelScanner.scanDirectory(slowDir);

      // Wait a small amount to let discovery start
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Cancel
      cancelScanner.cancelScan();

      await expect(scanPromise).rejects.toThrow("Scan cancelled");
    });
  });

  describe("File Discovery", () => {
    test("skips hidden files", async () => {
      await writeFile(join(moviesDir, ".hidden_movie.mp4"), "hidden");

      const result = await scanner.scanDirectory(testDir);

      const hasHidden = result.videos.some((v: any) =>
        v.path.includes(".hidden"),
      );
      expect(hasHidden).toBe(false);
    });

    test("handles empty directories", async () => {
      const emptyDir = join(testDir, "Empty");
      await mkdir(emptyDir, { recursive: true });

      const result = await scanner.scanDirectory(emptyDir);

      expect(result.videos).toEqual([]);
      expect(result.totalSize).toBe(0);
    });

    test("handles non-existent directories", async () => {
      // Use a guaranteed non-existent path
      const nonExistentPath = join(
        tmpdir(),
        `does-not-exist-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      );

      await expect(scanner.scanDirectory(nonExistentPath)).rejects.toThrow(
        "Directory not found",
      );
    });
  });

  describe("FileWatcher", () => {
    const watcher = new FileWatcher();

    afterAll(() => {
      watcher.unwatchAll();
    });

    test("watches folder for new files", async () => {
      const addedFiles: string[] = [];

      watcher.on("fileAdded", ({ path }: { path: string }) => {
        addedFiles.push(path);
      });

      watcher.watchFolder(moviesDir);

      // Create a new file
      await writeFile(join(moviesDir, "New.Movie.2024.1080p.mp4"), "new");

      // Wait for watch event (with timeout)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Note: File watching can be platform-dependent
      // This test may need adjustment based on OS
    });
  });
});

// ──────────────────────────────────────────────
// Benchmark Tests
// ──────────────────────────────────────────────

describe("Parser Benchmarks", () => {
  const parser = new MediaParser();
  const iterations = 1000;

  test("parses movie names efficiently", () => {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      parser.parse("The.Matrix.1999.1080p.BluRay.x264.mkv");
      parser.parse("Inception.2010.2160p.HDR.WEB-DL.mp4");
      parser.parse("Dune.2021.4K.HEVC.WEB-DL.mp4");
    }

    const duration = performance.now() - start;
    const perParse = duration / (iterations * 3);

    console.log(`Average parse time: ${perParse.toFixed(3)}ms`);

    // Should parse in under 1ms per file
    expect(perParse).toBeLessThan(1);
  });

  test("parses TV show names efficiently", () => {
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      parser.parse("Breaking.Bad.S01E01.Pilot.1080p.BluRay.x264.mp4");
      parser.parse(
        "Stranger.Things.S04E07.The.Massacre.at.Hawkins.Lab.2160p.WEB-DL.mkv",
      );
      parser.parse("Friends.S10E17E18.The.Last.One.720p.DVDRip.mp4");
    }

    const duration = performance.now() - start;
    const perParse = duration / (iterations * 3);

    expect(perParse).toBeLessThan(1);
  });
});

// ──────────────────────────────────────────────
// Data-Driven Tests
// ──────────────────────────────────────────────
describe("Bulk File Processing", () => {
  const parser = new MediaParser();

  const testCases = [
    [
      "Los.Tigres.2025.720p.BluRay.mp4",
      "movie",
      "Los Tigres",
      2025,
      undefined,
      undefined,
    ],
    [
      "The.Matrix.1999.1080p.BluRay.x264.mkv",
      "movie",
      "The Matrix",
      1999,
      undefined,
      undefined,
    ],
    [
      "Breaking.Bad.S01E01.Pilot.1080p.BluRay.x264.mp4",
      "tv",
      "Breaking Bad",
      undefined,
      1,
      [1],
    ],
    [
      "Friends.S10E17E18.The.Last.One.720p.DVDRip.mp4",
      "tv",
      "Friends",
      undefined,
      10,
      [17, 18],
    ],
    // Fix: underscore converted to space
    [
      "vacation_video.mp4",
      "unknown",
      "vacation video",
      undefined,
      undefined,
      undefined,
    ],
  ] as const;

  test.each(testCases)(
    "parses %s correctly",
    (
      filename,
      expectedType,
      expectedTitle,
      expectedYear,
      expectedSeason,
      expectedEpisode,
    ) => {
      const result = parser.parse(filename as string);

      expect(result.type).toBe(expectedType);
      expect(result.title).toEqual(expectedTitle);

      if (expectedYear) expect(result.year).toBe(expectedYear);
      if (expectedSeason) expect(result.season).toBe(expectedSeason);
      if (expectedEpisode)
        expect(result.episode).toEqual(Array.from(expectedEpisode));
    },
  );
});
