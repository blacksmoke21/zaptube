"use client";
import { useVisible } from "@/hooks/useVisible";

export function LazyThumbnail({ url }: { url: string }) {
  const [ref, isVisible] = useVisible<HTMLDivElement>();

  return (
    <div ref={ref} className="absolute top-0 left-0 w-full h-full object-cover">
      <img
        src={isVisible ? `http://localhost:3000/api/thumbnail?url=${encodeURIComponent(url)}` : "https://i.ytimg.com/"}
        alt="thumbnail"
        className="w-full h-full object-cover"
      />
    </div>
  );
}