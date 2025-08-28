"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth-store";
import { getStreams } from "@/lib/api";

export default function LivePage() {
  const [streams, setStreams] = useState<any>([]);

  useEffect(() => {
    const token = getToken();
    getStreams()
      .then(setStreams)
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <div style={{ padding: 20 }}>
        <h2>Live Streams</h2>
        {streams.length === 0 ? (
          <p>No live streams</p>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {streams.map((s: any) => (
              <div key={s.stream_key} style={{ marginBottom: 10 }} className="bg-gray-300 rounded-2xl p-8 space-y-4">
                <h1 className="text-2xl">{s.title}</h1>
                <Link href={`/live/${s.stream_key}`} className="underline">Join live stream</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
