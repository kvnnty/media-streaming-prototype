"use client";

import VideoPlayer from "@/components/VideoPlayer";
import { getAuth } from "@/lib/auth-store";
import Broadcast from "./components/Broadcast";
import { use } from "react";

export default function LiveStreamPage({ params }: { params: Promise<{ streamkey: string }> }) {
  const { streamkey } = use(params);
  const { user } = getAuth();

  const url = `http://localhost:8081/live/${streamkey}/index.m3u8`;

  return (
    <>
      {user.role === "broadcaster" ? (
        <Broadcast streamKey={streamkey} />
      ) : (
        <div style={{ padding: 20 }}>
          <h2>Live Stream</h2>
          <VideoPlayer url={url} />
        </div>
      )}
    </>
  );
}
