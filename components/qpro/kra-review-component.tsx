'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  FileText,
  FolderOpen,
} from 'lucide-react';

export interface KRAClassification {
  id: string;
  title: string;
  count: number;
  achievementRate: number;
  strategicAlignment?: string;
  kpiName?: string; // Optional: KPI name for display
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

/**
 * KRA Classification Review Component
 * 
 * PURPOSE: Document Inventory / Verification List
 * Shows WHAT was captured by the AI, not performance metrics.
 * 
 * For performance metrics, see the KPI-Level Breakdown (Yellow Card).
 */
export default function KRAReviewComponent({ classifications, isApproved = false }: KRAReviewProps) {

  // Map KRA ID to readable title
  const mappedClassifications = classifications.map(kra => ({
    ...kra,
    title: getKRATitle(kra.id, kra.title)
  }));

  // Calculate total records found
  const totalRecords = mappedClassifications.reduce((sum, kra) => sum + kra.count, 0);

  return (
    <Card className="border rounded-lg bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FolderOpen className="w-5 h-5 text-slate-600" />
            KRA Classification Review
          </CardTitle>
          <div className="flex items-center gap-2">
            {totalRecords > 0 && (
              <Badge variant="secondary" className="text-slate-600">
                {totalRecords} Total Records
              </Badge>
            )}
            {isApproved && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {mappedClassifications.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No KRA classifications found</p>
          </div>
        ) : (
          mappedClassifications.map((kra) => (
            <div
              key={kra.id}
              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              {/* Left: KRA Name */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-slate-800">{kra.title}</span>
                  {kra.kpiName && (
                    <span className="text-xs text-slate-500">{kra.kpiName}</span>
                  )}
                </div>
              </div>

              {/* Right: Data Inventory Count */}
              <div className="text-right">
                <span className="block text-lg font-bold text-slate-900">
                  {kra.count}
                </span>
                <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">
                  {kra.count === 1 ? 'Record Found' : 'Records Found'}
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
