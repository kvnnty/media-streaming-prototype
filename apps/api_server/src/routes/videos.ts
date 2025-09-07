import { Router } from "express";
import { VideoController } from "../controllers/video.controller";
import { requireAuth } from "../middleware/auth";
import { uploadVideo } from "../middleware/upload";

const router: Router = Router();

router.post("/upload", requireAuth, uploadVideo.single("video"), VideoController.uploadVideo);
router.get("/", VideoController.getVideos);
router.get("/:id", VideoController.getVideo);
router.get("/:id/stream", VideoController.streamVideo);
router.get("/:id/thumbnail", VideoController.getThumbnail);

export default router;
