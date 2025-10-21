"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MOCK_DOCUMENTS, MOCK_FORUM_POSTS } from "@/lib/mock-data"
import { SearchIcon, FileText, MessageSquare, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

export default function SearchPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{
    documents: typeof MOCK_DOCUMENTS
    forums: typeof MOCK_FORUM_POSTS
  }>({
    documents: [],
    forums: [],
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()

      const filteredDocs = MOCK_DOCUMENTS.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          doc.category.toLowerCase().includes(query),
      )

      const filteredForums = MOCK_FORUM_POSTS.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query)),
      )

      setSearchResults({
        documents: filteredDocs,
        forums: filteredForums,
      })
    } else {
      setSearchResults({ documents: [], forums: [] })
    }
  }, [searchQuery])

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
              className="object-contain animate-spin"
            />
          </div>
          <p className="text-lg text-muted-foreground">Loading search...</p>
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
              className="object-contain animate-spin"
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
              className="object-contain animate-spin"
            />
          </div>
          <p className="text-lg text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  const totalResults = searchResults.documents.length + searchResults.forums.length

  const popularSearches = ["Research", "Curriculum", "Policy", "Extension", "Teaching"]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Search Knowledge Base</h1>
          <p className="text-muted-foreground">Find documents, discussions, and resources across the system</p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8 animate-fade-in">
          <CardContent className="pt-6">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for documents, discussions, topics... (English/Filipino)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
              />
            </div>
            {!searchQuery && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search) => (
                    <Button key={search} variant="outline" size="sm" onClick={() => setSearchQuery(search)}>
                      {search}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchQuery && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {totalResults} {totalResults === 1 ? "result" : "results"} found for "{searchQuery}"
              </h2>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
                <TabsTrigger value="documents">Documents ({searchResults.documents.length})</TabsTrigger>
                <TabsTrigger value="forums">Forums ({searchResults.forums.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {searchResults.documents.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">{doc.title}</CardTitle>
                            <Badge variant="secondary">{doc.category}</Badge>
                          </div>
                          <CardDescription className="mt-1">{doc.description}</CardDescription>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}

                {searchResults.forums.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            <Badge variant="secondary">{post.category}</Badge>
                          </div>
                          <CardDescription className="mt-1 line-clamp-2">{post.content}</CardDescription>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{post.author}</span>
                            <span>•</span>
                            <span>{post.replies.length} replies</span>
                            <span>•</span>
                            <span>{post.likes} likes</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                {searchResults.documents.map((doc) => (
                  <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">{doc.title}</CardTitle>
                            <Badge variant="secondary">{doc.category}</Badge>
                          </div>
                          <CardDescription className="mt-1">{doc.description}</CardDescription>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="forums" className="space-y-4">
                {searchResults.forums.map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            <Badge variant="secondary">{post.category}</Badge>
                          </div>
                          <CardDescription className="mt-1 line-clamp-2">{post.content}</CardDescription>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{post.author}</span>
                            <span>•</span>
                            <span>{post.replies.length} replies</span>
                            <span>•</span>
                            <span>{post.likes} likes</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>

            {totalResults === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try different keywords or browse the repository</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <SearchIcon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Search</CardTitle>
                <CardDescription>
                  Natural language search in English and Filipino with intelligent results
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle>Comprehensive Index</CardTitle>
                <CardDescription>Search across documents, forums, policies, and research materials</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Smart Suggestions</CardTitle>
                <CardDescription>Get relevant recommendations based on your role and interests</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
