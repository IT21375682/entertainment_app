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


export const bulkCreateMovies = async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : (req.body.items || [])
    if (!items.length) {
      return res.status(200).json({ ok: true, inserted: 0, upserted: 0 })
    }

    const now = new Date()
    const ops = items.map((it) => {
      if (it && typeof it.reference_id === "string" && it.reference_id.trim() !== "") {
        // Upsert by reference_id
        return {
          updateOne: {
            filter: { reference_id: it.reference_id },
            update: {
              $setOnInsert: { ...it, createdAt: now },
              $set: { updatedAt: now }
            },
            upsert: true
          }
        }
      }
      // No reference_id — insert directly
      return { insertOne: { document: it } }
    })

    const result = await Movie.bulkWrite(ops, { ordered: false })
    return res.status(200).json({
      ok: true,
      inserted: result.insertedCount || 0,
      upserted: result.upsertedCount || 0,
      matched: result.matchedCount || 0,
      modified: result.modifiedCount || 0
    })
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ ok: false, code: "DUP_KEY", error: err.message })
    }
    return res.status(500).json({ ok: false, error: err.message })
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
