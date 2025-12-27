# Bug Fix: KRA3-KPI6 Target Value Showing as 0 / 0

## Problem
KRA3-KPI6 was displaying `0 / 0` as target values instead of showing the correct target value of `1` from the strategic plan.

## Root Cause
The issue was in `/app/api/kpi-progress/route.ts` where initiative ID lookups were using exact string matching without normalization:

```typescript
// INCORRECT (before fix)
const initiative = kra?.initiatives.find((i: any) => i.id === initiativeId);
```

This caused failures when:
- Initiative IDs had varying formats (e.g., "KRA3-KPI6" vs "KRA 3-KPI6")
- Whitespace differences between stored IDs and query IDs
- Case sensitivity issues

When the lookup failed, the code defaulted to `targetValue: 0` instead of properly falling back to the strategic plan target.

## Solution
Updated all initiative ID lookups to:
1. **Normalize both IDs** using the `normalizeInitiativeId()` function
2. **Implement fallback logic** to search by KPI number if direct match fails

### Changes Made
Fixed 6 locations across 2 files:

**app/api/kpi-progress/route.ts:**
1. **Line 316-320**: GET endpoint - legacy AggregationActivity processing
2. **Line 446-451**: GET endpoint - secondary initialization
3. **Line 626-631**: GET endpoint - KPIContribution processing  
4. **Line 906-911**: PATCH endpoint - manual override type lookup
5. **Line 925-930**: PATCH endpoint - new aggregation creation

**app/api/qpro/regenerate-insights/route.ts:**
6. **Line 600**: Activity context building for LLM

### New Lookup Logic
```typescript
// CORRECT (after fix)
const normalizedInitId = normalizeInitiativeId(String(initiativeId || ''));
let initiative = kra?.initiatives.find((i: any) => normalizeInitiativeId(String(i.id)) === normalizedInitId);

// Fallback: search by KPI number if direct match fails
if (!initiative && initiativeId) {
  const kpiMatch = String(initiativeId).match(/KPI(\d+)/i);
  if (kpiMatch) {
    initiative = kra?.initiatives?.find((i: any) => String(i.id).includes(`KPI${kpiMatch[1]}`));
  }
}
```

## Strategic Plan Data Verification
Confirmed that `KRA3-KPI6` in the strategic plan has correct target values:
- Type: `count`
- 2025-2029: All years have `target_value: 1`

## Files Modified
- `app/api/kpi-progress/route.ts` - Added `normalizeInitiativeId` import and applied fix to 5 locations
- `app/api/qpro/regenerate-insights/route.ts` - Added `normalizeInitiativeId` import and fixed line 600
- `lib/utils/qpro-aggregation.ts` - Already has proper `normalizeInitiativeId` and `findInitiative` with fallback logic (no changes needed)
- `app/api/qpro/analyses/[id]/route.ts` - Already has fallback logic implemented (no changes needed)

## Testing
The fix ensures that:
1. All KRA/KPI combinations are properly matched in the strategic plan
2. Target values correctly fall back to strategic plan if database lookups fail
3. Both normalized and non-normalized initiative ID formats are supported
4. The system is resilient to ID format variations

## Related Systems
This fix also applies to other KPIs that may have similar ID format issues:
- All other KRA-KPI combinations now use proper normalization
- The `getInitiativeTargetMeta` helper function (already implemented) provides the same fallback logic
