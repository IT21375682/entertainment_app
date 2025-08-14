import Blog from "../models/Blog.js"

export const createBlog = async (req, res) => {
  try {
    const blog = new Blog(req.body)
    await blog.save()
    res.status(201).json(blog)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}


//create bulks with reference_id


export const bulkCreateBlogs = async (req, res) => {
  try {
    // Accept either an array or { items: [...] }
    const items = Array.isArray(req.body) ? req.body : (req.body.items || [])
    if (!items.length) {
      return res.status(200).json({ ok: true, inserted: 0, upserted: 0 })
    }

    const now = new Date()
    const ops = items.map((it) => {
      if (it && typeof it.reference_id === "string" && it.reference_id.trim() !== "") {
        // Upsert by reference_id (idempotent)
        return {
          updateOne: {
            filter: { reference_id: it.reference_id },
            update: {
              // on first insert, write everything + createdAt
              $setOnInsert: { ...it, createdAt: now },
              // on every run, at least bump updatedAt; add fields here if you want to keep them in sync
              $set: { updatedAt: now },
            },
            upsert: true,
          },
        }
      }
      // No reference_id → plain insert (duplicates are possible)
      return { insertOne: { document: it } }
    })

    const result = await Blog.bulkWrite(ops, { ordered: false })
    return res.status(200).json({
      ok: true,
      inserted: result.insertedCount || 0,
      upserted: result.upsertedCount || 0,
      matched: result.matchedCount || 0,
      modified: result.modifiedCount || 0,
    })
  } catch (err) {
    // Duplicate key errors (if unique index enabled) will land here
    if (err?.code === 11000) {
      return res.status(409).json({ ok: false, code: "DUP_KEY", error: err.message })
    }
    return res.status(500).json({ ok: false, error: err.message })
  }
}



export const getAllBlogs = async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 })
  res.json(blogs)
}

// Get blogs by category for latest blogs
export const getFeaturedAndRecentBlogs = async (req, res) => {
  try {
    const featured = await Blog.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(6)

    const recent = await Blog.find({ featured: false })
      .sort({ createdAt: -1 })
      .limit(6)

    res.json({ featured, recent })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" })
    console.error("Error fetching featured and recent blogs:", error)
  }
}


//get paginated blogs

export const getPaginatedBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    console.log(`Fetching page ${page} with limit ${limit}`)

    const total = await Blog.countDocuments()
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      blogs
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blogs" })
  }
}





export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) return res.status(404).json({ error: "Blog not found" })
    res.json(blog)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
