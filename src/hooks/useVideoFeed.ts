import { useCallback, useEffect, useRef, useState } from "react";
import { SimplePool } from "nostr-tools/pool";
import { fetchProfile } from "@/lib/fetchProfile";

export type VideoPost = {
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
  "wss://relay.nostr.band",
];

export function useVideoFeed() {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastTimestampRef = useRef<number>(Math.floor(Date.now() / 1000));
  const loadedIds = useRef<Set<string>>(new Set());

  const fetchVideos = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const pool = new SimplePool();

    try {
      const events = await pool.querySync(relays, {
        kinds: [21, 34235],
        limit: PAGE_SIZE,
        until: lastTimestampRef.current,
      });

      const filtered = events
        .filter((e) => {
          const hasImeta = e.tags.some((t) => t[0] === "imeta");
          return hasImeta && !loadedIds.current.has(e.id);
        })
        .sort((a, b) => b.created_at - a.created_at);

      if (filtered.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      const newVideos: VideoPost[] = [];

      for (const event of filtered) {
        const iMetaTag = event.tags.find((t) => t[0] === "imeta");
        if (!iMetaTag || !iMetaTag[1]) continue;

        loadedIds.current.add(event.id);

        const profile = await fetchProfile(event.pubkey);

        newVideos.push({
          id: event.id,
          pubkey: event.pubkey,
          content: event.content,
          url: iMetaTag[1].split(" ")[1],
          created_at: event.created_at,
          profile,
        });
      }

      setVideos((prev) =>
        [...prev, ...newVideos].sort((a, b) => b.created_at - a.created_at)
      );

      // Update the `until` timestamp for pagination
      lastTimestampRef.current =
        filtered[filtered.length - 1].created_at - 1;
    } catch (err) {
      console.error("Error fetching videos:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    fetchVideos(); // initial load
  }, [fetchVideos]);

  return { videos, loading, hasMore, fetchVideos };
}
