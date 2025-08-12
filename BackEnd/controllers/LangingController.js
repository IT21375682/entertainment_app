// controllers/topStoryController.js
import TopStory from "../models/TopStory.js"

export const createTopStory = async (req, res) => {
  try {
    const story = new TopStory(req.body)
    await story.save()
    res.status(201).json(story)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

export const getTopStories = async (req, res) => {
  try {
    const stories = await TopStory.find().sort({ createdAt: -1 })
    res.json({ stories })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
