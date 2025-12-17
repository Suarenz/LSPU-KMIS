'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Target,
  TrendingUp,
  Lightbulb,
  Quote,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AuthService from '@/lib/services/auth-service';

// Available KRAs for selection
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

// Helper to format snake_case or camelCase to Title Case
function formatLabel(str: string): string {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')           // snake_case to spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase to spaces
    .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
}

// Comprehensive helper to safely render any prescriptive analysis field
// Handles: strings, JSON strings, objects, arrays, nested structures
// Renders arrays as proper bullet lists for professional formatting
function safeRenderItem(item: any): React.ReactNode {
  if (!item) return null;
  if (typeof item === 'string') {
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(item);
      return safeRenderItem(parsed);
    } catch {
      // Clean up markdown and return formatted text
      const cleaned = item
        .replace(/^#{1,3}\s+/gm, '') // Remove markdown headers
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
        .replace(/\*([^*]+)\*/g, '$1') // Remove italic
        .replace(/^\["|"\]$/g, '') // Remove JSON array brackets
        .trim();
      return cleaned;
    }
  }
  // Handle arrays - render as bullet list
  if (Array.isArray(item)) {
    if (item.length === 0) return null;
    return (
      <ul className="list-disc list-inside space-y-1 mt-1">
        {item.map((subItem, idx) => {
          let content = '';
          if (typeof subItem === 'string') {
            content = subItem.replace(/^#{1,3}\s+/gm, '').replace(/\*\*([^*]+)\*\*/g, '$1').trim();
          } else if (subItem?.action) {
            content = `${subItem.action}${subItem.timeline ? ` (${subItem.timeline})` : ''}`;
          } else if (subItem?.recommendation) {
            content = subItem.recommendation;
          } else if (typeof subItem === 'object') {
            content = JSON.stringify(subItem);
          } else {
            content = String(subItem);
          }
          return <li key={idx} className="text-sm">{content}</li>;
        })}
      </ul>
    );
  }
  if (typeof item === 'object' && item !== null) {
    // Handle action/timeline objects
    if (item.action) {
      return `${item.action}${item.timeline ? ` (${item.timeline})` : ''}`;
    }
    // Handle recommendation field
    if (item.recommendation) {
      return item.recommendation;
    }
    // Handle gap objects like {"target": 73, "actual": 16.3}
    if (item.target !== undefined && item.actual !== undefined) {
      const gap = item.gap || (item.target - item.actual);
      return `Target: ${item.target}, Actual: ${item.actual?.toFixed?.(1) || item.actual}, Gap: ${gap?.toFixed?.(1) || gap}%`;
    }
    // Fallback for other objects - show as readable text
    return JSON.stringify(item);
  }
  return String(item);
}

// Render an array of recommendation items as a formatted list
// Helper to strip markdown characters for clean display
function stripMarkdown(text: string): string {
  if (!text) return '';
  // Remove markdown headers (###, ##, #)
  let cleaned = text.replace(/^#{1,3}\s+/gm, '');
  // Remove bold/italic markers (**text** or *text*)
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  return cleaned.trim();
}

function renderRecommendationsList(value: any): React.ReactNode {
  if (!value) return <p className="text-sm text-muted-foreground italic">No recommendations available</p>;
  
  let items: any[] = [];
  
  // Parse JSON string if needed
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        items = parsed;
      } else {
        // Plain text - split by bullets, newlines, or numbered lists
        const lines = value.split(/•|\n|(?<=\))\s*(?=[A-Z])/).filter((l: string) => l.trim());
        if (lines.length > 1) {
          items = lines.map((l: string) => ({ action: stripMarkdown(l.trim()) }));
        } else {
          return <p className="text-sm">{stripMarkdown(value)}</p>;
        }
      }
    } catch {
      // Plain text - split by bullets or newlines
      const lines = value.split(/•|\n/).filter((l: string) => l.trim());
      if (lines.length > 1) {
        items = lines.map((l: string) => ({ action: stripMarkdown(l.trim()) }));
      } else {
        return <p className="text-sm">{stripMarkdown(value)}</p>;
      }
    }
  } else if (Array.isArray(value)) {
    items = value;
  } else {
    return <p className="text-sm">{safeRenderItem(value)}</p>;
  }
  
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No recommendations available</p>;
  }
  
  // Group items by headers (items starting with numbers like "1." or "2.")
  const sections: { header: string | null; items: string[] }[] = [];
  let currentSection: { header: string | null; items: string[] } = { header: null, items: [] };
  
  items.forEach((item: any) => {
    const action = typeof item === 'string' ? stripMarkdown(item) : stripMarkdown(item.action || item.recommendation || '');
    
    // Check if this is a header (starts with a number and period, or is a markdown header)
    const headerMatch = action.match(/^(\d+)\.\s+(.+)/);
    if (headerMatch) {
      // Save current section if it has items
      if (currentSection.items.length > 0 || currentSection.header) {
        sections.push(currentSection);
      }
      currentSection = { header: headerMatch[2], items: [] };
    } else if (action.startsWith('-') || action.startsWith('•')) {
      // This is a sub-item
      currentSection.items.push(action.replace(/^[-•]\s*/, ''));
    } else if (action.trim()) {
      // Regular item
      if (currentSection.header) {
        currentSection.items.push(action);
      } else {
        // No header yet, just add as item
        currentSection.items.push(action);
      }
    }
  });
  
  // Push the last section
  if (currentSection.items.length > 0 || currentSection.header) {
    sections.push(currentSection);
  }
  
  // If we have sections with headers, render them grouped
  if (sections.some(s => s.header)) {
    return (
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx}>
            {section.header && (
              <p className="font-semibold text-sm mb-2">{section.header}</p>
            )}
            {section.items.length > 0 && (
              <ul className="space-y-1 ml-4">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }
  
  // Fallback: simple list
  return (
    <ul className="space-y-2">
      {items.map((item: any, idx: number) => {
        const action = typeof item === 'string' ? stripMarkdown(item) : stripMarkdown(item.action || item.recommendation || '');
        const timeline = typeof item === 'object' ? item.timeline || item.deadline : null;
        
        return (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span className="text-primary mt-0.5">•</span>
            <div>
              <span>{action}</span>
              {timeline && (
                <span className="text-muted-foreground ml-1">({timeline})</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// Render gaps as a formatted table/list
function renderGapsList(value: any): React.ReactNode {
  if (!value) return <p className="text-sm text-muted-foreground italic">No gaps identified</p>;
  
  let gapsData: any = value;
  
  // Parse JSON string if needed
  if (typeof value === 'string') {
    try {
      gapsData = JSON.parse(value);
    } catch {
      return <p className="text-sm">{value}</p>;
    }
  }
  
  // Handle object with program names as keys
  if (typeof gapsData === 'object' && !Array.isArray(gapsData)) {
    const entries = Object.entries(gapsData);
    if (entries.length === 0) {
      return <p className="text-sm text-muted-foreground italic">No gaps identified</p>;
    }
    
    return (
      <div className="space-y-3">
        {entries.map(([programName, data]: [string, any], idx) => {
          const target = data?.target ?? 'N/A';
          const actual = data?.actual ?? 'N/A';
          const gap = data?.gap ?? data?.percentage_gap ?? (typeof target === 'number' && typeof actual === 'number' ? (target - actual).toFixed(1) : 'N/A');
          
          return (
            <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="font-medium text-red-900 text-sm">{formatLabel(programName)}</p>
              <div className="flex gap-4 mt-1 text-xs text-red-700">
                <span>Target: <strong>{target}%</strong></span>
                <span>Actual: <strong>{typeof actual === 'number' ? actual.toFixed(1) : actual}%</strong></span>
                <span>Gap: <strong className="text-red-600">{gap}%</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  // Handle array of gaps
  if (Array.isArray(gapsData)) {
    return (
      <ul className="space-y-2">
        {gapsData.map((gap: any, idx: number) => (
          <li key={idx} className="text-sm flex items-start gap-2">
            <span className="text-destructive">•</span>
            <span>{safeRenderItem(gap)}</span>
          </li>
        ))}
      </ul>
    );
  }
  
  return <p className="text-sm">{safeRenderItem(gapsData)}</p>;
}

// Render action items with better formatting
function renderActionItems(items: any[]): React.ReactNode {
  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No action items</p>;
  }
  
  return (
    <ul className="space-y-2">
      {items.map((item: any, idx: number) => {
        let text = '';
        if (typeof item === 'string') {
          // Check if it's a JSON string
          try {
            const parsed = JSON.parse(item);
            text = parsed.action || parsed.recommendation || JSON.stringify(parsed);
          } catch {
            text = item;
          }
        } else if (typeof item === 'object') {
          text = item.action || item.recommendation || item.task || JSON.stringify(item);
        } else {
          text = String(item);
        }
        
        // Clean up repetitive "Address gap in:" prefix if present
        const cleanText = text.replace(/^Address gap in:\s*/i, '').trim();
        const isGapItem = text.toLowerCase().startsWith('address gap');
        
        return (
          <li key={idx} className="flex items-start gap-2 text-sm p-2 bg-muted/50 rounded">
            <span className="text-amber-600 mt-0.5">→</span>
            <span>
              {isGapItem ? (
                <>
                  <span className="font-medium">Review & improve:</span> {cleanText}
                </>
              ) : (
                text
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

interface ReviewActivity {
  name: string;
  kraId: string;
  initiativeId: string;
  reported: number;
  target: number;
  achievement: number;
  status: string;
  dataType?: string;
  evidenceSnippet?: string;
  confidenceScore?: number;
  confidence?: number;
  prescriptiveNote?: string;
  prescriptiveAnalysis?: string;
  rootCause?: string;
  aiInsight?: string;
  authorizedStrategy?: string;
}

interface ReviewKRA {
  kraId: string;
  kraTitle: string;
  initiativeId: string;
  achievementRate: number;
  status: string;
  prescriptive?: {
    prescriptiveAnalysis?: string;
    rootCause?: string;
    actionItems?: string[];
    missedActivities?: any[];
    metActivities?: any[];
  };
}

interface AnalysisReviewData {
  id: string;
  documentTitle: string;
  documentType: string;
  status: string;
  uploadedBy: string;
  unit: string;
  year: number;
  quarter: number;
  achievementScore: number;
  createdAt: string;
  kras: ReviewKRA[];
  activities: ReviewActivity[];
  recommendations?: string;
  gaps?: string;
  opportunities?: string;
  alignment?: string;
}

interface QPROReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId: string | null;
  onApproved?: () => void;
  onRejected?: () => void;
}

export function QPROReviewModal({
  open,
  onOpenChange,
  analysisId,
  onApproved,
  onRejected,
}: QPROReviewModalProps) {
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<AnalysisReviewData | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('overview');
  const [editedKRAs, setEditedKRAs] = React.useState<{ [key: number]: string }>({});
  const [editedKPIs, setEditedKPIs] = React.useState<{ [key: number]: string }>({});
  const [changedActivityIds, setChangedActivityIds] = React.useState<Set<number>>(new Set());
  const [isRegenerating, setIsRegenerating] = React.useState(false);

  // Fetch analysis details when modal opens
  React.useEffect(() => {
    if (open && analysisId) {
      fetchAnalysisDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, analysisId]);

  const fetchAnalysisDetails = async () => {
    if (!analysisId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = await AuthService.getAccessToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const response = await fetch(`/api/qpro/approve/${analysisId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expired - try to refresh and retry once
        const newToken = await AuthService.getAccessToken();
        if (newToken && newToken !== token) {
          const retryResponse = await fetch(`/api/qpro/approve/${analysisId}`, {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });
          if (!retryResponse.ok) {
            throw new Error('Invalid or expired token. Please log in again.');
          }
          const result = await retryResponse.json();
          setData(result);
          return;
        }
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch analysis details');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!analysisId) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const token = await AuthService.getAccessToken();
      const response = await fetch(`/api/qpro/approve/${analysisId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to approve analysis');
      }

      onApproved?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!analysisId) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      const token = await AuthService.getAccessToken();
      const response = await fetch(`/api/qpro/approve/${analysisId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason || 'Rejected by reviewer' }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to reject analysis');
      }

      onRejected?.();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKRAChange = (activityIndex: number, newKraId: string) => {
    const newEditedKRAs = { ...editedKRAs };
    newEditedKRAs[activityIndex] = newKraId;
    setEditedKRAs(newEditedKRAs);

    // Track which activities have been changed
    const newChangedIds = new Set(changedActivityIds);
    newChangedIds.add(activityIndex);
    setChangedActivityIds(newChangedIds);
  };

  const handleKPIChange = (activityIndex: number, newKpiId: string) => {
    const newEditedKPIs = { ...editedKPIs };
    newEditedKPIs[activityIndex] = newKpiId;
    setEditedKPIs(newEditedKPIs);

    // Auto-update target and achievement if selected KPI has different target value
    const strategicPlan = require('@/src/data/strategic_plan.json');
    const activity = data?.activities[activityIndex];
    const selectedKra = strategicPlan.kras?.find((k: any) => k.kra_id === (editedKRAs[activityIndex] || activity?.kraId));
    const selectedKPI = selectedKra?.initiatives?.find((kpi: any) => kpi.id === newKpiId);
    
    if (selectedKPI && data && activity) {
      const currentYear = new Date().getFullYear();
      const targetData = selectedKPI.targets?.timeline_data?.find((t: any) => t.year === currentYear);
      const newTarget = targetData?.target_value ? parseInt(targetData.target_value) : activity.target;
      
      // Update activity with new target if different from current
      if (newTarget !== activity.target) {
        const updatedActivities = [...data.activities];
        updatedActivities[activityIndex] = {
          ...activity,
          target: newTarget,
          achievement: activity.reported ? (activity.reported / newTarget) * 100 : 0
        };
        setData({ ...data, activities: updatedActivities });
      }
    }

    // Track that this activity has been changed
    const newChangedIds = new Set(changedActivityIds);
    newChangedIds.add(activityIndex);
    setChangedActivityIds(newChangedIds);
  };

  const regenerateInsights = async () => {
    if (!data?.id || changedActivityIds.size === 0) return;
    
    setIsRegenerating(true);
    setError(null);
    try {
      const token = await AuthService.getAccessToken();
      
      // Build activities array with all updated KRAs and KPIs
      const activitiesForRegen = data.activities.map((act, idx) => ({
        ...act,
        kraId: editedKRAs[idx] || act.kraId,
        initiativeId: editedKPIs[idx] || act.initiativeId, // Include selected KPI
        userSelectedKPI: !!editedKPIs[idx], // Flag indicating user explicitly selected KPI
      }));

      const response = await fetch('/api/qpro/regenerate-insights', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: data.id,
          activities: activitiesForRegen,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to regenerate insights');
      }

      const result = await response.json();
      
      // Update the data with regenerated insights - keep modal open for review
      if (result.activities && data) {
        // Recalculate KRAs based on updated activities
        const kraMap: { [key: string]: { activities: any[]; achievementRate: number; status: string } } = {};
        
        result.activities.forEach((activity: any) => {
          const kraId = activity.kraId;
          if (!kraMap[kraId]) {
            kraMap[kraId] = { activities: [], achievementRate: 0, status: 'MISSED' };
          }
          kraMap[kraId].activities.push(activity);
        });
        
        // Calculate achievement rates for each KRA
        const updatedKRAs = data.kras.map((kra) => {
          const kraData = kraMap[kra.kraId];
          if (kraData) {
            const achievements = kraData.activities.map((a) => a.achievement || 0);
            const avgAchievement = achievements.length > 0
              ? achievements.reduce((a, b) => a + b, 0) / achievements.length
              : 0;
            
            // Determine status based on average achievement
            let status = 'MISSED';
            if (avgAchievement >= 100) {
              status = 'EXCEEDED';
            } else if (avgAchievement >= 80) {
              status = 'MET';
            } else if (avgAchievement >= 50) {
              status = 'ON_TRACK';
            }
            
            return {
              ...kra,
              achievementRate: avgAchievement,
              status,
            };
          }
          return kra;
        });
        
        setData({
          ...data,
          activities: result.activities,
          kras: updatedKRAs,
          achievementScore: result.overallAchievementScore || data.achievementScore,
          gaps: result.gaps ? JSON.stringify(result.gaps) : data.gaps,
          alignment: result.alignment || data.alignment,
          opportunities: result.opportunities || data.opportunities,
          recommendations: result.recommendations || data.recommendations,
        });
        
        // Reset the edited KRAs since they've been applied
        setEditedKRAs({});
        setChangedActivityIds(new Set());
        
        // Switch to insights tab so user can review the regenerated insights
        setActiveTab('insights');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate insights');
    } finally {
      setIsRegenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      MET: { variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
      EXCEEDED: { variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
      ON_TRACK: { variant: 'secondary', icon: <TrendingUp className="w-3 h-3" /> },
      DELAYED: { variant: 'outline', icon: <AlertTriangle className="w-3 h-3" /> },
      AT_RISK: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
      MISSED: { variant: 'destructive', icon: <XCircle className="w-3 h-3" /> },
    };

    const config = statusConfig[status] || { variant: 'outline' as const, icon: null };
    
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {status}
      </Badge>
    );
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] h-[95vh] max-w-[1400px] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Review QPro Analysis
          </DialogTitle>
          <DialogDescription>
            Review the extracted data and prescriptive insights before committing to the dashboard.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading analysis...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-destructive">
            <XCircle className="w-8 h-8 mb-2" />
            <p>{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchAnalysisDetails}>
              Retry
            </Button>
          </div>
        ) : data ? (
          <ScrollArea className="flex-1 pr-4">
            {/* Header Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                  <div className="text-2xl font-bold text-primary">
                    {data.achievementScore?.toFixed(1) || 0}%
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">KRAs Analyzed</div>
                  <div className="text-2xl font-bold">{data.kras.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Activities</div>
                  <div className="text-2xl font-bold">{data.activities.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge variant={data.status === 'DRAFT' ? 'secondary' : 'default'}>
                    {data.status}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Document Info */}
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Document Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div><strong>Title:</strong> {data.documentTitle}</div>
                <div><strong>Type:</strong> {data.documentType}</div>
                <div><strong>Unit:</strong> {data.unit}</div>
                <div><strong>Period:</strong> Q{data.quarter} {data.year}</div>
                <div><strong>Uploaded by:</strong> {data.uploadedBy}</div>
              </CardContent>
            </Card>

            {/* Tabs for detailed view */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">KRAs Overview</TabsTrigger>
                <TabsTrigger value="activities">Activities & Evidence</TabsTrigger>
                <TabsTrigger value="insights">Prescriptive Insights</TabsTrigger>
              </TabsList>

              {/* KRAs Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                {data.kras.map((kra, index) => (
                  <Card key={kra.kraId + index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{formatLabel(kra.kraTitle)}</CardTitle>
                        {getStatusBadge(kra.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Achievement Rate</span>
                          <span className="font-medium">{kra.achievementRate?.toFixed(1) || 0}%</span>
                        </div>
                        <Progress value={Math.min(kra.achievementRate || 0, 100)} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          Initiative ID: {kra.initiativeId}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* Activities & Evidence Tab */}
              <TabsContent value="activities" className="space-y-4 mt-4">
                {data.activities.map((activity, index) => (
                  <Card key={activity.name + index} className={editedKRAs[index] ? 'border-indigo-300 bg-indigo-50' : ''}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.name}</h4>
                          <div className="space-y-1 mt-1 text-xs">
                            <p className="text-muted-foreground">
                              <strong>KRA:</strong> {activity.kraId}
                            </p>
                            <p className="text-muted-foreground">
                              <strong>KPI:</strong> {editedKPIs[index] || activity.initiativeId}
                              {(() => {
                                const strategicPlan = require('@/src/data/strategic_plan.json');
                                const selectedKra = strategicPlan.kras?.find((k: any) => k.kra_id === activity.kraId);
                                const selectedKPI = selectedKra?.initiatives?.find((kpi: any) => kpi.id === (editedKPIs[index] || activity.initiativeId));
                                if (selectedKPI?.key_performance_indicator?.outputs) {
                                  return (
                                    <span className="text-muted-foreground italic block mt-0.5">
                                      {`${selectedKPI.key_performance_indicator.outputs.substring(0, 60)}${selectedKPI.key_performance_indicator.outputs.length > 60 ? '...' : ''}`}
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </p>
                          </div>
                        </div>
                        {activity.status && getStatusBadge(activity.status)}
                      </div>

                      {/* KRA Selector */}
                      <div className="mb-3 p-2 bg-white rounded border border-slate-200">
                        <Label className="text-xs font-semibold text-slate-600 mb-1 block">
                          KRA Assignment *
                        </Label>
                        <Select
                          value={editedKRAs[index] || activity.kraId || ''}
                          onValueChange={(v) => handleKRAChange(index, v)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select KRA" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_KRAS.map((kra) => (
                              <SelectItem key={kra.id} value={kra.id}>
                                <span className="text-sm">
                                  <strong>{kra.id}</strong>: {kra.title.substring(0, 50)}...
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {editedKRAs[index] && editedKRAs[index] !== activity.kraId && (
                          <p className="text-xs text-indigo-600 mt-1 font-medium">KRA Changed ✓</p>
                        )}
                      </div>

                      {/* KPI/Initiative Selector (always shown) */}
                      <div className={cn(
                        "mb-3 p-3 rounded-lg border",
                        editedKRAs[index] && editedKRAs[index] !== activity.kraId
                          ? "bg-indigo-50 border-indigo-200"
                          : "bg-slate-50 border-slate-200"
                      )}>
                        <Label className={cn(
                          "text-sm font-semibold mb-2 block",
                          editedKRAs[index] && editedKRAs[index] !== activity.kraId
                            ? "text-indigo-800"
                            : "text-slate-700"
                        )}>
                          KPI Selection
                          {editedKRAs[index] && editedKRAs[index] !== activity.kraId && <span className="text-red-500"> *</span>}
                        </Label>
                        <Select
                          value={editedKPIs[index] || activity.initiativeId || ''}
                          onValueChange={(v) => handleKPIChange(index, v)}
                        >
                          <SelectTrigger className="h-10 text-sm bg-white">
                            <SelectValue placeholder="Choose the appropriate KPI..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-80 w-[600px]">
                            {/* Get available KPIs for the selected KRA from strategic plan */}
                            {(() => {
                              const strategicPlan = require('@/src/data/strategic_plan.json');
                              const selectedKra = strategicPlan.kras?.find((k: any) => k.kra_id === (editedKRAs[index] || activity.kraId));
                              const currentYear = new Date().getFullYear();
                              return selectedKra?.initiatives?.map((kpi: any) => {
                                const outputs = kpi.key_performance_indicator?.outputs || kpi.description || '';
                                const targetData = kpi.targets?.timeline_data?.find((t: any) => t.year === currentYear);
                                const targetValue = targetData?.target_value || 'N/A';
                                const targetType = kpi.targets?.type || 'count';
                                
                                return (
                                  <SelectItem key={kpi.id} value={kpi.id} className="py-3 cursor-pointer">
                                    <div className="flex flex-col gap-1 max-w-[550px]">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-indigo-700">{kpi.id}</span>
                                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                                          Target: {typeof targetValue === 'number' ? targetValue : targetValue} ({targetType})
                                        </Badge>
                                      </div>
                                    </div>
                                  </SelectItem>
                                );
                              }) || [];
                            })()}
                          </SelectContent>
                        </Select>
                        {!editedKRAs[index] && (
                          <p className="text-xs text-slate-500 mt-2">
                            💡 Current KPI: {activity.initiativeId}
                          </p>
                        )}
                        {editedKRAs[index] && editedKRAs[index] !== activity.kraId && (
                          <p className="text-xs text-indigo-600 mt-2">
                            💡 Review the Output and Target for each KPI to find the best match for this activity.
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 my-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Reported:</span>
                          <span className="ml-1 font-medium">{activity.reported}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Target:</span>
                          <span className="ml-1 font-medium">{activity.target}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Achievement:</span>
                          <span className={cn(
                            "ml-1 font-medium",
                            (activity.achievement || 0) >= 100 ? "text-green-600" : "text-red-600"
                          )}>
                            {activity.status === 'EXCEEDED' || (activity.achievement || 0) > 100
                              ? `${(activity.achievement || 0).toFixed(1)}% (Exceeded)`
                              : `${(activity.achievement || 0).toFixed(1)}%`}
                          </span>
                        </div>
                      </div>

                      {activity.dataType && (
                        <Badge variant="outline" className="mb-2">
                          {activity.dataType}
                        </Badge>
                      )}

                      {activity.confidenceScore !== undefined && (
                        <div className={cn('text-xs mb-2', getConfidenceColor(activity.confidenceScore))}>
                          Confidence: {(activity.confidenceScore * 100).toFixed(0)}%
                        </div>
                      )}

                      {activity.evidenceSnippet && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Quote className="w-3 h-3" />
                            Evidence from document:
                          </div>
                          <p className="text-sm italic">&ldquo;{activity.evidenceSnippet}&rdquo;</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                
                {/* Regenerate Insights Button */}
                {changedActivityIds.size > 0 && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={regenerateInsights}
                      disabled={isRegenerating}
                    >
                      {isRegenerating ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Regenerating...
                        </>
                      ) : (
                        'Regenerate Insights'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedKRAs({});
                        setEditedKPIs({});
                        setChangedActivityIds(new Set());
                      }}
                      disabled={isRegenerating}
                    >
                      Cancel
                    </Button>
                    <div className="text-xs text-muted-foreground flex items-center ml-auto">
                      {changedActivityIds.size} change{changedActivityIds.size > 1 ? 's' : ''} pending
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Prescriptive Insights Tab */}
              <TabsContent value="insights" className="space-y-4 mt-4">
                {/* Strategic Alignment - Overall document alignment with strategic plan */}
                {data.alignment && (
                  <Card className="border-blue-200">
                    <CardHeader className="pb-2 bg-blue-50">
                      <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                        <Target className="w-4 h-4" />
                        Strategic Alignment Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm">{safeRenderItem(data.alignment)}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Document-Level AI Insights Summary */}
                {(data.activities.some(a => a.aiInsight || a.prescriptiveAnalysis) || 
                  data.activities.some(a => a.prescriptiveNote)) && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Document-Level AI Analysis Summary
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Aggregated intelligent analysis across all activities in this document
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Prescriptive Analysis from LLM */}
                      {data.activities.some(a => a.prescriptiveAnalysis || a.prescriptiveNote) && (
                        <div>
                          <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                            Prescriptive Analysis
                          </h5>
                          <div className="space-y-2 ml-4">
                            {data.activities
                              .filter(a => a.prescriptiveAnalysis || a.prescriptiveNote)
                              .map((activity, idx) => {
                                const analysis = activity.prescriptiveAnalysis || activity.prescriptiveNote;
                                return (
                                  <div key={idx} className="pb-3 border-b border-slate-200 last:border-b-0">
                                    <p className="text-xs font-medium text-slate-600 mb-1">
                                      {activity.name}
                                    </p>
                                    <p className="text-sm text-slate-700">
                                      {safeRenderItem(analysis)}
                                    </p>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* Document Insights from LLM */}
                      {data.activities.some(a => a.aiInsight) && (
                        <div>
                          <h5 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Document Insights
                          </h5>
                          <div className="space-y-2 ml-4">
                            {data.activities
                              .filter(a => a.aiInsight)
                              .map((activity, idx) => (
                                <div key={idx} className="pb-3 border-b border-slate-200 last:border-b-0">
                                  <p className="text-xs font-medium text-slate-600 mb-1">
                                    {activity.name}
                                  </p>
                                  <p className="text-sm italic text-slate-600">
                                    &ldquo;{safeRenderItem(activity.aiInsight)}&rdquo;
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Performance Summary by KRA */}
                {data.kras.filter(kra => kra.prescriptive).length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        KRA Performance Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {data.kras.filter(kra => kra.prescriptive).map((kra, idx) => {
                          const isBehind = (kra.achievementRate || 0) < 100;
                          const prescriptive = kra.prescriptive;
                          
                          // Parse prescriptiveAnalysis if it's JSON
                          let analysisText = '';
                          if (prescriptive?.prescriptiveAnalysis) {
                            const analysis = prescriptive.prescriptiveAnalysis;
                            if (typeof analysis === 'string') {
                              try {
                                const parsed = JSON.parse(analysis);
                                if (Array.isArray(parsed)) {
                                  // It's an array of action items - summarize
                                  analysisText = `${parsed.length} action items identified for improvement`;
                                } else {
                                  analysisText = analysis;
                                }
                              } catch {
                                analysisText = analysis;
                              }
                            } else if (typeof analysis === 'object') {
                              analysisText = `Analysis available with ${Object.keys(analysis).length} recommendations`;
                            }
                          }
                          
                          return (
                            <div key={idx} className={cn(
                              "p-3 rounded-lg border",
                              isBehind ? "border-amber-200 bg-amber-50/50" : "border-green-200 bg-green-50/50"
                            )}>
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{formatLabel(kra.kraTitle)}</h5>
                                <Badge variant={isBehind ? "outline" : "default"}>
                                  {kra.achievementRate?.toFixed(1) || 0}%
                                </Badge>
                              </div>
                              
                              {analysisText && (
                                <p className="text-sm mb-2 text-muted-foreground">{analysisText}</p>
                              )}
                              
                              {prescriptive?.rootCause && isBehind && (
                                <p className="text-xs text-amber-700">
                                  <strong>Root Cause:</strong> {safeRenderItem(prescriptive.rootCause)}
                                </p>
                              )}
                              
                              {prescriptive?.missedActivities && prescriptive.missedActivities.length > 0 && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  <strong>Activities needing attention:</strong> {prescriptive.missedActivities.length} activity(ies)
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Opportunities */}
                {data.opportunities && (
                  <Card className="border-green-200">
                    <CardHeader className="pb-2 bg-green-50">
                      <CardTitle className="text-base flex items-center gap-2 text-green-900">
                        <TrendingUp className="w-4 h-4" />
                        Opportunities Identified
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {renderRecommendationsList(data.opportunities)}
                    </CardContent>
                  </Card>
                )}

                {/* Overall Recommendations */}
                {data.recommendations && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        AI Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderRecommendationsList(data.recommendations)}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            {/* Rejection Reason Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
              <Textarea
                placeholder="Provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-20"
              />
            </div>
          </ScrollArea>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          {error && (
            <p className="text-sm text-destructive mr-auto">{error}</p>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={submitting || loading || !data}
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
            Reject
          </Button>
          <Button
            onClick={handleApprove}
            disabled={submitting || loading || !data}
          >
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Approve & Commit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
