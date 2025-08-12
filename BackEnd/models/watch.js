import mongoose from "mongoose"

const watchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: String,
  rating: Number,
  genre: [String],           // ✅ array of strings
  image: String,
  platforms: [String],       // ✅ array of strings
  description: String,
  director: String,
  cast: [String],            // ✅ array of strings
  duration: String,
  trending: Boolean,
  type: { type: String, enum: ["movie", "series"], default: "movie" }  // optional enum
}, { timestamps: true })

export default mongoose.models.Watch || mongoose.model("Watch", watchSchema)
