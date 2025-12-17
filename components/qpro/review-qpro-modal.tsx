'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Edit2, Save, Trash2, Plus } from 'lucide-react';
import AuthService from '@/lib/services/auth-service';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ReactMarkdown from 'react-markdown';
import strategicPlan from '@/src/data/strategic_plan.json';

// KRA keywords for mismatch detection
const KRA_KEYWORDS: { [key: string]: string[] } = {
  'KRA 1': ['curriculum', 'curricula', 'course', 'program design'],
  'KRA 2': ['market', 'industry', 'demand'],
  'KRA 3': ['instruction', 'teaching', 'learning', 'quality', 'student', 'employment', 'graduate'],
  'KRA 4': ['international', 'mou', 'moa', 'global', 'linkage'],
  'KRA 5': ['research', 'publication', 'innovation'],
  'KRA 6': ['research linkage', 'collaboration', 'partnership'],
  'KRA 7': ['research resources', 'funding', 'laboratory'],
  'KRA 8': ['community', 'outreach', 'service'],
  'KRA 11': ['human resources', 'faculty', 'staff'],
  'KRA 12': ['international', 'global', 'stakeholder'],
  'KRA 13': ['competitive', 'human resources'],
  'KRA 14': ['satisfaction', 'satisfaction rating'],
  'KRA 18': ['risk', 'compliance'],
  'KRA 19': ['revenue', 'operational', 'efficiency'],
  'KRA 22': ['financial', 'resources', 'budget'],
};

// Available KRAs for manual mapping (from LSPU Strategic Plan)
const AVAILABLE_KRAS = [
  { id: 'KRA 1', title: 'Development of New Curricula Incorporating Emerging Technologies' },
  { id: 'KRA 2', title: 'Market-Driven Program Design and Implementation' },
  { id: 'KRA 3', title: 'Quality and Relevance of Instruction' },
  { id: 'KRA 4', title: 'College and Office International Activities and Projects' },
  { id: 'KRA 5', title: 'Research, Extension, and Innovation Productivity' },
  { id: 'KRA 6', title: 'Research, Extension, and Innovation Linkages' },
  { id: 'KRA 7', title: 'Research, Extension, and Innovation Resources' },
  { id: 'KRA 8', title: 'Service to the Community' },
  { id: 'KRA 9', title: 'Implementation of Sustainable Governance' },
  { id: 'KRA 10', title: 'Transforming into Green University' },
  { id: 'KRA 11', title: 'Judicious Management of Human Resources' },
  { id: 'KRA 12', title: 'Internationalized/Global University Stakeholders' },
  { id: 'KRA 13', title: 'Competitive Human Resources' },
  { id: 'KRA 14', title: 'Improved Satisfaction Rating of the Students, Faculty, and Personnel of the University' },
  { id: 'KRA 15', title: 'Certification and Compliance to Regulatory Requirements' },
  { id: 'KRA 16', title: 'Updating of Learning Materials and Facilities' },
  { id: 'KRA 17', title: 'Digital Transformation and Smart Campus Enablement' },
  { id: 'KRA 18', title: 'Risk Management and Compliance' },
  { id: 'KRA 19', title: 'Revenue Growth and Operational Efficiency' },
  { id: 'KRA 20', title: 'Related IGP Industry Engagement' },
  { id: 'KRA 21', title: 'Responsive Management of Resources' },
  { id: 'KRA 22', title: 'Management of Financial Resources' },
];

interface Activity {
  name: string;
  kraId: string;
  initiativeId?: string;
  reported: number;
  target: number;
  achievement: number;
  status: 'MET' | 'MISSED';
  authorizedStrategy?: string;
  aiInsight?: string;
  prescriptiveAnalysis?: string;
  confidence: number;
  unit?: string;
  evidenceSnippet?: string;
  dataType?: string;
  rootCause?: string;
}

function extractDocumentLevelInsight(analysis: any): string {
  const fromJson = analysis?.prescriptiveAnalysis?.documentInsight;
  if (typeof fromJson === 'string' && fromJson.trim()) return fromJson.trim();

  const parts = [analysis?.alignment, analysis?.opportunities, analysis?.gaps]
    .filter((v: any) => typeof v === 'string' && v.trim())
    .map((v: string) => v.trim());

  return parts.join('\n\n');
}

