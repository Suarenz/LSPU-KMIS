export type UserRole = "admin" | "faculty" | "student" | "external"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  avatar?: string
}

export interface Document {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  uploadedBy: string
  uploadedAt: Date
  fileUrl: string
  fileType: string
  fileSize: number
  downloads: number
  views: number
  version: number
}

export interface ForumPost {
  id: string
  title: string
  content: string
  author: string
  authorRole: UserRole
  category: string
  tags: string[]
  createdAt: Date
  replies: ForumReply[]
  likes: number
  views: number
}

export interface ForumReply {
  id: string
  content: string
  author: string
  authorRole: UserRole
  createdAt: Date
  likes: number
}

export interface AnalyticsData {
  totalDocuments: number
  totalUsers: number
  totalDownloads: number
  totalViews: number
  recentActivity: Activity[]
  popularDocuments: Document[]
  categoryDistribution: { category: string; count: number }[]
}

export interface Activity {
  id: string
  type: "upload" | "download" | "view" | "comment" | "forum"
  user: string
  description: string
  timestamp: Date
}
