export interface Video {
  id: number;
  title: string;
  type: string;
  quality?: string;
  season?: number;
  episode?: string;
  size: number;
  extension: string;
  year?: number;
  episodeTitle?: string;
}
