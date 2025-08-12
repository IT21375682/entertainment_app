"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Eye } from "lucide-react"

export default function PaginatedBlogPage() {
  const [blogs, setBlogs] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const limit = 10

 useEffect(() => {
  const fetchBlogs = async () => {
    const res = await fetch(`http://localhost:5000/api/blogs/paginated?page=${page}&limit=${limit}`)
    const data = await res.json()

    // Append only if page > 1, otherwise reset
    if (page === 1) {
      setBlogs(data.blogs)
    } else {
      setBlogs((prev) => [...prev, ...data.blogs])
    }

    if (data.blogs.length < limit || data.page >= data.totalPages) {
      setHasMore(false)
    } else {
      setHasMore(true)
    }
  }

  fetchBlogs()
}, [page])

useEffect(() => {
  setBlogs([])         // clear old data
  setPage(1)           // start fresh
  setHasMore(true)     // reset hasMore
}, []) // Only runs once on mount


  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">All Blog Posts</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((post) => (
            <Link href={`/blog/${post._id}`} key={post._id}>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:bg-gray-800">
                <Image src={post.image || "/placeholder.svg"} alt={post.title} width={400} height={200} className="rounded mb-4 w-full h-48 object-cover" />
                <Badge variant="outline" className="text-xs mb-2">{post.category}</Badge>
                <h2 className="text-lg font-bold mb-2">{post.title}</h2>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{post.description}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</div>
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</div>
                  <div className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-10">
            <Button onClick={() => setPage((prev) => prev + 1)} className="bg-red-600 hover:bg-red-700">
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
