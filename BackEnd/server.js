import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import compression from "compression" 

import movieRoutes from "./routes/movies.js"
import sportRoutes from "./routes/sports.js"
import blogRoutes from "./routes/blogs.js"
import videoRoutes from "./routes/videos.js"
import watchRoutes from "./routes/watch.js"
import topStoriesRoutes from "./routes/land.js"
import storiesRouter from "./routes/story.js";

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

// Increase body limits (tune as needed)
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))
app.use(compression())

app.use("/api/movies", movieRoutes)
app.use("/api/sports", sportRoutes)
app.use("/api/blogs", blogRoutes)
app.use("/api/videos", videoRoutes)
app.use("/api/watch", watchRoutes)
app.use("/api/top-stories",topStoriesRoutes )
app.use("/api/stories", storiesRouter);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .then(() => {
    app.listen(5000, () => console.log("Server running on port 5000"))
  })
  .catch((err) => console.error("MongoDB connection failed", err))
