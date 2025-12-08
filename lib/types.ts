export type UserRole = "ADMIN" | "FACULTY" | "STUDENT" | "EXTERNAL"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  unit?: string
  unitId?: string // NEW: Unit association
 avatar?: string
}

export interface Document {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  uploadedBy: string
  uploadedById: string
  uploadedAt: Date
  fileUrl: string
  fileType: string
  fileSize: number
  downloads: number
  views: number
  version: number
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
  type: "upload" | "download" | "view" | "comment"
  user: string
  description: string
  timestamp: Date
}

// QPRO Analysis with Aggregation Types
export interface QPROAggregationMetrics {
  totalKRAs: number
  metKRAs: number
  missedKRAs: number
  onTrackKRAs: number
  overallAchievementPercent: number
}

export interface KRAMetricDetail {
  kraId: string
  kraName: string
  status: "MET" | "ON_TRACK" | "MISSED"
  reported: number
  target: number
  variance: number
  achievementPercent: number
  achievementMessage: string
}

export interface QPROAnalysisResult {
  id: string
  title: string
  alignment: string
  opportunities: string
  gaps: string
  recommendations: string
  achievementScore: number
}

export interface QPROWithAggregationResults {
  success: boolean
  analysis: QPROAnalysisResult
  kras: any[]
  aggregation: {
    metrics: QPROAggregationMetrics
    byKra: KRAMetricDetail[]
    dashboard: {
      totalKRAs: number
      metKRAs: number
      onTrackKRAs: number
      missedKRAs: number
      overallAchievementPercent: number
    }
  }
}