function extractDocumentLevelPrescriptive(analysis: any): string {
  const fromJson = analysis?.prescriptiveAnalysis?.prescriptiveAnalysis;
  if (typeof fromJson === 'string' && fromJson.trim()) return fromJson.trim();
  if (typeof analysis?.recommendations === 'string' && analysis.recommendations.trim()) return analysis.recommendations.trim();
  return '';
}

interface KRASummary {
  kraId: string;
  kraTitle: string;
  achievementRate: number;
  activities: Activity[];
  prescriptiveAnalysis?: string;
  rootCause?: string;
  actionItems?: string[];
}

interface ReviewQProModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisId: string;
  onApprove?: () => void;
  onReject?: () => void;
  forceFullPage?: boolean;
}

type TimelineEntry = {
  year?: number;
  target_value?: any;
};

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const cleaned = String(value).replace(/,/g, '').trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function getTargetFromTimelineForYear(timeline: TimelineEntry[] | undefined, year: number): number | null {
  if (!timeline || timeline.length === 0) return null;

  const exact = timeline.find((t) => Number(t?.year) === year);
  const exactValue = toNumberOrNull(exact?.target_value);
  if (exactValue !== null) return exactValue;

  const numericTargets = timeline
    .map((t) => ({ year: Number(t?.year), target: toNumberOrNull(t?.target_value) }))
    .filter((t) => Number.isFinite(t.year) && t.target !== null) as Array<{ year: number; target: number }>;

  const pastOrEqual = numericTargets.filter((t) => t.year <= year).sort((a, b) => b.year - a.year);
  if (pastOrEqual.length > 0) return pastOrEqual[0].target;

  const future = numericTargets.sort((a, b) => a.year - b.year);
  return future.length > 0 ? future[0].target : null;
}

function getInitiativesForKRA(kraId: string): any[] {
  const kra = (strategicPlan as any)?.kras?.find((k: any) => String(k?.kra_id) === String(kraId));
  return Array.isArray(kra?.initiatives) ? kra.initiatives : [];
}

function findInitiative(kraId: string, initiativeId: string | undefined): any | null {
  if (!initiativeId) return null;
  return getInitiativesForKRA(kraId).find((i: any) => String(i?.id) === String(initiativeId)) || null;
}

function getSelectedTargetType(
  kraId: string,
  initiativeId: string | undefined,
  fallback?: string | null
): string {
  const kpi = findInitiative(kraId, initiativeId);
  const raw = kpi?.targets?.type || fallback || 'count';
  return String(raw).toLowerCase();
}

// Helper function to safely extract prescriptive value from various formats
function extractPrescriptiveValue(data: any): string | null {
  if (!data) return null;
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    // Try common property names first
    if (data.recommendations || data.content || data.analysis || data.text) {
      return data.recommendations || data.content || data.analysis || data.text;
    }
    // Handle dictionary format - extract values, skip single-letter keys (likely iteration keys)
    const keys = Object.keys(data);
    if (keys.length === 0) return null;
    // Prefer keys that are not single letters (avoid 'a', 'b', 'c', 'd' iteration keys)
    const valueKey = keys.find(k => k.length > 1) || keys[0];
    const value = data[valueKey];
    if (typeof value === 'object' && value !== null) {
      if (value.recommendations || value.content || value.analysis) {
        return value.recommendations || value.content || value.analysis;
      }
      return JSON.stringify(value);
    }
    return String(value);
  }
  return null;
}

