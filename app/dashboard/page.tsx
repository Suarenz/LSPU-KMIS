"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MOCK_DOCUMENTS, MOCK_ANALYTICS } from "@/lib/mock-data"
import { BookOpen, Users, Download, Eye, FileText, MessageSquare, Search } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router])

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
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
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

  const stats = [
    {
      title: "Total Documents",
      value: MOCK_ANALYTICS.totalDocuments.toLocaleString(),
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Users",
      value: MOCK_ANALYTICS.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Total Downloads",
      value: MOCK_ANALYTICS.totalDownloads.toLocaleString(),
      icon: Download,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Total Views",
      value: MOCK_ANALYTICS.totalViews.toLocaleString(),
      icon: Eye,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]

  const quickActions = [
    {
      title: "Browse Repository",
      description: "Explore documents and resources",
      icon: BookOpen,
      href: "/repository",
      color: "primary",
    },
    {
      title: "Search Knowledge",
      description: "Find what you need quickly",
      icon: Search,
      href: "/search",
      color: "secondary",
    },
    {
      title: "Join Discussions",
      description: "Collaborate with community",
      icon: MessageSquare,
      href: "/forums",
      color: "accent",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Welcome, {user.name}!</h1>
          <p className="text-muted-foreground">
            {user.department} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={stat.title}
                className="animate-fade-in hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link key={action.title} href={action.href}>
                  <Card
                    className="animate-fade-in hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 bg-${action.color}/10 rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 text-${action.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{action.title}</CardTitle>
                          <CardDescription>{action.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Documents</h2>
            <Link href="/repository">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_DOCUMENTS.slice(0, 4).map((doc, index) => (
              <Card
                key={doc.id}
                className="animate-fade-in hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1">{doc.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{doc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {doc.downloads}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {doc.views}
                    </div>
                    <div className="ml-auto">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{doc.category}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {MOCK_ANALYTICS.recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} • {activity.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
