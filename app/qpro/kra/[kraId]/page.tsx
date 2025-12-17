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
import strategicPlan from '@/strategic_plan.json';
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

// KPI Progress types
interface KPIProgressItem {
  initiativeId: string;
  year: number;
  quarter: number;
  targetValue: string | number;
  currentValue: number;
  achievementPercent: number;
  status: 'MET' | 'ON_TRACK' | 'MISSED' | 'PENDING';
  submissionCount: number;
  participatingUnits: string[];
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
  const [selectedProgressQuarter, setSelectedProgressQuarter] = useState<number>(Math.ceil((new Date().getMonth() + 1) / 3));

  // QPRO-derived current values for the Targets-by-Year table (fallback only)
  const [qproDerivedValues, setQproDerivedValues] = useState<CurrentValuesMap>({});
  
  // Current values state management (keyed by "{initiativeId}-{year}")
  const [currentValues, setCurrentValues] = useState<CurrentValuesMap>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load saved current values from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && kraId) {
      const savedKey = `kra-current-values-${kraId}`;
      const saved = localStorage.getItem(savedKey);
      if (saved) {
        try {
          setCurrentValues(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading saved current values:', e);
        }
      }
    }
  }, [kraId]);

  // Save current values to localStorage
  const saveCurrentValues = useCallback(() => {
    if (typeof window !== 'undefined' && kraId) {
      const savedKey = `kra-current-values-${kraId}`;
      localStorage.setItem(savedKey, JSON.stringify(currentValues));
      setHasUnsavedChanges(false);
    }
  }, [kraId, currentValues]);

  // Update a single current value
  const updateCurrentValue = useCallback((initiativeId: string, year: number, value: string) => {
    const key = `${initiativeId}-${year}`;
    setCurrentValues(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Get current value for a specific initiative-year
  const getCurrentValue = useCallback((initiativeId: string, year: number): string | number | undefined => {
    const key = `${initiativeId}-${year}`;
    return currentValues[key] ?? qproDerivedValues[key];
  }, [currentValues, qproDerivedValues]);

  // Check if value is from localStorage (manual entry) vs QPRO data
  const getValueSource = useCallback((initiativeId: string, year: number): 'manual' | 'qpro' | 'none' => {
    const key = `${initiativeId}-${year}`;
    if (currentValues[key] !== undefined && currentValues[key] !== '') return 'manual';
    if (qproDerivedValues[key] !== undefined && qproDerivedValues[key] !== 0) return 'qpro';
    return 'none';
  }, [currentValues, qproDerivedValues]);

  // Clear localStorage values for this KRA (useful for resetting to QPRO data)
  const clearLocalStorageValues = useCallback(() => {
    if (typeof window !== 'undefined' && kraId) {
      const savedKey = `kra-current-values-${kraId}`;
      localStorage.removeItem(savedKey);
      setCurrentValues({});
      setHasUnsavedChanges(false);
    }
  }, [kraId]);

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

  // Fetch KPI progress from QPRO documents
  useEffect(() => {
    if (!isAuthenticated || isLoading || !kraId) return;

    const fetchKPIProgress = async () => {
      try {
        setLoadingProgress(true);
        const token = await AuthService.getAccessToken();
        const params = new URLSearchParams({
          kraId: kraId,
          year: selectedProgressYear.toString(),
          quarter: selectedProgressQuarter.toString(),
        });
        
        const response = await fetch(`/api/kpi-progress?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const api = (await response.json()) as KPIProgressApiResponse;
          setKpiProgress(api.data);
        }
      } catch (error) {
        console.error('Error fetching KPI progress:', error);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchKPIProgress();
  }, [kraId, isAuthenticated, isLoading, selectedProgressYear, selectedProgressQuarter]);

  // Fetch ANNUAL KPI progress and derive year-level current values for the Targets-by-Year table
  useEffect(() => {
    if (!isAuthenticated || isLoading || !kraId) return;

    const fetchAnnualKPIProgress = async () => {
      try {
        const token = await AuthService.getAccessToken();
        const params = new URLSearchParams({
          kraId: kraId,
          year: selectedProgressYear.toString(),
        });

        const response = await fetch(`/api/kpi-progress?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) return;
        const api = (await response.json()) as KPIProgressApiResponse;

        const derived: CurrentValuesMap = {};
        for (const initiative of api.data.initiatives || []) {
          const key = `${initiative.id}-${selectedProgressYear}`;
          const progressItems = (initiative.progress || []).filter((p) => p.year === selectedProgressYear);

          // Default: sum quarterly totals
          let yearValue = progressItems.reduce((sum, p) => sum + (p.currentValue || 0), 0);

          // For percentage KPIs, use the latest non-zero quarter value (fallback to max)
          if ((initiative.targetType || '').toLowerCase() === 'percentage') {
            const nonZero = progressItems.filter((p) => (p.currentValue || 0) > 0);
            const latest = nonZero.sort((a, b) => b.quarter - a.quarter)[0];
            yearValue = latest?.currentValue ?? Math.max(0, ...progressItems.map((p) => p.currentValue || 0));
          }

          derived[key] = yearValue;
        }

        setQproDerivedValues(derived);
      } catch (error) {
        console.error('Error fetching annual KPI progress:', error);
      }
    };

    fetchAnnualKPIProgress();
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

      {/* KPI Progress Summary Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            QPRO Progress Tracking
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Year:</label>
              <Select
                value={selectedProgressYear.toString()}
                onValueChange={(v) => setSelectedProgressYear(parseInt(v))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2025, 2026, 2027, 2028, 2029].map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Quarter:</label>
              <Tabs value={`Q${selectedProgressQuarter}`} onValueChange={(v) => setSelectedProgressQuarter(parseInt(v.replace('Q', '')))}>
                <TabsList className="h-9">
                  <TabsTrigger value="Q1" className="px-3">Q1</TabsTrigger>
                  <TabsTrigger value="Q2" className="px-3">Q2</TabsTrigger>
                  <TabsTrigger value="Q3" className="px-3">Q3</TabsTrigger>
                  <TabsTrigger value="Q4" className="px-3">Q4</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {loadingProgress ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading progress data...</span>
          </div>
        ) : kpiProgress ? (
          <div className="space-y-4">
            {(() => {
              const hasAnyApprovedSubmission = (kpiProgress.initiatives || []).some((i) =>
                (i.progress || []).some((p) =>
                  p.year === selectedProgressYear &&
                  p.quarter === selectedProgressQuarter &&
                  ((p.submissionCount || 0) > 0)
                )
              );

              if (!hasAnyApprovedSubmission) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No approved QPRO submissions for {selectedProgressYear} Q{selectedProgressQuarter}</p>
                    <p className="text-sm mt-1">Approve a QPRO analysis to reflect progress here</p>
                  </div>
                );
              }

              return null;
            })() || (
              <>
                {/* Overall Progress Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">{kpiProgress.initiatives?.length || 0}</div>
                    <div className="text-xs text-blue-600">Total KPIs</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {kpiProgress.initiatives?.filter((i) =>
                        i.progress?.some((p) => p.year === selectedProgressYear && p.quarter === selectedProgressQuarter && p.status === 'MET')
                      ).length || 0}
                    </div>
                    <div className="text-xs text-green-600">Met Target</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-700">
                      {kpiProgress.initiatives?.filter((i) =>
                        i.progress?.some((p) => p.year === selectedProgressYear && p.quarter === selectedProgressQuarter && p.status === 'ON_TRACK')
                      ).length || 0}
                    </div>
                    <div className="text-xs text-yellow-600">On Track</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-700">
                      {kpiProgress.initiatives?.filter((i) =>
                        i.progress?.some((p) => p.year === selectedProgressYear && p.quarter === selectedProgressQuarter && (p.status === 'MISSED' || p.status === 'PENDING'))
                      ).length || 0}
                    </div>
                    <div className="text-xs text-red-600">Needs Attention</div>
                  </div>
                </div>

            {/* Overall KRA Progress Bar */}
            {(() => {
              const quarterItems = (kpiProgress.initiatives || [])
                .map((i) => i.progress?.find((p) => p.year === selectedProgressYear && p.quarter === selectedProgressQuarter))
                .filter(Boolean) as KPIProgressItem[];
              const overallProgress = quarterItems.length
                ? quarterItems.reduce((sum, item) => sum + (item.achievementPercent || 0), 0) / quarterItems.length
                : undefined;

              if (overallProgress === undefined) return null;

              return (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">Overall KRA Progress</span>
                  <span className="text-lg font-bold text-blue-600">{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
              );
            })()}
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No QPRO documents uploaded for {selectedProgressYear} Q{selectedProgressQuarter}</p>
            <p className="text-sm mt-1">Upload documents to track progress automatically</p>
          </div>
        )}
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
                    
                    {/* KPI Progress Badge from QPRO */}
                    {quarterProgressItem && (
                      <div className="flex flex-col items-end gap-2 min-w-[140px]">
                        <Badge 
                          className={
                            quarterProgressItem.status === 'MET' ? 'bg-green-100 text-green-800' :
                            quarterProgressItem.status === 'ON_TRACK' ? 'bg-blue-100 text-blue-800' :
                            quarterProgressItem.status === 'MISSED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {quarterProgressItem.status === 'MET' ? '✓ Target Met' :
                           quarterProgressItem.status === 'ON_TRACK' ? '→ On Track' :
                           quarterProgressItem.status === 'MISSED' ? '✗ Missed' :
                           '○ Pending'}
                        </Badge>
                        <div className="w-full">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>QPRO Progress</span>
                            <span className="font-semibold">{Math.round(quarterProgressItem.achievementPercent || 0)}%</span>
                          </div>
                          <Progress 
                            value={quarterProgressItem.achievementPercent || 0} 
                            className={`h-2 ${
                              quarterProgressItem.status === 'MET' ? '[&>div]:bg-green-500' :
                              quarterProgressItem.status === 'ON_TRACK' ? '[&>div]:bg-blue-500' :
                              quarterProgressItem.status === 'MISSED' ? '[&>div]:bg-red-500' :
                              '[&>div]:bg-gray-400'
                            }`}
                          />
                        </div>
                        {(quarterProgressItem.submissionCount || 0) > 0 && (
                          <span className="text-xs text-gray-500">
                            {quarterProgressItem.submissionCount} submission{quarterProgressItem.submissionCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}
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

                  {/* Targets by Year */}
                  {initiative.targets && initiative.targets.timeline_data && initiative.targets.timeline_data.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Targets by Year</h4>
                        <div className="flex items-center gap-2">
                          {Object.keys(currentValues).length > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={clearLocalStorageValues}
                              className="flex items-center gap-1 text-amber-600 border-amber-300 hover:bg-amber-50"
                              title="Clear manually entered values and use QPRO data"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Reset to QPRO Data
                            </Button>
                          )}
                          {hasUnsavedChanges && (
                            <Button
                              size="sm"
                              onClick={saveCurrentValues}
                              className="flex items-center gap-1"
                            >
                              <Save className="h-3 w-3" />
                              Save Progress
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-gray-100 border-b">
                              <th className="px-3 py-2 text-left font-semibold text-gray-900 w-20">Year</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-900 w-32">Target</th>
                              <th className="px-3 py-2 text-left font-semibold text-gray-900 w-36">Current Value</th>
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
                              const currentVal = getCurrentValue(initiative.id, timelineItem.year);
                              const displayType = detectTargetType(
                                timelineItem.target_value,
                                currentVal,
                                targetConfig
                              );
                              const displayInfo = getTargetDisplayInfo(
                                timelineItem.target_value,
                                currentVal,
                                targetConfig
                              );

                              // Determine input type based on display type
                              const inputType = displayType === 'milestone' ? 'text' 
                                : displayType === 'percentage' ? 'percentage'
                                : displayType === 'currency' ? 'currency'
                                : 'number';

                              // Check value source for visual indicator
                              const valueSource = getValueSource(initiative.id, timelineItem.year);

                              return (
                                <tr key={i} className="border-b hover:bg-gray-50">
                                  <td className="px-3 py-2 text-gray-900 font-medium">
                                    {timelineItem.year}
                                  </td>
                                  <td className="px-3 py-2 text-gray-700">
                                    {displayInfo.formattedTarget}
                                    {initiative.targets.unit_basis && (
                                      <span className="text-xs text-gray-500 block">
                                        {initiative.targets.unit_basis}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                      <CurrentValueInput
                                        value={currentVal ?? ''}
                                        onChange={(val) => updateCurrentValue(initiative.id, timelineItem.year, val)}
                                        type={inputType}
                                        placeholder={displayType === 'milestone' ? 'Status...' : '0'}
                                      />
                                      {valueSource === 'manual' && (
                                        <span className="text-xs text-amber-600 whitespace-nowrap" title="Manually entered value (not from QPRO)">
                                          ⚠ Manual
                                        </span>
                                      )}
                                      {valueSource === 'qpro' && (
                                        <span className="text-xs text-green-600 whitespace-nowrap" title="Value from approved QPRO analysis">
                                          ✓ QPRO
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 min-w-[200px]">
                                    {/* Render appropriate component based on display type */}
                                    {displayType === 'percentage' && (
                                      <PercentageProgress
                                        currentValue={parseNumericValue(currentVal ?? 0)}
                                        targetValue={parseNumericValue(timelineItem.target_value)}
                                      />
                                    )}
                                    {displayType === 'currency' && (
                                      <CurrencyProgress
                                        currentValue={parseNumericValue(currentVal ?? 0)}
                                        targetValue={parseNumericValue(timelineItem.target_value)}
                                        formattedCurrent={displayInfo.formattedCurrent}
                                        formattedTarget={displayInfo.formattedTarget}
                                      />
                                    )}
                                    {displayType === 'high_volume' && (
                                      <HighVolumeProgress
                                        currentValue={parseNumericValue(currentVal ?? 0)}
                                        targetValue={parseNumericValue(timelineItem.target_value)}
                                        formattedCurrent={displayInfo.formattedCurrent}
                                        formattedTarget={displayInfo.formattedTarget}
                                        unit={initiative.targets.unit_basis}
                                      />
                                    )}
                                    {displayType === 'low_count' && (
                                      <FractionalDisplay
                                        currentValue={parseNumericValue(currentVal ?? 0)}
                                        targetValue={parseNumericValue(timelineItem.target_value)}
                                        unit={initiative.targets.unit_basis}
                                      />
                                    )}
                                    {displayType === 'milestone' && (
                                      <StatusBadge
                                        status={getMilestoneStatus(currentVal, timelineItem.target_value)}
                                        currentValue={currentVal?.toString()}
                                        targetValue={timelineItem.target_value.toString()}
                                      />
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
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
