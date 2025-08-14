import express from "express"
import { createBlog, getAllBlogs, getBlogById, getFeaturedAndRecentBlogs ,getPaginatedBlogs, bulkCreateBlogs  } from "../controllers/blogController.js"

const router = express.Router()

router.post("/", createBlog)

router.post("/bulk", bulkCreateBlogs)

router.get("/featured-and-recent", getFeaturedAndRecentBlogs)

router.get("/", getAllBlogs)

router.get("/paginated", getPaginatedBlogs)

router.get("/:id", getBlogById)

export default router
