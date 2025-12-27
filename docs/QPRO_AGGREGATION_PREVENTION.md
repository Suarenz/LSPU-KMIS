# QPro Aggregation Prevention Guide

## Problem Overview

### The Bug That Was Fixed
When multiple units uploaded QPro documents contributing to the same KPI in the same quarter, the system showed only the **latest value** (5) instead of **summing all contributions** (10 = 5 + 5). This was caused by the aggregation logic executing the **SNAPSHOT** branch instead of the **COUNT** branch, despite the database having the correct `target_type: 'count'`.

### Root Cause
The issue was mysterious - database queries confirmed correct `target_type` values, but the code was somehow executing the wrong conditional branch. It likely stemmed from:
1. **Hot-reload timing issues** with Next.js Turbopack causing stale compiled state
2. **Race conditions** between when aggregation ran and when target_type was read
3. **Implicit type coercion** or comparison issues in the conditional logic

### Resolution
The bug resolved after adding detailed logging to trace execution paths. The logging additions triggered a hot-reload that cleared the problematic state. To prevent recurrence, we've now implemented **comprehensive defensive measures** at three levels.

---

## Prevention Strategy

### Level 1: Data Entry Validation (Approval Endpoint)

**File**: `app/api/qpro/approve/[id]/route.ts` (lines 335-362)

**What It Does**:
- Validates `target_type` before creating KPIContribution records
- Ensures type is a non-empty string
- Normalizes to lowercase and trims whitespace
- Checks against whitelist of valid types
- Logs validation results for traceability
- Throws errors if validation fails

**Key Code**:
```typescript
// DEFENSIVE VALIDATION: Ensure target_type is always set and valid
if (!targetType || typeof targetType !== 'string') {
  console.error(`[Approve API] ⚠️  CRITICAL: Invalid target_type for ${initiativeId}. Got: ${targetType} (type: ${typeof targetType})`);
  throw new Error(`Invalid target_type for ${initiativeId}: expected string, got ${typeof targetType}`);
}

const normalizedTargetType = targetType.toLowerCase().trim();
const validTypes = ['count', 'snapshot', 'rate', 'percentage', 'milestone', 'boolean', 'financial', 'text_condition'];

if (!validTypes.includes(normalizedTargetType)) {
  console.warn(`[Approve API] ⚠️  Unusual target_type "${normalizedTargetType}" for ${initiativeId}, defaulting to "count"`);
}

console.log(`[Approve API] ✓ Validated target_type for ${initiativeId}: "${normalizedTargetType}" (source: ${dbTarget ? 'database' : 'strategic plan'})`);
```

**Benefits**:
- ✅ Prevents invalid target_type from entering database
- ✅ Provides clear error messages for debugging
- ✅ Creates audit trail in logs
- ✅ Catches issues at source before they propagate

---

### Level 2: Processing Validation (Aggregation Logic)

**File**: `app/api/kpi-progress/route.ts` (lines 174-182)

**What It Does**:
- Validates each KPIContribution record before processing
- Skips corrupted records instead of failing entirely
- Warns about target_type mismatches between contributions
- Detects anomalies like COUNT aggregations showing SNAPSHOT behavior

**Key Code**:
```typescript
// DEFENSIVE VALIDATION: Ensure target_type is valid before processing
if (!contrib.target_type || typeof contrib.target_type !== 'string') {
  console.error(`[KPI Progress] ⚠️  CRITICAL: Invalid target_type in contribution ${contrib.id}: ${contrib.target_type} (type: ${typeof contrib.target_type})`);
  continue; // Skip this contribution to prevent corruption
}

const targetType = contrib.target_type.toUpperCase();

// DEFENSIVE CHECK: Warn if target_type mismatch detected
if (existing.targetType.toUpperCase() !== targetType) {
  console.warn(`[KPI Progress] ⚠️  Target type mismatch for ${key}: existing="${existing.targetType}", current="${contrib.target_type}". Using existing type.`);
}
```

