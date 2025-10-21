"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MOCK_FORUM_POSTS } from "@/lib/mock-data"
import type { ForumPost } from "@/lib/types"
import { MessageSquare, ThumbsUp, Eye, Plus, TrendingUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

export default function ForumsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<ForumPost[]>(MOCK_FORUM_POSTS)
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (categoryFilter === "all") {
      setPosts(MOCK_FORUM_POSTS)
    } else {
      setPosts(MOCK_FORUM_POSTS.filter((post) => post.category === categoryFilter))
    }
  }, [categoryFilter])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <Image
              src="/LSPULogo.png"
              alt="LSPU Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain animate-spin"
            />
          </div>
          <p className="text-lg text-muted-foreground">Loading forums...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <Image
              src="/LSPULogo.png"
              alt="LSPU Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain animate-spin"
            />
          </div>
          <p className="text-lg text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is null but authentication is loading
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <Image
              src="/LSPULogo.png"
              alt="LSPU Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain animate-spin"
            />
          </div>
          <p className="text-lg text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  const categories = ["all", ...Array.from(new Set(MOCK_FORUM_POSTS.map((post) => post.category)))]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive text-destructive-foreground"
      case "faculty":
        return "bg-primary text-primary-foreground"
      case "student":
        return "bg-secondary text-secondary-foreground"
      case "external":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Discussion Forums</h1>
              <p className="text-muted-foreground">Collaborate, share knowledge, and engage with the community</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Discussion
            </Button>
          </div>
        </div>

        {/* Filter */}
        <Card className="mb-6 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Categories" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2 bg-transparent">
                <TrendingUp className="w-4 h-4" />
                Trending
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Forum Posts */}
        <div className="space-y-4">
          {posts.map((post, index) => (
            <Card
              key={post.id}
              className="animate-fade-in hover:shadow-lg transition-all cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(post.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <CardTitle className="text-xl mb-1">{post.title}</CardTitle>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{post.author}</span>
                          <Badge className={getRoleBadgeColor(post.authorRole)} variant="secondary">
                            {post.authorRole}
                          </Badge>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{post.createdAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <CardDescription className="text-base line-clamp-2 mb-3">{post.content}</CardDescription>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        {post.likes} {post.likes === 1 ? "like" : "likes"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views} {post.views === 1 ? "view" : "views"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Show first reply if exists */}
              {post.replies.length > 0 && (
                <CardContent className="border-t border-border pt-4">
                  <div className="flex items-start gap-3 bg-muted/50 p-4 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {getInitials(post.replies[0].author)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{post.replies[0].author}</span>
                        <Badge className={getRoleBadgeColor(post.replies[0].authorRole)} variant="secondary">
                          {post.replies[0].authorRole}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{post.replies[0].content}</p>
                    </div>
                  </div>
                  {post.replies.length > 1 && (
                    <Button variant="ghost" size="sm" className="mt-2">
                      View all {post.replies.length} replies
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {posts.length === 0 && (
          <Card className="animate-fade-in">
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No discussions found</h3>
              <p className="text-muted-foreground mb-4">Be the first to start a discussion in this category</p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Start Discussion
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
