import express from "express"
import { createVideo, getAllVideos, getVideoById,getPaginatedVideos } from "../controllers/videoController.js"

const router = express.Router()

router.post("/", createVideo)
router.get("/", getAllVideos)
router.get("/paginated", getPaginatedVideos)
router.get("/:id", getVideoById)

export default router
