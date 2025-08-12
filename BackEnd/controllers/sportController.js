import Sport from "../models/Sport.js"

// Create a sport article
export const createSport = async (req, res) => {
  try {
    const sport = new Sport(req.body)
    await sport.save()
    res.status(201).json(sport)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Get all sport articles
export const getAllSports = async (req, res) => {
  try {
    const sports = await Sport.find().sort({ createdAt: -1 })
    res.json(sports)
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sports articles" })
  }
}

// Get featured and recent (non-featured) sports articles
export const getFeaturedAndRecentSports = async (req, res) => {
  try {
    const featured = await Sport.find({ featured: true }).sort({ createdAt: -1 }).limit(6)
    const recent = await Sport.find({ featured: false }).sort({ createdAt: -1 }).limit(6)

    res.json({ featured, recent })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch featured and recent sports articles" })
  }
}

// Get paginated sports articles
export const getPaginatedSports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const total = await Sport.countDocuments()
    const sports = await Sport.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      sports,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch paginated sports articles" })
  }
}

// Get a sport article by ID
export const getSportById = async (req, res) => {
  try {
    const sport = await Sport.findById(req.params.id)
    if (!sport) return res.status(404).json({ error: "Sport article not found" })
    res.json(sport)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
