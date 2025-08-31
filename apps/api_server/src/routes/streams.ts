import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const title = req.body.title || "Untitled";
  const streamKey = uuidv4().replace(/-/g, "");
  const result = await query("INSERT INTO streams (stream_key, user_id, title) VALUES ($1, $2, $3) RETURNING id", [streamKey, req.user!.sub, title]);
  res.json({ id: result.rows[0].id, streamKey, title });
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const result = await query("SELECT id, stream_key, title, created_at, active FROM streams");
  res.json(result.rows);
});

router.get("/verify/:streamKey", async (req, res) => {
  const { streamKey } = req.params;
  const result = await query("SELECT id, active FROM streams WHERE stream_key=$1", [streamKey]);
  const row = result.rows[0];
  if (!row) return res.status(404).json({ ok: false, reason: "no such key" });
  if (!row.active) return res.status(403).json({ ok: false, reason: "key deactivated" });
  res.json({ ok: true });
});

export default router;
