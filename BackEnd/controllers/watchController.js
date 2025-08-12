import Watch from "../models/watch.js"

// Create a new movie
export const createMovie = async (req, res) => {
  try {
    console.log(typeof req.body.genre, req.body.genre) // <--- Debug line

    const movie = new Watch(req.body)
    await movie.save()
    res.status(201).json(movie)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Get all movies (with filtering, search, pagination)
export const getAllMovies = async (req, res) => {
  try {
    const {
      search = "",
      genre,
      platform,
      year,
      type,
      page = 1,
      limit = 12,
    } = req.query

    console.log("Query parameters:", req.query)

    const query = {}

    if (search) {
      query.title = { $regex: search, $options: "i" }
    }

    if (genre && genre !== "All") {
      query.genre = { $in: [genre] } // ✅ fix
    }

    if (platform && platform !== "All Platforms") {
      query.platforms = { $in: [platform] } // ✅ fix
    }

    if (year && year !== "All Years") {
      query.year = year
    }

    if (type) {
      query.type = type
    }

    const skip = (page - 1) * limit

    const [movies, total] = await Promise.all([
      Watch.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      Watch.countDocuments(query),
    ])

    res.json({
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      movies,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch movies", details: error.message })
  }
}

// Get a single movie by ID
export const getMovieById = async (req, res) => {
  try {
    const movie = await Watch.findById(req.params.id)
    if (!movie) return res.status(404).json({ error: "Movie not found" })
    res.json(movie)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get trending movies
// controllers/movieController.js
export const getTrendingMovies = async (req, res) => {
  try {
    const trending = await Watch.find({ trending: true }).sort({ createdAt: -1 }).limit(12)
    res.json({ trending })  // MUST be wrapped in an object with an array
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

