'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Clock, User, AlertCircle } from 'lucide-react';

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOWER';
  timeline?: string;
  owner?: string;
  kraId?: string;
}

interface RecommendationsDisplayProps {
  recommendations: Recommendation[];
}

export default function RecommendationsDisplay({
  recommendations,
}: RecommendationsDisplayProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOWER':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <AlertCircle className="w-4 h-4" />;
      case 'MEDIUM':
        return <Clock className="w-4 h-4" />;
      case 'LOWER':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const highPriority = recommendations.filter((r) => r.priority === 'HIGH');
  const mediumPriority = recommendations.filter((r) => r.priority === 'MEDIUM');
  const lowerPriority = recommendations.filter((r) => r.priority === 'LOWER');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Prescriptive Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* High Priority */}
        {highPriority.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              🔴 High Priority ({highPriority.length})
            </h3>
            {highPriority.map((rec) => (
              <div
                key={rec.id}
                className="p-4 border-l-4 border-red-500 bg-red-50 rounded-lg"
              >
                <div className="flex items-start gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{rec.title}</h4>
                    <p className="text-sm text-slate-700 mt-1">
                      {rec.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                  {rec.timeline && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-4 h-4" />
                      {rec.timeline}
                    </div>
                  )}
                  {rec.owner && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <User className="w-4 h-4" />
                      {rec.owner}
                    </div>
                  )}
                  <Badge
                    className={`border ${getPriorityColor(rec.priority)}`}
                  >
                    {rec.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Medium Priority */}
        {mediumPriority.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              🟡 Medium Priority ({mediumPriority.length})
            </h3>
            {mediumPriority.map((rec) => (
              <div
                key={rec.id}
                className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-lg"
              >
                <div className="flex items-start gap-3 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{rec.title}</h4>
                    <p className="text-sm text-slate-700 mt-1">
                      {rec.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                  {rec.timeline && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-4 h-4" />
                      {rec.timeline}
                    </div>
                  )}
                  {rec.owner && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <User className="w-4 h-4" />
                      {rec.owner}
                    </div>
                  )}
                  <Badge
                    className={`border ${getPriorityColor(rec.priority)}`}
                  >
                    {rec.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lower Priority */}
        {lowerPriority.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              🔵 Lower Priority ({lowerPriority.length})
            </h3>
            {lowerPriority.map((rec) => (
              <div
                key={rec.id}
                className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg"
              >
                <div className="flex items-start gap-3 mb-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{rec.title}</h4>
                    <p className="text-sm text-slate-700 mt-1">
                      {rec.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                  {rec.timeline && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-4 h-4" />
                      {rec.timeline}
                    </div>
                  )}
                  {rec.owner && (
                    <div className="flex items-center gap-1 text-slate-600">
                      <User className="w-4 h-4" />
                      {rec.owner}
                    </div>
                  )}
                  <Badge
                    className={`border ${getPriorityColor(rec.priority)}`}
                  >
                    {rec.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {recommendations.length === 0 && (
          <div className="text-center py-6">
            <Lightbulb className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600">No recommendations available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
