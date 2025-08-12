// models/TopStory.js
import mongoose from "mongoose"

const topStorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  image: String,
  author: String,
  date: String,
  readTime: String,
  category: { type: String, enum: ["Sports", "Movies", "Blog"], required: true },
  route: { type: String, required: true }, // e.g., "/sports", "/movies", etc.
}, { timestamps: true })

export default mongoose.models.TopStory || mongoose.model("TopStory", topStorySchema)
