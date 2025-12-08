'use client';

import { useEffect, useState } from 'react';

interface UniversitySummary {
  totalKRAs: number;
  metKRAs: number;
  missedKRAs: number;
  onTrackKRAs: number;
  overallAchievementPercent: number;
}

export function KRAAggregationDashboard() {
  const [summary, setSummary] = useState<UniversitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(2025);
  const [quarter, setQuarter] = useState(1);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/aggregations?type=summary&year=${year}&quarter=${quarter}`
        );
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch aggregation summary:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [year, quarter]);

  if (loading) {
    return <div className="text-center py-8">Loading aggregation data...</div>;
  }

  if (!summary) {
    return <div className="text-center py-8">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 mb-6">
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-3 py-2 border rounded"
        >
          {[2025, 2026, 2027, 2028, 2029].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={quarter}
          onChange={(e) => setQuarter(Number(e.target.value))}
          className="px-3 py-2 border rounded"
        >
          {[1, 2, 3, 4].map((q) => (
            <option key={q} value={q}>
              Q{q}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="border rounded p-4">
          <p className="text-sm font-medium text-gray-600">Total KRAs</p>
          <p className="text-3xl font-bold">{summary.totalKRAs}</p>
        </div>

        <div className="border rounded p-4 bg-green-50">
          <p className="text-sm font-medium text-green-700">KRAs Met</p>
          <p className="text-3xl font-bold text-green-700">
            {summary.metKRAs}
          </p>
        </div>

        <div className="border rounded p-4 bg-blue-50">
          <p className="text-sm font-medium text-blue-700">On Track</p>
          <p className="text-3xl font-bold text-blue-700">
            {summary.onTrackKRAs}
          </p>
        </div>

        <div className="border rounded p-4 bg-red-50">
          <p className="text-sm font-medium text-red-700">KRAs Missed</p>
          <p className="text-3xl font-bold text-red-700">
            {summary.missedKRAs}
          </p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm font-medium text-gray-600">Overall %</p>
          <p className="text-3xl font-bold">
            {summary.overallAchievementPercent.toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="border rounded p-4">
        <h3 className="font-semibold mb-4">Achievement Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(summary.overallAchievementPercent, 100)}%`,
            }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          University-wide achievement for {year} Q{quarter}
        </p>
      </div>
    </div>
  );
}
