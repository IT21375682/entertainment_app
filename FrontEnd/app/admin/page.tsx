"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Plus,
  Trash2,
  Upload,
  Eye,
  BarChart3,
  Users,
  FileText,
  ImageIcon,
  Settings,
  MessageSquare,
  TrendingUp,
  Activity,
  Edit,
  Save,
  Star,
} from "lucide-react"
import Link from "next/link"

// Mock data for articles
const initialArticles = [
  {
    id: 1,
    title: "Marvel's Phase 5: Everything We Know So Far",
    status: "Published",
    views: "12.5K",
    date: "2 hours ago",
    category: "Movie News",
    author: "Sarah Johnson",
    excerpt: "A comprehensive breakdown of upcoming Marvel movies and series...",
    featured: true,
    comments: 156,
  },
  {
    id: 2,
    title: "The Batman 2: Production Updates",
    status: "Draft",
    views: "0",
    date: "1 day ago",
    category: "Movie News",
    author: "Mike Rodriguez",
    excerpt: "Latest updates from the set of The Batman sequel...",
    featured: false,
    comments: 0,
  },
  {
    id: 3,
    title: "Oscars 2024: Predictions and Analysis",
    status: "Scheduled",
    views: "0",
    date: "Tomorrow",
    category: "Awards",
    author: "Emma Davis",
    excerpt: "Our expert predictions for this year's Academy Awards...",
    featured: true,
    comments: 0,
  },
]

// Mock data for media files
const initialMediaFiles = [
  { id: 1, name: "hero-image-1.jpg", type: "image", size: "2.4 MB", date: "2024-01-15" },
  { id: 2, name: "movie-poster-1.jpg", type: "image", size: "1.8 MB", date: "2024-01-14" },
  { id: 3, name: "behind-scenes-video.mp4", type: "video", size: "45.2 MB", date: "2024-01-13" },
  { id: 4, name: "interview-audio.mp3", type: "audio", size: "12.1 MB", date: "2024-01-12" },
  { id: 5, name: "thumbnail-grid.jpg", type: "image", size: "3.1 MB", date: "2024-01-11" },
  { id: 6, name: "trailer-preview.mp4", type: "video", size: "67.8 MB", date: "2024-01-10" },
]

