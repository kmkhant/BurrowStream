// tests/media-parser.test.ts
import { describe, expect, test } from "bun:test";
import { MediaParser } from "../../src/bun/media/parser";

describe("MediaParser", () => {
  const parser = new MediaParser();

  test("parses movie with dots", () => {
    const result = parser.parse("Los.Tigres.2025.720p.BluRay.mp4");

    expect(result.type).toBe("movie");
    expect(result.title).toBe("Los Tigres");
    expect(result.year).toBe(2025);
    expect(result.quality).toBe("720p");
    expect(result.source).toBe("BluRay");
    expect(result.extension).toBe("mp4");
  });

  test("parses TV show episode", () => {
    const result = parser.parse("Breaking.Bad.S01E01.Pilot.1080p.BluRay.mp4");

    expect(result.type).toBe("tv");
    expect(result.title).toContain("Breaking Bad");
    expect(result.season).toBe(1);
    expect(result.episode).toEqual([1]);
  });

  test("parses unknown file", () => {
    const result = parser.parse("random.video.360p.mp4");

    expect(result.type).toBe("unknown");
  });
});
