import mongoose from "mongoose"

const blogSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: [String],
  contentImages: [
    {
      index: Number,      // position after which to insert
      url: String,
      alt: String,
    }
  ],  
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


export default mongoose.models.Blog || mongoose.model("Blog", blogSchema)
