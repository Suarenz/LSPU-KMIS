"use client"

import { useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, TrendingUp, Clock, AlertCircle } from "lucide-react"

interface Initiative {
  id: string
  key_performance_indicator: {
    outputs: string
    outcomes: string | string[]
  }
  strategies: string[]
  programs_activities: string[]
  responsible_offices: string[]
  targets: {
    type: string
    timeline_data: Array<{
      year: number
      target_value: string | number
      milestones?: string[]
    }>
  }
}

interface KPIProgress {
  initiativeId: string
  kpiOutputs: string
  plannedTarget: string | number
  actualAchieved: number
  achievementPercentage: number
  status: "MET" | "ON_TRACK" | "PARTIAL" | "NOT_STARTED"
}

interface KRAKPIDetailsProps {
  initiatives: Initiative[]
  year: number
  quarter: number
  analysisKRAData?: any // KRA data from analysis
}

const STATUS_CONFIG: {
  [key: string]: {
    label: string
    color: string
    bgColor: string
    icon: React.ReactNode
    borderColor: string
  }
} = {
  MET: {
    label: "Met",
    color: "text-green-700",
    bgColor: "bg-green-100",
    icon: <CheckCircle2 className="w-4 h-4" />,
    borderColor: "border-green-300",
  },
  ON_TRACK: {
    label: "On Track",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    icon: <TrendingUp className="w-4 h-4" />,
    borderColor: "border-blue-300",
  },
  PARTIAL: {
    label: "Partial",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
    icon: <Clock className="w-4 h-4" />,
    borderColor: "border-yellow-300",
  },
  NOT_STARTED: {
    label: "Not Started",
    color: "text-red-700",
    bgColor: "bg-red-100",
    icon: <AlertCircle className="w-4 h-4" />,
    borderColor: "border-red-300",
  },
}

export function KRAKPIDetails({
  initiatives,
  year,
  quarter,
  analysisKRAData,
}: KRAKPIDetailsProps) {
  // Process KPI progress data
  const kpiProgress = useMemo(() => {
    return initiatives.map((initiative) => {
      const targetData = initiative.targets?.timeline_data?.find(
        (t) => t.year === year
      )
      const plannedTarget = targetData?.target_value || "N/A"

      // Get data from analysis if available
      let actualAchieved = 0
      let achievementPercentage = 0
      let status: "MET" | "ON_TRACK" | "PARTIAL" | "NOT_STARTED" = "NOT_STARTED"

      if (analysisKRAData && analysisKRAData.activities) {
        // Find matching activity in analysis
        const matchingActivity = analysisKRAData.activities.find(
          (act: any) =>
            act.initiativeId === initiative.id ||
            act.kraId === analysisKRAData.kraId // Fallback match
        )

        if (matchingActivity) {
          actualAchieved = matchingActivity.reported || 0
          achievementPercentage = matchingActivity.achievement || 0

          // Determine status based on achievement percentage
          if (achievementPercentage >= 100) {
            status = "MET"
          } else if (achievementPercentage >= 80) {
            status = "ON_TRACK"
          } else if (achievementPercentage > 0) {
            status = "PARTIAL"
          } else {
            status = "NOT_STARTED"
          }
        }
      }

      return {
        initiativeId: initiative.id,
        kpiOutputs: initiative.key_performance_indicator?.outputs || "No output defined",
        plannedTarget,
        actualAchieved,
        achievementPercentage,
        status,
      } as KPIProgress
    })
  }, [initiatives, year, analysisKRAData])

  return (
    <div className="space-y-3 mt-4 ml-2 sm:ml-6 border-l-2 border-slate-200 pl-3 sm:pl-4">
      <h4 className="text-sm font-semibold text-slate-700 mb-3">
        Key Performance Indicators (KPIs) for {year} Q{quarter}
      </h4>

      {kpiProgress.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No KPIs defined for this KRA.</p>
      ) : (
        kpiProgress.map((kpi, idx) => {
          const statusConfig = STATUS_CONFIG[kpi.status]

          return (
            <Card
              key={`${kpi.initiativeId}-${idx}`}
              className={`p-3 sm:p-4 border-l-4 ${statusConfig.borderColor} bg-slate-50 hover:bg-slate-100 transition-colors`}
            >
              {/* KPI Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-xs font-semibold text-slate-700">KPI {idx + 1}</p>
                  <p className="text-sm text-slate-600 line-clamp-3 sm:line-clamp-2">
                    {kpi.kpiOutputs}
                  </p>
                </div>
                <Badge
                  className={`${statusConfig.bgColor} ${statusConfig.color} border-0 shrink-0 flex items-center gap-1 whitespace-nowrap`}
                >
                  {statusConfig.icon}
                  <span className="text-xs">{statusConfig.label}</span>
                </Badge>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div className="bg-white p-2 sm:p-3 rounded border border-slate-200">
                  <p className="text-slate-500 font-medium mb-1 text-xs">Planned</p>
                  <p className="font-semibold text-slate-900 text-sm truncate">{kpi.plannedTarget}</p>
                </div>
                <div className="bg-white p-2 sm:p-3 rounded border border-slate-200">
                  <p className="text-slate-500 font-medium mb-1 text-xs">Accomplished</p>
                  <p className="font-semibold text-slate-900 text-sm truncate">{kpi.actualAchieved}</p>
                </div>
                <div className={`${statusConfig.bgColor} p-2 sm:p-3 rounded border ${statusConfig.borderColor}`}>
                  <p className="text-slate-500 font-medium mb-1 text-xs">Progress</p>
                  <p className={`font-semibold text-sm ${statusConfig.color}`}>
                    {kpi.achievementPercentage.toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Completion Progress</span>
                  <span className={`font-semibold ${statusConfig.color}`}>
                    {kpi.achievementPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(kpi.achievementPercentage, 100)}
                  className="h-2"
                />
              </div>

              {/* Status Message */}
              <div className={`mt-2 p-2 sm:p-3 rounded text-xs ${statusConfig.bgColor}`}>
                <p className={statusConfig.color}>
                  {kpi.status === "MET"
                    ? `✓ Target met - ${kpi.achievementPercentage.toFixed(1)}% accomplished`
                    : kpi.status === "ON_TRACK"
                      ? `Ongoing - ${kpi.achievementPercentage.toFixed(1)}% accomplished`
                      : kpi.status === "PARTIAL"
                        ? `In progress - ${kpi.achievementPercentage.toFixed(1)}% accomplished`
                        : "No progress yet - awaiting submissions"}
                </p>
              </div>
            </Card>
          )
        })
      )}
    </div>
  )
}
