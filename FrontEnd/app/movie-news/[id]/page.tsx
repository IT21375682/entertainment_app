"use client"

import { useEffect, useState } from "react"
import { useParams, notFound } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, Eye, User } from "lucide-react"

export default function ArticleDetailPage() {
  const params = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/movies/${params.id}`)
        if (!res.ok) {
          throw new Error("Failed to fetch article")
        }
        const data = await res.json()
        setArticle(data)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchArticle()
    }
  }, [params.id])

  if (loading) return <div className="text-center text-white mt-20">Loading...</div>
  if (error || !article) return notFound()

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 pt-16 md:px-8">
      <div className="max-w-4xl pt-1 mx-auto">
        <div className="mb-6">
          <Badge variant="secondary" className="mb-2">
            {article.category}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex flex-wrap text-sm text-gray-400 gap-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{article.readTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.views} views</span>
            </div>
          </div>
        </div>

        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
          <Image
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            width={800}
            height={400}
            className="w-full object-cover h-64"
          />
        </Card>

        <div className="mt-6 text-lg text-gray-300 space-y-4">
          <p>{article.description}</p>
          {/* You can expand here to support full content rendering */}
        </div>

        {article.tags?.length > 0 && (
          <div className="mt-8 flex gap-2 flex-wrap">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs border-gray-600">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
