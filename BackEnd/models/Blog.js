// models/blog.js
import mongoose from "mongoose"

const blogSchema = new mongoose.Schema({
  reference_id: String, // Unique identifier for the blog post
  title: String,
  description: String,
  content: [String],
  contentImages: [{ index: Number, url: String, alt: String }],
  image: String,
  author: String,
  date: String,
  readTime: String,
  category: String,
  tags: [String],
  views: String,
  comments: Number,
  featured: Boolean,
  type: String
}, { timestamps: true })


// OPTIONAL: prevent duplicates when reference_id is provided
blogSchema.index({ reference_id: 1 }, { unique: true, sparse: true })

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema)
