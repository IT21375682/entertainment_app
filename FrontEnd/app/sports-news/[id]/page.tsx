"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Eye, User } from "lucide-react"

export default function SportsArticlePage() {
  const { id } = useParams()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchArticle = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/sports/${id}`)
        if (!res.ok) throw new Error("Not found")
        const data = await res.json()
        setArticle(data)
      } catch (err) {
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id])

  if (loading) return <div className="text-white p-8">Loading...</div>
  if (!article) return notFound()

  const images = article.images && article.images.length > 0 ? article.images : [article.image || "/placeholder.svg"]

  return (
    <div className="min-h-screen bg-black text-white py-12 pt-16 px-4 md:px-8">
      <div className="max-w-5xl pt-1 mx-auto">
        <div className="mb-4">
          <Badge className="bg-red-600">{article.sport}</Badge>
          <h1 className="text-4xl font-bold mt-4 mb-2">{article.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {article.author}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {article.date}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readTime}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {article.views} views
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {images.map((img: string, i: number) => (
            <Image
              key={i}
              src={img}
              alt={`${article.title} - ${i + 1}`}
              width={600}
              height={400}
              className="rounded-md object-cover w-full h-64 border border-gray-800"
            />
          ))}
        </div>

        {/* Description (supports string or string[]) */}
        {Array.isArray(article.description) ? (
          article.description.map((para: string, i: number) => (
            <p key={i} className="text-lg text-gray-300 mb-6">{para}</p>
          ))
        ) : (
          <p className="text-lg text-gray-300 mb-6">{article.description}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {article.tags?.map((tag: string) => (
            <Badge key={tag} variant="default" className="border-gray-700 text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
