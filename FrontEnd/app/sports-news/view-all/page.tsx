"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, Eye } from "lucide-react"

export default function PaginatedSportsPage() {
  const [sports, setSports] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const limit = 10

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/sports/paginated?page=${page}&limit=${limit}`)
        const data = await res.json()

        if (page === 1) {
          setSports(data.sports)
        } else {
          setSports((prev) => [...prev, ...data.sports])
        }

        if (data.sports.length < limit || data.page >= data.totalPages) {
          setHasMore(false)
        } else {
          setHasMore(true)
        }
      } catch (error) {
        console.error("Failed to fetch sports articles", error)
        setHasMore(false)
      }
    }

    fetchSports()
  }, [page])

  useEffect(() => {
    setSports([])
    setPage(1)
    setHasMore(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">All Sports News</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((post) => (
            <Link href={`/sports-news/${post._id}`} key={post._id}>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:bg-gray-800">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="rounded mb-4 w-full h-48 object-cover"
                />
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
