import mongoose from "mongoose"

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String }, // short intro / summary
    content: { type: [String] },   // paragraphs of content

    contentImages: [
      {
        index: Number,             // insert image after which paragraph
        url: String,
        alt: String,
      },
    ],

    images: [String],              // optional: additional gallery images
    thumbnail: String,             // main header image

    author: String,
    date: String,                  // manually assigned or auto (use createdAt)
    readTime: String,
    category: String,              // e.g., "Review", "News", "Interview"
    tags: [String],

    views: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },

    genre: String,                 // e.g., "Action", "Drama"
    type: String,                  // e.g., "Movie", "Series", "Trailer"
  },
  { timestamps: true }
)

export default mongoose.models.Movie || mongoose.model("Movie", movieSchema)
