interface ParsedMedia {
  type: "movie" | "tv" | "unknown";
  title: string;
  year?: number;
  season?: number;
  episode?: number[];
  episodeTitle?: string;
  quality?: string;
  source?: string;
  codec?: string;
  extension: string;
  fullMatch: string;
}

export class MediaParser {
  private static TECHNICAL_TERMS = new Set([
    "4k",
    "2160p",
    "1080p",
    "720p",
    "480p",
    "360p",
    "bluray",
    "web-dl",
    "webrip",
    "hdrip",
    "dvdrip",
    "bdrip",
    "hdtv",
    "web",
    "x264",
    "x265",
    "hevc",
    "h264",
    "av1",
    "avc",
    "h.264",
    "h.265",
    "hdr",
    "hdr10",
    "hdr10+",
    "dolby",
    "vision",
    "atmos",
    "dd5.1",
    "dd7.1",
    "aac",
    "dts",
    "truehd",
    "extended",
    "directors",
    "theatrical",
    "unrated",
  ]);

  private static QUALITY = /\b(4K|2160p|1080p|720p|480p|360p)\b/i;
  private static SOURCE =
    /\b(BluRay|WEB-DL|WEBRip|HDRip|DVDRip|BDRip|HDTV|WEB)\b/i;
  private static CODEC = /\b(x264|x265|HEVC|H264|AV1|AVC|H\.264|H\.265)\b/i;

  private static TV_EPISODE = /S(\d{2})E(\d{2}(?:E\d{2})?)/i;
  private static TV_ALT = /(\d+)x(\d+)/i;

  private static YEAR = /\b(19|20)\d{2}\b/;

  parse(filename: string): ParsedMedia {
    const lastDot = filename.lastIndexOf(".");
    const ext = lastDot !== -1 ? filename.slice(lastDot + 1).toLowerCase() : "";
    const nameWithoutExt =
      lastDot !== -1 ? filename.slice(0, lastDot) : filename;

    // Extract technical info
    const quality = nameWithoutExt.match(MediaParser.QUALITY)?.[0];
    const source = nameWithoutExt.match(MediaParser.SOURCE)?.[0];
    const codec = nameWithoutExt.match(MediaParser.CODEC)?.[0];
    const yearMatch = nameWithoutExt.match(MediaParser.YEAR);
    const year = yearMatch ? parseInt(yearMatch[0]) : undefined;

    // Split into parts for analysis
    const parts = nameWithoutExt.split(".");

    // Find episode pattern
    const tvMatch =
      nameWithoutExt.match(MediaParser.TV_EPISODE) ||
      nameWithoutExt.match(MediaParser.TV_ALT);

    if (tvMatch) {
      return this.parseTVShow(parts, tvMatch, ext, { quality, source, codec });
    }

    if (year) {
      return this.parseMovie(parts, year, ext, { quality, source, codec });
    }

    // Unknown - clean title
    const title = this.cleanTitle(parts);

    return {
      type: "unknown",
      title,
      extension: ext,
      fullMatch: filename,
      quality,
      source,
      codec,
    };
  }

  private isTechnical(part: string): boolean {
    return MediaParser.TECHNICAL_TERMS.has(part.toLowerCase());
  }

  private cleanTitle(parts: string[]): string {
    const cleaned = parts
      .filter((p) => !this.isTechnical(p))
      .join(" ")
      .replace(/_/g, " ") // ← ADD: convert underscores to spaces
      .replace(/\s+/g, " ")
      .trim();

    // If nothing left after cleaning, convert dots to spaces from original
    if (!cleaned && parts.length > 0) {
      return parts
        .join(" ")
        .replace(/_/g, " ") // ← ADD: convert underscores to spaces
        .replace(/\s+/g, " ")
        .trim();
    }

    return cleaned;
  }

  private parseMovie(
    parts: string[],
    year: number,
    ext: string,
    info: { quality?: string; source?: string; codec?: string },
  ): ParsedMedia {
    const yearIndex = parts.findIndex((p) => parseInt(p) === year);

    const titleParts = parts
      .slice(0, yearIndex)
      .filter((p) => !this.isTechnical(p));

    const title = titleParts
      .join(" ")
      .replace(/_/g, " ") // ← ADD
      .replace(/\s+/g, " ")
      .trim();

    return {
      type: "movie",
      title,
      year,
      quality: info.quality,
      source: info.source,
      codec: info.codec,
      extension: ext,
      fullMatch: parts.join(".") + "." + ext,
    };
  }

  private parseTVShow(
    parts: string[],
    tvMatch: RegExpMatchArray,
    ext: string,
    info: { quality?: string; source?: string; codec?: string },
  ): ParsedMedia {
    let season: number;
    let episode: number[];

    if (tvMatch[0].includes("x")) {
      season = parseInt(tvMatch[1]);
      episode = [parseInt(tvMatch[2])];
    } else {
      season = parseInt(tvMatch[1]);
      episode = tvMatch[2]
        .split("E")
        .filter(Boolean)
        .map((e) => parseInt(e));
    }

    // Find the episode pattern index
    const epPattern = tvMatch[0];
    const epIndex = parts.findIndex((p) =>
      p.toUpperCase().includes(epPattern.toUpperCase()),
    );

    const titleParts =
      epIndex > 0
        ? parts.slice(0, epIndex).filter((p) => !this.isTechnical(p))
        : [];

    const title = titleParts
      .join(" ")
      .replace(/_/g, " ") // ← ADD
      .replace(/\s+/g, " ")
      .trim();

    const epTitleParts =
      epIndex >= 0
        ? parts.slice(epIndex + 1).filter((p) => !this.isTechnical(p))
        : [];

    const episodeTitle =
      epTitleParts.length > 0
        ? epTitleParts.join(" ").replace(/_/g, " ").replace(/\s+/g, " ").trim() // ← ADD
        : undefined;

    return {
      type: "tv",
      title,
      season,
      episode,
      episodeTitle,
      quality: info.quality,
      source: info.source,
      codec: info.codec,
      extension: ext,
      fullMatch: parts.join(".") + "." + ext,
    };
  }
}
