# KRA Aggregation Engine - Integration Guide

## Overview

The KRA Aggregation Engine is a comprehensive system for calculating and tracking achievement metrics across all 22 KRAs in the LSPU strategic plan. It supports 6 target types: count, percentage, financial, milestone, text_condition, and count+unit_basis.

## Architecture

### Components

1. **Strategic Plan Service** (`lib/services/strategic-plan-service.ts`)
   - Loads and caches strategic_plan.json
   - Provides access to KRA, initiative, and target data
   - Invalidate cache after plan updates

2. **Target Aggregation Service** (`lib/services/target-aggregation-service.ts`)
   - Implements calculation logic for each target type
   - Validates reported values
   - Calculates achievement metrics
   - Provides rollup and summary functions

3. **API Endpoints**
   - `/api/aggregations` - Query aggregation data (summary, unit rollup)
   - `/api/aggregations/validate` - Validate and calculate metrics for reported values

4. **UI Components**
   - `KRAAggregationDashboard` - University-wide summary dashboard

## Setup Instructions

### 1. Create Database Tables

Run the migration SQL to create the aggregation tables:

```bash
psql -d your_database -f scripts/migration-aggregation-tables.sql
```

Or execute the SQL directly in your PostgreSQL client:

```sql
CREATE TABLE IF NOT EXISTS kra_aggregations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
  kra_id TEXT NOT NULL,
  kra_title TEXT,
  initiative_id TEXT NOT NULL,
  total_reported INTEGER,
  target_value NUMERIC,
  achievement_percent NUMERIC,
  submission_count INTEGER DEFAULT 0,
  participating_units JSON,
  status TEXT CHECK (status IN ('MET', 'MISSED', 'ON_TRACK', 'NOT_APPLICABLE')),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by TEXT,
  previous_quarter_achieved NUMERIC,
  previous_quarter_reported INTEGER,
  previous_quarter_target NUMERIC,
  CONSTRAINT unique_aggregation UNIQUE(year, quarter, kra_id, initiative_id)
);

CREATE TABLE IF NOT EXISTS aggregation_activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  aggregation_id TEXT NOT NULL REFERENCES kra_aggregations(id) ON DELETE CASCADE,
  qpro_analysis_id TEXT NOT NULL REFERENCES qpro_analyses(id) ON DELETE CASCADE,
  unit_id TEXT,
  activity_name TEXT NOT NULL,
  reported INTEGER,
  target INTEGER,
  achievement NUMERIC,
  activity_type TEXT,
  initiative_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kra_aggregations_year_quarter ON kra_aggregations(year, quarter);
CREATE INDEX idx_kra_aggregations_kra_id ON kra_aggregations(kra_id);
CREATE INDEX idx_aggregation_activities_aggregation_id ON aggregation_activities(aggregation_id);
```

### 2. File Placement

Ensure all files are in correct locations:

```
lib/services/
  ├── strategic-plan-service.ts ✓
  └── target-aggregation-service.ts ✓

app/api/
  └── aggregations/
      ├── route.ts ✓
      └── validate/
          └── route.ts ✓

components/
  └── kra-aggregation-dashboard.tsx ✓

scripts/
  └── migration-aggregation-tables.sql ✓
```

### 3. Integration with QPRO Analysis

The aggregation engine works with existing QPRO analyses. After a QPRO document is analyzed:

```typescript
// In your QPRO analysis processing:
import { targetAggregationService } from '@/lib/services/target-aggregation-service';

// After creating QPROAnalysis record with kras[], activities[] JSON
const metrics = await targetAggregationService.calculateAggregation(
  kraId,
  initiativeId,
  year,
  reportedValue,
  targetType
);
```

## Usage Examples

### 1. Get University Summary

```typescript
const summary = await targetAggregationService.getUniversitySummary(2025, 1);
// Returns: {
//   totalKRAs: 22,
//   metKRAs: 15,
//   missedKRAs: 3,
//   onTrackKRAs: 4,
//   overallAchievementPercent: 82.5
// }
```

### 2. Validate Reported Value

