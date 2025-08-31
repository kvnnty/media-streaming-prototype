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
      <h2 className="text-3xl">Videos Library and previously streamed broadcasts</h2>
      <div className="grid grid-cols-3 gap-5 mt-10">
        {vods.length === 0 ? (
          <p className="text-gray-500">No videos</p>
        ) : (
          vods.map((v: any) => (
            <div key={v.id} style={{ marginBottom: 10 }}>
              <button onClick={() => setCurrent(v)}>{v.title}</button>
            </div>
          ))
        )}
      </div>
      {current && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="bg-white text-black p-6 rounded-lg w-[600px]">
            <h3>{current.title}</h3>
            <VideoPlayer url={`http://localhost:8000/${current.path}`} />
          </div>
        </div>
      )}
    </div>
  );
}
