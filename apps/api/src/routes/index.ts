import { Router } from "express";
import authRoutes from "./auth";
import streamRoutes from "./streams";
import videoRoutes from "./videos";

const router: Router = Router();

router.use("/auth", authRoutes);
router.use("/streams", streamRoutes);
router.use("/videos", videoRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

export default router;
