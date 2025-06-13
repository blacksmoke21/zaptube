"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { SimplePool } from "nostr-tools/pool";
import { fetchProfile } from "@/utils/fetchProfile";
import { VideoCard } from "./VideoCard";
import { SkeletonCard } from "./SkeletonCard";
import { TopPillTabs } from "@/components/TopPillTabs";

type VideoPost = {
  id: string;
  pubkey: string;
  content: string;
  url: string;
  created_at: number;
  profile?: { name: string; picture: string };
};

const PAGE_SIZE = 12;
const relays = ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.snort.social", "wss://relay.nostr.band"];

export default function VideoFeed() {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [preloadedNextPage, setPreloadedNextPage] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const lastTimestampRef = useRef<number>(Math.floor(Date.now() / 1000));

  const fetchVideos = useCallback(async () => {
    if (!hasMore) return;

    setLoading(true);
    const pool = new SimplePool();

    const events = await pool.querySync(relays, {
      kinds: [21, 34235],
      limit: PAGE_SIZE * 3,
      until: lastTimestampRef.current,
    });

    const sorted = events
      .filter((e) => e.tags.find((t) => t[0] === "imeta"))
      .sort((a, b) => b.created_at - a.created_at);

    if (sorted.length === 0) {
      setHasMore(false);
      setLoading(false);
      return;
    }

    for (const event of sorted) {
      const iMetaTag = event.tags.find((t) => t[0] === "imeta");
      if (!iMetaTag || !iMetaTag[1]) continue;
      const videoUrl = iMetaTag[1].split(" ");
      if (videoUrl[0] !== "url" || videoUrl.length !== 2) continue;

      const profile = await fetchProfile(event.pubkey);
      
      
      setVideos((prev) => {
        const exists = prev.find((v) => v.id === event.id);
        if (exists) return prev;

        // const thumb = new Image();
        // thumb.src = `/api/thumbnail?url=${encodeURIComponent(videoUrl[1])}`;

        return [
          ...prev,
          {
            id: event.id,
            pubkey: event.pubkey,
            content: event.content,
            url: videoUrl[1],
            created_at: event.created_at,
            profile,
          },
        ].sort((a, b) => b.created_at - a.created_at);
      });
    }

    lastTimestampRef.current = sorted[sorted.length - 1].created_at;
    setLoading(false);
  }, [hasMore]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  useEffect(() => {
    if (!loading && !preloadedNextPage && videos.length > 0) {
      setPreloadedNextPage(true);
      fetchVideos();
    }
  }, [loading, videos.length, fetchVideos, preloadedNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          fetchVideos();
        }
      },
      {
        root: null,
        rootMargin: "0px 0px 300px 0px",
        threshold: 0.1,
      }
    );

    const current = loaderRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [fetchVideos, loading]);

  return (
    <>
      <TopPillTabs />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}

        {loading && Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)}
      </div>

      <div ref={loaderRef} className="w-full py-10 text-center text-gray-400">
        {loading ? (
          <svg
            className="mx-auto h-8 w-8 text-purple-400 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : hasMore ? (
          "Scroll to load more"
        ) : (
          "No more videos"
        )}
      </div>
    </>
  );
}
