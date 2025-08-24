"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Calendar,
  User,
  Play,
  Eye,
  ThumbsUp,
  MessageCircle,
} from "lucide-react"
import Image from "next/image"

export default function VideosPage() {
  const [videos, setVideos] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [playingId, setPlayingId] = useState(null)
  const limit = 6

  const fetchVideos = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/videos/paginated?page=${page}&limit=${limit}`)
    const data = await res.json()

    setVideos((prev) => [...prev, ...data.videos])
    if (data.videos.length < limit || page >= data.totalPages) setHasMore(false)
  }

  useEffect(() => {
    fetchVideos()
  }, [page])

    const getThumbnail = (video) => {
   // if (video.thumbnail) return video.thumbnail
    if (video.videoUrl?.includes("youtube.com/embed/")) {
      const id = video.videoUrl.split("/embed/")[1]?.split("?")[0]
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    }
    return "/placeholder.svg"
  }

  

  const loadMoreVideos = () => setPage((prev) => prev + 1)

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <section className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Latest Videos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => {
              // Extract YouTube ID for thumbnail fallback
              const youtubeId = video.videoUrl?.split("/embed/")[1]?.split("?")[0]
              const fallbackThumbnail = youtubeId
                ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                : "/placeholder.svg"

              return (
                <Card
                  key={video._id}
                  className="bg-gray-900 border-gray-800 hover:bg-gray-800 group cursor-pointer"
                  onClick={() => setPlayingId(video._id)}
                >
                  <div className="relative overflow-hidden">
                    {playingId === video._id ? (
                      <iframe
                        src={video.videoUrl}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-48"
                      />
                    ) : (
                      <>
                        <Image
                          src={getThumbnail(video) || fallbackThumbnail}
                          alt={video.title}
                          width={400}
                          height={250}
                          className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 flex items-center justify-center transition-colors">
                          <div className="bg-red-600 rounded-full p-3 group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </>
                    )}
                    <Badge variant="secondary" className="absolute top-3 left-3">
                      {video.category}
                    </Badge>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{video.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {video.uploadedBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {video.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {video.views}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {hasMore && (
            <div className="text-center mt-10">
              <Button onClick={loadMoreVideos} className="bg-red-600 hover:bg-red-700">
                Load More Videos
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
