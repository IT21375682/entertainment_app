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
