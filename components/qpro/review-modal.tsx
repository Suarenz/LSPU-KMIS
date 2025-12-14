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
function safeRenderItem(item: any): React.ReactNode {
  if (!item) return null;
  if (typeof item === 'string') {
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(item);
      return safeRenderItem(parsed);
    } catch {
      return item;
    }
  }
  if (typeof item === 'object' && item !== null) {
    // Handle action/timeline objects
    if (item.action) {
      return `${item.action}${item.timeline ? ` (${item.timeline})` : ''}`;
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
        // Plain text - split by bullets or newlines
        const lines = value.split(/•|\n|(?<=\))\s*(?=[A-Z])/).filter((l: string) => l.trim());
        if (lines.length > 1) {
          items = lines.map((l: string) => ({ action: l.trim() }));
        } else {
          return <p className="text-sm">{value}</p>;
        }
      }
    } catch {
      // Plain text - split by bullets or newlines
      const lines = value.split(/•|\n/).filter((l: string) => l.trim());
      if (lines.length > 1) {
        items = lines.map((l: string) => ({ action: l.trim() }));
      } else {
        return <p className="text-sm">{value}</p>;
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
  
  return (
    <ul className="space-y-2">
      {items.map((item: any, idx: number) => {
        const action = typeof item === 'string' ? item : item.action || item.recommendation || '';
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

    // Auto-regenerate insights when KRA is changed
    if (data?.id) {
      regenerateInsights(activityIndex, newKraId);
    }
  };

  const regenerateInsights = async (activityIndex: number, newKraId: string) => {
    if (!data?.id) return;
    
    setIsRegenerating(true);
    try {
      const token = await AuthService.getAccessToken();
      
      // Build activities array with the updated KRA
      const activitiesForRegen = data.activities.map((act, idx) => ({
        ...act,
        kraId: idx === activityIndex ? newKraId : (editedKRAs[idx] || act.kraId),
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
        console.error('Failed to regenerate insights:', result.error);
        return;
      }

      const result = await response.json();
      
      // Update the data with regenerated insights
      if (result.activities && data) {
        setData({
          ...data,
          activities: result.activities,
        });
      }
    } catch (err) {
      console.error('Error regenerating insights:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      MET: { variant: 'default', icon: <CheckCircle2 className="w-3 h-3" /> },
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
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
          <ScrollArea className="h-[60vh] pr-4">
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
                          <p className="text-xs text-muted-foreground">
                            Initiative: {activity.initiativeId}
                          </p>
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
                          <span className="ml-1 font-medium">
                            {(activity.achievement || 0) > 200 
                              ? 'Exceeded' 
                              : `${activity.achievement?.toFixed(1) || 0}%`}
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
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedKRAs({});
                        setChangedActivityIds(new Set());
                      }}
                      disabled={isRegenerating}
                    >
                      Clear Changes
                    </Button>
                    <div className="text-xs text-muted-foreground flex items-center">
                      {isRegenerating ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Regenerating insights...
                        </>
                      ) : (
                        `${changedActivityIds.size} KRA change${changedActivityIds.size > 1 ? 's' : ''} pending. Insights auto-regenerated.`
                      )}
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

                {/* AI-Generated Insights per Activity */}
                {data.activities.some(a => a.aiInsight || a.prescriptiveAnalysis) && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        AI Document Insights
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Intelligent analysis of document performance against strategic targets
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {data.activities
                        .filter(a => a.aiInsight || a.prescriptiveAnalysis || a.rootCause)
                        .map((activity, idx) => {
                          const isMissed = activity.status === 'MISSED' || (activity.achievement && activity.achievement < 100);
                          return (
                            <div key={idx} className={cn(
                              "p-3 rounded-lg border",
                              isMissed ? "border-red-200 bg-red-50/50" : "border-green-200 bg-green-50/50"
                            )}>
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium text-sm">{activity.name}</h5>
                                <Badge 
                                  variant={isMissed ? "destructive" : "default"} 
                                  className="text-xs"
                                >
                                  {(activity.achievement || 0) > 200 
                                    ? 'Exceeded Target' 
                                    : `${Math.min(activity.achievement || 0, 200).toFixed(0)}% achieved`}
                                </Badge>
                              </div>
                              
                              {activity.aiInsight && (
                                <div className="mb-2">
                                  <p className="text-sm text-muted-foreground italic">
                                    &ldquo;{safeRenderItem(activity.aiInsight)}&rdquo;
                                  </p>
                                </div>
                              )}
                              
                              {activity.prescriptiveAnalysis && (
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-muted-foreground">Analysis: </span>
                                  <span className="text-sm">{safeRenderItem(activity.prescriptiveAnalysis)}</span>
                                </div>
                              )}
                              
                              {activity.rootCause && isMissed && (
                                <div className="mt-2 pt-2 border-t border-red-200">
                                  <span className="text-xs font-medium text-red-700">Root Cause: </span>
                                  <span className="text-sm text-red-600">{safeRenderItem(activity.rootCause)}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
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

                {/* Identified Gaps */}
                {data.gaps && (
                  <Card className="border-red-200">
                    <CardHeader className="pb-2 bg-red-50">
                      <CardTitle className="text-base text-destructive flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Performance Gaps
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      {renderGapsList(data.gaps)}
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
