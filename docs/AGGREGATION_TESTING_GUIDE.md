# KRA Aggregation System - Testing Guide

## Overview

This guide provides comprehensive testing procedures for the KRA Aggregation Engine integration with the QPRO analysis workflow.

## Test Environment Setup

### Prerequisites
- PostgreSQL database running with aggregation tables created
- Application running on `http://localhost:3000`
- Valid JWT authentication token for API testing

### Database Verification

1. **Verify tables exist**:
   ```sql
   SELECT tablename FROM pg_tables WHERE tablename IN ('kra_aggregations', 'aggregation_activities');
   ```

2. **Check table structure**:
   ```sql
   \d kra_aggregations
   \d aggregation_activities
   ```

## Unit Tests

### Test 1: Strategic Plan Service

**Test Name**: Load Strategic Plan from JSON

```typescript
// Should successfully load strategic_plan.json
const plan = await strategicPlanService.getStrategicPlan();
expect(plan).toBeDefined();
expect(plan.kras).toBeDefined();
expect(plan.kras.length).toBeGreaterThan(0);

// Should have at least 22 KRAs
expect(plan.kras.length).toBe(22);
```

**Test Name**: Get Specific KRA

```typescript
const kra = await strategicPlanService.getKRA('KRA 3');
expect(kra).toBeDefined();
expect(kra.kra_id).toBe('KRA 3');
```

**Test Name**: Get Initiative with Targets

```typescript
const initiative = await strategicPlanService.getInitiative('KRA 3', 'KRA3-KPI5');
expect(initiative).toBeDefined();
expect(initiative.targets).toBeDefined();
expect(initiative.targets.timeline_data).toBeDefined();
```

### Test 2: Target Aggregation Service - Calculation Methods

**Test 2a**: COUNT aggregation (12 reported / 10 target = 120%)

```typescript
const metrics = await targetAggregationService.calculateAggregation(
  'KRA 13',
  'KRA13-KPI1',
  2025,
  12,
  'count'
);

expect(metrics.achieved).toBe(12);
expect(metrics.target).toBe(10);
expect(metrics.achievementPercent).toBe(120);
expect(metrics.status).toBe('MET');
expect(metrics.variance).toBe(2);
```

**Test 2b**: PERCENTAGE aggregation (85 reported / 80 target = 106.25%)

```typescript
const metrics = await targetAggregationService.calculateAggregation(
  'KRA 3',
  'KRA3-KPI5',
  2025,
  85,
  'percentage'
);

expect(metrics.achieved).toBe(85);
expect(metrics.target).toBe(80);
expect(metrics.achievementPercent).toBeCloseTo(106.25, 2);
expect(metrics.status).toBe('MET');
```

**Test 2c**: FINANCIAL aggregation (₱425,000 / ₱400,000 = 106.25%)

```typescript
const metrics = await targetAggregationService.calculateAggregation(
  'KRA 2',
  'KRA2-KPI3',
  2025,
  425000,
  'financial'
);

expect(metrics.achieved).toBe(425000);
expect(metrics.target).toBe(400000);
expect(metrics.achievementPercent).toBeCloseTo(106.25, 2);
expect(metrics.status).toBe('MET');
```

**Test 2d**: MILESTONE aggregation (Completed = MET)

```typescript
const metrics = await targetAggregationService.calculateAggregation(
  'KRA 1',
  'KRA1-KPI1',
  2025,
  'Completed',
  'milestone'
);

expect(metrics.status).toBe('MET');
```

**Test 2e**: TEXT_CONDITION aggregation (Contains check)

```typescript
const metrics = await targetAggregationService.calculateAggregation(
  'KRA 8',
  'KRA8-KPI2',
  2025,
  'Above national passing rate',
  'text_condition'
);

expect(metrics.status).toBe('MET');
```

### Test 3: Validation Service

**Test 3a**: Valid percentage (0-100)

```typescript
const result = await targetAggregationService.validateReportedValue(75, 'percentage');
expect(result.valid).toBe(true);
expect(result.errors.length).toBe(0);
```

**Test 3b**: Invalid percentage (>100)

```typescript
const result = await targetAggregationService.validateReportedValue(150, 'percentage');
expect(result.valid).toBe(false);
expect(result.errors[0]).toContain('must be between 0 and 100');
```

**Test 3c**: Valid count (positive integer)

```typescript
const result = await targetAggregationService.validateReportedValue(42, 'count');
expect(result.valid).toBe(true);
```

**Test 3d**: Invalid count (negative)

```typescript
const result = await targetAggregationService.validateReportedValue(-5, 'count');
expect(result.valid).toBe(false);
expect(result.errors[0]).toContain('positive integer');
```

## API Endpoint Tests

### Test 4: GET /api/aggregations (Summary)

**Request**:
```bash
curl -X GET "http://localhost:3000/api/aggregations?type=summary&year=2025&quarter=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
{
  "totalKRAs": 22,
  "metKRAs": 15,
  "missedKRAs": 3,
  "onTrackKRAs": 4,
  "overallAchievementPercent": 82.5
}
```

**Assertions**:
- Status code: 200
- Response contains all 5 required fields
- totalKRAs = metKRAs + missedKRAs + onTrackKRAs (approximately)
- overallAchievementPercent between 0-100

### Test 5: GET /api/aggregations (Unit Rollup)

