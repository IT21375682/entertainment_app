import Video from "../models/Video.js"

export const createVideo = async (req, res) => {
  try {
    const video = new Video(req.body)
    await video.save()
    res.status(201).json(video)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

export const getAllVideos = async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 })
  res.json(videos)
}


// Get paginated videos
// Get paginated videos
export const getPaginatedVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const total = await Video.countDocuments()
    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      videos,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch paginated videos" })
  }
}


export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
    if (!video) return res.status(404).json({ error: "Video not found" })
    res.json(video)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
