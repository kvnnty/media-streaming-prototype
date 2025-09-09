import { Request, Response } from "express";
import path from "path";
import { AuthRequest } from "../middleware/auth";
import pool from "../models/db";
import { buildMediaUrl } from "../utils/media";
import { generateStreamKey } from "../utils/streamkey";

export class StreamController {
  static async createStream(req: AuthRequest, res: Response) {
    try {
      const { title, description } = req.body;
      const userId = req.user?.id;
      const file = req.file;

      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      if (!title?.trim()) return res.status(400).json({ error: "Title is required" });
      if (!file) return res.status(400).json({ error: "Thumbnail is required" });

      // Optional: validate image type & size
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ error: "Unsupported image format" });
      }
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) return res.status(400).json({ error: "Thumbnail exceeds size limit" });

      // Paths
      const thumbnailRelativePath = path.relative(process.cwd(), file.path);

      // Generate unique stream key
      const streamKey = generateStreamKey();

      // Insert into DB
      const result = await pool.query(
        `INSERT INTO streams (user_id, title, description, stream_key, thumbnail_url, is_live)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, title.trim(), description?.trim() || null, streamKey, thumbnailRelativePath, false]
      );

      const stream = result.rows[0];

      res.status(201).json({
        ...stream,
        stream_url: buildMediaUrl(`/live/${stream.stream_key}`),
        thumbnail_url: buildMediaUrl(stream.thumbnail_url),
      });
    } catch (error) {
      console.error("[StreamController] createStream error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

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

  static async startStream(req: Request, res: Response) {
    try {
      const { name: streamKey } = req.body;
      console.log("Starting stream with key:", streamKey);

      const result = await pool.query(
        `UPDATE streams SET is_live = true, actual_start = $1
       WHERE stream_key = $2 RETURNING *`,
        [new Date(), streamKey]
      );

      if (result.rows.length === 0) return res.sendStatus(404);

      res.sendStatus(200);
    } catch (error) {
      console.error("[StreamController] startStream error:", error);
      res.sendStatus(500);
    }
  }

  static async endStream(req: Request, res: Response) {
    try {
      const { name: streamKey } = req.body;
      console.log("Ending stream with key:", streamKey);

      const result = await pool.query(
        `UPDATE streams SET is_live = false, actual_end = $1
       WHERE stream_key = $2 RETURNING *`,
        [new Date(), streamKey]
      );

      if (result.rows.length === 0) return res.sendStatus(404);

      res.sendStatus(200);
    } catch (error) {
      console.error("[StreamController] endStream error:", error);
      res.sendStatus(500);
    }
  }

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
