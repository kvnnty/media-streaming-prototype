import bcrypt from "bcrypt";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { query } from "../db";
import { User } from "../types";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET as string;

router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "username, password and role are required" });
  }

  try {
    const existing = await query("SELECT id FROM users WHERE username=$1", [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await query("INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role", [username, hashedPassword, role]);

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await query("SELECT * FROM users WHERE username=$1", [username]);
    const user: User | undefined = result.rows[0];
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ sub: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
