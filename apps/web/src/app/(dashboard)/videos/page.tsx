"use client";

import VideoPlayer from "@/components/VideoPlayer";
import { getVODs } from "@/lib/api";
import { useEffect, useState } from "react";

export default function VODPage() {
  const [vods, setVODs] = useState<any>([]);
  const [current, setCurrent] = useState<any>(null);

  useEffect(() => {
    getVODs()
      .then(setVODs)
      .catch((err: any) => console.error(err));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>VOD Library</h2>
      {vods.length === 0 && <p>No videos</p>}
      {vods.map((v: any) => (
        <div key={v.id} style={{ marginBottom: 10 }}>
          <button onClick={() => setCurrent(v)}>{v.title}</button>
        </div>
      ))}
      {current && (
        <div style={{ marginTop: 20 }}>
          <h3>{current.title}</h3>
          <VideoPlayer url={`http://localhost:8000/${current.path}`} />
        </div>
      )}
    </div>
  );
}
