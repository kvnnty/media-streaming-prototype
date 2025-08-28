import NodeMediaServer from "node-media-server";
import axios from "axios";

const API_URL = process.env.API_URL;
if (!API_URL) throw new Error("API_URL env required");

const FFMPEG_PATH = process.env.FFMPEG_PATH || "/usr/bin/ffmpeg";

const config = {
  rtmp: { port: 1935, chunk_size: 60000, gop_cache: true, ping: 30, ping_timeout: 60 },
  http: { port: 8000, mediaroot: "./hls", allow_origin: "*" },
  trans: {
    ffmpeg: FFMPEG_PATH,
    tasks: [
      {
        app: "live",
        ac: "aac",
        hls: true,
        hlsFlags: "[hls_time=4:hls_list_size=5:hls_flags=delete_segments]",
        dash: false,
        mp4: true,
        mp4Flags: "[movflags=+faststart]",
      },
    ],
  },
};

const nms = new NodeMediaServer(config);

nms.on("prePublish", async (id, StreamPath) => {
  
  // StreamPath from frontend looks like: /live/{streamKey}
  const parts = StreamPath.split("/");
  const streamKey = parts[parts.length - 1];

  try {
    const res = await axios.get(`${API_URL}/verify-stream/${streamKey}`, { timeout: 3000 });
    if (!res.data?.ok) {
      const session = nms.getSession(id);
      // session?.reject();
      console.log("Publish rejected", streamKey, "reason:", res.data?.reason);
    } else {
      console.log("Publish allowed", streamKey);
    }
  } catch (err: any) {
    console.error("Verify stream error", err.message);
    // nms.getSession(id)?.reject();
  }
});

nms.on("postPublish", (id, StreamPath) => console.log("postPublish", id, StreamPath));

nms.on("donePublish", (id, StreamPath) => {
  console.log("donePublish", id, StreamPath);
  // Detect the mp4 file in recordings and call API to register VOD
});

nms.run();
