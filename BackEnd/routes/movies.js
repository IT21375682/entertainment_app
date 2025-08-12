import express from "express"
import {
  createMovie,
  getAllMovies,
  getFeaturedAndRecentMovies,
  getPaginatedMovies,
  getMovieById
} from "../controllers/movieController.js"

const router = express.Router()

router.post("/", createMovie)
router.get("/", getAllMovies)
router.get("/featured-and-recent", getFeaturedAndRecentMovies)
router.get("/paginated", getPaginatedMovies)
router.get("/:id", getMovieById)

export default router
