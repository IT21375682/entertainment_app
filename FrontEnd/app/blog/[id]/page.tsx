"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  Clock,
  Eye,
  Bookmark,
  Share2,
  ThumbsUp,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function BlogPostPage() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/blogs/${id}`)
        const data = await res.json()
        setArticle(data)
      } catch (error) {
        console.error("Failed to load article", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchArticle()
  }, [id])

  if (loading) return <div className="text-white p-10">Loading...</div>
  if (!article) return <div className="text-red-500 p-10">Article not found.</div>

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Link href="/blog" className="text-red-500 hover:text-red-400">Blog</Link>
            <span className="text-gray-500">/</span>
            <Badge variant="secondary">{article.category}</Badge>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">{article.title}</h1>
          <p className="text-xl text-gray-300 mb-8">{article.description}</p>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={article.authorAvatar || "/placeholder.svg"} alt={article.author} />
                <AvatarFallback>{article.author[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{article.author}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{article.readTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{article.views}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon"><Bookmark className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon"><Share2 className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon"><ThumbsUp className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative mb-12 rounded-lg overflow-hidden">
          <Image
            src={article.image || "/placeholder.svg"}
            alt={article.title}
            width={800}
            height={400}
            className="w-full h-96 object-cover"
          />
        </div>

        {/* Article Content */}
      <div className="text-gray-300 leading-relaxed space-y-6 mb-12">
  {article.content?.map((para, idx) => (
    <div key={idx}>
      <p>{para}</p>

      {article.contentImages?.map((img) =>
        img.index === idx + 1 ? (
          <div key={img.url} className="my-6">
            <Image
              src={img.url}
              alt={img.alt || `Image for ${article.title}`}
              width={800}
              height={400}
              className="rounded-lg object-cover w-full"
            />
          </div>
        ) : null
      )}
    </div>
  ))}
</div>


        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags?.map((tag) => (
            <Badge key={tag} variant="default" className="border-gray-600">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Article Footer */}
        <div className="flex items-center justify-between py-6 border-t border-gray-800">
          <div className="flex items-center space-x-4">
            <Button variant="outline"><ThumbsUp className="w-4 h-4 mr-2" />{article.likes}</Button>
            <Button variant="outline"><MessageCircle className="w-4 h-4 mr-2" />{article.comments}</Button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            Share:
            <Button variant="ghost" size="icon"><Facebook className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon"><Twitter className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon"><Instagram className="w-4 h-4" /></Button>
          </div>
        </div>
      </article>
    </div>
  )
}
