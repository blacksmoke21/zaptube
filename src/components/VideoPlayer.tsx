"use client";

import { useEffect, useState } from "react";
import { SimplePool } from "nostr-tools/pool";

type VideoPost = {
  id: string;
  pubkey: string;
  content: string;
  url: string;
  created_at: number;
  profile?: { name: string; picture: string };
};

export default function VideoPlayer({ id }: { id: string }) {
  const [video, setVideo] = useState<null | VideoPost>(null);

  useEffect(() => {
    if (!id || id == "") return;

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

  if (!id || id == "") return <div className="text-white p-4">No video ID provided</div>;
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
