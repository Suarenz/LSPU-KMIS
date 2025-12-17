'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  BarChart3,
} from 'lucide-react';

export interface KRAClassification {
  id: string;
  title: string;
  count: number;
  achievementRate: number;
  strategicAlignment?: string;
}

interface KRAReviewProps {
  classifications: KRAClassification[];
  isApproved?: boolean;
}

// Map KRA IDs to human-readable titles
const KRA_TITLES: { [key: string]: string } = {
  'KRA 1': 'Development of New Curricula',
  'KRA 2': 'Accreditation',
  'KRA 3': 'Quality and Relevance of Instruction',
  'KRA 4': 'International Activities',
  'KRA 5': 'Research Outputs',
  'KRA 6': 'Extension Programs',
  'KRA 7': 'Community Partnerships',
  'KRA 8': 'Technology Transfer',
  'KRA 9': 'Revenue Generation',
  'KRA 10': 'Resource Mobilization',
  'KRA 11': 'Human Resource Management',
  'KRA 12': 'Student Development',
  'KRA 13': 'Health and Wellness',
  'KRA 14': 'Environmental Sustainability',
  'KRA 15': 'Quality Management',
  'KRA 16': 'Governance',
  'KRA 17': 'Digital Transformation',
  'UNCLASSIFIED': 'Uncategorized Activities',
};

function getKRATitle(kraId: string, fallbackTitle?: string): string {
  return KRA_TITLES[kraId] || fallbackTitle || kraId;
}

export default function KRAReviewComponent({ classifications, isApproved = false }: KRAReviewProps) {

  const getAchievementColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAchievementBg = (rate: number) => {
    if (rate >= 80) return 'bg-green-50';
    if (rate >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  // Map KRA ID to readable title
  const mappedClassifications = classifications.map(kra => ({
    ...kra,
    title: getKRATitle(kra.id, kra.title)
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            KRA Classification Review
          </CardTitle>
          {isApproved && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mappedClassifications.map((kra) => (
          <div
            key={kra.id}
            className={`p-4 rounded-lg border transition-all ${getAchievementBg(kra.achievementRate)} border-slate-200`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-slate-900">{kra.title}</h4>
                <p className="text-sm text-slate-600 mt-1">
                  {kra.count} activities recorded
                </p>
              </div>
              <span className={`text-lg font-bold ${getAchievementColor(kra.achievementRate)}`}>
                {kra.achievementRate}%
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                  Achievement Rate
                </span>
                <span
                  className={`text-sm font-bold ${getAchievementColor(kra.achievementRate)}`}
                >
                  {kra.achievementRate}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    kra.achievementRate >= 80
                      ? 'bg-green-600'
                      : kra.achievementRate >= 60
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                  }`}
                  style={{ width: `${kra.achievementRate}%` }}
                />
              </div>
            </div>

          </div>
        ))}
      </CardContent>
    </Card>
  );
}
