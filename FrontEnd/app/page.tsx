"use client"

import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Play, Star, Calendar, User, ChevronLeft, ChevronRight, Menu, Bell, Settings } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"



const heroSlides = [
  {
    id: 1,
    title: "The Batman Returns: Behind the Scenes",
    description: "Exclusive interviews and never-before-seen footage from the upcoming sequel",
    image: "/placeholder.svg?height=600&width=1440",
    category: "Movie News",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "Champions League Final Preview",
    description: "Everything you need to know about this weekend's epic showdown",
    image: "/placeholder.svg?height=600&width=1440",
    category: "Sports News",
    readTime: "3 min read",
  },
  {
    id: 3,
    title: "Stranger Things: The Final Season",
    description: "Cast interviews and exclusive clips from the highly anticipated finale",
    image: "/placeholder.svg?height=600&width=1440",
    category: "Video Posts",
    readTime: "8 min watch",
  },
]

 const trendingTags = ["Marvel", "Netflix Originals", "Premier League", "Oscar Winners", "Sci-Fi", "Action", "Drama"]

// const featuredContent = [
//   {
//     id: 1,
//     title: "Top 10 Movies to Watch This Weekend",
//     description: "Our curated list of must-watch films available on streaming platforms",
//     image: "/placeholder.svg?height=300&width=400",
//     category: "Movie News",
//     author: "Sarah Johnson",
//     date: "2 hours ago",
//     readTime: "4 min read",
//   },
//   {
//     id: 2,
//     title: "World Cup Highlights: Best Goals",
//     description: "Relive the most spectacular goals from this year's tournament",
//     image: "/placeholder.svg?height=300&width=400",
//     category: "Sports News",
//     author: "Mike Rodriguez",
//     date: "5 hours ago",
//     readTime: "6 min read",
//   },
//   {
//     id: 3,
//     title: "The Future of Streaming Services",
//     description: "How AI and personalization are changing how we consume content",
//     image: "/placeholder.svg?height=300&width=400",
//     category: "General Blog",
//     author: "Alex Chen",
//     date: "1 day ago",
//     readTime: "7 min read",
//   },
//   {
//     id: 4,
//     title: "Behind the Scenes: Marvel's Latest",
//     description: "Exclusive video content from the set of the newest superhero blockbuster",
//     image: "/placeholder.svg?height=300&width=400",
//     category: "Video Posts",
//     author: "Emma Davis",
//     date: "2 days ago",
//     readTime: "12 min watch",
//   },
// ]



export default function Homepage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [hoveredMovie, setHoveredMovie] = useState<number | null>(null)
  const [movieShowcase,setMovieShowcase] = useState([])
  const [showcases, setShowcases] = useState([])
 // const[featuredContent,setFeaturedContent] = useState([])
   useEffect(() => {
      fetchTrending()
    }, [])
   const fetchTrending = async () => {
    const res = await fetch("http://localhost:5000/api/watch/trending")
    const data = await res.json() 
    setMovieShowcase(data.trending || [])
    console.log("Fetched trending movies:", data.trending) // Debug line
  }
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

    useEffect(() => {
    const fetchShowcases = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/top-stories")
        const data = await res.json()
        setShowcases(data.stories || [])
   
      } catch (err) {
        console.error("Failed to fetch showcases:", err)
      }
    }

    fetchShowcases()
  }, [])


