// models/movie.js
import mongoose from "mongoose"

const movieSchema = new mongoose.Schema(
  {
    reference_id: String, // Unique identifier for dedupe/upsert (optional)

    title: { type: String, required: true },
    description: String,
    content: [String],

    contentImages: [{ index: Number, url: String, alt: String }],
    images: [String],
    thumbnail: String,

    author: String,
    date: String,
    readTime: String,
    category: String,
    tags: [String],

    views: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },

    genre: String,
    type: String
  },
  { timestamps: true }
)

// Optional: prevent duplicates if reference_id is provided
movieSchema.index({ reference_id: 1 }, { unique: true, sparse: true })

export default mongoose.models.Movie || mongoose.model("Movie", movieSchema)
