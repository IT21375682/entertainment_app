"use client"

import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, User, Clock, Bookmark, Share2, Eye, Trophy, Target } from "lucide-react"
import Image from "next/image"
import Link from "next/link"



const sportsCategories = ["All Sports", "Football", "Basketball", "Tennis", "Formula 1", "Olympics", "Baseball", "Golf"]
const sortOptions = ["Latest", "Most Popular", "Most Read", "Oldest"]

const liveScores = [
  { team1: "Manchester United", team2: "Arsenal", score1: 2, score2: 1, status: "FT", league: "Premier League" },
  { team1: "Lakers", team2: "Warriors", score1: 108, score2: 112, status: "Q4 2:34", league: "NBA" },
  { team1: "Real Madrid", team2: "Barcelona", score1: 1, score2: 0, status: "45'", league: "La Liga" },
]





export default function SportsNewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Sports")
  const [sortBy, setSortBy] = useState("Latest")
  const [searchQuery, setSearchQuery] = useState("")
  const [featuredArticles, setFeaturedArticles] = useState([])
  const [regularArticles, setRegularArticles] = useState([])

  useEffect(() => {
  const fetchSportsArticles = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/sports/featured-and-recent`)
      const data = await res.json()
      setFeaturedArticles(data.featured   || [])
      setRegularArticles(data.recent || [])
      console.log(data);
    } catch (err) {
      console.error("Error fetching sports articles:", err)
    }
  }

  fetchSportsArticles()
}, [])

 const filteredFeatured = featuredArticles.filter((article) => {
  const categoryMatch = selectedCategory === "All Sports" || article.sport === selectedCategory
  const searchMatch =
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  return categoryMatch && searchMatch
})

const filteredRegular = regularArticles.filter((article) => {
  const categoryMatch = selectedCategory === "All Sports" || article.sport === selectedCategory
  const searchMatch =
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase())
  return categoryMatch && searchMatch
})


console.log(filteredFeatured,filteredRegular)
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
     

      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative h-96 overflow-hidden">
          <Image src="/placeholder.svg?height=400&width=1440" alt="Sports News" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-5xl font-bold mb-4">Sports News</h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Get the latest sports news, scores, and analysis from around the world
              </p>
            </div>
          </div>
        </section>

        {/* Live Scores */}
        <section className="py-6 bg-gray-950 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-500" />
                Live Scores
              </h2>
              <Link href="/scores" className="text-red-500 hover:text-red-400 text-sm">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {liveScores.map((match, index) => (
           
                <Card key={index} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {match.league}
                      </Badge>
                      <span className="text-xs text-red-500 font-medium">{match.status}</span>
                    </div>
                    <div className="flex items-center text-white justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{match.team1}</p>
                        <p className="font-medium text-sm">{match.team2}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{match.score1}</p>
                        <p className="font-bold text-lg">{match.score2}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
     
              ))}
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-6 bg-gray-950 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 overflow-x-auto">
                {sportsCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "primary"}
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

              <div className="flex items-center space-x-4">
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
          </div>
        </section>

        {/* Featured Articles */}
        {filteredFeatured.length > 0 && (
          <section className="py-12 bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold mb-8 flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-red-500" />
                Featured Stories
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredArticles.map((article, index) => (
                  <Link href={`/sports-news/${article.id}`}>
                  <Card
                    key={article._id}
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
                        className={`font-bold mb-3 group-hover:text-red-400 text-gray-300 transition-colors ${
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
              <h2 className="text-2xl font-bold">Latest Sports News</h2>
              <span className="text-gray-400">{filteredFeatured.length} articles</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRegular.map((article) => (
                <Link href={`/sports-news/${article._id}`}>
                <Card
                  key={article.id}
                  className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors group cursor-pointer"
                >
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
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-300 group-hover:text-red-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{article.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs border-gray-600">
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

            {/* Load More Button */}
            <div className="text-center mt-12">
              <Link href="/sports-news/view-all">
              <Button className="bg-red-600 hover:bg-red-700">Load More Articles</Button>
              </Link>
            </div>
          </div>  
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay in the Game</h2>
            <p className="text-gray-400 mb-8">
              Get the latest sports news, scores, and analysis delivered straight to your inbox.
            </p>
            <div className="flex max-w-md mx-auto">
              <Input placeholder="Enter your email" className="rounded-r-none bg-gray-800 border-gray-700" />
              <Button className="rounded-l-none bg-red-600 hover:bg-red-700">Subscribe</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
