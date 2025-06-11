// src/app/watch/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SimplePool } from "nostr-tools/pool";

export default function WatchPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [video, setVideo] = useState<null | any>(null);

  useEffect(() => {
    if (!id) return;

    const pool = new SimplePool();
    const sub = pool.subscribeMany(["wss://relay.damus.io", "wss://nos.lol"], [{ ids: [id] }], {
      onevent(event) {
        const iMetaTag = event.tags.find((t) => t[0] === "imeta");
        if (!iMetaTag || !iMetaTag[1]) return;
        
        setVideo({
          id: event.id,
          url: iMetaTag[1].split(" ")[1],
          content: event.content,
          pubkey: event.pubkey,
          created_at: event.created_at,
        });
      },
      oneose() {
        console.log("done loading");
      },
    });

    return () => sub.close();
  }, [id]);

  if (!video) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <video src={video.url} controls className="w-full max-w-4xl mx-auto rounded-lg mb-4" />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-lg font-bold mb-2">{video.content || "Untitled"}</h1>
        <p className="text-sm text-gray-400 mb-2">
          Posted by <span className="font-mono">{video.pubkey.slice(0, 12)}...</span> ·{" "}
          {new Date(video.created_at * 1000).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