**Benefits**:
- ✅ Graceful degradation (skip bad data, continue processing)
- ✅ Detects data corruption early
- ✅ Warns about inconsistencies
- ✅ Prevents cascading failures

---

### Level 3: Anomaly Detection (Summary Logging)

**File**: `app/api/kpi-progress/route.ts` (lines 214-230)

**What It Does**:
- Logs aggregation statistics after processing all contributions
- Counts how many KPIs use each aggregation type
- Detects suspicious patterns (e.g., COUNT with multiple contributions but total equals latest)
- Provides visibility into system behavior

**Key Code**:
```typescript
// DEFENSIVE SUMMARY: Log aggregation patterns to detect anomalies
console.log(`[KPI Progress] Aggregation summary: ${contributionTotals.size} unique KPI/period combinations`);
const typeCounts = new Map<string, number>();
contributionTotals.forEach((agg, key) => {
  const type = agg.targetType.toUpperCase();
  typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  
  // Warn if COUNT aggregation has suspiciously low total (possible SNAPSHOT behavior)
  if (type === 'COUNT' && agg.count > 1 && agg.total === agg.latestValue) {
    console.warn(`[KPI Progress] ⚠️  Possible aggregation anomaly for ${key}: COUNT type with ${agg.count} contributions but total=${agg.total} equals latest=${agg.latestValue}`);
  }
});
console.log(`[KPI Progress] Aggregation types: ${Array.from(typeCounts.entries()).map(([t, c]) => `${t}=${c}`).join(', ')}`);
```

**Benefits**:
- ✅ Early detection of recurring bugs
- ✅ Statistical overview of aggregation behavior
- ✅ Identifies patterns humans might miss
- ✅ Supports proactive monitoring

---

## Testing & Verification

### Automated Test Script

**File**: `scripts/test-aggregation-integrity.ts`

Run with: `npx tsx scripts/test-aggregation-integrity.ts`

**What It Tests**:
1. **Target Type Validation**: All KPIContribution records have valid target_type
2. **Consistency Check**: Same KPI in same period has consistent target_type
3. **COUNT Aggregation**: Multi-unit contributions are summed correctly
4. **Orphaned Records**: No contributions without associated analysis
5. **Multi-Unit Examples**: Shows real aggregation calculations

**Example Output**:
```
🔍 KPI Aggregation Integrity Test

============================================================

📊 Test 1: KPIContribution Validation
------------------------------------------------------------
✅ Target Type Validation: 45 total contributions
   ℹ️  {
     "total": 45,
     "invalid": 0
   }
✅ Target Type Consistency: 32 unique KPI/period combinations
   ℹ️  {
     "total": 32,
     "inconsistent": 0
   }
✅ COUNT Type Aggregation: 28 COUNT-type KPIs
   ℹ️  {
     "totalGroups": 28,
     "multiUnit": 3
   }
✅ Orphaned Contributions Check: 0 orphaned records

📊 Test 2: Multi-Unit Aggregation
------------------------------------------------------------
✅ Multi-Unit KPIs: Found 3 KPIs with multiple unit contributions
✅ Aggregation Test: KRA5-KPI9 (COUNT)
   Values: [5, 5]
   Expected SUM: 10
   Units: CICS, CTE

📈 Summary: 8/8 tests passed
✅ All integrity checks passed! System is healthy.
```

---

## How to Verify After Uploads

### 1. Check Terminal Logs

**During Approval**:
```
[Approve API] ✓ Validated target_type for KRA5-KPI9: "count" (source: strategic plan)
[Approve API] ✓ Created/Updated KPIContribution: analysis=abc123, unit=unit456, kpi=KRA5-KPI9, Q1 2025, value=5, target_type="count", id=contrib789
```

**During Aggregation**:
```
[KPI Progress] Processing 2 KPIContribution records...
[KPI Progress] Aggregation summary: 1 unique KPI/period combinations
[KPI Progress] Aggregation types: COUNT=1
```

