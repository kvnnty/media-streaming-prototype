import { Router } from "express";
import { StreamController } from "../controllers/stream.controller";
import { requireAuth } from "../middleware/auth";
import { uploadImage } from "../middleware/multer/image-upload";

const router: Router = Router();

router.post("/", requireAuth, uploadImage.single("thumbnail"), StreamController.createStream);
router.get("/", StreamController.getStreams);
router.get("/live", StreamController.getLiveStreams);
router.get("/:id", StreamController.getStream);
router.post("/start", StreamController.startStream);
router.post("/end", StreamController.endStream);

export default router;