```typescript
const validation = await targetAggregationService.validateReportedValue(75, 'percentage');
// Returns: { valid: true, errors: [] }

const invalidValidation = await targetAggregationService.validateReportedValue(150, 'percentage');
// Returns: { valid: false, errors: ['Percentage must be between 0 and 100'] }
```

### 3. Calculate Metrics

```typescript
const metrics = await targetAggregationService.calculateAggregation(
  'KRA 3',
  'KRA3-KPI5',
  2025,
  76,
  'percentage'
);
// Returns: {
//   achieved: 76,
//   target: 75,
//   achievementPercent: 101.33,
//   status: 'MET',
//   variance: 1,
//   message: '76% / 75% target (101.33% achievement)'
// }
```

### 4. Get Unit Rollup

```typescript
const rollup = await targetAggregationService.rollupByUnit('KRA 3', 2025, 1);
// Returns array of aggregation results by participating unit
```

### 5. API Usage - Get Summary

```bash
curl -X GET "http://localhost:3000/api/aggregations?type=summary&year=2025&quarter=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. API Usage - Validate Input

```bash
curl -X POST "http://localhost:3000/api/aggregations/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "value": 76,
    "targetType": "percentage",
    "kraId": "KRA 3",
    "initiativeId": "KRA3-KPI5",
    "year": 2025
  }'
```

## Target Type Reference

### COUNT
- Input: Non-negative integer
- Calculation: `(reported / target) * 100`
- Example: Training sessions 12/10 = 120%

### PERCENTAGE
- Input: 0-100
- Calculation: `(reported / target) * 100`
- Example: OJT students 85% / 80% = 106.25%

### FINANCIAL
- Input: Non-negative number (PHP)
- Calculation: `(reported / target) * 100`
- Example: Revenue ₱425,000 / ₱400,000 = 106.25%

### MILESTONE
- Input: Status string (Completed, In Progress, etc.)
- Calculation: Binary (MET if completed, MISSED if not)
- Example: "Curriculum Updated" → Completed = MET

### TEXT_CONDITION
- Input: String matching condition
- Calculation: Contains check
- Example: "Above national passing rate" → Check if above

### COUNT + UNIT_BASIS
- Input: Non-negative integer with unit context
- Calculation: Same as COUNT but tracks per-unit
- Example: Training per college/program

## Status Mapping

| Achievement % | Status |
|---|---|
| ≥ 100% | MET |
| 80-99% | ON_TRACK |
| < 80% | MISSED |
| Unknown target | NOT_APPLICABLE |

## Dashboard Component Usage

```tsx
import { KRAAggregationDashboard } from '@/components/kra-aggregation-dashboard';

export default function AggregationPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">KRA Achievement Dashboard</h1>
      <KRAAggregationDashboard />
    </div>
  );
}
```

## Troubleshooting

### Issue: "Target not found in strategic plan"
- Check that strategic_plan.json exists in project root
- Verify KRA ID and Initiative ID are correct
- Try invalidating cache: `strategicPlanService.invalidateCache()`

### Issue: API returns 401 Unauthorized
- Ensure user is authenticated
- Check Authorization header is present
- Verify JWT token is valid

### Issue: Validation errors
- Check input type matches target type
- For percentage, ensure value is 0-100
- For count, ensure value is non-negative integer
- For financial, ensure value is non-negative

### Issue: Database connection error
- Verify DATABASE_URL environment variable
- Check PostgreSQL is running
- Confirm tables are created with migration

## Performance Considerations

1. **Caching**: Strategic plan is cached in memory. Call `invalidateCache()` after updates.
2. **Batch Operations**: Process multiple reports in batches for better performance.
3. **Indexes**: Database indexes created on frequently queried columns (year, quarter, kra_id).
4. **Query Optimization**: Use specific filters (year, quarter) to reduce query scope.

## Next Steps

1. Execute migration SQL to create tables
2. Verify files are in correct directories
3. Integrate aggregation service into QPRO analysis workflow
4. Test API endpoints with sample data
5. Verify dashboard displays aggregated metrics from QPRO uploads
6. Monitor aggregation accuracy with spot checks
