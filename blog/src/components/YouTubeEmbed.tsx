// components/YouTubeEmbed.tsx
import React from "react";

type YouTubeEmbedProps = {
  /** YouTube URL or video ID */
  src: string;
  /** Optional iframe title for accessibility */
  title?: string;
  /** Width (px or %) */
  width?: number | string;
  /** Height (px) */
  height?: number | string;
};

export function YouTubeEmbed({
  src,
  title = "YouTube video",
  width = "100%",
  height = 360,
}: YouTubeEmbedProps) {
  // If passed a full URL, extract the video ID; otherwise assume it's already an ID.
  const videoId = extractVideoId(src);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="mb-4">
      <iframe
        width={width}
        height={height}
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full"
      />
    </div>
  );
}

/** Extracts the 11‑char YouTube video ID from various URL formats */
function extractVideoId(urlOrId: string): string {
  // Regex covers: youtube.com/watch?v=, youtube.com/embed/, youtu.be/
  const regExp =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([A-Za-z0-9_-]{11})/;
  const match = urlOrId.match(regExp);
  return match ? match[1] : urlOrId;
}
