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
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, XCircle, Edit2 } from 'lucide-react';
import AuthService from '@/lib/services/auth-service';
import ReactMarkdown from 'react-markdown';
import strategicPlan from '@/lib/data/strategic_plan.json';
import { ActivityCardRedesigned } from '@/components/qpro/activity-card-redesigned';

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
  evidenceSnippet?: string;
  confidence: number;
  confidenceScore?: number;
  prescriptiveNote?: string;
  prescriptiveAnalysis?: string;
  rootCause?: string;
  aiInsight?: string;
}

interface ReviewModalProps {
  isOpen?: boolean;
  onClose: () => void;
  analysisId: string;
  onApprove?: () => void;
  onReject?: () => void;
  forceFullPage?: boolean;
}

export default function ReviewQProModal({
  isOpen,
  onClose,
  analysisId,
  onApprove,
  onReject,
  forceFullPage = false,
}: ReviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [editedActivities, setEditedActivities] = useState<Activity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [changedKRAIndices, setChangedKRAIndices] = useState<Set<number>>(new Set());
  const [mismatches, setMismatches] = useState<{ [key: number]: boolean }>({});
  const [kraValidationErrors, setKraValidationErrors] = useState<{ [key: number]: string }>({});
  const [kpiValidationErrors, setKpiValidationErrors] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (analysisId && (isOpen || forceFullPage)) {
      fetchAnalysis();
    }
  }, [analysisId, isOpen, forceFullPage]);

  // Helper to extract flat activities array from API response
  const extractActivitiesFromResponse = (data: any): Activity[] => {
    // Check if activities are directly available
    if (data.activities && Array.isArray(data.activities) && data.activities.length > 0) {
      return data.activities.map((act: any) => ({
        name: act.name || act.title || 'Unnamed Activity',
        kraId: act.kraId || act.kra_id || '',
        initiativeId: act.initiativeId || act.initiative_id || '',
        reported: Number(act.reported) || 0,
        target: Number(act.target) || 0,
        achievement: Number(act.achievement) || 0,
        status: act.status === 'MET' ? 'MET' : 'MISSED',
        authorizedStrategy: act.authorizedStrategy || '',
        evidenceSnippet: act.evidenceSnippet || '',
        confidence: Number(act.confidence) || 0.75,
        confidenceScore: Number(act.confidenceScore) || Number(act.confidence) || 0.75,
        prescriptiveNote: act.prescriptiveNote || '',
        prescriptiveAnalysis: act.prescriptiveAnalysis || '',
        rootCause: act.rootCause || '',
        aiInsight: act.aiInsight || '',
      }));
    }

    // Extract from organizedActivities (nested KRA → activities structure)
    if (data.organizedActivities && Array.isArray(data.organizedActivities)) {
      const flatActivities: Activity[] = [];
      data.organizedActivities.forEach((kraGroup: any) => {
        const kraId = kraGroup.kraId || '';
        const kpiId = kraGroup.kpiId || '';
        if (kraGroup.activities && Array.isArray(kraGroup.activities)) {
          kraGroup.activities.forEach((act: any) => {
            flatActivities.push({
              name: act.title || act.name || 'Unnamed Activity',
              kraId: kraId,
              initiativeId: act.initiativeId || kpiId || '',
              reported: Number(act.reported) || 0,
              target: Number(act.target) || 0,
              achievement: Number(act.achievement) || 0,
              status: act.status === 'MET' || (Number(act.achievement) >= 100) ? 'MET' : 'MISSED',
              authorizedStrategy: act.authorizedStrategy || '',
              evidenceSnippet: act.evidenceSnippet || act.description || '',
              confidence: Number(act.confidence) || 0.75,
              confidenceScore: Number(act.confidenceScore) || Number(act.confidence) || 0.75,
              prescriptiveNote: act.prescriptiveNote || '',
              prescriptiveAnalysis: act.prescriptiveAnalysis || '',
              rootCause: act.rootCause || '',
              aiInsight: act.aiInsight || '',
            });
          });
        }
      });
      return flatActivities;
    }

    return [];
  };

  const fetchAnalysis = async () => {
    try {
      setIsLoading(true);
      const token = await AuthService.getAccessToken();
      const response = await fetch(`/api/qpro/analyses/${analysisId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch analysis');
      const data = await response.json();
      setAnalysis(data);
      
      // Extract activities from the response (handles both flat and nested structures)
      const activities = extractActivitiesFromResponse(data);
      setEditedActivities(activities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitiativesForKRA = (kraId: string) => {
    const kra = strategicPlan.kras.find((k: any) => k.kra_id === kraId);
    if (!kra?.initiatives) return [];
    const currentYear = Number(analysis?.year) || new Date().getFullYear();
    return kra.initiatives.map((i: any) => {
      // Get target for current year from timeline_data
      const timelineData = i.targets?.timeline_data;
      const yearTarget = timelineData?.find((t: any) => t.year === currentYear);
      const targetValue = yearTarget ? parseFloat(yearTarget.target_value) : undefined;
      
      return {
        ...i,
        title: i.key_performance_indicator?.outputs || i.key_performance_indicator?.outcomes || i.description || i.id,
        target: targetValue,
        targetType: i.targets?.type || 'count',
      };
    });
  };

  const findInitiative = (kraId: string, initiativeId?: string) => {
    if (!initiativeId) return null;
    const initiatives = getInitiativesForKRA(kraId);
    return initiatives.find((i: any) => i.id === initiativeId);
  };

  const getTargetFromTimelineForYear = (timelineData: any[] | undefined, year: number) => {
    if (!timelineData) return null;
    const target = timelineData.find((t: any) => t.year === year);
    return target ? parseFloat(target.target_value) : null;
  };

  const handleActivityChange = (index: number, field: keyof Activity, value: any) => {
    const updated = [...editedActivities];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'reported' || field === 'target') {
      const reported = field === 'reported' ? value : updated[index].reported;
      const target = field === 'target' ? value : updated[index].target;
      if (target > 0) {
        updated[index].achievement = (reported / target) * 100;
        updated[index].status = updated[index].achievement >= 100 ? 'MET' : 'MISSED';
      } else {
        updated[index].achievement = 0;
      }
    }
    setEditedActivities(updated);
  };

  const handleKRAChange = (index: number, kraId: string) => {
    const updated = [...editedActivities];
    updated[index] = { ...updated[index], kraId, initiativeId: undefined };
    setEditedActivities(updated);
    
    const newChanged = new Set(changedKRAIndices);
    newChanged.add(index);
    setChangedKRAIndices(newChanged);
    
    // Check for mismatch
    const keywords = KRA_KEYWORDS[kraId] || [];
    const activityName = updated[index].name.toLowerCase();
    const isMismatch = !keywords.some(k => activityName.includes(k));
    setMismatches(prev => ({ ...prev, [index]: isMismatch }));
  };

  const handleKPIChange = (index: number, kpiId: string) => {
    const updated = [...editedActivities];
    updated[index] = { ...updated[index], initiativeId: kpiId };
    
    // Auto-set target if available
    const year = Number(analysis?.year) || new Date().getFullYear();
    const kpi = findInitiative(updated[index].kraId, kpiId);
    const target = getTargetFromTimelineForYear(kpi?.targets?.timeline_data, year);
    
    if (target !== null) {
      updated[index].target = target;
      if (target > 0) {
        updated[index].achievement = (updated[index].reported / target) * 100;
        updated[index].status = updated[index].achievement >= 100 ? 'MET' : 'MISSED';
      }
    }
    
    setEditedActivities(updated);
  };

  const handleDeleteActivity = (index: number) => {
    const updated = editedActivities.filter((_, i) => i !== index);
    setEditedActivities(updated);
  };

  const validateKRAAssignments = () => {
    const errors: { [key: number]: string } = {};
    editedActivities.forEach((act, idx) => {
      if (!act.kraId) errors[idx] = 'KRA is required';
    });
    setKraValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateKPISelections = () => {
    const errors: { [key: number]: string } = {};
    editedActivities.forEach((act, idx) => {
      if (changedKRAIndices.has(idx) && !act.initiativeId) {
        errors[idx] = 'KPI is required for changed KRA';
      }
    });
    setKpiValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper to safely extract text from various data structures
  const safeExtractText = (val: any): string | null => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) {
      // If array of objects with title/action/issue fields, format nicely
      return val.map((item, idx) => {
        if (typeof item === 'string') return `${idx + 1}. ${item}`;
        if (typeof item === 'object') {
          const title = item.title || item.issue || item.name || '';
          const action = item.action || item.nextStep || item.recommendation || '';
          if (title && action) return `**${title}**: ${action}`;
          if (title) return `- ${title}`;
          if (action) return `- ${action}`;
          // Fallback: show key fields
          const keys = Object.keys(item).filter(k => typeof item[k] === 'string');
          return keys.map(k => `- **${k}**: ${item[k]}`).join('\n');
        }
        return String(item);
      }).join('\n\n');
    }
    if (typeof val === 'object') {
      // Handle nested object with common fields
      const parts: string[] = [];
      if (val.documentInsight) parts.push(safeExtractText(val.documentInsight) || '');
      if (val.prescriptiveAnalysis) parts.push(safeExtractText(val.prescriptiveAnalysis) || '');
      if (val.summary) parts.push(safeExtractText(val.summary) || '');
      if (val.recommendations) parts.push(safeExtractText(val.recommendations) || '');
      if (val.prescriptiveItems) parts.push(safeExtractText(val.prescriptiveItems) || '');
      if (parts.length > 0) return parts.filter(Boolean).join('\n\n');
      // Fallback: iterate object keys
      const entries = Object.entries(val).filter(([, v]) => v && typeof v === 'string');
      if (entries.length > 0) {
        return entries.map(([k, v]) => `**${k}**: ${v}`).join('\n\n');
      }
    }
    return null;
  };

  const extractDocumentLevelInsight = (analysisData: any): string | null => {
    if (!analysisData) return null;
    const val = analysisData.aiInsight || analysisData.documentInsight;
    return safeExtractText(val);
  };

  const extractDocumentLevelPrescriptive = (analysisData: any): string | null => {
    if (!analysisData) return null;
    const val = analysisData.prescriptiveAnalysis;
    return safeExtractText(val);
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
  // FIX: Calculate average achievement by averaging individual activity percentages,
  // NOT by summing reported values and dividing by max target (which inflates percentages)
  const summaryStats = (() => {
    const activitiesWithTarget = editedActivities.filter((a) => a.target > 0);
    
    // Calculate average achievement: sum of all achievement percentages / count
    const avgAchievement = activitiesWithTarget.length > 0
      ? activitiesWithTarget.reduce((sum, a) => sum + (a.achievement || 0), 0) / activitiesWithTarget.length
      : 0;
    
    // Count activities that met their targets (achievement >= 100%)
    const metCount = activitiesWithTarget.filter((a) => a.achievement >= 100).length;
    const missedCount = activitiesWithTarget.filter((a) => a.achievement < 100).length;

    return {
      totalActivities: editedActivities.length,
      metCount,
      missedCount,
      avgAchievement,
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
          <div className="flex justify-center gap-3 mb-4 flex-wrap">
            <div className="p-3 bg-blue-50 rounded-lg text-center min-w-[100px]">
              <p className="text-2xl font-bold text-blue-700">
                {summaryStats.avgAchievement.toFixed(1)}%
              </p>
              <p className="text-xs text-blue-600">Overall Achievement</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg text-center min-w-[100px]">
              <p className="text-2xl font-bold text-slate-900">
                {summaryStats.totalActivities}
              </p>
              <p className="text-xs text-slate-600">Total Activities</p>
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

          {/* Activities List - Modern Split Layout */}
          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-4">
              {editedActivities.map((activity, idx) => (
                <ActivityCardRedesigned
                  key={activity.name + idx}
                  activity={activity}
                  mismatches={mismatches[idx]}
                  kraValidationError={kraValidationErrors[idx]}
                  kpiValidationError={kpiValidationErrors[idx]}
                  availableKRAs={AVAILABLE_KRAS}
                  availableKPIs={getInitiativesForKRA(activity.kraId)}
                  onKRAChange={(v) => handleKRAChange(idx, v)}
                  onKPIChange={(v) => handleKPIChange(idx, v)}
                  onReportedChange={(v) => handleActivityChange(idx, 'reported', v)}
                  onTargetChange={(v) => handleActivityChange(idx, 'target', v)}
                  onDelete={() => handleDeleteActivity(idx)}
                  kraChanged={changedKRAIndices.has(idx)}
                />
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
    <Dialog
      open={!!isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
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
