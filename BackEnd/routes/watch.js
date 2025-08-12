import express from "express"
import {
  createMovie,
  getAllMovies,
  getMovieById,
  getTrendingMovies,
} from "../controllers/watchController.js"

const router = express.Router()

// Create
router.post("/", createMovie)

// Read
router.get("/", getAllMovies) // with filtering, search, pagination
router.get("/trending", getTrendingMovies)

router.get("/:id", getMovieById)

export default router
