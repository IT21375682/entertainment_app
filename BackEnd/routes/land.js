// routes/topStories.js
import express from "express"
import { createTopStory, getTopStories } from "../controllers/LangingController.js"

const router = express.Router()

router.post("/", createTopStory)    // POST /api/top-stories
router.get("/", getTopStories)      // GET /api/top-stories

export default router
