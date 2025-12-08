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
  authorizedStrategy?: string
  prescriptiveAnalysis?: string
  aiInsight?: string
  status?: string
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

  // Group activities by KRA or use kras array if available
  const kraGroups = analysis.kras && analysis.kras.length > 0 
    ? analysis.kras 
    : [];

  // If no kras but we have activities, create groups manually
  if (kraGroups.length === 0 && activities.length > 0) {
    const groupedByKra: { [key: string]: any } = {};
    activities.forEach((activity) => {
      const kraId = activity.kraId || "Unknown";
      if (!groupedByKra[kraId]) {
        groupedByKra[kraId] = {
          kraId: kraId,
          kraTitle: activity.kraTitle || kraId,
          activities: [],
          achievementRate: 0,
        };
      }
      groupedByKra[kraId].activities.push(activity);
    });
    
    // Calculate achievement rates
    Object.values(groupedByKra).forEach((kra: any) => {
      const totalAchievement = kra.activities.reduce((sum: number, act: Activity) => sum + act.achievement, 0);
      kra.achievementRate = kra.activities.length > 0 ? totalAchievement / kra.activities.length : 0;
    });
    
    kraGroups.push(...Object.values(groupedByKra));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          AI Insights
        </h3>
        <Badge variant="outline">{kraGroups.length} KRAs Analyzed</Badge>
      </div>

      {/* KRA-Grouped Insight Cards */}
      <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
        {kraGroups.map((kra: any, kraIdx: number) => {
          const kraActivities = Array.isArray(kra.activities) ? kra.activities : [];
          const kraAchievement = kra.achievementRate || 0;
          const verdict = getVerdictStyle(kraAchievement);
          
          // Sum reported across all activities in this KRA
          const totalReported = kraActivities.reduce((sum: number, act: any) => {
            return sum + (typeof act.reported === 'number' ? act.reported : (act.reported || 0));
          }, 0);
          
          // Get the SINGLE target from Strategic Plan (all activities in same KRA share same target - DO NOT multiply)
          // The target is a fixed number from the Strategic Plan, independent of activity count
          let totalTarget = 0;
          if (kraActivities.length > 0) {
            // Look up target from Strategic Plan based on KRA and initiative ID
            const kraData = strategicPlan.kras?.find((k: any) => k.kra_id === kra.kraId);
            if (kraData && kraActivities[0].initiativeId) {
              const initiative = kraData.initiatives?.find((init: any) => init.id === kraActivities[0].initiativeId);
              if (initiative && initiative.targets?.timeline_data) {
                // Extract the single target value for the reporting year
                const timelineData = initiative.targets.timeline_data.find((t: any) => t.year === year || t.year === 2025);
                if (timelineData) {
                  // CRITICAL: This is the single target for the KRA, NOT per activity
                  // Do NOT multiply by activity count - each reported value adds to total reported
                  totalTarget = typeof timelineData.target_value === 'number' ? timelineData.target_value : 1;
                }
              }
            }
            // Fallback: use first activity's target if Strategic Plan lookup fails
            if (totalTarget === 0 && kraActivities[0].target) {
              totalTarget = kraActivities[0].target;
            }
          }
          
          const gap = totalTarget - totalReported;

          return (
            <Card key={kraIdx} className={`p-4 border-l-4 ${verdict.border}`}>
              <div className="space-y-4">
                {/* KRA Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <Badge className={`${KRA_COLORS[kra.kraId] || "bg-gray-500"} text-white text-xs mb-2`}>
                      {kra.kraId}
                    </Badge>
                    <h4 className="font-bold text-base">{kra.kraTitle || kra.kraId}</h4>
                  </div>
                  {verdict.icon}
                </div>

                {/* KRA-Level Aggregated Stats */}
                <div className={`p-4 rounded-md ${verdict.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Total Reported: <span className="text-xl font-bold">{totalReported}</span>
                    </span>
                    <span className="text-sm font-medium">
                      Total Target: <span className="text-xl font-bold">{totalTarget}</span>
                    </span>
                  </div>
                  <Progress value={kraAchievement} className="h-3" />
                  <div className="flex items-center justify-between mt-2">
                    <p className={`text-sm ${verdict.textColor} font-semibold`}>
                      {kraAchievement.toFixed(1)}% Achievement
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {kraActivities.length} {kraActivities.length === 1 ? 'activity' : 'activities'}
                    </span>
                  </div>
                </div>

                {/* Overall KRA Verdict */}
                <div className={`flex items-center gap-2 ${verdict.textColor} font-semibold`}>
                  {verdict.icon}
                  <span>{verdict.text}</span>
                </div>

                {/* Individual Activities Breakdown - Clean list without redundant metrics */}
                {kraActivities.length > 1 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold text-muted-foreground">Activities Included:</h5>
                    <div className="pl-4 space-y-1">
                      {kraActivities.map((activity: any, actIdx: number) => (
                        <div key={actIdx} className="flex items-start gap-2">
                          <span className="text-xs text-muted-foreground mt-0.5">•</span>
                          <p className="text-sm text-muted-foreground">{activity.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prescriptive Analysis - Action-oriented recommendations */}
                {gap > 0 && kraActivities.length > 0 && (
                  <div className="bg-amber-50 border border-amber-300 rounded-md p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-amber-900 mb-1">
                            Gap Identified: {gap} unit{gap !== 1 ? 's' : ''} behind target
                          </p>
                          <p className="text-xs text-amber-800">
                            {kraActivities[0].prescriptiveAnalysis || (
                              kraActivities[0].authorizedStrategy ? (
                                <>To close this gap, implement Strategic Plan Strategy: <span className="font-semibold">"{kraActivities[0].authorizedStrategy}"</span> immediately in Q{quarter} {year}.</>
                              ) : (
                                <>Review and accelerate implementation of activities under {kra.kraId} to meet the target of {totalTarget}.</>
                              )
                            )}
                          </p>
                        </div>
                        {kraActivities[0].authorizedStrategy && kraActivities[0].prescriptiveAnalysis && (
                          <div className="pt-2 border-t border-amber-200">
                            <p className="text-xs font-medium text-amber-900">Authorized Strategy:</p>
                            <p className="text-xs text-amber-700 italic">"{kraActivities[0].authorizedStrategy}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sustainability message for met/exceeded targets */}
                {gap <= 0 && kraActivities.length > 0 && (
                  <div className="bg-green-50 border border-green-300 rounded-md p-4">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-green-900 mb-1">
                            Target {gap === 0 ? 'Met' : 'Exceeded'} ✓
                          </p>
                          <p className="text-xs text-green-800">
                            {kraActivities[0].prescriptiveAnalysis || (
                              kraActivities[0].authorizedStrategy ? (
                                <>Sustain this achievement by continuing: <span className="font-semibold">"{kraActivities[0].authorizedStrategy}"</span>. Consider expanding scope or increasing targets for next quarter.</>
                              ) : (
                                <>Excellent performance on {kra.kraId}. Maintain current practices and document best practices for replication.</>
                              )
                            )}
                          </p>
                        </div>
                        {kraActivities[0].authorizedStrategy && kraActivities[0].prescriptiveAnalysis && (
                          <div className="pt-2 border-t border-green-200">
                            <p className="text-xs font-medium text-green-900">Authorized Strategy:</p>
                            <p className="text-xs text-green-700 italic">"{kraActivities[0].authorizedStrategy}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {kraGroups.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No activities extracted from the QPRO report.</p>
          <p className="text-xs mt-1">
            The AI analysis may still be processing or the document format may need adjustment.
          </p>
        </div>
      )}

      {/* Overall Summary - High-level strategic overview only */}
      {(analysis.alignment || analysis.gaps) && (
        <div className="pt-6 mt-6 border-t space-y-3">
          <h3 className="text-lg font-bold text-muted-foreground">Overall Summary</h3>
          
          {analysis.alignment && (
            <Card className="p-4 bg-slate-50 border-slate-200">
              <h4 className="font-semibold text-sm text-slate-900 mb-2">📊 Strategic Alignment</h4>
              <p className="text-xs text-slate-700 whitespace-pre-wrap">{analysis.alignment}</p>
            </Card>
          )}

          {analysis.gaps && (
            <Card className="p-4 bg-orange-50 border-orange-200">
              <h4 className="font-semibold text-sm text-orange-900 mb-2">🎯 Priority Gaps</h4>
              <p className="text-xs text-orange-800 whitespace-pre-wrap">{analysis.gaps}</p>
              <p className="text-xs text-orange-600 mt-2 italic">Note: Specific recommendations for each KRA are provided in the cards above.</p>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
