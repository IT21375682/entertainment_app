"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  Calendar,
  User,
  Clock,
  Bookmark,
  Share2,
  Eye,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const categories = [
  "All",
  "Marvel",
  "DC",
  "Awards",
  "Sci-Fi",
  "Action",
  "Streaming",
  "Horror",
  "Comedy",
  "Drama",
]
const sortOptions = ["Latest", "Most Popular", "Most Read", "Oldest"]

export default function MovieNewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("Latest")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [featuredArticles, setFeaturedArticles] = useState([])
  const [regularArticles, setRegularArticles] = useState([])

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/movies/featured-and-recent")
        const data = await res.json()
        setFeaturedArticles(data.featured || [])
        setRegularArticles(data.recent || [])
      } catch (err) {
        console.error("Error fetching movie articles:", err)
      }
    }

    fetchMovies()
  }, [])

  const filterArticles = (articles) =>
    articles.filter((article) => {
      const categoryMatch =
        selectedCategory === "All" || article.category === selectedCategory
      const searchMatch =
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description?.toLowerCase().includes(searchQuery.toLowerCase())
      return categoryMatch && searchMatch
    })

  const filteredFeatured = filterArticles(featuredArticles)
  const filteredRegular = filterArticles(regularArticles)

  const loadMoreArticles = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative h-96 overflow-hidden">
          <Image
            src="/placeholder.svg?height=400&width=1440"
            alt="Movie News"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-5xl font-bold mb-4">Movie News</h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Stay updated with the latest movie news, reviews, and industry insights
              </p>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-6 bg-gray-950 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 overflow-x-auto">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-red-600 hover:bg-red-700"
                        : "border-gray-700 hover:bg-gray-800"
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 bg-gray-900 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        {filteredFeatured.length > 0 && (
          <section className="py-12 bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold mb-8">Featured Stories</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredFeatured.map((article, index) => (
                  <Link
                    href={`/movie-news/${article._id}`}
                    key={article._id}
                    className="contents"
                  >
                    <Card
                      className={`bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors group cursor-pointer ${
                        index === 0 ? "lg:col-span-2" : ""
                      }`}
                    >
                      <div className="relative overflow-hidden">
                        <Image
                          src={article.image || "/placeholder.svg"}
                          alt={article.title}
                          width={600}
                          height={index === 0 ? 300 : 400}
                          className={`object-cover w-full group-hover:scale-105 transition-transform duration-300 ${
                            index === 0 ? "h-64" : "h-48"
                          }`}
                        />
                        <Badge className="absolute top-4 left-4 bg-red-600">Featured</Badge>
                        <Badge variant="secondary" className="absolute top-4 right-4">
                          {article.category}
                        </Badge>
                      </div>
                      <CardContent className="p-6">
                        <h3
                          className={`font-bold mb-3 group-hover:text-red-400 transition-colors ${
                            index === 0 ? "text-2xl" : "text-xl"
                          }`}
                        >
                          {article.title}
                        </h3>
                        <p className="text-gray-400 mb-4 line-clamp-2">{article.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{article.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{article.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{article.readTime}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{article.views}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="w-6 h-6">
                              <Bookmark className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-6 h-6">
                              <Share2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Regular Articles */}
        <section className="py-12 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Latest News</h2>
              <span className="text-gray-400">{filteredRegular.length} articles</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRegular.map((article) => (
                <Link href={`/movie-news/${article._id}`} key={article._id} className="contents">
                  <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors group cursor-pointer">
                    <div className="relative overflow-hidden">
                      <Image
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        width={400}
                        height={250}
                        className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
                      />
                      <Badge variant="secondary" className="absolute top-3 left-3">
                        {article.category}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{article.description}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {article.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-gray-600">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <User className="w-3 h-3" />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span>{article.date}</span>
                          <span>{article.readTime}</span>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.views}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/movie-news/view-all">
              <Button
                onClick={loadMoreArticles}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? "Loading..." : "Load More Articles"}
              </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
