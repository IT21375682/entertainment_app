// models/Story.ts
import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true, unique: true },
    summary: String,
    image: String,
    source: String,               // e.g., 'Variety', 'ESPN'
    category: {                   // high-level bucket
      type: String,
      enum: ["sports", "movies", "blogs"],
      required: true,
    },
    tags: [String],
    publishedAt: Date,
    content: String,
  },
  { timestamps: true }
);

export default mongoose.models.Story || mongoose.model("Story", storySchema);
