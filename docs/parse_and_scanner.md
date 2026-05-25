# BurrowStream Media Parser & Scanner

> Convention-based media file detection for local video streaming servers

## Supported Naming Conventions

### Movies

```
Title.Year.Quality.Source.Codec.ext
```

| Component | Pattern                       | Examples                                                                |
| --------- | ----------------------------- | ----------------------------------------------------------------------- |
| Title     | Any text (dots become spaces) | `Los.Tigres`, `The.Matrix`                                              |
| Year      | 4-digit number (19xx-20xx)    | `2025`, `1999`                                                          |
| Quality   | Resolution                    | `4K`, `2160p`, `1080p`, `720p`, `480p`, `360p`                          |
| Source    | Media source                  | `BluRay`, `WEB-DL`, `WEBRip`, `HDRip`, `DVDRip`, `BDRip`, `HDTV`, `WEB` |
| Codec     | Video codec                   | `x264`, `x265`, `HEVC`, `H264`, `AV1`, `AVC`, `H.264`, `H.265`          |

**Examples:**

```
Los.Tigres.2025.720p.BluRay.mp4
The.Matrix.1999.1080p.BluRay.x264.mkv
Inception.2010.2160p.HDR.WEB-DL.mp4
Dune.2021.4K.HEVC.WEB-DL.mp4
```

### TV Shows

```
Show.Name.SXXEXX.Episode.Title.Quality.Source.Codec.ext
Show.Name.SXXEXXEXX.Episode.Title.Quality.Source.Codec.ext  (multi-part)
Show.Name.1x02.Episode.Title.Quality.Source.Codec.ext        (alternate)
```

| Component      | Pattern                    | Examples                     |
| -------------- | -------------------------- | ---------------------------- |
| Show Name      | Text before episode marker | `Breaking.Bad`, `The.Office` |
| Season/Episode | `S01E02` or `1x02`         | `S01E01`, `3x07`             |
| Multi-part     | `S01E02E03`                | Two episodes joined          |
| Episode Title  | Text after episode marker  | `Pilot`, `The.Last.One`      |

**Examples:**

```
Breaking.Bad.S01E01.Pilot.1080p.BluRay.x264.mp4
Stranger.Things.S04E07.The.Massacre.at.Hawkins.Lab.2160p.WEB-DL.mkv
Friends.S10E17E18.The.Last.One.720p.DVDRip.mp4
Rick.and.Morty.3x07.720p.WEB-DL.mkv
```

### Unknown Files

Files that don't match movie or TV patterns are flagged as `unknown` type. Titles still get cleaned (dots/underscores become spaces, technical terms removed).

```
vacation_video.mp4          → type: unknown, title: "vacation video"
random.video.360p.mp4       → type: unknown, title: "random video", quality: "360p"
```

---

## API Reference

### `MediaParser`

```typescript
class MediaParser {
  parse(filename: string): ParsedMedia;
}
```

#### `ParsedMedia` Interface

```typescript
interface ParsedMedia {
  type: "movie" | "tv" | "unknown";
  title: string;
  year?: number;
  season?: number;
  episode?: number[]; // Array for multi-part episodes
  episodeTitle?: string;
  quality?: string;
  source?: string;
  codec?: string;
  extension: string;
  fullMatch: string;
}
```

#### Usage

```typescript
const parser = new MediaParser();

// Movies
parser.parse("Los.Tigres.2025.720p.BluRay.mp4");
// → { type: "movie", title: "Los Tigres", year: 2025, quality: "720p", source: "BluRay" }

// TV Shows
parser.parse("Breaking.Bad.S01E01.Pilot.1080p.BluRay.x264.mp4");
// → { type: "tv", title: "Breaking Bad", season: 1, episode: [1], episodeTitle: "Pilot" }

// Multi-part episodes
parser.parse("Friends.S10E17E18.The.Last.One.720p.DVDRip.mp4");
// → { type: "tv", title: "Friends", season: 10, episode: [17, 18] }

// Unknown
parser.parse("vacation_video.mp4");
// → { type: "unknown", title: "vacation video" }
```

---

### `MediaScanner`

```typescript
class MediaScanner extends EventEmitter {
  scanDirectory(dirPath: string): Promise<ScanResult>;
  cancelScan(): void;
  on(event: "progress", callback: (progress: ScanProgress) => void): void;
}
```

#### `ScanResult` Interface

```typescript
interface ScanResult {
  videos: VideoFile[];
  totalSize: number;
  duration: number; // milliseconds
  errors: string[];
}

interface VideoFile {
  path: string;
  name: string;
  size: number;
  extension: string;
  lastModified: number;
}
```

#### `ScanProgress` Interface

```typescript
interface ScanProgress {
  processed: number;
  total: number;
  currentFile?: string;
  phase: "discovering" | "processing" | "complete" | "error";
}
```

#### Usage

