import { Response } from "express";
import fs from "fs";
import path from "path";
import { AuthRequest } from "../middleware/auth";
import pool from "../models/db";
import { generateStreamKey } from "../utils/streamkey";
import { buildMediaUrl } from "../utils/media";


export class StreamController {
  // Helper to ensure uploads directories exist and return saved relative path
  private static ensureUploadsDir(...parts: string[]) {
    const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
    const fullDir = path.join(uploadsDir, ...parts);
    if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });
    return fullDir;
  }

  private static saveUploadedFile(file: Express.Multer.File, subdir: string) {
    // create directory
    const dir = this.ensureUploadsDir(subdir);
    // sanitize filename: timestamp + originalname
    const safeName = `${Date.now()}-${path.basename(file.originalname).replace(/\s+/g, "-")}`;
    const dest = path.join(dir, safeName);
    // move file (multer may have already stored it; handle both)
    try {
      if (file.path && fs.existsSync(file.path)) {
        fs.renameSync(file.path, dest);
      } else if (file.buffer) {
        fs.writeFileSync(dest, file.buffer);
      } else {
        // fallback: write from stream (unlikely)
        throw new Error("Uploaded file missing buffer/path");
      }
    } catch (err) {
      throw err;
    }
    // return relative path from project root (portable)
    return path.relative(process.cwd(), dest);
  }

  // -------------------
  // Create a stream (optional thumbnail upload)
  // -------------------
  static async createStream(req: AuthRequest, res: Response) {
    try {
      const { title, description, scheduled_start } = req.body;
      const userId = req.user?.id;

      if (!title || !scheduled_start) {
        return res.status(400).json({ error: "Title and scheduled start time are required" });
      }

      const streamKey = generateStreamKey();

      // optional thumbnail (multer => req.file)
      let thumbnailRelativePath: string | null = null;
      if (req.file) {
        try {
          thumbnailRelativePath = this.saveUploadedFile(req.file, "thumbnails");
        } catch (err) {
          console.warn("[StreamController] thumbnail save failed:", err);
          // continue without failing creation
        }
      }

      const result = await pool.query(
        `INSERT INTO streams (user_id, title, description, stream_key, scheduled_start, thumbnail_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, title, description || null, streamKey, scheduled_start, thumbnailRelativePath]
      );

      const stream = result.rows[0];
      res.status(201).json({
        ...stream,
        stream_url: buildMediaUrl(`/live/${stream.stream_key}`),
        thumbnail_url: stream.thumbnail_url ? buildMediaUrl(stream.thumbnail_url) : null,
      });
    } catch (error) {
      console.error("[StreamController] createStream error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // -------------------
  // Upload or replace stream thumbnail (separate endpoint)
  // -------------------
  static async uploadStreamThumbnail(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Thumbnail file is required" });

      // Check ownership
      const q = await pool.query("SELECT * FROM streams WHERE id = $1", [id]);
      if (q.rows.length === 0) return res.status(404).json({ error: "Stream not found" });
      const stream = q.rows[0];
      if (stream.user_id !== userId) return res.status(403).json({ error: "Unauthorized" });

      // Save new thumbnail
      let thumbnailRelativePath: string;
      try {
        thumbnailRelativePath = this.saveUploadedFile(file, "thumbnails");
      } catch (err) {
        console.error("[StreamController] thumbnail save failed:", err);
        return res.status(500).json({ error: "Failed to save thumbnail" });
      }

      // delete previous thumbnail if exists (best-effort)
      if (stream.thumbnail_url) {
        try {
          const oldFull = path.resolve(stream.thumbnail_url);
          if (fs.existsSync(oldFull)) fs.unlinkSync(oldFull);
        } catch (e) {
          console.warn("[StreamController] failed to remove old thumbnail:", e);
        }
      }

      // Update DB
      const upd = await pool.query("UPDATE streams SET thumbnail_url = $1 WHERE id = $2 RETURNING *", [thumbnailRelativePath, id]);

      const updated = upd.rows[0];
      res.json({
        ...updated,
        stream_url: buildMediaUrl(`/live/${updated.stream_key}`),
        thumbnail_url: updated.thumbnail_url ? buildMediaUrl(updated.thumbnail_url) : null,
      });
    } catch (error) {
      console.error("[StreamController] uploadStreamThumbnail error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // -------------------
  // Get all streams (with stream_url and thumbnail_url)
  // -------------------
  static async getStreams(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(`
        SELECT s.*, u.username
        FROM streams s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.created_at DESC
      `);

      const rows = result.rows.map((stream) => ({
        ...stream,
        stream_url: buildMediaUrl(`/live/${stream.stream_key}`),
        thumbnail_url: stream.thumbnail_url ? buildMediaUrl(stream.thumbnail_url) : null,
      }));

      res.json(rows);
    } catch (error) {
      console.error("[StreamController] getStreams error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // -------------------
  // Get single stream
  // -------------------
  static async getStream(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT s.*, u.username
         FROM streams s
         JOIN users u ON s.user_id = u.id
         WHERE s.id = $1`,
        [id]
      );

      if (result.rows.length === 0) return res.status(404).json({ error: "Stream not found" });

      const stream = result.rows[0];
      res.json({
        ...stream,
        stream_url: buildMediaUrl(`/live/${stream.stream_key}`),
        thumbnail_url: stream.thumbnail_url ? buildMediaUrl(stream.thumbnail_url) : null,
      });
    } catch (error) {
      console.error("[StreamController] getStream error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // -------------------
  // Update stream live status (only owner)
  // -------------------
  static async updateStreamStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { is_live } = req.body;
      const userId = req.user?.id;

      const result = await pool.query(
        `UPDATE streams SET is_live = $1, actual_start = $2
         WHERE id = $3 AND user_id = $4
         RETURNING *`,
        [is_live, is_live ? new Date() : null, id, userId]
      );

      if (result.rows.length === 0) return res.status(404).json({ error: "Stream not found or unauthorized" });

      const stream = result.rows[0];
      res.json({
        ...stream,
        stream_url: buildMediaUrl(`/live/${stream.stream_key}`),
        thumbnail_url: stream.thumbnail_url ? buildMediaUrl(stream.thumbnail_url) : null,
      });
    } catch (error) {
      console.error("[StreamController] updateStreamStatus error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // -------------------
  // End stream (owner)
  // -------------------
  static async endStream(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const result = await pool.query(
        `UPDATE streams SET is_live = false, actual_end = $1
         WHERE id = $2 AND user_id = $3 RETURNING *`,
        [new Date(), id, userId]
      );

      if (result.rows.length === 0) return res.status(404).json({ error: "Stream not found or unauthorized" });

      const stream = result.rows[0];
      res.json({
        ...stream,
        stream_url: buildMediaUrl(`/live/${stream.stream_key}`),
        thumbnail_url: stream.thumbnail_url ? buildMediaUrl(stream.thumbnail_url) : null,
      });
    } catch (error) {
      console.error("[StreamController] endStream error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // -------------------
  // Get live streams
  // -------------------
  static async getLiveStreams(req: AuthRequest, res: Response) {
    try {
      const result = await pool.query(
        `SELECT s.*, u.username
         FROM streams s
         JOIN users u ON s.user_id = u.id
         WHERE s.is_live = true
         ORDER BY s.actual_start DESC`
      );

      const rows = result.rows.map((stream) => ({
        ...stream,
        stream_url: buildMediaUrl(`/live/${stream.stream_key}`),
        thumbnail_url: stream.thumbnail_url ? buildMediaUrl(stream.thumbnail_url) : null,
      }));

      res.json(rows);
    } catch (error) {
      console.error("[StreamController] getLiveStreams error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
