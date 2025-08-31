"use client";

import { getStreams } from "@/lib/api";
import { getAuth } from "@/lib/auth-store";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LivePage() {
  const [streams, setStreams] = useState<any>([]);
  const { user } = getAuth();

  useEffect(() => {
    getStreams()
      .then(setStreams)
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <div style={{ padding: 20 }}>
        <h2 className="text-3xl">Live Streams and broadcasts</h2>
        <div className="grid grid-cols-3 gap-5 mt-10">
          {streams.length === 0 ? (
            <p className="text-gray-500">No live streams</p>
          ) : (
            streams.map((s: any) => (
              <div key={s.stream_key} style={{ marginBottom: 10 }} className="bg-gray-100 rounded-2xl p-8 space-y-5">
                <h1 className="text-xl">{s.title}</h1>

                <Link href={`/live/${s.stream_key}`} className="bg-black text-white px-4 py-3">
                  {user.role === "user" ? "Join live broadcast" : "Go live broadcast"}
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
