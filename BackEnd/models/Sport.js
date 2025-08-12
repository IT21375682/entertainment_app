import mongoose from "mongoose"

const sportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String }, // short intro / summary
    content: { type: [String] },   // paragraphs of content
    contentImages: [
      {
        index: Number,             // after which paragraph to insert
        url: String,
        alt: String,
      },
    ],

    images: [String],              // gallery / related images
    thumbnail: String,            // main header image (optional)

    author: String,
    date: String,                 // display-only, or you can use createdAt
    readTime: String,
    category: String,             // e.g., "Match Report", "Opinion", "News"
    tags: [String],
    views: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    sport: String,                // e.g., "Football", "Tennis", "Cricket"

    type: String,                 // optional (e.g., "News", "Highlight")
  },
  { timestamps: true }
)

export default mongoose.models.Sport || mongoose.model("Sport", sportSchema)
