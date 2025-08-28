"use client";

import VideoPlayer from "@/components/VideoPlayer";
import { useParams } from "next/navigation";

export default function LiveStreamPage() {
  const params = useParams();
  const streamKey = params.streamKey;
  const url = `http://localhost:8000/live/${streamKey}/index.m3u8`;

  return (
    <>
      <div style={{ padding: 20 }}>
        <h2>Live Stream</h2>
        <VideoPlayer url={url} />
      </div>
    </>
  );
}
