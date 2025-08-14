// routes/story.js
import express from "express"
import { bulkUpsertStories,getAllStories } from "../controllers/storyController.js"

const router = express.Router()

router.get("/", getAllStories) // GET /api/stories
router.post("/bulk", bulkUpsertStories)

export default router
