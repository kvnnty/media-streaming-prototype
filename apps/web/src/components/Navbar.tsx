"use client";

import { startStream } from "@/lib/api";
import { clearAuth, getAuth } from "@/lib/auth-store";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const [isStreamInfoModalOpen, setIsStreamInfoModalOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const router = useRouter();

  const { user } = getAuth();

  const handleGoLive = async () => {
    try {
      const res = await startStream(streamTitle);
      setIsStreamInfoModalOpen(false);
      router.push(`/live/${res.streamKey}`);
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
        {user.role === "broadcaster" && (
          <button className="bg-green-600 px-3 py-1 rounded" onClick={() => setIsStreamInfoModalOpen(true)}>
            Go live
          </button>
        )}
        <button
          className="bg-red-600 px-3 py-1 rounded"
          onClick={() => {
            clearAuth();
            window.location.href = "/login";
          }}>
          Logout
        </button>
      </div>

      {/* Modal */}
      {isStreamInfoModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="bg-white text-black p-6 rounded-lg w-[500px]">
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
          </div>
        </div>
      )}
    </nav>
  );
}
