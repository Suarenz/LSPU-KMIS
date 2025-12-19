'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Save, TrendingUp, CheckCircle2, Clock, XCircle, BarChart2, FileText, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import strategicPlan from '@/lib/data/strategic_plan.json';
import { useAuth } from '@/lib/auth-context';
import AuthService from '@/lib/services/auth-service';
import {
  PercentageProgress,
  CurrencyProgress,
  HighVolumeProgress,
  FractionalDisplay,
  StatusBadge,
  CurrentValueInput,
} from '@/components/ui/target-displays';
import {
  detectTargetType,
  getTargetDisplayInfo,
  getMilestoneStatus,
  parseNumericValue,
  type TargetDisplayType,
} from '@/lib/utils/target-type-detector';
import { DynamicInput, formatDisplayValue, type TargetType } from '@/components/ui/dynamic-input';
import { mapTargetType } from '@/lib/utils/target-type-utils';

// KPI Progress types
interface KPIProgressItem {
  initiativeId: string;
  year: number;
  quarter: number;
  targetValue: string | number;
  currentValue: number | string;
  achievementPercent: number;
  status: 'MET' | 'ON_TRACK' | 'MISSED' | 'PENDING';
  submissionCount: number;
  participatingUnits: string[];
  targetType: TargetType;
  // Manual override fields
  manualOverride?: number | string | null;
  manualOverrideReason?: string | null;
  manualOverrideBy?: string | null;
  manualOverrideAt?: string | null;
  valueSource: 'qpro' | 'manual' | 'none';
}

interface KPIProgressData {
  kraId: string;
  kraTitle: string;
  initiatives: {
    id: string;
    outputs: string;
    outcomes: string;
    targetType: string;
    progress: KPIProgressItem[];
  }[];
}

interface KPIProgressApiResponse {
  success: boolean;
  year: number;
  quarter?: number;
  data: KPIProgressData;
}

interface KRA {
  kra_id: string;
  kra_title: string;
  guiding_principle: string;
  initiatives: Initiative[];
}

interface TimelineItem {
  year: number;
  target_value: string | number;
  current_value?: string | number;
}

interface Initiative {
  id: string;
  key_performance_indicator: {
    outputs: string;
    outcomes: string;
  };
  strategies: string[];
  programs_activities: string[];
  responsible_offices: string[];
  targets: {
    type: string;
    currency?: string;
    unit_basis?: string;
    low_count_threshold?: number;
    timeline_data: TimelineItem[];
  };
}

// Type for storing current values in state
type CurrentValuesMap = Record<string, string | number>;

// Type for pending saves (values being edited but not yet saved to DB)
type PendingEditsMap = Record<string, { value: string | number; reason?: string }>;

const kraColors = [
  'bg-red-100 text-red-800',
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-yellow-100 text-yellow-800',
  'bg-purple-100 text-purple-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-cyan-100 text-cyan-800',
  'bg-orange-100 text-orange-800',
  'bg-teal-100 text-teal-800',
  'bg-lime-100 text-lime-800',
  'bg-rose-100 text-rose-800',
  'bg-sky-100 text-sky-800',
  'bg-violet-100 text-violet-800',
  'bg-amber-100 text-amber-800',
  'bg-emerald-100 text-emerald-800',
  'bg-fuchsia-100 text-fuchsia-800',
  'bg-cyan-100 text-cyan-800',
  'bg-red-200 text-red-900',
  'bg-blue-200 text-blue-900',
  'bg-green-200 text-green-900',
  'bg-purple-200 text-purple-900',
];

// Helper function to normalize data - convert strings to arrays if needed
const normalizeToArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return [value];
  return [];
};

