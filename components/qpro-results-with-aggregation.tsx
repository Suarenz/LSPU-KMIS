'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, TrendingUp, Clock, Target, AlertTriangle } from 'lucide-react';

// Helper function to safely render analysis fields
// These fields may contain JSON strings, formatted text, or already-parsed objects/arrays
function renderAnalysisField(value: any): React.ReactNode {
  if (!value) return 'No data available';
  
  // Handle arrays directly (already parsed from API response)
  if (Array.isArray(value)) {
    if (value.length === 0) return 'No data available';
    return (
      <ul className="space-y-2">
        {value.map((item: any, idx: number) => (
          <li key={idx} className="flex gap-2">
            <span>•</span>
            <span>
              {typeof item === 'string' 
                ? item 
                : item.action 
                  ? `${item.action}${item.timeline ? ` (${item.timeline})` : ''}`
                  : JSON.stringify(item)}
            </span>
          </li>
        ))}
      </ul>
    );
  }
  
  // Handle objects directly (single recommendation object)
  if (typeof value === 'object' && value !== null) {
    if (value.action) {
      return `${value.action}${value.timeline ? ` (${value.timeline})` : ''}`;
    }
    return JSON.stringify(value, null, 2);
  }
  
  // Handle strings - may be JSON or plain text
  if (typeof value === 'string') {
    // Try to parse as JSON (recommendations might be JSON stringified)
    try {
      const parsed = JSON.parse(value);
      // Recursively call to handle the parsed value
      return renderAnalysisField(parsed);
    } catch {
      // Not JSON, treat as plain text with preserved formatting
    }
    return value;
  }
  
  // Fallback for other types
  return String(value);
}

// Parse JSON string or array into structured action items
function parseRecommendations(value: any): Array<{action: string; timeline?: string; priority?: string}> {
  if (!value) return [];
  
  if (Array.isArray(value)) {
    return value.map((item: any) => {
      if (typeof item === 'string') return { action: item };
      if (typeof item === 'object' && item !== null) {
        return {
          action: item.action || item.recommendation || JSON.stringify(item),
          timeline: item.timeline || item.deadline,
          priority: item.priority
        };
      }
      return { action: String(item) };
    });
  }
  
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parseRecommendations(parsed);
    } catch {
      const lines = value.split(/\n|•|\.(?=\s*[A-Z])/).filter((l: string) => l.trim());
      return lines.map((line: string) => ({ action: line.trim() }));
    }
  }
  
  if (typeof value === 'object' && value !== null) {
    return [{
      action: value.action || value.recommendation || JSON.stringify(value),
      timeline: value.timeline,
      priority: value.priority
    }];
  }
  
  return [{ action: String(value) }];
}

// Get severity level based on achievement
function getSeverityLevel(achievement: number): { 
  level: 'critical' | 'warning' | 'success'; 
  label: string; 
  bgColor: string; 
  textColor: string;
  borderColor: string;
} {
  if (achievement < 50) {
    return { level: 'critical', label: 'CRITICAL ALERT', bgColor: 'bg-red-100', textColor: 'text-red-900', borderColor: 'border-red-500' };
  }
  if (achievement < 80) {
    return { level: 'warning', label: 'NEEDS ATTENTION', bgColor: 'bg-amber-100', textColor: 'text-amber-900', borderColor: 'border-amber-500' };
  }
  return { level: 'success', label: 'ON TRACK', bgColor: 'bg-green-100', textColor: 'text-green-900', borderColor: 'border-green-500' };
}