```typescript
const scanner = new MediaScanner();

// Listen for progress updates
scanner.on("progress", (progress) => {
  console.log(`${progress.phase}: ${progress.processed}/${progress.total}`);
});

// Scan a directory
const result = await scanner.scanDirectory("/path/to/media");
console.log(`Found ${result.videos.length} videos`);

// Cancel ongoing scan
scanner.cancelScan();
```

#### Scan Phases

| Phase         | Description                            |
| ------------- | -------------------------------------- |
| `discovering` | Walking directory tree, counting files |
| `processing`  | Checking each file, identifying videos |
| `complete`    | Scan finished successfully             |
| `error`       | Scan failed or was cancelled           |

#### Supported Video Extensions

```
.mp4, .mkv, .avi, .mov, .wmv, .flv, .webm, .m4v, .mpg, .mpeg
```

#### Error Handling

```typescript
try {
  await scanner.scanDirectory("/non/existent/path");
} catch (error) {
  // Throws: "Directory not found: /non/existent/path"
}

try {
  await scanner.scanDirectory("/path/to/file.txt");
} catch (error) {
  // Throws: "Path is not a directory: /path/to/file.txt"
}
```

#### Behavior

| Behavior          | Details                                       |
| ----------------- | --------------------------------------------- |
| Hidden files      | Skipped (files starting with `.`)             |
| Recursive         | Scans all subdirectories                      |
| Cancellation      | Aborts via `AbortController`                  |
| Concurrency       | Only one scan at a time                       |
| Empty directories | Returns empty result, no error                |
| Non-video files   | Counted in progress but excluded from results |

---

### `FileWatcher`

```typescript
class FileWatcher extends EventEmitter {
  watchFolder(folderPath: string): void;
  unwatchFolder(folderPath: string): void;
  unwatchAll(): void;
  on(
    event: "fileAdded" | "fileRemoved",
    callback: (data: { path: string; folderPath: string }) => void,
  ): void;
}
```

#### Usage

```typescript
const watcher = new FileWatcher();

watcher.on("fileAdded", ({ path }) => {
  console.log(`New video: ${path}`);
});

watcher.on("fileRemoved", ({ path }) => {
  console.log(`Removed: ${path}`);
});

watcher.watchFolder("/path/to/media");
watcher.unwatchAll();
```

---

## Technical Terms Filter

These terms are automatically stripped from titles:

| Category | Terms                                                                   |
| -------- | ----------------------------------------------------------------------- |
| Quality  | `4K`, `2160p`, `1080p`, `720p`, `480p`, `360p`                          |
| Source   | `BluRay`, `WEB-DL`, `WEBRip`, `HDRip`, `DVDRip`, `BDRip`, `HDTV`, `WEB` |
| Codec    | `x264`, `x265`, `HEVC`, `H264`, `AV1`, `AVC`, `H.264`, `H.265`          |
| HDR      | `HDR`, `HDR10`, `HDR10+`, `Dolby`, `Vision`, `Atmos`                    |
| Audio    | `DD5.1`, `DD7.1`, `AAC`, `DTS`, `TrueHD`                                |
| Editions | `Extended`, `Directors`, `Theatrical`, `Unrated`                        |

---

## Testing

```bash
# Run all scanner tests
bun test tests/media/scanner.test.ts

# Run specific suites
bun test --test-name-pattern "MediaParser"
bun test --test-name-pattern "MediaScanner"
bun test --test-name-pattern "Benchmarks"

# Watch mode
bun test --watch tests/media/scanner.test.ts
```

### Test Coverage

| Suite           | Tests | Coverage                                     |
| --------------- | ----- | -------------------------------------------- |
| Movie Parsing   | 8     | Dots, codecs, all qualities & sources        |
| TV Show Parsing | 7     | SXXEXX, multi-part, 1x02, titles             |
| Edge Cases      | 6     | Unknown files, underscores, HDR, WEB         |
| Integration     | 2     | Bulk movie & TV pattern validation           |
| Scanner Results | 5     | Discovery, filtering, progress, cancellation |
| File Discovery  | 3     | Hidden files, empty dirs, errors             |
| FileWatcher     | 1     | New file detection                           |
| Benchmarks      | 2     | <0.003ms per parse                           |
| Bulk Processing | 5     | Data-driven validation                       |

### Performance Benchmarks

```
Movie parsing:  ~0.002ms per file
TV parsing:     ~0.003ms per file
Scanning:       ~2ms for small directories
File watching:  ~1s for OS notification
```

---

## Integration Example

```typescript
import { MediaParser } from "./media/parser";
import { MediaScanner } from "./media/scanner";
import { FileWatcher } from "./media/watcher";

// Parse individual files
const parser = new MediaParser();
const result = parser.parse("Breaking.Bad.S01E01.mp4");

// Scan a directory
const scanner = new MediaScanner();
scanner.on("progress", (p) => console.log(p));
const scan = await scanner.scanDirectory("/media/videos");

// Watch for changes
const watcher = new FileWatcher();
watcher.on("fileAdded", ({ path }) => {
  const info = parser.parse(path);
  console.log(`New ${info.type}: ${info.title}`);
});
watcher.watchFolder("/media/videos");
```
