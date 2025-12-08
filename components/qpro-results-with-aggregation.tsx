'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'metrics'>('summary');

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

  return (
    <div className="space-y-6">
      {/* Aggregation Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total KRAs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {results.aggregation.metrics.totalKRAs}
            </div>
            <p className="text-xs text-gray-500 mt-1">KRAs Covered</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Met KRAs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {results.aggregation.metrics.metKRAs}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {results.aggregation.metrics.totalKRAs > 0
                ? `${Math.round((results.aggregation.metrics.metKRAs / results.aggregation.metrics.totalKRAs) * 100)}%`
                : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              On Track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {results.aggregation.metrics.onTrackKRAs}
            </div>
            <p className="text-xs text-blue-600 mt-1">80-99% Achievement</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">
              Missed KRAs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {results.aggregation.metrics.missedKRAs}
            </div>
            <p className="text-xs text-red-600 mt-1">&lt;80% Achievement</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Overall Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {results.aggregation.metrics.overallAchievementPercent.toFixed(1)}%
            </div>
            <p className="text-xs text-purple-600 mt-1">Across All KRAs</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'summary'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Strategic Analysis
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'metrics'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Calculated Metrics
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'details'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          KRA Details
        </button>
      </div>

      {/* Tab Content: Strategic Analysis & Recommendations */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Strategic Alignment
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 whitespace-pre-wrap">
              {results.analysis.alignment}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 whitespace-pre-wrap">
              {results.analysis.opportunities}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Identified Gaps
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 whitespace-pre-wrap">
              {results.analysis.gaps}
            </CardContent>
          </Card>

          <Card className="border-blue-300 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">
                Prescriptive Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-800 whitespace-pre-wrap">
              {results.analysis.recommendations}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Content: Calculated Metrics */}
      {activeTab === 'metrics' && (
        <Card>
          <CardHeader>
            <CardTitle>Achievement Metrics by KRA</CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Year: {results.aggregation.metrics.year} | Quarter: Q{results.aggregation.metrics.quarter}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.aggregation.byKra.map((kra) => (
                <div
                  key={`${kra.kraId}-${kra.kraTitle}`}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{kra.kraId}</h4>
                      <p className="text-sm text-gray-600">{kra.kraTitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(kra.status)}
                      <Badge className={getStatusColor(kra.status)}>
                        {kra.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Achievement Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">Achievement</span>
                      <span className="font-semibold text-gray-900">
                        {kra.achievementPercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          kra.achievementPercent >= 100
                            ? 'bg-green-500'
                            : kra.achievementPercent >= 80
                            ? 'bg-blue-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(kra.achievementPercent, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Reported</p>
                      <p className="font-semibold text-gray-900">{kra.reported}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Target</p>
                      <p className="font-semibold text-gray-900">{kra.target}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Variance</p>
                      <p
                        className={`font-semibold ${
                          kra.reported >= kra.target
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {kra.reported - kra.target > 0 ? '+' : ''}
                        {kra.reported - kra.target}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="text-xs text-gray-600 mt-3 italic">
                    {kra.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Content: KRA Details */}
      {activeTab === 'details' && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed KRA Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {results.kras.map((kra) => (
                <div key={kra.kraId} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-bold text-gray-900">
                    {kra.kraId}: {kra.kraTitle}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Achievement Rate: {kra.achievementRate?.toFixed(2)}%
                  </p>
                  <div className="mt-2 space-y-2">
                    {Array.isArray(kra.activities) &&
                      kra.activities.map((activity: any, idx: number) => (
                        <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                          <p className="font-medium text-gray-800">
                            {activity.name || activity}
                          </p>
                          {typeof activity === 'object' && (
                            <>
                              <p className="text-gray-600">
                                Reported: {activity.reported} | Target: {activity.target}
                              </p>
                              <p className="text-gray-600">
                                Achievement: {activity.achievement?.toFixed(2)}%
                              </p>
                            </>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
