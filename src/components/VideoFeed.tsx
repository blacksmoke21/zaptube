"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SimplePool } from "nostr-tools/pool";
import Link from "next/link";
import { fetchProfile } from "@/lib/fetchProfile";

type VideoPost = {
  id: string;
  pubkey: string;
  content: string;
  url: string;
  created_at: number;
  profile?: { name: string; picture: string };
};

const PAGE_SIZE = 16;
const relays = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://relay.nostr.band"
];

export default function VideoFeed() {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const lastTimestampRef = useRef<number>(Math.floor(Date.now() / 1000)); // initial time

  const fetchVideos = useCallback(async () => {
    if (!hasMore) return;

    setLoading(true);
    const pool = new SimplePool();

    const events = await pool.querySync(relays, {
      kinds: [21, 34235],
      limit: PAGE_SIZE,
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

      const profile = await fetchProfile(event.pubkey);

      setVideos((prev) => {
        const exists = prev.find((v) => v.id === event.id);
        if (exists) return prev;

        return [
          ...prev,
          {
            id: event.id,
            pubkey: event.pubkey,
            content: event.content,
            url: iMetaTag[1].split(" ")[1],
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

  // 👇 Infinite scroll
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

  const SkeletonCard = () => (
    <div className="bg-gray-800 rounded-xl p-3 animate-pulse">
      <div className="relative pb-[56.25%] mb-2 bg-gray-700 rounded-md" />
      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-600 rounded-full" />
        <div className="h-3 w-1/2 bg-gray-700 rounded" />
      </div>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <Link
            key={video.id}
            href={`/watch?id=${video.id}`}
            className="bg-gray-900 rounded-xl p-3 shadow-md hover:ring-2 hover:ring-purple-500 transition"
          >
            <div className="relative pb-[56.25%] mb-2 rounded-md overflow-hidden">
              <img
                src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                alt="thumbnail"
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>

            <p className="text-md text-gray-300 truncate mb-2">{video.content || "Untitled Video"}</p>

            <div className="flex items-center space-x-2 text-xs text-gray-400">
              {video.profile?.picture ? (
                <img src={video.profile.picture} alt="profile" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-600" />
              )}
              <span>{video.profile?.name || video.pubkey.slice(0, 12)}</span>
              <span>· {new Date(video.created_at * 1000).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}

        {loading &&
          Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={`skeleton-${i}`} />)}
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
