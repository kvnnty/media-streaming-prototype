import { Router } from "express";
import { query } from "../db";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const result = await query("SELECT id, title, path, created_at FROM videos ORDER BY created_at DESC");
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { title, path } = req.body;
  if (!title || !path) return res.status(400).json({ message: "title & path required" });
  const result = await query("INSERT INTO videos (title, path) VALUES ($1, $2) RETURNING id", [title, path]);
  res.json({ id: result.rows[0].id });
});

export default router;
