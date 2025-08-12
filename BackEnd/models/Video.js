import mongoose from "mongoose"

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  videoUrl: { type: String, required: true },
  thumbnail: String,
  uploadedBy: String,
  date: String,
  category: String,
  tags: [String],
  views: Number,
  featured: Boolean,
}, { timestamps: true })

export default mongoose.models.Video || mongoose.model("Video", videoSchema)