**Request**:
```bash
curl -X GET "http://localhost:3000/api/aggregations?type=unit&kraId=KRA%203&year=2025&quarter=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response**:
```json
[
  {
    "unitId": "unit-1",
    "unitName": "College of Engineering",
    "achieved": 85,
    "target": 80,
    "achievementPercent": 106.25,
    "status": "MET"
  },
  {
    "unitId": "unit-2",
    "unitName": "College of Science",
    "achieved": 75,
    "target": 80,
    "achievementPercent": 93.75,
    "status": "ON_TRACK"
  }
]
```

**Assertions**:
- Status code: 200
- Response is array of aggregation results
- Each result has correct calculation
- Status matches achievement percentage

### Test 6: POST /api/aggregations/validate

**Request**:
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

**Expected Response** (Valid):
```json
{
  "valid": true,
  "errors": [],
  "metrics": {
    "achieved": 76,
    "target": 75,
    "achievementPercent": 101.33,
    "status": "MET",
    "variance": 1
  }
}
```

**Expected Response** (Invalid):
```json
{
  "valid": false,
  "errors": ["Percentage must be between 0 and 100"],
  "metrics": null
}
```

## Integration Tests

### Test 7: QPRO Upload → Aggregation Flow

**Scenario**: Upload a QPRO document with multiple KRA activities

**Steps**:
1. Upload PDF/DOCX to `/api/documents/upload`
2. Analyze via `/api/analyze-qpro`
3. Verify aggregation records created in database

**Verification Queries**:

```sql
-- Check if aggregation records were created
SELECT * FROM kra_aggregations 
WHERE year = 2025 AND quarter = 1 
ORDER BY last_updated DESC LIMIT 5;

-- Check if activities linked correctly
SELECT aa.activity_name, aa.reported, aa.target, aa.achievement
FROM aggregation_activities aa
JOIN kra_aggregations ka ON aa.aggregation_id = ka.id
WHERE ka.year = 2025 AND ka.quarter = 1
LIMIT 10;
```

### Test 8: Dashboard Data Freshness

**Test Name**: Verify dashboard reflects latest aggregations

```typescript
// Simulate: Upload QPRO → Create aggregation records
// Then query dashboard endpoint
const summary = await fetch('/api/aggregations?type=summary&year=2025&quarter=1');
const data = await summary.json();

// Dashboard should show updated metrics
expect(data.overallAchievementPercent).toBeGreaterThan(0);
expect(data.metKRAs).toBeGreaterThanOrEqual(0);
```

## Performance Tests

### Test 9: Aggregation Calculation Speed

**Test**: Time the calculation endpoint

```bash
time curl -X POST "http://localhost:3000/api/aggregations/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"value": 76, "targetType": "percentage", "kraId": "KRA 3", "initiativeId": "KRA3-KPI5", "year": 2025}'
```

**Target**: Response time < 200ms

### Test 10: Summary Query Speed

**Test**: Time the summary endpoint

```bash
time curl -X GET "http://localhost:3000/api/aggregations?type=summary&year=2025&quarter=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Target**: Response time < 500ms

## Error Handling Tests

### Test 11: Missing Parameters

**Request**:
```bash
curl -X GET "http://localhost:3000/api/aggregations" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected**: 400 error with parameter requirements

### Test 12: Invalid KRA ID

**Request**:
```bash
curl -X GET "http://localhost:3000/api/aggregations?type=unit&kraId=INVALID&year=2025&quarter=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected**: Returns empty array or 404

### Test 13: Unauthorized Access

**Request** (no token):
```bash
curl -X GET "http://localhost:3000/api/aggregations?type=summary&year=2025&quarter=1"
```

**Expected**: 401 Unauthorized

## Manual Testing Checklist

- [ ] Database tables created successfully
- [ ] Prisma client regenerated with new models
- [ ] No TypeScript compilation errors
- [ ] All calculation methods return correct values
- [ ] Validation rejects invalid inputs
- [ ] API endpoints return correct status codes
- [ ] Authentication middleware enforces JWT
- [ ] QPRO upload triggers aggregation calculation
- [ ] Dashboard displays aggregated metrics
- [ ] Database indexes created for performance
- [ ] Error logging captures exceptions

## Debugging Tips

### Issue: "Model not found: KRAggregation"
- Solution: Run `npx prisma generate` to regenerate client
- Verify models in `prisma/schema.prisma`
- Check database tables exist

### Issue: "Target not found in strategic plan"
- Solution: Verify `strategic_plan.json` exists in project root
- Check KRA ID and Initiative ID spelling
- Call `strategicPlanService.invalidateCache()`

### Issue: Aggregation values incorrect
- Solution: Review calculation logic in `target-aggregation-service.ts`
- Verify target type is correctly identified
- Check timeline data has correct year entry

### Issue: Performance is slow
- Solution: Verify indexes created on kra_aggregations table
- Check database connection string
- Monitor for slow queries with EXPLAIN ANALYZE

## Sample Test Data

For manual testing, use these values:

```json
{
  "testCases": [
    {
      "kraId": "KRA 3",
      "initiativeId": "KRA3-KPI5",
      "targetType": "percentage",
      "target": 80,
      "reported": 85,
      "expectedStatus": "MET",
      "expectedAchievement": 106.25
    },
    {
      "kraId": "KRA 13",
      "initiativeId": "KRA13-KPI2",
      "targetType": "count",
      "target": 50,
      "reported": 45,
      "expectedStatus": "ON_TRACK",
      "expectedAchievement": 90
    },
    {
      "kraId": "KRA 2",
      "initiativeId": "KRA2-KPI3",
      "targetType": "financial",
      "target": 400000,
      "reported": 350000,
      "expectedStatus": "ON_TRACK",
      "expectedAchievement": 87.5
    }
  ]
}
```

## Next Steps

1. Run manual tests against local environment
2. Verify all endpoints respond correctly
3. Test with real QPRO documents
4. Monitor aggregation accuracy with spot checks
5. Collect performance metrics
6. Document any issues found

---

**Test Suite Status**: Ready for execution
**Last Updated**: December 8, 2025
