import React, { useState, useEffect } from 'react';
import './YouTubePlayer.css';

/**
 * YouTubePlayer — Reusable component that fetches and embeds
 * a single educational YouTube video related to the given topic.
 *
 * Props:
 *   - topic (string): The search query for finding a relevant video.
 *
 * Environment variable required:
 *   VITE_YOUTUBE_API_KEY  — YouTube Data API v3 key
 *   (set in .env, referenced via import.meta.env.VITE_YOUTUBE_API_KEY)
 */
function YouTubePlayer({ topic }) {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    /* Do nothing when topic is empty or whitespace-only */
    if (!topic || !topic.trim()) {
      setVideoId(null);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function fetchVideo() {
      setLoading(true);
      setError(null);
      setVideoId(null);

      /* YouTube Data API v3 key — loaded from environment variable */
      // Environment variable: VITE_YOUTUBE_API_KEY
      const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

      if (!API_KEY) {
        setError('YouTube API key is not configured. Add VITE_YOUTUBE_API_KEY to your .env file.');
        setLoading(false);
        return;
      }

      try {
        const query = encodeURIComponent(`${topic.trim()} tutorial educational`);
        const url =
          `https://www.googleapis.com/youtube/v3/search` +
          `?part=snippet` +
          `&q=${query}` +
          `&type=video` +
          `&videoEmbeddable=true` +
          `&maxResults=1` +
          `&key=${API_KEY}`;

        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`YouTube API error (${response.status})`);
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
          setVideoId(data.items[0].id.videoId);
        } else {
          setError('No relevant video found for this topic.');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Failed to fetch video. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();

    /* Cleanup: abort in-flight request if topic changes or component unmounts */
    return () => controller.abort();
  }, [topic]);

  /* Hide the player entirely when there is no topic */
  if (!topic || !topic.trim()) return null;

  return (
    <div className="youtube-player result-section card-flat animate-fade-in">
      <h3 className="result-section-title">🎬 Related Video</h3>

      {/* Loading skeleton */}
      {loading && (
        <div className="youtube-player__wrapper">
          <div className="skeleton youtube-player__skeleton" />
        </div>
      )}

      {/* Error / no-result message */}
      {error && !loading && (
        <p className="youtube-player__message">{error}</p>
      )}

      {/* Embedded video */}
      {videoId && !loading && (
        <div className="youtube-player__wrapper">
          <iframe
            className="youtube-player__iframe"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="Related YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}

export default YouTubePlayer;
