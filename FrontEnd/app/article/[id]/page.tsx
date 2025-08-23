"use client"

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

const article = {
  id: 1,
  title: "Marvel's Phase 5: Everything We Know So Far",
  description:
    "A comprehensive breakdown of upcoming Marvel movies and series, including release dates, cast announcements, and plot theories.",
  content: `
    <p>Marvel Studios has officially unveiled their ambitious Phase 5 lineup, and fans have plenty to be excited about. From highly anticipated sequels to brand new characters making their MCU debut, the next phase promises to expand the Marvel Cinematic Universe in unprecedented ways.</p>
    
    <h2>The Big Picture</h2>
    <p>Phase 5 represents a crucial turning point for the MCU, following the conclusion of the Infinity Saga and the introduction of the multiverse concept. Kevin Feige and his team are carefully crafting a narrative that will set up the next major crossover event while introducing fresh faces and exploring new corners of the Marvel universe.</p>
    
    <h2>Confirmed Movies and Release Dates</h2>
    <p>Here's what we know about the confirmed theatrical releases:</p>
    <ul>
      <li><strong>Guardians of the Galaxy Vol. 3</strong> - May 5, 2023</li>
      <li><strong>The Marvels</strong> - July 28, 2023</li>
      <li><strong>Blade</strong> - November 3, 2023</li>
      <li><strong>Captain America: New World Order</strong> - May 3, 2024</li>
      <li><strong>Thunderbolts</strong> - July 26, 2024</li>
    </ul>
    
    <h2>Disney+ Series</h2>
    <p>The streaming platform will continue to play a crucial role in Phase 5 storytelling:</p>
    <ul>
      <li><strong>Secret Invasion</strong> - Spring 2023</li>
      <li><strong>Loki Season 2</strong> - Summer 2023</li>
      <li><strong>Ironheart</strong> - Fall 2023</li>
      <li><strong>Agatha: Coven of Chaos</strong> - Winter 2023</li>
      <li><strong>Daredevil: Born Again</strong> - Spring 2024</li>
    </ul>
    
    <h2>New Characters and Casting</h2>
    <p>Phase 5 will introduce several major characters to the MCU. Mahershala Ali's Blade has been highly anticipated since his voice cameo in Eternals, while the Fantastic Four are finally set to make their proper MCU debut. The X-Men integration remains a closely guarded secret, but rumors suggest we may see the first mutants appear before Phase 5 concludes.</p>
    
    <h2>Multiverse Implications</h2>
    <p>Following the events of Doctor Strange in the Multiverse of Madness and Loki, the multiverse concept will continue to play a significant role. This opens up possibilities for variant characters, alternate timelines, and potentially the return of previous Marvel movie actors in new roles.</p>
    
    <h2>What This Means for Fans</h2>
    <p>Phase 5 represents both an ending and a beginning. While we're saying goodbye to some beloved characters, we're also being introduced to the next generation of heroes who will carry the MCU forward. The interconnected storytelling that made the Infinity Saga so compelling is being rebuilt with new foundations and fresh perspectives.</p>
    
    <p>As always with Marvel, expect the unexpected. The studio has become masters of misdirection and surprise reveals, so while this roadmap gives us a general idea of what's coming, there are sure to be plenty of surprises along the way.</p>
  `,
  image: "/placeholder.svg?height=400&width=800",
  author: {
    name: "Sarah Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    bio: "Senior Entertainment Writer with 8 years covering Marvel and DC content",
    social: {
      twitter: "@sarahjohnson",
      instagram: "@sarahjmovies",
    },
  },
  date: "2 hours ago",
  readTime: "8 min read",
  category: "Marvel",
  tags: ["Marvel", "MCU", "Phase 5", "Movies", "Disney+"],
  views: "12.5K",
  likes: 847,
  comments: 156,
  publishedAt: "March 15, 2024",
}

const relatedArticles = [
  {
    id: 2,
    title: "The Batman 2: Production Updates and Cast News",
    image: "/placeholder.svg?height=200&width=300",
    category: "DC",
    readTime: "5 min read",
  },
  {
    id: 3,
    title: "Oscars 2024: Predictions and Analysis",
    image: "/placeholder.svg?height=200&width=300",
    category: "Awards",
    readTime: "12 min read",
  },
  {
    id: 4,
    title: "Dune: Part Three Officially Announced",
    image: "/placeholder.svg?height=200&width=300",
    category: "Sci-Fi",
    readTime: "6 min read",
  },
]

export default function ArticlePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-red-500">
              TrendStream
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/movie-news" className="text-gray-300 hover:text-white transition-colors">
                Movie News
              </Link>
              <Link href="/sports-news" className="text-gray-300 hover:text-white transition-colors">
                Sports News
              </Link>
              <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                Blog
              </Link>
              <Link href="/videos" className="text-gray-300 hover:text-white transition-colors">
                Videos
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Link href="/movie-news" className="text-red-500 hover:text-red-400 transition-colors">
                Movie News
              </Link>
              <span className="text-gray-500">/</span>
              <Badge variant="secondary">{article.category}</Badge>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">{article.title}</h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">{article.description}</p>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={article.author.avatar || "/placeholder.svg"} alt={article.author.name} />
                  <AvatarFallback>
                    {article.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{article.author.name}</p>
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
                <Button variant="outline" size="icon" className="border-gray-700 bg-transparent">
                  <Bookmark className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-gray-700 bg-transparent">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-gray-700 bg-transparent">
                  <ThumbsUp className="w-4 h-4" />
                </Button>
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
          <div className="prose prose-invert prose-lg max-w-none mb-12">
            <div
              dangerouslySetInnerHTML={{ __html: article.content }}
              className="text-gray-300 leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-white [&>h2]:mt-8 [&>h2]:mb-4 [&>p]:mb-6 [&>ul]:mb-6 [&>ul]:pl-6 [&>li]:mb-2 [&>li]:list-disc [&>strong]:text-white"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="border-gray-600">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Article Footer */}
          <div className="flex items-center justify-between py-6 border-t border-gray-800">
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-gray-700 bg-transparent">
                <ThumbsUp className="w-4 h-4 mr-2" />
                {article.likes}
              </Button>
              <Button variant="outline" className="border-gray-700 bg-transparent">
                <MessageCircle className="w-4 h-4 mr-2" />
                {article.comments}
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Share:</span>
              <Button variant="ghost" size="icon">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </article>

        {/* Author Bio */}
        <section className="bg-gray-950 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={article.author.avatar || "/placeholder.svg"} alt={article.author.name} />
                    <AvatarFallback>
                      {article.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{article.author.name}</h3>
                    <p className="text-gray-400 mb-4">{article.author.bio}</p>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">Follow:</span>
                      <Link
                        href={`https://twitter.com/${article.author.social.twitter.slice(1)}`}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        {article.author.social.twitter}
                      </Link>
                      <Link
                        href={`https://instagram.com/${article.author.social.instagram.slice(1)}`}
                        className="text-pink-400 hover:text-pink-300 transition-colors"
                      >
                        {article.author.social.instagram}
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Related Articles */}
        <section className="py-12 bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <Card
                  key={relatedArticle.id}
                  className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors group cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={relatedArticle.image || "/placeholder.svg"}
                      alt={relatedArticle.title}
                      width={300}
                      height={200}
                      className="object-cover w-full h-40 group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge variant="secondary" className="absolute top-3 left-3">
                      {relatedArticle.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">
                      {relatedArticle.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{relatedArticle.readTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-400 mb-8">
              Get the latest movie news and updates delivered straight to your inbox.
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Button className="rounded-l-none bg-red-600 hover:bg-red-700">Subscribe</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
