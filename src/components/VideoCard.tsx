import Link from "next/link";
import timeAgo from "@/utils/timeAgo";
import { useEffect, useState } from "react";

type VideoPost = {
  id: string;
  pubkey: string;
  content: string;
  url: string;
  created_at: number;
  profile?: { name: string; picture: string };
};

export function VideoCard({ video }: { video: VideoPost }) {
  const fallbackUrl = "https://i.ytimg.com";
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    fetchMetadata(video.url);
  }, [video.url]);

  const fetchMetadata = async (url: string) => {
    try {
      const response = await fetch(`/api/thumbnail?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error("Failed to fetch metadata");
      const data = await response.json();
      setThumbnail(data.thumbnail);
      setDuration(data.duration);
    } catch (error) {
      setThumbnail(null);
      setDuration(null);
    }
  };

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  return (
    <Link
      key={video.id}
      href={`/watch?id=${video.id}`}
      className="bg-gray-900 rounded-xl p-3 shadow-md hover:ring-2 hover:ring-purple-500 transition"
    >
      <div className="relative pb-[56.25%] mb-2 rounded-md overflow-hidden bg-black">
        <div className="absolute top-0 left-0 w-full h-full object-cover">
          <img
            src={thumbnail ?? fallbackUrl}
            alt="thumbnail"
            className={"w-full h-full object-cover transition-opacity duration-300"}
          />

          {duration !== null && (
            <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
              {formatDuration(duration)}
            </div>
          )}
        </div>
      </div>
      <p className="text-md text-gray-300 truncate mb-2">{video.content || "Untitled Video"}</p>
      <div className="flex items-center space-x-2 text-xs text-gray-400">
        {video.profile?.picture ? (
          <img src={video.profile.picture} alt="profile" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-600" />
        )}
        <span>{video.profile?.name || video.pubkey.slice(0, 12)}</span>
        <span>· {timeAgo(video.created_at)}</span>
      </div>
    </Link>
  );
}
