import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";

import pool from "./models/db";
import router from "./routes";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directories exist
const uploadsDir = process.env.UPLOADS_DIR || "./uploads";
const videosDir = path.join(uploadsDir, "videos");
const thumbnailsDir = path.join(uploadsDir, "thumbnails");

[uploadsDir, videosDir, thumbnailsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Routes
app.use("/api", router)

// Serve static files
app.use("/uploads", express.static(uploadsDir));

// Socket.io for real-time chat
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-stream", (streamId) => {
    socket.join(`stream-${streamId}`);
    console.log(`User ${socket.id} joined stream ${streamId}`);
  });

  socket.on("send-message", async (data) => {
    const { streamId, userId, username, message } = data;

    try {
      // Save message to database (optional)
      await pool.query("INSERT INTO chat_messages (stream_id, user_id, message) VALUES ($1, $2, $3)", [streamId, userId, message]);

      // Broadcast message to all users in the stream
      io.to(`stream-${streamId}`).emit("new-message", {
        id: Date.now().toString(),
        stream_id: streamId,
        user_id: userId,
        username,
        message,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error saving chat message:", error);
    }
  });

  socket.on("leave-stream", (streamId) => {
    socket.leave(`stream-${streamId}`);
    console.log(`User ${socket.id} left stream ${streamId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
