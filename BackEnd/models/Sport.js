// models/sport.js
import mongoose from "mongoose"

const sportSchema = new mongoose.Schema(
  {
    reference_id: String, // optional unique key for idempotent upsert

    title: { type: String, required: true },
    description: { type: String },
    content: { type: [String] },
    contentImages: [{ index: Number, url: String, alt: String }],

    images: [String],
    thumbnail: String,

    author: String,
    date: String,
    readTime: String,
    category: String,  // "Match Report", "Opinion", "News", ...
    tags: [String],

    views: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },

    sport: String,     // "Football", "Tennis", "Cricket", ...
    type: String       // "News", "Highlight", ...
  },
  { timestamps: true }
)

// Optional but recommended to prevent dupes when reference_id is provided
sportSchema.index({ reference_id: 1 }, { unique: true, sparse: true })

export default mongoose.models.Sport || mongoose.model("Sport", sportSchema)
