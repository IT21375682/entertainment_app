"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Play, Star, ChevronDown, X } from "lucide-react"
import Image from "next/image"

const genres = ["All", "Action", "Adventure", "Comedy", "Crime", "Drama", "Fantasy", "Horror", "Sci-Fi", "Thriller"]
const platforms = ["All Platforms", "Netflix", "HBO Max", "Disney+", "Amazon Prime", "Paramount+", "Apple TV+"]
const years = ["All Years", "2024", "2023", "2022", "2021", "2020", "2019", "2018"]

export default function WatchPage() {
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms")
  const [selectedYear, setSelectedYear] = useState("All Years")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [movies, setMovies] = useState([])
  const [trending, setTrending] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const limit = 9


useEffect(() => {
  setPage(1)
  fetchMovies(true)
}, [selectedGenre, selectedPlatform, selectedYear])

useEffect(() => {
  if (page > 1) {
    fetchMovies()
  }
}, [page])

  useEffect(() => {
    fetchTrending()
  }, [])

  const fetchMovies = async (reset = false) => {
  const params = new URLSearchParams()
  if (selectedGenre !== "All") params.append("genre", selectedGenre)
  if (selectedPlatform !== "All Platforms") params.append("platform", selectedPlatform)
  if (selectedYear !== "All Years") params.append("year", selectedYear)
  params.append("page", reset ? 1 : page)
  params.append("limit", limit)

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/watch?${params.toString()}`)
  const data = await res.json()

  if (reset) {
    setMovies(data.movies || [])
  } else {
    setMovies((prev) => [...prev, ...(data.movies || [])])
  }

  setHasMore(data.totalPages > page)
}


  const fetchTrending = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/watch/trending`)
    const data = await res.json()
    setTrending(data.trending || [])
    console.log("Fetched trending movies:", data.trending) // Debug line
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="relative h-96 overflow-hidden">
        <Image src="/placeholder.svg?height=400&width=1440" alt="Hero" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-4">
          <div>
            <h1 className="text-5xl font-bold mb-4">Watch Movies & Series</h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Discover and stream the latest movies and TV series from all major platforms
            </p>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.map((movie) => (
              <div key={movie._id} className="relative group cursor-pointer" onClick={() => setSelectedMovie(movie)}>
                <div className="relative overflow-hidden rounded-lg">
                  <Image src={movie.image || "/placeholder.svg"} alt={movie.title} width={300} height={450} className="object-cover w-full h-64" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <Badge className="absolute top-2 left-2 bg-red-600">Trending</Badge>
                </div>
                <h3 className="font-semibold mt-2 text-sm">{movie.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="border-gray-700">
                <Filter className="w-4 h-4 mr-2" /> Filters <ChevronDown className={`w-4 h-4 ml-2 ${showFilters ? "rotate-180" : ""}`} />
              </Button>

              {showFilters && (
                <>
                  <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                    <SelectTrigger className="w-32 bg-gray-900 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="w-40 bg-gray-900 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32 bg-gray-900 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {movies.map((movie) => (
              <div key={movie._id} className="group cursor-pointer" onClick={() => setSelectedMovie(movie)}>
                <div className="relative overflow-hidden rounded-lg">
                  <Image
                    src={movie.image || "/placeholder.svg"}
                    alt={movie.title}
                    width={300}
                    height={450}
                    className="object-cover w-full h-80 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold mt-3">{movie.title}</h3>
              </div>
            ))}
          </div>
          {hasMore && (
  <div className="text-center mt-8">
    <Button onClick={() => setPage((prev) => prev + 1)} className="bg-red-600 hover:bg-red-700">
      Load More
    </Button>
  </div>
)}

        </div>
      </section>

      {/* Movie Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <Image
                src={selectedMovie.image || "/placeholder.svg"}
                alt={selectedMovie.title}
                width={800}
                height={400}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-black/50 hover:bg-black/70" onClick={() => setSelectedMovie(null)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedMovie.title}</h2>
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-gray-400">{selectedMovie.year}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span>{selectedMovie.rating}</span>
                    </div>
                    <span className="text-gray-400">{selectedMovie.duration}</span>
                  </div>
                </div>
                <Button size="lg" className="bg-red-600 hover:bg-red-700">
                  <Play className="w-5 h-5 mr-2" /> Watch Now
                </Button>
              </div>

              <p className="text-gray-300 mb-6">{selectedMovie.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Director</h3>
                  <p className="text-gray-400">{selectedMovie.director}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Cast</h3>
                  <p className="text-gray-400">{selectedMovie.cast?.join(", ")}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Available on</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMovie.platforms?.map((platform) => (
                    <Badge key={platform} variant="secondary">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
