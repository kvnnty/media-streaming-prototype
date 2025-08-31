import dotenv from "dotenv";
import NodeMediaServer from "node-media-server";
import path from "path";

dotenv.config();

const FFMPEG_PATH = process.env.FFMPEG_PATH;
if (!FFMPEG_PATH) throw new Error("FFMPEG_PATH env required");

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8081,
    mediaroot: path.join(__dirname, "hls"),
    allow_origin: "*",
  },
  trans: {
    ffmpeg: FFMPEG_PATH,
    tasks: [
      {
        app: "live",
        ac: "aac",
        hls: true,
        hlsFlags: "[hls_time=4:hls_list_size=5:hls_flags=delete_segments]",
        dash: false,
      },
    ],
  },
  webrtc: {
    port: 8888,
    ssl: false,
  },
};

const nms = new NodeMediaServer(config);

nms.on("prePublish", (id, streamPath) => {
  console.log(`[prePublish] Stream starting: ${streamPath}`);
});

nms.on("postPublish", (id, streamPath) => {
  console.log(`[postPublish] Stream active: ${streamPath}`);
});

nms.on("donePublish", (id, streamPath) => {
  console.log(`[donePublish] Stream ended: ${streamPath}`);
});

nms.run();

console.log("Broadcast server running...");
