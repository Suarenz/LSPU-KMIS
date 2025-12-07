"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Lightbulb, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react"
import strategicPlan from "@/strategic_plan.json"
import AuthService from "@/lib/services/auth-service"

interface InsightFeedProps {
  analysisId: string
  year: number
  quarter: number
}

interface Activity {
  name: string
  reported: number
  target: number
  kraId: string
  kraTitle?: string
  achievement: number
  strategies?: string[]
  responsibleOffices?: string[]
}

interface AnalysisData {
  id: string
  kras: any[]
  activities?: Activity[]
  alignment?: string
  gaps?: string
  recommendations?: string
}

const KRA_COLORS: { [key: string]: string } = {
  "KRA 1": "bg-blue-500",
  "KRA 2": "bg-green-500",
  "KRA 3": "bg-purple-500",
  "KRA 4": "bg-orange-500",
  "KRA 5": "bg-red-500",
  "KRA 6": "bg-teal-500",
  "KRA 7": "bg-indigo-500",
  "KRA 8": "bg-pink-500",
}

export function InsightFeed({ analysisId, year, quarter }: InsightFeedProps) {
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true)
      try {
        const token = await AuthService.getAccessToken()
        const response = await fetch(`/api/qpro-analyses/${analysisId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setAnalysis(data.analysis)
        }
      } catch (error) {
        console.error("Error fetching analysis:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [analysisId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No analysis data found.</p>
      </div>
    )
  }

  // Extract activities from the analysis
  const activities: Activity[] = analysis.activities || []

  // If no structured activities, try to parse from kras field
  if (activities.length === 0 && analysis.kras && analysis.kras.length > 0) {
    analysis.kras.forEach((kra: any) => {
      if (kra.activities && Array.isArray(kra.activities)) {
        kra.activities.forEach((act: any) => {
          activities.push({
            name: act.name || "Unnamed Activity",
            reported: act.reported || 0,
            target: act.target || 0,
            kraId: kra.kraId || "Unknown",
            achievement: act.achievement || 0,
            strategies: kra.strategies,
            responsibleOffices: kra.responsibleOffices,
          })
        })
      }
    })
  }

  const getVerdictStyle = (achievement: number) => {
    if (achievement >= 100) {
      return {
        border: "border-green-500",
        bg: "bg-green-50",
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        text: "Achieved",
        textColor: "text-green-700",
      }
    } else if (achievement >= 50) {
      return {
        border: "border-yellow-500",
        bg: "bg-yellow-50",
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        text: "Gap Detected",
        textColor: "text-yellow-700",
      }
    } else {
      return {
        border: "border-red-500",
        bg: "bg-red-50",
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        text: "Significant Gap",
        textColor: "text-red-700",
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          AI Insights
        </h3>
        <Badge variant="outline">{activities.length} Activities Analyzed</Badge>
      </div>

      {/* Insight Cards */}
      <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
        {activities.map((activity, idx) => {
          const verdict = getVerdictStyle(activity.achievement)
          const gap = activity.target - activity.reported

          return (
            <Card key={idx} className={`p-4 border-l-4 ${verdict.border}`}>
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm flex-1">{activity.name}</h4>
                  {verdict.icon}
                </div>

                {/* Match Badge */}
                <div>
                  <Badge className={`${KRA_COLORS[activity.kraId] || "bg-gray-500"} text-white text-xs`}>
                    Linked to {activity.kraId}
                  </Badge>
                </div>

                {/* Comparison Section */}
                <div className={`p-3 rounded-md ${verdict.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">
                      Reported: <span className="text-lg font-bold">{activity.reported}</span>
                    </span>
                    <span className="text-xs font-medium">
                      Target: <span className="text-lg font-bold">{activity.target}</span>
                    </span>
                  </div>
                  <Progress value={activity.achievement} className="h-2" />
                  <p className={`text-xs mt-1 ${verdict.textColor} font-medium`}>
                    {activity.achievement.toFixed(0)}% Achievement
                  </p>
                </div>

                {/* Verdict */}
                <div className={`flex items-center gap-2 ${verdict.textColor} font-semibold text-sm`}>
                  {verdict.icon}
                  <span>{verdict.text}</span>
                </div>

                {/* Prescriptive Analytics */}
                {gap > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-blue-900 mb-1">
                          AI Recommendation
                        </p>
                        <p className="text-xs text-blue-800">
                          You are behind by <span className="font-bold">{gap}</span>. 
                          {activity.strategies && activity.strategies.length > 0 && (
                            <span> The Strategic Plan suggests: "{activity.strategies[0]}"</span>
                          )}
                          {activity.responsibleOffices && activity.responsibleOffices.length > 0 && (
                            <span> Consider coordinating with <span className="font-semibold">{activity.responsibleOffices[0]}</span>.</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No activities extracted from the QPRO report.</p>
          <p className="text-xs mt-1">
            The AI analysis may still be processing or the document format may need adjustment.
          </p>
        </div>
      )}

      {/* Summary Sections */}
      {(analysis.alignment || analysis.gaps || analysis.recommendations) && (
        <div className="pt-4 border-t space-y-3">
          {analysis.alignment && (
            <Card className="p-4 bg-green-50 border-green-200">
              <h4 className="font-semibold text-sm text-green-900 mb-2">✅ Alignment</h4>
              <p className="text-xs text-green-800 whitespace-pre-wrap">{analysis.alignment}</p>
            </Card>
          )}

          {analysis.gaps && (
            <Card className="p-4 bg-red-50 border-red-200">
              <h4 className="font-semibold text-sm text-red-900 mb-2">⚠️ Gaps</h4>
              <p className="text-xs text-red-800 whitespace-pre-wrap">{analysis.gaps}</p>
            </Card>
          )}

          {analysis.recommendations && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">💡 Recommendations</h4>
              <p className="text-xs text-blue-800 whitespace-pre-wrap">{analysis.recommendations}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
