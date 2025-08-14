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

// Bulk create or upsert sport articles

export const bulkCreateSports = async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : (req.body.items || [])
    if (!items.length) {
      return res.status(200).json({ ok: true, inserted: 0, upserted: 0 })
    }

    const now = new Date()
    const ops = items.map((it) => {
      const hasRef =
        it && typeof it.reference_id === "string" && it.reference_id.trim() !== ""

      if (hasRef) {
        // Idempotent upsert by reference_id
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

      // No reference_id → plain insert (duplicates possible)
      return { insertOne: { document: it } }
    })

    const result = await Sport.bulkWrite(ops, { ordered: false })
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
