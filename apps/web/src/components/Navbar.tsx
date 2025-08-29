"use client";

import { startStream } from "@/lib/api";
import { clearToken } from "@/lib/auth-store";
import Link from "next/link";
import { useState } from "react";

export default function NavBar() {
  const [isStreamInfoModalOpen, setIsStreamInfoModalOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamInfo, setStreamInfo] = useState<{ id: number; streamKey: string; title: string } | null>(null);

  const handleGoLive = async () => {
    try {
      const res = await startStream(streamTitle);
      setStreamInfo(res); // store API response
    } catch (err) {
      console.error("Failed to start stream", err);
    }
  };

  return (
    <nav className="flex justify-between p-4 bg-gray-900 text-white">
      <div className="flex gap-4">
        <Link href="/live" className="underline">
          Live
        </Link>
        <Link href="/videos" className="underline">
          Videos
        </Link>
      </div>
      <div className="flex gap-2">
        <button className="bg-green-600 px-3 py-1 rounded" onClick={() => setIsStreamInfoModalOpen(true)}>
          Go live
        </button>
        <button
          className="bg-red-600 px-3 py-1 rounded"
          onClick={() => {
            clearToken();
            window.location.href = "/login";
          }}>
          Logout
        </button>
      </div>

      {/* Modal */}
      {isStreamInfoModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70">
          <div className="bg-white text-black p-6 rounded-lg w-[500px]">
            {!streamInfo ? (
              <>
                <h2 className="text-lg font-bold mb-4">Enter stream title</h2>
                <input
                  type="text"
                  placeholder="Stream title"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsStreamInfoModalOpen(false)} className="mt-4 bg-gray-300 text-black px-3 py-1 rounded">
                    Close
                  </button>
                  <button onClick={handleGoLive} className="mt-4 bg-blue-600 text-white px-3 py-1 rounded">
                    Go live
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold mb-4">Stream Created 🎉</h2>
                <p>
                  <strong>Title:</strong> {streamInfo.title}
                </p>
                <p>
                  <strong>Stream Key:</strong> {streamInfo.streamKey}
                </p>
                <p>
                  <strong>RTMP URL:</strong> rtmp://localhost:1935/live/{streamInfo.streamKey}
                </p>
                <button onClick={() => setIsStreamInfoModalOpen(false)} className="mt-4 bg-green-600 text-white px-3 py-1 rounded">
                  Done
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
