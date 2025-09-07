import { Router } from "express";
import { StreamController } from "../controllers/stream.controller";
import { requireAuth } from "../middleware/auth";

const router: Router = Router();

router.post("/", requireAuth, StreamController.createStream);
router.get("/", StreamController.getStreams);
router.get("/live", StreamController.getLiveStreams);
router.get("/:id", StreamController.getStream);
router.patch("/:id/status", requireAuth, StreamController.updateStreamStatus);
router.post("/:id/end", requireAuth, StreamController.endStream);

export default router;
