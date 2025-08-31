"use client";
import Hls from "hls.js";
import { useEffect, useRef } from "react";

export default function VideoPlayer({ url }: { url: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
      return () => hls.destroy();
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    }
  }, [url]);

  return (
    <div>
      <video ref={videoRef} controls autoPlay playsInline style={{ width: "100%", maxWidth: 900 }} />;<p>Currently watching: 0</p>
      <p>Time elapsed: 00:00:00</p>
    </div>
  );
}