export default function ReviewQProModal({
  isOpen,
  onClose,
  analysisId,
  onApprove,
  onReject,
  forceFullPage = false,
}: ReviewQProModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [editedActivities, setEditedActivities] = useState<Activity[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [kraValidationErrors, setKraValidationErrors] = useState<{ [key: number]: string }>({});
  const [mismatches, setMismatches] = useState<{ [key: number]: boolean }>({});
  const [changedKRAIndices, setChangedKRAIndices] = useState<Set<number>>(new Set());
  const [kpiValidationErrors, setKpiValidationErrors] = useState<{ [key: number]: string }>({});

  // Load analysis data
  useEffect(() => {
    if (isOpen && analysisId) {
      loadAnalysis();
    }
  }, [isOpen, analysisId]);

  const loadAnalysis = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await AuthService.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/qpro/approve/${analysisId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load analysis');
      }

      const data = await response.json();
      setAnalysis(data);
      
      // Initialize editable activities from the analysis
      const activities = data.activities || [];
      setEditedActivities(activities.map((act: Activity) => ({ ...act })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle activity value change
  const handleActivityChange = (index: number, field: keyof Activity, value: any) => {
    setEditedActivities((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      // Recalculate achievement if reported or target changed
      if (field === 'reported' || field === 'target') {
        const reported = field === 'reported' ? value : updated[index].reported;
        const target = field === 'target' ? value : updated[index].target;
        updated[index].achievement = target > 0 ? (reported / target) * 100 : 0;
        updated[index].status = updated[index].achievement >= 100 ? 'MET' : 'MISSED';
      }

      return updated;
    });
  };

  // Helper function to detect KRA mismatch
  const detectKRAMismatch = (activityName: string, kraId: string): boolean => {
    const keywords = KRA_KEYWORDS[kraId];
    if (!keywords) return false;
    
    const activityLower = activityName.toLowerCase();
    const hasMatchingKeyword = keywords.some((keyword) =>
      activityLower.includes(keyword.toLowerCase())
    );
    
    return !hasMatchingKeyword; // True if no matching keywords found
  };

  // Handle KRA change
  const handleKRAChange = (index: number, kraId: string) => {
    const activity = editedActivities[index];
    const isMismatched = detectKRAMismatch(activity.name, kraId);
    
    setMismatches((prev) => ({
      ...prev,
      [index]: isMismatched,
    }));
    
    // Clear any validation error for this field
    setKraValidationErrors((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    
    // Track that this activity's KRA was changed
    setChangedKRAIndices((prev) => {
      const updated = new Set(prev);
      updated.add(index);
      return updated;
    });

    // Clear KPI validation error for this activity
    setKpiValidationErrors((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    
    setEditedActivities((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        kraId: kraId,
        // Force KPI re-selection under the corrected KRA
        initiativeId: undefined,
      };
      return updated;
    });
  };

  const handleKPIChange = (index: number, initiativeId: string) => {
    const reportYear = Number(analysis?.year) || new Date().getFullYear();

    // Track that this activity should be regenerated (KPI affects targets + narrative)
    setChangedKRAIndices((prev) => {
      const updated = new Set(prev);
      updated.add(index);
      return updated;
    });

    setKpiValidationErrors((prev) => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });

    setEditedActivities((prev) => {
      const updated = [...prev];
      const activity = updated[index];
      const initiative = findInitiative(activity.kraId, initiativeId);
      const newTarget = initiative
        ? getTargetFromTimelineForYear(initiative?.targets?.timeline_data, reportYear)
        : null;

      const target = newTarget !== null ? newTarget : activity.target;
      const achievement = target > 0 ? (Number(activity.reported || 0) / target) * 100 : 0;

      updated[index] = {
        ...activity,
        initiativeId,
        target,
        achievement,
        status: achievement >= 100 ? 'MET' : 'MISSED',
      };
      return updated;
    });
  };

  // Handle delete activity
  const handleDeleteActivity = (index: number) => {
    setEditedActivities((prev) => prev.filter((_, i) => i !== index));
  };

  // Validate all KRAs are assigned
  const validateKRAAssignments = (): boolean => {
    const errors: { [key: number]: string } = {};
    
    editedActivities.forEach((activity, idx) => {
      if (!activity.kraId || activity.kraId.trim() === '') {
        errors[idx] = 'KRA assignment is required';
      }
    });
    
    setKraValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateKPISelections = (): boolean => {
    const errors: { [key: number]: string } = {};

    editedActivities.forEach((activity, idx) => {
      // Only enforce KPI selection when the KRA was changed or if missing.
      if (changedKRAIndices.has(idx) || !activity.initiativeId) {
        const initiatives = getInitiativesForKRA(activity.kraId);
        const isValid = Boolean(activity.initiativeId) && initiatives.some((i: any) => String(i?.id) === String(activity.initiativeId));
        if (!isValid) {
          errors[idx] = 'Select a KPI under the chosen KRA';
        }
      }
    });

    setKpiValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Regenerate insights for activities with changed KRAs
  const handleRegenerateInsights = async () => {
    if (changedKRAIndices.size === 0) {
      setError('No KRA changes to regenerate');
      return;
    }

    if (!validateKPISelections()) {
      setError('Please select the correct KPI for each changed activity before regenerating.');
      return;
    }

    try {
      setIsRegenerating(true);
      setError(null);

      const token = await AuthService.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Get activities with changed KRAs
      const activitiesToRegenerate = editedActivities
        .map((act, idx) => ({
          ...act,
          index: idx,
          // When reviewer regenerates from this screen, treat KPI as explicitly selected.
          // This prevents the regenerate endpoint from overriding initiativeId via LLM matching.
          userSelectedKPI: true,
        }))
        .filter((act) => changedKRAIndices.has(act.index));

      // Call API to regenerate insights based on new KRAs
      const response = await fetch(`/api/qpro/regenerate-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysisId,
          activities: activitiesToRegenerate,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || 'Failed to regenerate insights'
        );
      }

      const regeneratedData = await response.json();

      // Refresh analysis-level document insights so the review reflects the latest regeneration
      setAnalysis((prev: any) => ({
        ...(prev || {}),
        ...(regeneratedData || {}),
      }));

      // Update activities with new insights
      setEditedActivities((prev) => {
        const updated = [...prev];
        regeneratedData.activities.forEach((regenerated: Activity) => {
          const origIndex = activitiesToRegenerate.find(
            (a) => a.name === regenerated.name
          )?.index;
          if (origIndex !== undefined) {
            updated[origIndex] = {
              ...updated[origIndex],
              ...regenerated,
            };
          }
        });
        return updated;
      });

      // Clear the changed KRA indices since we've regenerated
      setChangedKRAIndices(new Set());
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate insights');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle approve
  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate all KRAs are assigned before approval
      if (!validateKRAAssignments()) {
        setError('Please assign a KRA to all activities before approval');
        setIsSubmitting(false);
        return;
      }

      // If any activity was reclassified, enforce KPI selection under the corrected KRA
      if (!validateKPISelections()) {
        setError('Please select the correct KPI under the corrected KRA before approval');
        setIsSubmitting(false);
        return;
      }

      const token = await AuthService.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // CRITICAL: First update activities with edits - must succeed before approval
      console.log('[ReviewModal] Saving activity edits before approval...');
      const updateResponse = await fetch(`/api/qpro/analyses/${analysisId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          activities: editedActivities,
        }),
      });

      if (!updateResponse.ok) {
        const updateError = await updateResponse.json().catch(() => ({}));
        throw new Error(updateError.error || 'Failed to save activity edits. Please try again.');
      }

      console.log('[ReviewModal] Activity edits saved successfully, proceeding with approval...');

      // Then approve - this will use the updated activities from the database
      const response = await fetch(`/api/qpro/approve/${analysisId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve analysis');
      }

      console.log('[ReviewModal] Analysis approved successfully');
      onApprove?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const token = await AuthService.getAccessToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/qpro/approve/${analysisId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: 'Rejected after review',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject analysis');
      }

      onReject?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate summary stats
  const summaryStats = (() => {
    type Group = {
      key: string;
      reported: number;
      target: number;
      achievement: number;
      status: 'MET' | 'MISSED';
    };

    // Compute KPI-level status by grouping activities with the same initiative/KPI.
    // This prevents count-based KPIs from showing inflated "Targets Met" when each row is just a contribution.
    const groupsByKey = new Map<string, { reported: number; target: number }>();

    editedActivities.forEach((activity, idx) => {
      const key = activity.initiativeId?.trim() ? activity.initiativeId.trim() : `__activity_${idx}`;
      const current = groupsByKey.get(key) || { reported: 0, target: 0 };
      const reported = Number(activity.reported) || 0;
      const target = Number(activity.target) || 0;
      current.reported += reported;
      // Use the largest target we see for a KPI group (targets should be consistent within a KPI).
      if (target > current.target) current.target = target;
      groupsByKey.set(key, current);
    });

    const groups: Group[] = Array.from(groupsByKey.entries()).map(([key, g]) => {
      const achievement = g.target > 0 ? (g.reported / g.target) * 100 : 0;
      return {
        key,
        reported: g.reported,
        target: g.target,
        achievement,
        status: achievement >= 100 ? 'MET' : 'MISSED',
      };
    });

    const groupsWithTarget = groups.filter((g) => g.target > 0);
    const fallbackAvg =
      editedActivities.length > 0
        ? editedActivities.reduce((sum, a) => sum + (a.achievement || 0), 0) / editedActivities.length
        : 0;

    return {
      totalActivities: editedActivities.length,
      metCount: groupsWithTarget.filter((g) => g.status === 'MET').length,
      missedCount: groupsWithTarget.filter((g) => g.status === 'MISSED').length,
      avgAchievement:
        groupsWithTarget.length > 0
          ? groupsWithTarget.reduce((sum, g) => sum + g.achievement, 0) / groupsWithTarget.length
          : fallbackAvg,
    };
  })();

  // Content component for both modal and full-page rendering
  const ReviewContent = () => (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Loading analysis...</span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {summaryStats.totalActivities}
                </p>
                <p className="text-xs text-slate-600">Total Activities</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">
                  {summaryStats.metCount}
                </p>
                <p className="text-xs text-green-600">Targets Met</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-700">
                  {summaryStats.missedCount}
                </p>
                <p className="text-xs text-red-600">Targets Missed</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {summaryStats.avgAchievement.toFixed(1)}%
                </p>
                <p className="text-xs text-blue-600">Avg Achievement</p>
              </div>
            </div>

            {/* Document-Level AI Review (exactly one insight + one prescriptive analysis per document) */}
            {(() => {
              const documentInsight = extractDocumentLevelInsight(analysis);
              const prescriptive = extractDocumentLevelPrescriptive(analysis);

              if (!documentInsight && !prescriptive) return null;

              return (
                <div className="space-y-3 mb-4">
                  {documentInsight && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Label className="text-xs text-blue-700 font-semibold">
                        Document Insight
                      </Label>
                      <div className="text-blue-900 mt-1 text-sm prose prose-sm max-w-none">
                        <ReactMarkdown>{documentInsight}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {prescriptive && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <Label className="text-xs text-amber-700 font-semibold">
                        Prescriptive Analysis
                      </Label>
                      <div className="text-amber-900 mt-1 text-sm prose prose-sm max-w-none">
                        <ReactMarkdown>{prescriptive}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Activities List */}
            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                {editedActivities.map((activity, idx) => (
                  <Card
                    key={idx}
                    className={`border-l-4 ${
                      activity.status === 'MET'
                        ? 'border-l-green-500'
                        : 'border-l-red-500'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Activity Name */}
                          <div>
                            <Label className="text-xs text-slate-500">
                              Activity Name
                            </Label>
                            <p className="font-medium text-slate-900">
                              {activity.name}
                            </p>
                          </div>

                          {/* Editable Fields Row */}
                          <div className="grid grid-cols-1 gap-3">
                            {/* KRA Selector - Full Width with Validation */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Label className={`text-xs font-semibold ${
                                  kraValidationErrors[idx]
                                    ? 'text-red-600'
                                    : mismatches[idx]
                                    ? 'text-amber-600'
                                    : 'text-slate-600'
                                }`}>
                                  KRA Assignment *
                                </Label>
                                {mismatches[idx] && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                                    <AlertTriangle className="w-3 h-3" />
                                    Possible Mismatch
                                  </span>
                                )}
                              </div>
                              <Select
                                value={activity.kraId || ''}
                                onValueChange={(v) => handleKRAChange(idx, v)}
                              >
                                <SelectTrigger className={`h-8 text-sm ${
                                  kraValidationErrors[idx]
                                    ? 'border-red-300 bg-red-50'
                                    : mismatches[idx]
                                    ? 'border-amber-300 bg-amber-50'
                                    : ''
                                }`}>
                                  <SelectValue placeholder="Select KRA (required)" />
                                </SelectTrigger>
                                <SelectContent>
                                  {AVAILABLE_KRAS.map((kra) => (
                                    <SelectItem key={kra.id} value={kra.id}>
                                      <span className="text-sm">
                                        <strong>{kra.id}</strong>: {kra.title.substring(0, 60)}...
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {kraValidationErrors[idx] && (
                                <p className="text-xs text-red-600 mt-1 font-medium">
                                  {kraValidationErrors[idx]}
                                </p>
                              )}
                              {activity.kraId && !kraValidationErrors[idx] && (
                                <p className="text-xs text-slate-500 mt-1">
                                  {AVAILABLE_KRAS.find((k) => k.id === activity.kraId)?.title}
                                </p>
                              )}
                            </div>

                            {/* KPI Selector (must be under the selected KRA) */}
                            <div className="w-full">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                <Label
                                  className={`text-xs font-semibold ${
                                    kpiValidationErrors[idx]
                                      ? 'text-red-600'
                                      : 'text-slate-600'
                                  }`}
                                >
                                  KPI Selection
                                  {changedKRAIndices.has(idx) && (
                                    <span className="text-red-600"> *</span>
                                  )}
                                </Label>
                                <Badge variant="outline" className="text-[10px] px-2 py-0.5 shrink-0 whitespace-nowrap">
                                  Target Year: {Number(analysis?.year) || new Date().getFullYear()}
                                </Badge>
                              </div>

                              <Select
                                value={activity.initiativeId || ''}
                                onValueChange={(v) => handleKPIChange(idx, v)}
                              >
                                <SelectTrigger
                                  className={`h-10 text-sm bg-white ${
                                    kpiValidationErrors[idx]
                                      ? 'border-red-300 bg-red-50'
                                      : ''
                                  }`}
                                >
                                  <SelectValue placeholder="Choose a KPI under this KRA..." />
                                </SelectTrigger>
                                <SelectContent className="max-h-80 w-auto min-w-[500px] max-w-[700px]">
                                  {(() => {
                                    const initiatives = getInitiativesForKRA(activity.kraId);
                                    const reportYear =
                                      Number(analysis?.year) || new Date().getFullYear();

                                    return initiatives.map((kpi: any) => {
                                      const outputs =
                                        kpi?.key_performance_indicator?.outputs ||
                                        kpi?.description ||
                                        '';
                                      const targetType = String(
                                        kpi?.targets?.type || 'count'
                                      );
                                      const targetValue = getTargetFromTimelineForYear(
                                        kpi?.targets?.timeline_data,
                                        reportYear
                                      );
                                      const targetDisplay =
                                        targetValue === null
                                          ? 'N/A'
                                          : `${targetValue.toFixed(2)}${
                                              targetType === 'percentage' ? '%' : ''
                                            }`;

                                      return (
                                        <SelectItem
                                          key={String(kpi?.id)}
                                          value={String(kpi?.id)}
                                          className="py-3 cursor-pointer px-2"
                                        >
                                          <div className="flex flex-col gap-2 w-full">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                              <span className="font-semibold text-indigo-700 shrink-0">
                                                {String(kpi?.id)}
                                              </span>
                                              <Badge
                                                variant="outline"
                                                className="text-xs px-1.5 py-0.5 shrink-0 whitespace-nowrap"
                                              >
                                                Target ({reportYear}): {targetDisplay} ({targetType})
                                              </Badge>
                                            </div>
                                            {outputs ? (
                                              <p className="text-xs text-slate-600 whitespace-normal leading-relaxed 'wrap-break-word">
                                                <strong>Output:</strong>{' '}
                                                {outputs.length > 120
                                                  ? outputs.substring(0, 120) + '...'
                                                  : outputs}
                                              </p>
                                            ) : null}
                                          </div>
                                        </SelectItem>
                                      );
                                    });
                                  })()}
                                </SelectContent>
                              </Select>

                              {kpiValidationErrors[idx] && (
                                <p className="text-xs text-red-600 mt-1 font-medium">
                                  {kpiValidationErrors[idx]}
                                </p>
                              )}

                              {(() => {
                                const kpi = findInitiative(
                                  activity.kraId,
                                  activity.initiativeId
                                );
                                const outputs =
                                  kpi?.key_performance_indicator?.outputs ||
                                  kpi?.description ||
                                  '';
                                if (!outputs) return null;
                                return (
                                  <p className="text-xs text-slate-500 mt-1">
                                    <strong>KPI Output:</strong>{' '}
                                    {outputs.length > 120
                                      ? outputs.substring(0, 120) + '...'
                                      : outputs}
                                  </p>
                                );
                              })()}
                            </div>

                            {/* Reported, Target, Achievement in Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                              {/* Reported Value */}
                              <div className="w-full">
                                <Label className="text-xs text-slate-500 block truncate">
                                  {getSelectedTargetType(activity.kraId, activity.initiativeId) === 'percentage'
                                    ? 'Reported (Actual %)'
                                    : 'Reported'}
                                </Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={activity.reported}
                                  onChange={(e) =>
                                    handleActivityChange(
                                      idx,
                                      'reported',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="h-8 text-sm mt-0.5"
                                />
                              </div>

                              {/* Target Value */}
                              <div className="w-full">
                                <Label className="text-xs text-slate-500 block truncate">
                                  {getSelectedTargetType(activity.kraId, activity.initiativeId) === 'percentage'
                                    ? 'Target (%)'
                                    : 'Target'}
                                </Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={activity.target}
                                  onChange={(e) =>
                                    handleActivityChange(
                                      idx,
                                      'target',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="h-8 text-sm mt-0.5"
                                />
                              </div>

                              {/* Achievement (calculated) */}
                              <div className="w-full">
                                <Label className="text-xs text-slate-500 block truncate">
                                  {getSelectedTargetType(activity.kraId, activity.initiativeId) === 'percentage'
                                    ? 'Progress to Target'
                                    : 'Achievement'}
                                </Label>
                                <div className="flex items-center h-8 gap-2 mt-0.5">
                                  <span
                                    className={`text-sm font-semibold ${
                                      activity.achievement >= 100
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                    }`}
                                  >
                                    {activity.achievement.toFixed(1)}%
                                    {getSelectedTargetType(activity.kraId, activity.initiativeId) === 'percentage'
                                      ? ' of target'
                                      : ''}
                                  </span>
                                  <Badge
                                    className={
                                      activity.status === 'MET'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }
                                  >
                                    {activity.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            </div>

                          {/* Per-activity AI insight/prescriptive analysis intentionally not shown.
                              Requirement: exactly one Document Insight and one Prescriptive Analysis per document,
                              reviewed at the document level before approval. */}

                          {/* Evidence Snippet */}
                          {activity.evidenceSnippet && (
                            <div className="p-2 bg-slate-50 rounded text-xs">
                              <Label className="text-xs text-slate-500">
                                Evidence
                              </Label>
                              <p className="text-slate-700 italic mt-1">
                                "{activity.evidenceSnippet}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Confidence Badge & Actions */}
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                              activity.confidence >= 0.85
                                ? 'bg-green-100 text-green-700'
                                : activity.confidence >= 0.7
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {(activity.confidence * 100).toFixed(0)}%
                          </div>
                          <p className="text-xs text-slate-500">
                            Confidence
                          </p>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteActivity(idx)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete this activity</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </>
  );

  // Footer component for both modal and full-page rendering
  const ReviewFooter = () => (
    <div className={forceFullPage ? 'mt-6 gap-2 flex flex-col sm:flex-row' : 'gap-2 flex flex-col sm:flex-row'}>
      {/* Info text when KRAs are changed */}
      {changedKRAIndices.size > 0 && (
        <div className="sm:col-span-2 md:col-span-3 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-2">
          <p className="text-sm text-blue-700">
            <strong>{changedKRAIndices.size} activity update(s) pending.</strong> Click "Regenerate Insights" to update targets and document-level AI analysis based on corrected KRA/KPI selections.
          </p>
        </div>
      )}
      
      <Button variant="outline" onClick={onClose} disabled={isSubmitting || isRegenerating}>
        Cancel
      </Button>
      
      {/* Regenerate Insights Button - visible when KRAs changed */}
      {changedKRAIndices.size > 0 && (
        <Button
          onClick={handleRegenerateInsights}
          disabled={isRegenerating || isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {isRegenerating ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Edit2 className="w-4 h-4 mr-2" />
          )}
          {isRegenerating ? 'Regenerating...' : 'Regenerate Insights'}
        </Button>
      )}
      
      <Button
        variant="destructive"
        onClick={handleReject}
        disabled={isLoading || isSubmitting || isRegenerating}
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <XCircle className="w-4 h-4 mr-2" />
        )}
        Reject
      </Button>
      <Button
        onClick={handleApprove}
        disabled={isLoading || isSubmitting || isRegenerating}
        className="bg-green-600 hover:bg-green-700"
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <CheckCircle className="w-4 h-4 mr-2" />
        )}
        Approve & Commit
      </Button>
    </div>
  );

  // Render as full page or modal based on forceFullPage prop
  if (forceFullPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Edit2 className="w-5 h-5" />
          <h2 className="text-2xl font-bold">Review QPro Analysis</h2>
        </div>
        
        <ReviewContent />
        <ReviewFooter />
      </div>
    );
  }

  // Default: render as modal
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] h-[95vh] max-w-[1400px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            Review QPro Analysis
          </DialogTitle>
        </DialogHeader>

        <ReviewContent />

        <DialogFooter className="mt-4 gap-2 flex flex-col sm:flex-row">
          <ReviewFooter />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
