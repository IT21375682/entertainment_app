import express from "express"
import {
  createMovie,
  getAllMovies,
  getFeaturedAndRecentMovies,
  getPaginatedMovies,
  getMovieById,
  bulkCreateMovies
  
} from "../controllers/movieController.js"

const router = express.Router()

router.post("/", createMovie)

router.get("/", getAllMovies)
router.post("/bulk", bulkCreateMovies)
router.get("/featured-and-recent", getFeaturedAndRecentMovies)
router.get("/paginated", getPaginatedMovies)
router.get("/:id", getMovieById)

export default router
