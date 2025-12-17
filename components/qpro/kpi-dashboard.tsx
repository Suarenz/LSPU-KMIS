'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Activity,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';

// Types for KPI-level data
export interface KPIActivity {
  title: string;
  target: number;
  reported: number;
  achievement: number;
  status: 'MET' | 'PARTIAL' | 'NOT_STARTED';
  confidence: number;
}

export interface KPIGroup {
  kraId: string;
  kraTitle: string;
  kpiId: string;
  kpiTitle: string;
  activities: KPIActivity[];
  totalTarget: number;
  totalReported: number;
  completionPercentage: number;
  status: 'MET' | 'ON_TRACK' | 'PARTIAL' | 'NOT_STARTED';
}

interface KPIDashboardProps {
  kpiGroups: KPIGroup[];
  selectedQuarter?: number;
  selectedYear?: number;
}

// Status configuration
const STATUS_CONFIG = {
  MET: {
    color: 'bg-green-100',
    textColor: 'text-green-900',
    borderColor: 'border-green-300',
    icon: CheckCircle2,
    label: 'Target Met',
    badgeClass: 'bg-green-600',
  },
  ON_TRACK: {
    color: 'bg-blue-100',
    textColor: 'text-blue-900',
    borderColor: 'border-blue-300',
    icon: TrendingUp,
    label: 'On Track',
    badgeClass: 'bg-blue-600',
  },
  PARTIAL: {
    color: 'bg-yellow-100',
    textColor: 'text-yellow-900',
    borderColor: 'border-yellow-300',
    icon: Clock,
    label: 'Partial Progress',
    badgeClass: 'bg-yellow-600',
  },
  NOT_STARTED: {
    color: 'bg-red-100',
    textColor: 'text-red-900',
    borderColor: 'border-red-300',
    icon: AlertCircle,
    label: 'Not Started',
    badgeClass: 'bg-red-600',
  },
};

/**
 * Feature 1: KPI-Level Groupings with visual hierarchy
 */
