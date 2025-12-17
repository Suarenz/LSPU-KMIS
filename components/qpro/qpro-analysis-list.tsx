'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Loader2,
  FileText,
  Calendar,
  Zap,
} from 'lucide-react';

export interface QPROAnalysisSummary {
  id: string;
  title: string;
  type: string;
  uploadedDate: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  achievementPercentage: number;
  kraCount: number;
  activitiesCount: number;
  year?: number;
  quarter?: string;
}

interface QPROAnalysisListProps {
  onSelectAnalysis: (id: string) => void;
  selectedId?: string;
}

export default function QPROAnalysisList({
  onSelectAnalysis,
  selectedId,
}: QPROAnalysisListProps) {
  const [analyses, setAnalyses] = useState<QPROAnalysisSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/qpro/analyses');
      if (!response.ok) {
        throw new Error('Failed to load analyses');
      }

      const data = await response.json();
      setAnalyses(data.analyses || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load analyses';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">QPRO Reports</h2>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="flex items-start gap-3 py-6">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Failed to load reports</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : analyses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-slate-600 font-medium">No reports yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Upload a QPRO report to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {analyses.map((analysis) => (
            <Card
              key={analysis.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedId === analysis.id
                  ? 'ring-2 ring-blue-500 shadow-md'
                  : ''
              }`}
              onClick={() => onSelectAnalysis(analysis.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {analysis.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {analysis.type}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(analysis.status)}>
                    {analysis.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    {formatDate(analysis.uploadedDate)}
                  </div>
                  {analysis.year && analysis.quarter && (
                    <div className="text-slate-600">
                      {analysis.year} {analysis.quarter}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-xs text-slate-600">KRA Count</p>
                    <p className="font-semibold text-slate-900">
                      {analysis.kraCount}
                    </p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-xs text-slate-600">Activities</p>
                    <p className="font-semibold text-slate-900">
                      {analysis.activitiesCount}
                    </p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <p className="text-xs text-slate-600">Achievement</p>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-yellow-600" />
                      <p className="font-semibold text-slate-900">
                        {analysis.achievementPercentage}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all"
                    style={{
                      width: `${analysis.achievementPercentage}%`,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