function getPriorityColor(priority?: string): string {
  switch (priority?.toLowerCase()) {
    case 'high': case 'critical': return 'bg-red-500 text-white';
    case 'medium': return 'bg-amber-500 text-white';
    case 'low': return 'bg-blue-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
}

interface AggregationMetric {
  kraId: string;
  kraTitle: string;
  reported: number;
  target: number;
  achieved: number;
  achievementPercent: number;
  status: 'MET' | 'MISSED' | 'ON_TRACK';
  message: string;
}

interface QPROWithAggregationResults {
  analysis: {
    id: string;
    title: string;
    alignment: string;
    opportunities: string;
    gaps: string;
    recommendations: string;
    achievementScore: number;
    createdAt: string;
  };
  kras: any[];
  aggregation: {
    metrics: {
      totalKRAs: number;
      metKRAs: number;
      missedKRAs: number;
      onTrackKRAs: number;
      overallAchievementPercent: number;
      year: number;
      quarter: number;
    };
    byKra: AggregationMetric[];
    dashboard: {
      totalKRAs: number;
      metKRAs: number;
      missedKRAs: number;
      onTrackKRAs: number;
      overallAchievementPercent: number;
    };
  };
}

export function QPROResultsWithAggregation({
  results,
}: {
  results: QPROWithAggregationResults;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MET':
        return 'bg-green-100 text-green-800';
      case 'ON_TRACK':
        return 'bg-blue-100 text-blue-800';
      case 'MISSED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'MET':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'MISSED':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'ON_TRACK':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      default:
        return null;
    }
  };

  const achievement = results.aggregation.metrics.overallAchievementPercent;
  const severity = getSeverityLevel(achievement);

  return (
    <div className="space-y-6">
      {/* ===== SECTION 1: Header Cards (Retained) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border-l-4 ${severity.borderColor}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${severity.textColor}`}>
              {results.aggregation.metrics.overallAchievementPercent.toFixed(1)}%
            </div>
            <Badge className={severity.level === 'critical' ? 'bg-red-600 text-white mt-2' : severity.level === 'warning' ? 'bg-amber-500 text-white mt-2' : 'bg-green-600 text-white mt-2'}>
              {severity.level === 'critical' ? '⚠️' : severity.level === 'warning' ? '⚡' : '✓'} {severity.label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Data Completeness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">
              {results.aggregation.metrics.totalKRAs > 0 
                ? Math.round((results.aggregation.byKra.filter(k => k.reported > 0).length / results.aggregation.metrics.totalKRAs) * 100)
                : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {results.aggregation.byKra.filter(k => k.reported > 0).length} of {results.aggregation.metrics.totalKRAs} KRAs have data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              KRAs Covered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900">
              {results.aggregation.metrics.totalKRAs}
            </div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-green-600">✓ {results.aggregation.metrics.metKRAs} Met</span>
              <span className="text-red-600">✗ {results.aggregation.metrics.missedKRAs} Missed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== SECTION 2: Prescriptive Analysis (Moved to Top-Center, Below Header) ===== */}
      <Card className="overflow-hidden border-2 border-indigo-300 shadow-lg">
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-5 py-4">
          <h3 className="font-bold text-xl text-white flex items-center gap-2">
            <Target className="w-6 h-6" /> AI Strategic Analysis
          </h3>
          <p className="text-indigo-100 text-sm mt-1">
            Mapped to System Strategic Plan • Q{results.aggregation.metrics.quarter} {results.aggregation.metrics.year}
          </p>
        </div>
        
        <CardContent className="p-0">
          {/* Status Alert */}
          <div className={`p-4 border-b ${severity.bgColor}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-lg font-bold ${severity.textColor}`}>
                  {achievement.toFixed(1)}% Overall Achievement
                </p>
                <p className="text-sm text-slate-600">
                  {results.aggregation.metrics.metKRAs} of {results.aggregation.metrics.totalKRAs} Key Result Areas Met
                </p>
              </div>
              {severity.level === 'critical' && (
                <AlertTriangle className="w-8 h-8 text-red-500" />
              )}
            </div>
          </div>

          {/* Gap Identification */}
          {results.analysis.gaps && (
            <div className="p-4 border-b bg-red-50">
              <h4 className="font-semibold text-red-900 flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" />
                {achievement < 50 ? 'Critical Gaps Identified' : 'Gap Identification'}
              </h4>
              <div className="text-sm text-red-800">
                {renderAnalysisField(results.analysis.gaps)}
              </div>
            </div>
          )}

          {/* Strategic Mapping */}
          {results.analysis.alignment && (
            <div className="p-4 border-b bg-blue-50">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" />
                Strategic Plan Mapping
              </h4>
              <div className="text-sm text-blue-800">
                {renderAnalysisField(results.analysis.alignment)}
              </div>
            </div>
          )}

          {/* Prescriptive Roadmap */}
          <div className="p-4">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" />
              Prescriptive Action Items
            </h4>
            <div className="space-y-2">
              {(() => {
                const items = parseRecommendations(results.analysis.recommendations);
                if (items.length === 0) {
                  return <p className="text-sm text-slate-500 italic">No recommendations available</p>;
                }
                return items.map((item, idx) => {
                  let priority = item.priority || 'medium';
                  if (item.timeline?.toLowerCase().includes('immediate') || 
                      item.timeline?.toLowerCase().includes('1 month') ||
                      item.timeline?.toLowerCase().includes('3 month')) {
                    priority = 'high';
                  } else if (item.timeline?.toLowerCase().includes('12 month') ||
                             item.timeline?.toLowerCase().includes('year')) {
                    priority = 'low';
                  }
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                      <Badge className={`shrink-0 ${getPriorityColor(priority)}`}>
                        {priority === 'high' ? '🔴 Critical' : priority === 'low' ? '🟢 Low' : '🟡 Medium'}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">{item.action}</p>
                        {item.timeline && (
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.timeline}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== SECTION 3: KRA Classification Review (Retained) ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            KRA Classification Review
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Activities mapped to Key Result Areas from the Strategic Plan
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.aggregation.byKra.map((kra) => (
              <div
                key={`${kra.kraId}-${kra.kraTitle}`}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  kra.status === 'MET' ? 'bg-green-50 border-green-200' :
                  kra.status === 'ON_TRACK' ? 'bg-blue-50 border-blue-200' :
                  'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(kra.status)}
                  <div>
                    <h4 className="font-semibold text-gray-900">{kra.kraId}</h4>
                    <p className="text-xs text-gray-600">{kra.kraTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{kra.achievementPercent.toFixed(1)}%</p>
                  <Badge className={getStatusColor(kra.status)}>
                    {kra.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== REMOVED SECTIONS (De-Cluttered) =====
        ❌ Target vs Reported by KPI Graph (Bar Chart)
        ❌ Status Distribution Graph (Pie Chart)  
        ❌ Completion Percentage by KPI Graph (Line Chart)
        ❌ Quarter-over-Quarter Comparison (Timeline/Table)
        ❌ Tabs Navigation (metrics, details tabs)
      ===== */}
    </div>
  );
}