function KPIGroupCard({
  kpi,
  expanded,
  onToggle,
}: {
  kpi: KPIGroup;
  expanded: boolean;
  onToggle: () => void;
}) {
  const statusConfig = STATUS_CONFIG[kpi.status];
  const StatusIcon = statusConfig.icon;

  return (
    <Card className={`border-l-4 ${statusConfig.borderColor}`}>
      <CardHeader className="pb-3 cursor-pointer" onClick={onToggle}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 sm:justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
              <h3 className="font-semibold text-sm sm:text-base text-slate-900 truncate">
                {kpi.kraId} - {kpi.kpiTitle}
              </h3>
              <Badge className={`${statusConfig.badgeClass} text-white shrink-0 whitespace-nowrap`}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 line-clamp-1">{kpi.kraTitle}</p>
          </div>
          <div className="shrink-0 flex items-center justify-end">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Feature 2: Progress metrics visualization */}
      <CardContent className="space-y-4 pt-4">
        {/* Progress bar and percentage */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Target Progress</span>
            <span className={`text-2xl sm:text-2xl font-bold ${statusConfig.textColor}`}>
              {kpi.completionPercentage}%
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all rounded-full ${statusConfig.badgeClass}`}
                style={{ width: `${Math.min(kpi.completionPercentage, 100)}%` }}
              />
            </div>
            <span className="text-xs text-slate-600 font-medium shrink-0">
              {(() => {
                const isRate =
                  Number.isFinite(kpi.totalTarget) &&
                  Number.isFinite(kpi.totalReported) &&
                  kpi.totalTarget > 0 &&
                  kpi.totalTarget <= 100 &&
                  kpi.totalReported >= 0 &&
                  kpi.totalReported <= 100;

                const reported = isRate ? `${kpi.totalReported.toFixed(2)}%` : String(kpi.totalReported);
                const target = isRate ? `${kpi.totalTarget.toFixed(2)}%` : String(kpi.totalTarget);
                const reportedNum = Number(kpi.totalReported);
                const targetNum = Number(kpi.totalTarget);

                // Hide the "0/0" shorthand when both reported and target are zero or invalid
                if ((reportedNum === 0 || Number.isNaN(reportedNum)) && (targetNum === 0 || Number.isNaN(targetNum))) {
                  return '';
                }

                return `${reported}/${target}`;
              })()}
            </span>
          </div>
        </div>

        {/* Status indicator with detail */}
        <div className={`p-3 rounded-lg ${statusConfig.color} border ${statusConfig.borderColor}`}>
          <div className="flex items-start gap-3">
            <StatusIcon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${statusConfig.textColor}`}>
                {statusConfig.label}
              </p>
              <p className="text-xs text-slate-700 mt-0.5 wrap-break-word">
                {kpi.completionPercentage >= 100
                  ? 'Target achieved'
                  : `${100 - kpi.completionPercentage}% remaining`}
              </p>
            </div>
          </div>
        </div>

        {/* Expanded view: Feature 4 - Drill down to activities */}
        {expanded && (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activities ({kpi.activities.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {kpi.activities.map((activity, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <h5 className="text-sm font-medium text-slate-900 flex-1 min-w-0">
                      {activity.title}
                    </h5>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 whitespace-nowrap ${
                        activity.status === 'MET'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : activity.status === 'PARTIAL'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div className="bg-white p-2 rounded border border-slate-100">
                      <p className="text-slate-600 font-medium mb-0.5">Target</p>
                      <p className="font-semibold text-slate-900">
                        {activity.target}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-100">
                      <p className="text-slate-600 font-medium mb-0.5">Reported</p>
                      <p className="font-semibold text-slate-900">
                        {activity.reported}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-100">
                      <p className="text-slate-600 font-medium mb-0.5">Achievement</p>
                      <p className="font-semibold text-slate-900">
                        {activity.achievement}%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-slate-600 shrink-0">
                        {(activity.confidence * 100).toFixed(0)}% confident
                      </span>
                    </div>
                    <div className="flex-1 bg-slate-300 rounded h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded ${
                          activity.status === 'MET'
                            ? 'bg-green-600'
                            : activity.status === 'PARTIAL'
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${Math.min(activity.achievement, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// REMOVED: Feature 5 - Quarter Comparison
// This chart was removed to de-clutter the UI. Performance trends are visible in the KPI-Level Breakdown section.

/**
 * Main KPI Dashboard Component
 * Combines all 5 features
 */
export default function KPIDashboard({
  kpiGroups,
  selectedQuarter,
  selectedYear = 2025,
}: KPIDashboardProps) {
  const [expandedKPI, setExpandedKPI] = useState<string | null>(null);

  // Calculate summary metrics
  const summary = useMemo(() => {
    const total = kpiGroups.length;
    const met = kpiGroups.filter((k) => k.status === 'MET').length;
    const onTrack = kpiGroups.filter((k) => k.status === 'ON_TRACK').length;
    const partial = kpiGroups.filter((k) => k.status === 'PARTIAL').length;
    const notStarted = kpiGroups.filter((k) => k.status === 'NOT_STARTED').length;
    const avgCompletion =
      kpiGroups.reduce((sum, k) => sum + k.completionPercentage, 0) / total;
    const totalActivities = kpiGroups.reduce((sum, k) => sum + k.activities.length, 0);

    return { total, met, onTrack, partial, notStarted, avgCompletion, totalActivities };
  }, [kpiGroups]);

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle>KPI Performance Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-600 uppercase font-semibold">Total KPIs</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{summary.total}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-700 uppercase font-semibold">Met</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{summary.met}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 uppercase font-semibold">On Track</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{summary.onTrack}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-700 uppercase font-semibold">Partial</p>
              <p className="text-2xl font-bold text-yellow-900 mt-1">{summary.partial}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-700 uppercase font-semibold">Not Started</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{summary.notStarted}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700 uppercase font-semibold">Avg Completion</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {summary.avgCompletion.toFixed(0)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature 1: KPI Groups with Feature 3 & 4 */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 px-1">
          KPI-Level Breakdown
        </h2>
        {kpiGroups.map((kpi) => (
          <KPIGroupCard
            key={kpi.kpiId}
            kpi={kpi}
            expanded={expandedKPI === kpi.kpiId}
            onToggle={() =>
              setExpandedKPI(expandedKPI === kpi.kpiId ? null : kpi.kpiId)
            }
          />
        ))}
      </div>
    </div>
  );
}