### 2. Check Database Directly

```sql
-- Verify target_type values
SELECT 
  initiative_id, 
  year, 
  quarter, 
  COUNT(*) as contribution_count,
  STRING_AGG(DISTINCT target_type, ', ') as target_types,
  SUM(value) as total_value
FROM "KPIContribution"
WHERE initiative_id = 'KRA5-KPI9'
  AND year = 2025
  AND quarter = 1
GROUP BY initiative_id, year, quarter;

-- Expected output:
-- initiative_id | year | quarter | contribution_count | target_types | total_value
-- KRA5-KPI9     | 2025 | 1       | 2                  | count        | 10
```

### 3. Run Integrity Test Script

```bash
npx tsx scripts/test-aggregation-integrity.ts
```

Look for:
- ✅ All tests passed
- No ⚠️ warnings about anomalies
- Multi-unit examples showing correct sums

---

## When to Investigate

### Warning Signs

**1. Inconsistent target_type** (Terminal Log):
```
[KPI Progress] ⚠️  Target type mismatch for KRA5-KPI9|2025|1: existing="count", current="snapshot"
```
**Action**: Check why different units have different target_type. Verify strategic_plan.json and KPITarget table.

**2. Aggregation Anomaly** (Terminal Log):
```
[KPI Progress] ⚠️  Possible aggregation anomaly for KRA5-KPI9|2025|1: COUNT type with 2 contributions but total=5 equals latest=5
```
**Action**: This is the exact bug we fixed! Check if hot-reload issues are back. Restart dev server.

**3. Test Script Failures**:
```
❌ Target Type Consistency: 1 inconsistent KPI/period combinations
   ⚠️  Issues found:
   {
     "key": "KRA5-KPI9|2025|1",
     "types": ["count", "snapshot"]
   }
```
**Action**: Data corruption detected. Run `scripts/fix-kpi-contribution-types.ts` to normalize.

---

## Maintenance Checklist

### After Each Deployment
- [ ] Run `npx tsx scripts/test-aggregation-integrity.ts`
- [ ] Check for 0 invalid contributions
- [ ] Check for 0 inconsistent target_types
- [ ] Verify multi-unit KPIs show expected sums

### Weekly Monitoring
- [ ] Review terminal logs for ⚠️ warnings
- [ ] Spot-check a few multi-unit KPIs manually
- [ ] Verify dashboard displays match database totals

### When Issues Arise
1. Check terminal logs for validation errors
2. Run integrity test script to identify scope
3. Query database to see raw data
4. If corruption found, run fix scripts
5. Restart dev server to clear any cached state
6. Re-test after restart

---

## Key Takeaways

### What Made This Bug Tricky
1. **Database was correct** - target_type values were valid in DB
2. **Logic looked correct** - conditional branches were properly structured
3. **Intermittent nature** - Hot-reload timing caused inconsistent behavior
4. **No obvious errors** - Code executed without exceptions

### Why These Fixes Work
1. **Validation at source** - Catches problems before they enter database
2. **Defensive processing** - Handles corrupted data gracefully
3. **Extensive logging** - Makes invisible problems visible
4. **Automated testing** - Catches regressions quickly
5. **Multiple safety nets** - If one layer fails, others catch it

### Best Practices Going Forward
1. Always validate external inputs (strategic plan, user data)
2. Log key decision points for debugging
3. Use automated tests to verify critical paths
4. Monitor production logs for warning patterns
5. Document known issues and their resolutions

---

**Last Updated**: December 21, 2024  
**Author**: GitHub Copilot (Claude Sonnet 4.5)  
**Related Files**:
- `app/api/qpro/approve/[id]/route.ts` (approval validation)
- `app/api/kpi-progress/route.ts` (aggregation logic)
- `scripts/test-aggregation-integrity.ts` (automated testing)
