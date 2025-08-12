import Movie from "../models/Movie.js"

// Create a new movie article
export const createMovie = async (req, res) => {
  try {
    const movie = new Movie(req.body)
    await movie.save()
    res.status(201).json(movie)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Get all movie articles
export const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 })
    res.json(movies)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch movies" })
  }
}

// Get featured and recent (non-featured) movie articles
export const getFeaturedAndRecentMovies = async (req, res) => {
  try {
    const featured = await Movie.find({ featured: true }).sort({ createdAt: -1 }).limit(6)
    const recent = await Movie.find({ featured: false }).sort({ createdAt: -1 }).limit(6)

    res.json({ featured, recent })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch featured and recent movies" })
  }
}

// Get paginated movie articles
export const getPaginatedMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const total = await Movie.countDocuments()
    const movies = await Movie.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      movies,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch paginated movies" })
  }
}

// Get movie article by ID
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
    if (!movie) return res.status(404).json({ error: "Movie not found" })
    res.json(movie)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
