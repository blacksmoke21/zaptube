import Link from "next/link";
import { LazyThumbnail } from "./LazyThumbnail";

type VideoPost = {
  id: string;
  pubkey: string;
  content: string;
  url: string;
  created_at: number;
  profile?: { name: string; picture: string };
};

export function VideoCard({ video }: { video: VideoPost }) {
  return (
    <Link
      key={video.id}
      href={`/watch?id=${video.id}`}
      className="bg-gray-900 rounded-xl p-3 shadow-md hover:ring-2 hover:ring-purple-500 transition"
    >
      <div className="relative pb-[56.25%] mb-2 rounded-md overflow-hidden">
        <LazyThumbnail url={video.url} />
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
  );
}