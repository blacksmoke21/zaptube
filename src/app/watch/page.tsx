import VideoPlayer from "@/components/VideoPlayer";
import { notFound } from "next/navigation";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function WatchPage({ searchParams }: Props) {
  const params = await searchParams;
  const id = params.id;

  if (!id) {
    notFound();
  }

  return <VideoPlayer id={id} />;
}
