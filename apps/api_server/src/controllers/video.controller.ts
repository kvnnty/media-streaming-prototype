import { Response } from "express";
import fs from "fs";
import path from "path";
import { AuthRequest } from "../middleware/auth";
import pool from "../models/db";
import { FFmpegUtils } from "../utils/ffmpeg";
import { buildMediaUrl } from "../utils/media";

export class VideoController {
  // -------------------
  // 1. Upload Video
  // -------------------
  static async uploadVideo(req: AuthRequest, res: Response) {
    try {
      const { title, description } = req.body;
      const userId = req.user?.id;
      const file = req.file;

      if (!file) return res.status(400).json({ error: "Video file is required" });
      if (!title) return res.status(400).json({ error: "Title is required" });

      // Validate video type & size
      const allowedTypes = ["video/mp4", "video/quicktime"];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Unsupported video format" });
      }

      if (file.size > 1_500_000_000) {
        // 1.5GB max
        return res.status(400).json({ error: "Video exceeds size limit" });
      }

      // Ensure uploads directories exist
      const uploadsDir = process.env.UPLOADS_DIR || "./uploads";
      const videosDir = path.join(uploadsDir, "videos");
      const thumbnailsDir = path.join(uploadsDir, "thumbnails");

      [uploadsDir, videosDir, thumbnailsDir].forEach((dir) => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      });

      // Move file to uploads/videos (optional if using multer diskStorage)
      const videoFilename = `${Date.now()}-${file.originalname}`;
      const videoPath = path.join(videosDir, videoFilename);
      fs.renameSync(file.path, videoPath);

      // Generate thumbnail
      const thumbnailPath = path.join(thumbnailsDir, `${Date.now()}-thumb.jpg`);
      try {
        await FFmpegUtils.generateThumbnail(videoPath, thumbnailPath);
      } catch (error) {
        console.warn("Thumbnail generation failed:", error);
      }

      // Get duration
      const duration = await FFmpegUtils.getVideoDuration(videoPath);

      // Save record to DB (store relative paths)
      const result = await pool.query(
        `INSERT INTO videos (user_id, title, description, file_path, thumbnail_url, duration) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, title, description, path.relative(process.cwd(), videoPath), path.relative(process.cwd(), thumbnailPath), Math.floor(duration)]
      );

      const video = result.rows[0];
      res.status(201).json({
        ...video,
        file_path: buildMediaUrl(video.file_path),
        thumbnail_url: buildMediaUrl(video.thumbnail_url),
      });
    } catch (error) {
      console.error("[VideoController] uploadVideo error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // -------------------
  // 2. Get all videos
  // -------------------
  static async getVideos(req: AuthRequest, res: Response) {
    try {
      const { search } = req.query;

      let query = `
        SELECT v.*, u.username
        FROM videos v
        JOIN users u ON v.user_id = u.id
      `;
      const params: any[] = [];

      if (search) {
        query += " WHERE v.title ILIKE $1 OR v.description ILIKE $1";
        params.push(`%${search}%`);
      }

      query += " ORDER BY v.created_at DESC";

      const result = await pool.query(query, params);
      const videos = result.rows.map((video) => ({
        ...video,
        file_path: buildMediaUrl(video.file_path),
        thumbnail_url: buildMediaUrl(video.thumbnail_url),
      }));

      res.json(videos);
    } catch (error) {
      console.error("[VideoController] getVideos error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // -------------------
  // 3. Get single video
  // -------------------
  static async getVideo(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Increment view count
      await pool.query("UPDATE videos SET view_count = view_count + 1 WHERE id = $1", [id]);

      const result = await pool.query(
        `SELECT v.*, u.username
         FROM videos v
         JOIN users u ON v.user_id = u.id
         WHERE v.id = $1`,
        [id]
      );

      if (result.rows.length === 0) return res.status(404).json({ error: "Video not found" });

      const video = result.rows[0];
      res.json({
        ...video,
        file_path: buildMediaUrl(video.file_path),
        thumbnail_url: buildMediaUrl(video.thumbnail_url),
      });
    } catch (error) {
      console.error("[VideoController] getVideo error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // -------------------
  // 4. Stream video (byte-range)
  // -------------------
  static async streamVideo(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const result = await pool.query("SELECT file_path FROM videos WHERE id = $1", [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Video not found" });

      const videoPath = path.resolve(result.rows[0].file_path);
      if (!fs.existsSync(videoPath)) return res.status(404).json({ error: "Video file not found" });

      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": "video/mp4",
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = { "Content-Length": fileSize, "Content-Type": "video/mp4" };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (error) {
      console.error("[VideoController] streamVideo error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // -------------------
  // 5. Get thumbnail
  // -------------------
  static async getThumbnail(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT thumbnail_url FROM videos WHERE id = $1", [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Video not found" });

      const thumbnailPath = path.resolve(result.rows[0].thumbnail_url);
      if (!fs.existsSync(thumbnailPath)) return res.status(404).json({ error: "Thumbnail not found" });

      res.sendFile(thumbnailPath);
    } catch (error) {
      console.error("[VideoController] getThumbnail error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