export default function KRADetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const kraIdRaw = params.kraId as string;
  
  // Decode the URL parameter - useParams returns encoded values
  const kraId = decodeURIComponent(kraIdRaw);

  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  // KPI Progress state (from QPRO uploaded documents)
  const [kpiProgress, setKpiProgress] = useState<KPIProgressData | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [selectedProgressYear, setSelectedProgressYear] = useState<number>(new Date().getFullYear());
  const [selectedProgressQuarter, setSelectedProgressQuarter] = useState<number>(1);

  // QPRO-derived current values for the Targets-by-Year table
  const [qproDerivedValues, setQproDerivedValues] = useState<CurrentValuesMap>({});
  
  // Pending edits that haven't been saved to DB yet (keyed by "{initiativeId}-{year}-{quarter}")
  const [pendingEdits, setPendingEdits] = useState<PendingEditsMap>({});
  const [savingOverride, setSavingOverride] = useState<string | null>(null); // Track which item is being saved

  // NOTE: We no longer use localStorage for persistence - all saves go to database
  // The old localStorage-based currentValues state is replaced by database-backed values
  
  // Get the effective current value for a specific initiative-year-quarter from API data
  const getCurrentValueFromProgress = useCallback((initiativeId: string, year: number, quarter?: number): number | string => {
    if (!kpiProgress) return 0;
    const initiative = kpiProgress.initiatives?.find(i => i.id === initiativeId);
    if (!initiative) return 0;
    
    if (quarter) {
      // Get specific quarter value
      const progressItem = initiative.progress?.find(p => p.year === year && p.quarter === quarter);
      return progressItem?.currentValue ?? 0;
    } else {
      // Sum all quarters for the year (only for numeric types)
      const yearItems = initiative.progress?.filter(p => p.year === year) || [];
      return yearItems.reduce((sum, item) => {
        const val = typeof item.currentValue === 'number' ? item.currentValue : parseFloat(String(item.currentValue)) || 0;
        return sum + val;
      }, 0);
    }
  }, [kpiProgress]);

  // Get the value source for a specific initiative-year-quarter from API data
  const getValueSourceFromProgress = useCallback((initiativeId: string, year: number, quarter?: number): 'qpro' | 'manual' | 'none' => {
    if (!kpiProgress) return 'none';
    const initiative = kpiProgress.initiatives?.find(i => i.id === initiativeId);
    if (!initiative) return 'none';
    
    if (quarter) {
      const progressItem = initiative.progress?.find(p => p.year === year && p.quarter === quarter);
      return progressItem?.valueSource || 'none';
    } else {
      // If any quarter has a value, return the highest priority source
      const yearItems = initiative.progress?.filter(p => p.year === year) || [];
      if (yearItems.some(item => item.valueSource === 'manual')) return 'manual';
      if (yearItems.some(item => item.valueSource === 'qpro')) return 'qpro';
      return 'none';
    }
  }, [kpiProgress]);

  // Save a manual override value to the database
  const saveManualOverride = useCallback(async (
    initiativeId: string,
    year: number,
    quarter: number,
    value: number | string | null,
    reason?: string,
    targetType?: TargetType
  ) => {
    const key = `${initiativeId}-${year}-${quarter}`;
    setSavingOverride(key);
    
    try {
      const token = await AuthService.getAccessToken();
      const response = await fetch('/api/kpi-progress', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          kraId: kraId,
          initiativeId,
          year,
          quarter,
          value,
          reason,
          targetType,
        }),
      });
      
      if (!response.ok) {
        let error: any = {};
        try {
          error = await response.json();
        } catch {
          // If response body is not JSON, try to get text
          error = { message: `HTTP ${response.status}` };
        }
        console.error('Failed to save override:', error, 'Status:', response.status);
        return false;
      }
      
      // Remove from pending edits on success
      setPendingEdits(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      
      // Always refresh KPI progress for the whole year (all quarters)
      const params = new URLSearchParams({
        kraId: kraId,
        year: selectedProgressYear.toString(),
        _t: Date.now().toString(), // cache bust
      });
      const refreshResponse = await fetch(`/api/kpi-progress?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (refreshResponse.ok) {
        const api = await refreshResponse.json();
        setKpiProgress(api.data);
      }
      
      return true;
    } catch (error) {
      console.error('Error saving manual override:', error);
      return false;
    } finally {
      setSavingOverride(null);
    }
  }, [kraId, selectedProgressYear, selectedProgressQuarter]);

  // Update a pending edit (before saving to DB)
  const updatePendingEdit = useCallback((initiativeId: string, year: number, quarter: number, value: string | number) => {
    const key = `${initiativeId}-${year}-${quarter}`;
    // Keep as-is (string or number) based on input type
    const finalValue = value === '' ? 0 : value;
    setPendingEdits(prev => ({
      ...prev,
      [key]: { value: finalValue },
    }));
  }, []);

  // Get current value for display (pending edit → API value → 0)
  const getDisplayValue = useCallback((initiativeId: string, year: number, quarter: number): string | number => {
    const key = `${initiativeId}-${year}-${quarter}`;
    if (pendingEdits[key] !== undefined) {
      return pendingEdits[key].value;
    }
    return getCurrentValueFromProgress(initiativeId, year, quarter);
  }, [pendingEdits, getCurrentValueFromProgress]);

  // Check if there's a pending edit for this item
  const hasPendingEdit = useCallback((initiativeId: string, year: number, quarter: number): boolean => {
    const key = `${initiativeId}-${year}-${quarter}`;
    return pendingEdits[key] !== undefined;
  }, [pendingEdits]);

  // Clear all pending edits and reset to API values
  const clearPendingEdits = useCallback(() => {
    setPendingEdits({});
  }, []);

  // Direct access to KRA
  const allKras = (strategicPlan as any).kras || [];
  const kra = allKras.find((k: KRA) => k.kra_id === kraId) || null;

  const kraColorClass = kra 
    ? kraColors[(parseInt(kra.kra_id.split(' ')[1]) - 1) % kraColors.length]
    : kraColors[0];

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const fetchAnalysisData = async () => {
      try {
        setLoadingAnalysis(true);
        const token = await AuthService.getAccessToken();
        const response = await fetch(`/api/qpro-analyses?kraId=${kraId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAnalysisData(data);
        }
      } catch (error) {
        console.error('Error fetching analysis data:', error);
      } finally {
        setLoadingAnalysis(false);
      }
    };

    fetchAnalysisData();
  }, [kraId, isAuthenticated, isLoading]);

  // Fetch KPI progress from QPRO documents - fetches all quarters for the year
  useEffect(() => {
    if (!isAuthenticated || isLoading || !kraId) return;

    const fetchKPIProgress = async () => {
      try {
        setLoadingProgress(true);
        const token = await AuthService.getAccessToken();
        // Fetch without quarter param to get all quarters for the year
        // Add cache-busting param to ensure fresh data
        const params = new URLSearchParams({
          kraId: kraId,
          year: selectedProgressYear.toString(),
          _t: Date.now().toString(), // Cache bust
        });
        
        const response = await fetch(`/api/kpi-progress?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        });
        
        if (response.ok) {
          const api = (await response.json()) as KPIProgressApiResponse;
          setKpiProgress(api.data);
          
          // Build QPRO-derived values map for the per-quarter table
          const derived: CurrentValuesMap = {};
          for (const initiative of api.data.initiatives || []) {
            const progressItems = (initiative.progress || []).filter((p) => p.year === selectedProgressYear);
            for (const pItem of progressItems) {
              const key = `${initiative.id}-${pItem.year}-${pItem.quarter}`;
              derived[key] = pItem.currentValue || 0;
            }
          }
          setQproDerivedValues(derived);
        }
      } catch (error) {
        console.error('Error fetching KPI progress:', error);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchKPIProgress();
  }, [kraId, isAuthenticated, isLoading, selectedProgressYear]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Please log in to view this page.</div>
      </div>
    );
  }

  if (!kra) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Strategic Commitments
        </Button>
        <div className="bg-white rounded-lg border border-gray-300 p-8">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">KRA Not Found</h2>
              <p className="text-gray-600 mt-1">The requested KRA could not be found.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <Button
        variant="outline"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Strategic Commitments
      </Button>

      {/* KRA Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <Badge className={`${kraColorClass} text-lg font-bold w-fit`}>
            {kra.kra_id}
          </Badge>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              {kra.kra_title}
            </h1>
            <div className="bg-gray-100 rounded p-4">
              <p className="text-gray-700 text-sm sm:text-base">
                <span className="font-semibold">Guiding Principle: </span>
                {kra.guiding_principle}
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* KPIs Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Key Performance Indicators (KPIs)</h2>

        {kra.initiatives && kra.initiatives.length > 0 ? (
          <div className="grid gap-6">
            {kra.initiatives.map((initiative: Initiative, index: number) => {
              const initiativeProgress = kpiProgress?.initiatives?.find((i) => i.id === initiative.id);
              const quarterProgressItem = initiativeProgress?.progress?.find(
                (p) => p.year === selectedProgressYear && p.quarter === selectedProgressQuarter
              );
              
              return (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {initiative.id || `KPI ${index + 1}`}
                      </CardTitle>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Outputs: </span>
                          {initiative.key_performance_indicator?.outputs}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-semibold">Outcomes: </span>
                          {initiative.key_performance_indicator?.outcomes}
                        </p>
                      </div>
                    </div>
                    
                    {/* QPRO summary removed per user preference - rely on detailed Targets by Year table */}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Strategies */}
                  {(() => {
                    const strategies = normalizeToArray(initiative.strategies);
                    return strategies.length > 0 ? (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Strategies</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                          {strategies.map((strategy: string, i: number) => (
                            <li key={i}>{strategy}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null;
                  })()}

                  {/* Programs/Activities */}
                  {(() => {
                    const activities = normalizeToArray(initiative.programs_activities);
                    return activities.length > 0 ? (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Programs/Activities</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                          {activities.map((activity: string, i: number) => (
                            <li key={i}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null;
                  })()}

                  {/* Responsible Offices */}
                  {(() => {
                    const offices = normalizeToArray(initiative.responsible_offices);
                    return offices.length > 0 ? (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Responsible Offices</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                          {offices.map((office: string, i: number) => (
                            <li key={i}>{office}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null;
                  })()}

                  {/* Targets by Year with Per-Quarter Values */}
                  {initiative.targets && initiative.targets.timeline_data && initiative.targets.timeline_data.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Targets by Year</h4>
                        <div className="flex items-center gap-2">
                          {Object.keys(pendingEdits).length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={clearPendingEdits}
                              className="flex items-center gap-1 text-gray-600 border-gray-300 hover:bg-gray-50"
                              title="Discard unsaved changes"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Discard Changes
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-gray-100 border-b">
                              <th className="px-3 py-2 text-left font-semibold text-gray-900 w-20">Year</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-900 w-20">Quarter</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-900 w-32">Annual Target</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-900 w-48">Current Value</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-900">Progress</th>
                            </tr>
                          </thead>
                          <tbody>
                            {initiative.targets.timeline_data.map((timelineItem: TimelineItem, i: number) => {
                              const targetConfig = {
                                type: initiative.targets.type,
                                currency: initiative.targets.currency,
                                low_count_threshold: initiative.targets.low_count_threshold,
                              };

                              // Always show Q1-Q4 for every year present in timeline_data
                              const quarters = [1, 2, 3, 4];
                              // Get quarterly data from kpiProgress
                              const initiativeProgress = kpiProgress?.initiatives?.find(ip => ip.id === initiative.id);
                              const quarterlyItems = initiativeProgress?.progress?.filter(p => p.year === timelineItem.year) || [];

                              return quarters.map((quarter, qIdx) => {
                                // If there is a quarterly item for this quarter, use its value, else use the annual target value
                                const quarterItem = quarterlyItems.find(q => q.quarter === quarter);
                                // If no quarterly data, use the annual target value for all quarters
                                const displayValue = getDisplayValue(initiative.id, timelineItem.year, quarter);
                                const valueSource = quarterItem?.valueSource || getValueSourceFromProgress(initiative.id, timelineItem.year, quarter);
                                const isPending = hasPendingEdit(initiative.id, timelineItem.year, quarter);
                                const cellKey = `${initiative.id}-${timelineItem.year}-${quarter}`;
                                const isSaving = savingOverride === cellKey;

                                const displayType = detectTargetType(
                                  timelineItem.target_value,
                                  displayValue,
                                  targetConfig
                                );
                                const displayInfo = getTargetDisplayInfo(
                                  timelineItem.target_value,
                                  displayValue,
                                  targetConfig
                                );

                                // Map target type from strategic plan to TargetType enum
                                const planTargetType = initiative.targets?.type || 'count';
                                const dynamicTargetType = mapTargetType(planTargetType);

                                const inputType = displayType === 'milestone' ? 'text' 
                                  : displayType === 'percentage' ? 'percentage'
                                  : displayType === 'currency' ? 'currency'
                                  : 'number';

                                return (
                                  <tr 
                                    key={`${i}-${quarter}`} 
                                    className={`border-b hover:bg-gray-50 ${qIdx === 0 ? 'border-t-2 border-t-gray-200' : ''}`}
                                  >
                                    {/* Year column - only show for first quarter */}
                                    {qIdx === 0 ? (
                                      <td className="px-3 py-2 text-gray-900 font-medium" rowSpan={quarters.length}>
                                        {timelineItem.year}
                                      </td>
                                    ) : null}

                                    {/* Quarter column */}
                                    <td className="px-3 py-2 text-gray-600">
                                      Q{quarter}
                                    </td>

                                    {/* Target column - only show for first quarter */}
                                    {qIdx === 0 ? (
                                      <td className="px-3 py-2 text-gray-700" rowSpan={quarters.length}>
                                        {displayInfo.formattedTarget}
                                        {initiative.targets.unit_basis && (
                                          <span className="text-xs text-gray-500 block">
                                            {initiative.targets.unit_basis}
                                          </span>
                                        )}
                                      </td>
                                    ) : null}

                                    {/* Current Value column with edit and save */}
                                    <td className="px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        <DynamicInput
                                          targetType={dynamicTargetType}
                                          value={displayValue ?? ''}
                                          onChange={(val) => updatePendingEdit(initiative.id, timelineItem.year, quarter, val)}
                                          placeholder={dynamicTargetType === 'TEXT_CONDITION' ? 'Select status...' : '0'}
                                        />

                                        {/* Save button - appears when there's a pending edit */}
                                        {isPending && (
                                          <Button
                                            size="sm"
                                            variant="default"
                                            onClick={() => {
                                              const editValue = pendingEdits[`${initiative.id}-${timelineItem.year}-${quarter}`]?.value;
                                              
                                              // Handle different target types
                                              let valueToSave: number | string | null = null;
                                              
                                              if (dynamicTargetType === 'MILESTONE') {
                                                // Milestone: boolean 0/1
                                                valueToSave = editValue === 1 || editValue === '1' ? 1 : 0;
                                              } else if (dynamicTargetType === 'TEXT_CONDITION') {
                                                // Text condition: string value
                                                valueToSave = editValue ? String(editValue) : null;
                                              } else {
                                                // Numeric types: COUNT, PERCENTAGE, FINANCIAL
                                                const numValue = typeof editValue === 'string' ? parseFloat(editValue.replace(/,/g, '')) : editValue;
                                                // Handle NaN case - treat as clearing the override
                                                valueToSave = (typeof numValue === 'number' && !Number.isNaN(numValue)) ? numValue : null;
                                              }
                                              
                                              // Get QPRO value for this cell
                                              const qproVal = getCurrentValueFromProgress(initiative.id, timelineItem.year, quarter);
                                              // If user entered 0 and QPRO value is also 0, treat as clear override
                                              if (typeof valueToSave === 'number' && valueToSave === 0 && qproVal === 0) {
                                                valueToSave = null;
                                              }
                                              
                                              saveManualOverride(initiative.id, timelineItem.year, quarter, valueToSave, undefined, dynamicTargetType);
                                            }}
                                            disabled={isSaving}
                                            className="h-7 px-2 text-xs"
                                          >
                                            {isSaving ? (
                                              <span className="animate-spin">⟳</span>
                                            ) : (
                                              <>
                                                <Save className="h-3 w-3 mr-1" />
                                                Save
                                              </>
                                            )}
                                          </Button>
                                        )}

                                        {/* Value source indicator */}
                                        {!isPending && valueSource === 'qpro' && (
                                          <span className="text-xs text-green-600 whitespace-nowrap" title="Value from approved QPRO analysis">
                                            ✓ QPRO
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    
                                    {/* Progress column */}
                                    <td className="px-3 py-3 min-w-[200px]">
                                      {displayType === 'percentage' && (
                                        <PercentageProgress
                                          currentValue={parseNumericValue(displayValue ?? 0)}
                                          targetValue={parseNumericValue(timelineItem.target_value)}
                                        />
                                      )}
                                      {displayType === 'currency' && (
                                        <CurrencyProgress
                                          currentValue={parseNumericValue(displayValue ?? 0)}
                                          targetValue={parseNumericValue(timelineItem.target_value)}
                                          formattedCurrent={displayInfo.formattedCurrent}
                                          formattedTarget={displayInfo.formattedTarget}
                                        />
                                      )}
                                      {displayType === 'high_volume' && (
                                        <HighVolumeProgress
                                          currentValue={parseNumericValue(displayValue ?? 0)}
                                          targetValue={parseNumericValue(timelineItem.target_value)}
                                          formattedCurrent={displayInfo.formattedCurrent}
                                          formattedTarget={displayInfo.formattedTarget}
                                          unit={initiative.targets.unit_basis}
                                        />
                                      )}
                                      {displayType === 'low_count' && (
                                        <FractionalDisplay
                                          currentValue={parseNumericValue(displayValue ?? 0)}
                                          targetValue={parseNumericValue(timelineItem.target_value)}
                                          unit={initiative.targets.unit_basis}
                                        />
                                      )}
                                      {displayType === 'milestone' && (
                                        <StatusBadge
                                          status={getMilestoneStatus(displayValue, timelineItem.target_value)}
                                          currentValue={displayValue?.toString()}
                                          targetValue={timelineItem.target_value.toString()}
                                        />
                                      )}
                                    </td>
                                  </tr>
                                );
                              });
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Year totals summary */}
                      {initiative.targets.timeline_data.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-900 text-sm mb-2">Year Totals</h5>
                          <div className="flex flex-wrap gap-4">
                            {initiative.targets.timeline_data.map((timelineItem: TimelineItem, i: number) => {
                              const initiativeProgress = kpiProgress?.initiatives?.find(ip => ip.id === initiative.id);
                              const yearItems = initiativeProgress?.progress?.filter(p => p.year === timelineItem.year) || [];
                              const yearTotal = yearItems.reduce((sum, item) => {
                                const val = typeof item.currentValue === 'number' ? item.currentValue : parseFloat(String(item.currentValue)) || 0;
                                return sum + val;
                              }, 0);
                              const targetNum = parseNumericValue(timelineItem.target_value);
                              const yearPct = targetNum > 0 ? Math.min(100, Math.round((yearTotal / targetNum) * 100)) : 0;
                              
                              return (
                                <div key={i} className="text-sm">
                                  <span className="font-medium text-blue-800">{timelineItem.year}:</span>
                                  <span className="ml-2 text-blue-700">{yearTotal} / {timelineItem.target_value}</span>
                                  <span className={`ml-2 font-medium ${yearPct >= 100 ? 'text-green-700' : yearPct >= 80 ? 'text-blue-700' : 'text-amber-700'}`}>
                                    ({yearPct}%)
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-300 p-8 text-center">
            <p className="text-gray-600">No KPIs found for this KRA.</p>
          </div>
        )}
      </div>
    </div>
  );
}
