'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Trash2, FileText } from 'lucide-react';

export interface ActivityCardRedesignedProps {
  activity: {
    name: string;
    kraId: string;
    initiativeId?: string;
    reported: number;
    target: number;
    achievement: number;
    status: string;
    dataType?: string;
    confidenceScore?: number;
    confidence?: number;
    evidenceSnippet?: string;
    prescriptiveNote?: string;
  };
  editedKRA?: string;
  editedKPI?: string;
  onKRAChange?: (kraId: string) => void;
  onKPIChange?: (kpiId: string) => void;
  onReportedChange?: (value: number) => void;
  onTargetChange?: (value: number) => void;
  onDelete?: () => void;
  kraChanged?: boolean;
  availableKRAs?: Array<{ id: string; title: string }>;
  availableKPIs?: Array<{ id: string; title: string; target?: number; targetType?: string }>;
  index?: number;
  mismatches?: boolean;
  kraValidationError?: string;
  kpiValidationError?: string;
}

/**
 * Activity Card - Simplified Layout
 * Shows KRA/KPI assignment and evidence only (removed per-activity performance metrics to avoid confusion)
 */
export function ActivityCardRedesigned({
  activity,
  editedKRA,
  editedKPI,
  onKRAChange,
  onKPIChange,
  onDelete,
  kraChanged,
  availableKRAs = [],
  availableKPIs = [],
  mismatches,
  kraValidationError,
  kpiValidationError,
}: ActivityCardRedesignedProps) {

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{activity.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            className="text-gray-300 hover:text-red-500 transition-colors p-1"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content: Single Column Layout (removed confusing per-activity performance panel) */}
      <div className="space-y-4">
        {/* Left: Context */}
        <div className="space-y-4">
          {/* KRA Assignment */}
          <div>
            <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">KRA Assignment *</Label>
            <Select value={editedKRA || activity.kraId} onValueChange={onKRAChange}>
              <SelectTrigger className={cn("w-full mt-1 bg-white border rounded-lg", kraValidationError ? "border-red-500" : "border-gray-300")}>
                <SelectValue placeholder="Select KRA" />
              </SelectTrigger>
              <SelectContent>
                {availableKRAs.map((kra) => (
                  <SelectItem key={kra.id} value={kra.id}>
                    {kra.id}: {kra.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {kraValidationError && <p className="text-xs text-red-500 mt-1">{kraValidationError}</p>}
            {mismatches && <p className="text-xs text-yellow-600 mt-1">⚠️ Potential KRA mismatch detected</p>}
          </div>

          {/* KPI Selection */}
          <div>
            <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">KPI Selection</Label>
            <div className={cn("mt-1 bg-gray-50 rounded-lg border p-3", kpiValidationError ? "border-red-500" : "border-gray-200")}>
              <Select value={editedKPI || activity.initiativeId} onValueChange={onKPIChange}>
                <SelectTrigger className="w-full bg-white border border-gray-300 rounded-md h-auto min-h-[40px] py-2">
                  <SelectValue placeholder="Select KPI">
                    {(editedKPI || activity.initiativeId) && (
                      <span className="text-left">{editedKPI || activity.initiativeId}</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {availableKPIs.map((kpi) => (
                    <SelectItem key={kpi.id} value={kpi.id} className="cursor-pointer">
                      <div className="py-1">
                        <div className="font-medium text-sm">{kpi.id}</div>
                        {kpi.title && (
                          <div className="text-xs text-gray-500 mt-0.5 whitespace-normal max-w-[350px]">
                            {kpi.title}
                          </div>
                        )}
                        {kpi.target !== undefined && (
                          <div className="text-xs text-blue-600 font-medium mt-0.5">
                            Target: {kpi.target}{kpi.targetType === 'percentage' ? '%' : ''}
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {kpiValidationError && <p className="text-xs text-red-500 mt-1">{kpiValidationError}</p>}
              
              {/* Selected KPI Details */}
              {(editedKPI || activity.initiativeId) && (
                <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                  <p className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">Output:</span> {availableKPIs.find(k => k.id === (editedKPI || activity.initiativeId))?.title || 'N/A'}
                  </p>
                  <p className="text-xs">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Target: {activity.target}</span>
                  </p>
                </div>
              )}
            </div>
            {kraChanged && (
              <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-700 rounded px-2 py-1 font-semibold">
                Possible Mismatch
              </span>
            )}
          </div>

          {/* Evidence - only show if it's a real snippet, not auto-generated text */}
          {activity.evidenceSnippet && 
           !activity.evidenceSnippet.startsWith('Target:') && 
           activity.evidenceSnippet.length > 10 && (
            <div>
              <Label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Evidence</Label>
              <div className="mt-1 flex items-start gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded border border-dashed border-gray-300">
                <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="italic">"{activity.evidenceSnippet}"</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
