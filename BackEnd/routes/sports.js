import express from "express"
import {
  createSport,
  getAllSports,
  getSportById,
  getFeaturedAndRecentSports,
  getPaginatedSports,
  bulkCreateSports
} from "../controllers/sportController.js"

const router = express.Router()

router.post("/", createSport)
router.get("/", getAllSports)
router.post("/bulk", bulkCreateSports)
router.get("/featured-and-recent", getFeaturedAndRecentSports)
router.get("/paginated", getPaginatedSports)
router.get("/:id", getSportById)

export default router