const analytics = {
  totalViews: "2.4M",
  totalArticles: 1247,
  totalUsers: "45.2K",
  engagement: "8.7%",
  monthlyGrowth: {
    views: "+12.5%",
    articles: "+23",
    users: "+8.2%",
    engagement: "+2.1%",
  },
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [articles, setArticles] = useState(initialArticles)
  const [mediaFiles, setMediaFiles] = useState(initialMediaFiles)
  const [isCreatingArticle, setIsCreatingArticle] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)

  // Form states
  const [newArticle, setNewArticle] = useState({
    title: "",
    category: "",
    tags: "",
    excerpt: "",
    content: "",
    featured: false,
    allowComments: true,
    publishDate: "",
  })

  // Site settings state
  const [siteSettings, setSiteSettings] = useState({
    siteTitle: "TrendStream",
    siteDescription: "Your ultimate destination for entertainment news and streaming content.",
    contactEmail: "admin@TrendStream.online",
    commentsEnabled: true,
    newsletterEnabled: true,
    analyticsEnabled: true,
    postsPerPage: "12",
  })

  const handleCreateArticle = () => {
    if (newArticle.title && newArticle.category) {
      const article = {
        id: articles.length + 1,
        title: newArticle.title,
        status: "Draft",
        views: "0",
        date: "Just now",
        category: newArticle.category,
        author: "Admin",
        excerpt: newArticle.excerpt,
        featured: newArticle.featured,
        comments: 0,
      }
      setArticles([article, ...articles])
      setNewArticle({
        title: "",
        category: "",
        tags: "",
        excerpt: "",
        content: "",
        featured: false,
        allowComments: true,
        publishDate: "",
      })
      setIsCreatingArticle(false)
    }
  }

  const handleDeleteArticle = (id) => {
    setArticles(articles.filter((article) => article.id !== id))
  }

  const handlePublishArticle = (id) => {
    setArticles(
      articles.map((article) => (article.id === id ? { ...article, status: "Published", date: "Just now" } : article)),
    )
  }

  const handleDeleteMedia = (id) => {
    setMediaFiles(mediaFiles.filter((file) => file.id !== id))
  }

  const handleSaveSettings = () => {
    // In a real app, this would save to a backend
    alert("Settings saved successfully!")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Admin Navigation */}
      <nav className="border-b border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-red-500">
                TrendStream Admin
              </Link>
              <div className="flex space-x-6">
                <Button
                  variant="ghost"
                  className={`text-gray-300 hover:text-white ${activeTab === "content" ? "text-white bg-gray-800" : ""}`}
                  onClick={() => setActiveTab("content")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Content
                </Button>
                <Button
                  variant="ghost"
                  className={`text-gray-300 hover:text-white ${activeTab === "media" ? "text-white bg-gray-800" : ""}`}
                  onClick={() => setActiveTab("media")}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Media
                </Button>
                <Button
                  variant="ghost"
                  className={`text-gray-300 hover:text-white ${activeTab === "analytics" ? "text-white bg-gray-800" : ""}`}
                  onClick={() => setActiveTab("analytics")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                <Button
                  variant="ghost"
                  className={`text-gray-300 hover:text-white ${activeTab === "settings" ? "text-white bg-gray-800" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isCreatingArticle} onOpenChange={setIsCreatingArticle}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Article</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div>
                      <Label htmlFor="title">Article Title</Label>
                      <Input
                        id="title"
                        value={newArticle.title}
                        onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                        placeholder="Enter article title..."
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newArticle.category}
                        onValueChange={(value) => setNewArticle({ ...newArticle, category: value })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Movie News">Movie News</SelectItem>
                          <SelectItem value="Sports News">Sports News</SelectItem>
                          <SelectItem value="Blog">Blog</SelectItem>
                          <SelectItem value="Video Posts">Video Posts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="excerpt">Excerpt</Label>
                      <Textarea
                        id="excerpt"
                        value={newArticle.excerpt}
                        onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                        placeholder="Brief description of the article..."
                        className="bg-gray-800 border-gray-700"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="featured">Featured Article</Label>
                      <Switch
                        id="featured"
                        checked={newArticle.featured}
                        onCheckedChange={(checked) => setNewArticle({ ...newArticle, featured: checked })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" onClick={() => setIsCreatingArticle(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateArticle} className="bg-red-600 hover:bg-red-700">
                      Create Article
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Link href="/" className="text-gray-400 hover:text-white">
                <Eye className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-900">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media Library</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalViews}</div>
                  <p className="text-xs text-green-500">{analytics.monthlyGrowth.views} from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Articles</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalArticles}</div>
                  <p className="text-xs text-green-500">{analytics.monthlyGrowth.articles} this month</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                  <p className="text-xs text-green-500">{analytics.monthlyGrowth.users} from last month</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.engagement}</div>
                  <p className="text-xs text-green-500">{analytics.monthlyGrowth.engagement} from last month</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Recent Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {articles.slice(0, 5).map((article) => (
                      <div key={article.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium line-clamp-1">{article.title}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Badge variant="outline" className="border-gray-600">
                              {article.category}
                            </Badge>
                            <span>{article.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={article.status === "Published" ? "default" : "secondary"}
                            className={article.status === "Published" ? "bg-green-600" : ""}
                          >
                            {article.status}
                          </Badge>
                          <span className="text-sm text-gray-400">{article.views}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      className="h-20 flex-col bg-red-600 hover:bg-red-700"
                      onClick={() => setIsCreatingArticle(true)}
                    >
                      <Plus className="w-6 h-6 mb-2" />
                      New Article
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col border-gray-700 bg-transparent"
                      onClick={() => setActiveTab("media")}
                    >
                      <Upload className="w-6 h-6 mb-2" />
                      Upload Media
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col border-gray-700 bg-transparent"
                      onClick={() => setActiveTab("analytics")}
                    >
                      <MessageSquare className="w-6 h-6 mb-2" />
                      Comments
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col border-gray-700 bg-transparent"
                      onClick={() => setActiveTab("analytics")}
                    >
                      <Activity className="w-6 h-6 mb-2" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Articles ({articles.length})</CardTitle>
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => setIsCreatingArticle(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Article
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-4 border border-gray-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{article.title}</h3>
                          {article.featured && (
                            <Badge className="bg-yellow-600">
                              <Star className="w-3 h-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{article.excerpt}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>By {article.author}</span>
                          <span>{article.date}</span>
                          <Badge variant="outline" className="border-gray-600">
                            {article.category}
                          </Badge>
                          <span>{article.views} views</span>
                          <span>{article.comments} comments</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={article.status === "Published" ? "default" : "secondary"}
                          className={article.status === "Published" ? "bg-green-600" : ""}
                        >
                          {article.status}
                        </Badge>
                        <Button variant="outline" size="icon" className="border-gray-700 bg-transparent">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {article.status === "Draft" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handlePublishArticle(article.id)}
                          >
                            Publish
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="border-red-700 text-red-500 hover:bg-red-900 bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-900 border-gray-800">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Article</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{article.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-gray-700">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDeleteArticle(article.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Library Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Media Library ({mediaFiles.length} files)</CardTitle>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {mediaFiles.map((file) => (
                    <div key={file.id} className="relative group cursor-pointer">
                      <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                        <div className="w-full h-full flex items-center justify-center">
                          {file.type === "image" && <ImageIcon className="w-8 h-8 text-gray-600" />}
                          {file.type === "video" && <Activity className="w-8 h-8 text-gray-600" />}
                          {file.type === "audio" && <MessageSquare className="w-8 h-8 text-gray-600" />}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="flex space-x-2">
                          <Button size="icon" variant="secondary" className="w-8 h-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="secondary" className="w-8 h-8 text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-900 border-gray-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete File</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{file.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-gray-700">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteMedia(file.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{file.size}</p>
                        <p className="text-xs text-gray-500">{file.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Traffic Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Traffic Chart</p>
                      <p className="text-sm text-gray-500">Analytics data would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Top Articles</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {articles.slice(0, 5).map((article, index) => (
                      <div key={article.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl font-bold text-gray-500">#{index + 1}</span>
                          <div>
                            <h4 className="font-medium line-clamp-1">{article.title}</h4>
                            <p className="text-sm text-gray-400">{article.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{article.views}</p>
                          <p className="text-sm text-gray-400">views</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="site-title">Site Title</Label>
                      <Input
                        id="site-title"
                        value={siteSettings.siteTitle}
                        onChange={(e) => setSiteSettings({ ...siteSettings, siteTitle: e.target.value })}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>

                    <div>
                      <Label htmlFor="site-description">Site Description</Label>
                      <Textarea
                        id="site-description"
                        value={siteSettings.siteDescription}
                        onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
                        className="bg-gray-800 border-gray-700"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={siteSettings.contactEmail}
                        onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                        className="bg-gray-800 border-gray-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="comments-enabled">Enable Comments</Label>
                      <Switch
                        id="comments-enabled"
                        checked={siteSettings.commentsEnabled}
                        onCheckedChange={(checked) => setSiteSettings({ ...siteSettings, commentsEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="newsletter-enabled">Newsletter Signup</Label>
                      <Switch
                        id="newsletter-enabled"
                        checked={siteSettings.newsletterEnabled}
                        onCheckedChange={(checked) => setSiteSettings({ ...siteSettings, newsletterEnabled: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="analytics-enabled">Analytics Tracking</Label>
                      <Switch
                        id="analytics-enabled"
                        checked={siteSettings.analyticsEnabled}
                        onCheckedChange={(checked) => setSiteSettings({ ...siteSettings, analyticsEnabled: checked })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="posts-per-page">Posts Per Page</Label>
                      <Select
                        value={siteSettings.postsPerPage}
                        onValueChange={(value) => setSiteSettings({ ...siteSettings, postsPerPage: value })}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6</SelectItem>
                          <SelectItem value="12">12</SelectItem>
                          <SelectItem value="18">18</SelectItem>
                          <SelectItem value="24">24</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-red-600 hover:bg-red-700" onClick={handleSaveSettings}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