//   const showcases = [
//   {
//     id: "sports",
//     title: "Explore Explosive Sports Updates",
//     description: "Catch the latest match reports, game analyses, and sports insights.",
//     image: "/images/sports-showcase.jpg", // replace with your static asset or CDN URL
//     category: "Sports News",
//     route: "/sports", // destination route
//   },
//   {
//     id: "movies",
//     title: "Dive into Movie News & Highlights",
//     description: "Stay updated on upcoming films, reviews, and exclusive behind-the-scenes.",
//     image: "/images/movies-showcase.jpg",
//     category: "Movie News",
//     route: "/movies",
//   },
//   {
//     id: "blogs",
//     title: "Read In-Depth Blog Articles",
//     description: "Explore our curated blog content covering opinions, trends, and more.",
//     image: "/images/blogs-showcase.jpg",
//     category: "Blogs",
//     route: "/blogs",
//   },
// ]

  return (
    <div className="min-h-screen bg-black text-white">
     

      {/* Hero Section */}
      {/* <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroSlides[currentSlide].image || "/placeholder.svg"}
            alt={heroSlides[currentSlide].title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4 bg-red-600 text-white">
              {heroSlides[currentSlide].category}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">{heroSlides[currentSlide].title}</h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">{heroSlides[currentSlide].description}</p>
            <div className="flex items-center space-x-4 mb-8">
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                Read Article
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-black bg-transparent"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Trailer
              </Button>
            </div>
            <div className="flex items-center text-sm text-gray-400">
              <Calendar className="w-4 h-4 mr-2" />
              {heroSlides[currentSlide].readTime}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
          onClick={prevSlide}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70"
          onClick={nextSlide}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-red-600" : "bg-gray-600"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </section> */}


 <section className="py-16 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8">Explore Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcases.map((item) => (
  <Link key={item.id} href={`${item.route}/${item.id}`}>
    <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors group cursor-pointer">
      <div className="relative overflow-hidden rounded-t-lg">
        <Image
          src={item.image}
          alt={item.title}
          width={400}
          height={300}
          className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
        />
        <Badge className="absolute top-3 left-3 bg-red-600">{item.category}</Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-200 text-lg mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
          {item.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-end text-sm text-red-400 group-hover:underline">
          Explore <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </CardContent>
    </Card>
  </Link>
))}
        </div>
      </div>
    </section>
      {/* Trending Tags */}
      <section className="py-8 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <span className="text-gray-400 whitespace-nowrap">Trending:</span>
            {trendingTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="whitespace-nowrap border-gray-600 bg-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      {/* <section className="py-16 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">Latest Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* {currentSlide.map((item) => (
              <Card
                key={item.id}
                className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    width={400}
                    height={300}
                    className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-red-600">{item.category}</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <User className="w-3 h-3" />
                      <span>{item.author}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span>{item.date}</span>
                      <span>{item.readTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))} 
          </div>
        </div>
      </section> */}

      {/* Movie Showcase */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Watch Movies & Series</h2>
            <Link href="/watch" className="text-red-500 hover:text-red-400 transition-colors">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {movieShowcase.map((movie) => (
              <div
                key={movie.id}
                className="relative group cursor-pointer"
                onMouseEnter={() => setHoveredMovie(movie.id)}
                onMouseLeave={() => setHoveredMovie(null)}
              >
                <div className="relative overflow-hidden rounded-lg">
                  <Image
                    src={movie.image || "/placeholder.svg"}
                    alt={movie.title}
                    width={300}
                    height={450}
                    className="object-cover w-full h-64 md:h-80 group-hover:scale-105 transition-transform duration-300"
                  />

                  {hoveredMovie === movie.id && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col justify-end p-4 transition-opacity duration-300">
                      <h3 className="font-bold text-lg mb-1">{movie.title}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-300">{movie.year}</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm">{movie.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{movie.genre}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {movie.platforms.map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <Play className="w-3 h-3 mr-1" />
                        Watch Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-400 mb-8">
            Get the latest movie news, sports updates, and streaming recommendations delivered to your inbox.
          </p>
          <div className="flex max-w-md mx-auto">
            <Input placeholder="Enter your email" className="rounded-r-none bg-gray-800 border-gray-700" />
            <Button className="rounded-l-none bg-red-600 hover:bg-red-700">Subscribe</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-red-500 mb-4">StreamNews</h3>
              <p className="text-gray-400 text-sm">
                Your ultimate destination for entertainment news and streaming content.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/movie-news" className="hover:text-white transition-colors">
                    Movie News
                  </Link>
                </li>
                <li>
                  <Link href="/sports-news" className="hover:text-white transition-colors">
                    Sports News
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/videos" className="hover:text-white transition-colors">
                    Videos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Streaming</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/watch" className="hover:text-white transition-colors">
                    Watch Now
                  </Link>
                </li>
                <li>
                  <Link href="/trending" className="hover:text-white transition-colors">
                    Trending
                  </Link>
                </li>
                <li>
                  <Link href="/new-releases" className="hover:text-white transition-colors">
                    New Releases
                  </Link>
                </li>
                <li>
                  <Link href="/top-rated" className="hover:text-white transition-colors">
                    Top Rated
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 StreamNews. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
