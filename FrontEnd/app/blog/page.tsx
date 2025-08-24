"use client"

import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, User, Clock, Bookmark, Share2, Eye, TrendingUp, MessageCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"



const blogCategories = ["All", "Technology", "Industry", "Psychology", "Filmmaking", "Global", "Business", "Marketing"]
const sortOptions = ["Latest", "Most Popular", "Most Commented", "Oldest"]

const trendingTopics = [
  { topic: "Streaming Wars", count: "45 articles" },
  { topic: "AI in Entertainment", count: "32 articles" },
  { topic: "International Content", count: "28 articles" },
  { topic: "Box Office Analysis", count: "24 articles" },
  { topic: "Future of Cinema", count: "19 articles" },
]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("Latest")
  const [searchQuery, setSearchQuery] = useState("")
  const [featuredPostsDB, setFeaturedPosts] = useState([])
  const [regularPostsDB, setRegularPosts] = useState([])

    useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/blogs/featured-and-recent`)
        const data = await res.json()
        setFeaturedPosts(data.featured || [])
        setRegularPosts(data.recent || [])
        console.log("Fetched blogs:", data)
      } catch (err) {
        console.error("Failed to fetch blogs:", err)
      }
    }

    fetchBlogs()
  }, [])

  const blogPosts = [...featuredPostsDB, ...regularPostsDB]

  const filteredPosts = blogPosts.filter((post) => {
    const categoryMatch = selectedCategory === "All" || post.category === selectedCategory
    const searchMatch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase())
    return categoryMatch && searchMatch
  })

  const featuredPosts = filteredPosts.filter((post) => post.featured)
  const regularPosts = filteredPosts.filter((post) => !post.featured)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
    

      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative h-96 overflow-hidden">
          <Image src="/placeholder.svg?height=400&width=1440" alt="Blog" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-5xl font-bold mb-4">Entertainment Blog</h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Deep insights, analysis, and thought-provoking articles about the entertainment industry
              </p>
            </div>
          </div>
        </section>

        {/* Trending Topics */}
        <section className="py-8 bg-gray-950 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-red-500" />
                Trending Topics
              </h2>
            </div>
            <div className="flex items-center space-x-4 overflow-x-auto">
              {trendingTopics.map((topic) => (
                <Card
                  key={topic.topic}
                  className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer min-w-fit"
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-200 text-sm mb-1">{topic.topic}</h3>
                    <p className="text-xs text-gray-400">{topic.count}</p>
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
                {blogCategories.map((category) => (
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
                  <SelectTrigger className="w-40 bg-gray-900 border-gray-700">
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

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-12 bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold mb-8">Featured Articles</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredPosts.map((post, index) => (
                  <Link href={`/blog/${post._id}`}>
                  <Card
                    key={post._id}
                    className={`bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors group cursor-pointer ${
                      index === 0 ? "lg:col-span-2" : ""
                    }`}
                  >
                    <div className="relative overflow-hidden">
                      <Image
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        width={600}
                        height={index === 0 ? 300 : 400}
                        className={`object-cover w-full group-hover:scale-105 transition-transform duration-300 ${
                          index === 0 ? "h-64" : "h-48"
                        }`}
                      />
                      <Badge className="absolute top-4 left-4 bg-red-600">Featured</Badge>
                      <Badge variant="secondary" className="absolute top-4 right-4">
                        {post.type}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="secondary" className="border-gray-600">
                          {post.category}
                        </Badge>
                      </div>
                      <h3
                        className={`font-bold mb-3 text-gray-300 group-hover:text-red-400 transition-colors ${
                          index === 0 ? "text-2xl" : "text-xl"
                        }`}
                      >
                        {post.title}
                      </h3>
                      <p className="text-gray-400 mb-4 line-clamp-2">{post.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{post.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.comments}</span>
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

        {/* Regular Posts */}
        <section className="py-12 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Latest Articles</h2>
              <span className="text-gray-400">{filteredPosts.length} articles</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <Link href={`/blog/${post._id}`}>
                <Card
                  key={post._id}
                  className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors group cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      width={400}
                      height={250}
                      className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge variant="secondary" className="absolute top-3 left-3">
                      {post.type}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="text-xs border-gray-600">
                        {post.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-200 group-hover:text-red-400 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.description}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs border-gray-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-2">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span>{post.date}</span>
                        <span>{post.readTime}</span>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>{post.comments}</span>
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
              <Link href="/blog/view-all">
              <Button className="bg-red-600 hover:bg-red-700">Load More Articles</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-gray-400 mb-8">
              Get exclusive insights, behind-the-scenes content, and thought-provoking articles delivered to your inbox.
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
