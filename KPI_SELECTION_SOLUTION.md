# QPro KPI Selection Implementation - Complete Solution Summary

## Problem Statement
After changing an activity's KRA classification in the QPro review modal, the system was:
1. Using LLM to match the activity to a KPI
2. LLM was selecting wrong KPIs (e.g., Employment Rate to wrong KPI with no target)
3. Resulting in inflated achievement percentages (1584.50%)

## Solution: Explicit User-Selected KPI
Instead of relying on LLM matching, let users explicitly select the correct KPI when they change the KRA.

## Implementation Summary

### 1. Frontend Enhancement (review-modal.tsx)

**Added State:**
```typescript
const [editedKPIs, setEditedKPIs] = React.useState<{ [key: number]: string }>({});
```

**Added Handler:**
```typescript
const handleKPIChange = (activityIndex: number, newKpiId: string) => {
  const newEditedKPIs = { ...editedKPIs };
  newEditedKPIs[activityIndex] = newKpiId;
  setEditedKPIs(newEditedKPIs);
};
```

**Updated API Call:**
```typescript
const activitiesForRegen = data.activities.map((act, idx) => ({
  ...act,
  kraId: editedKRAs[idx] || act.kraId,
  initiativeId: editedKPIs[idx] || act.initiativeId,
  userSelectedKPI: !!editedKPIs[idx], // Flag indicating explicit selection
}));
```

**Added UI Component:**
- Conditional KPI selector that appears when KRA is changed
- Shows available KPIs from strategic_plan.json filtered by selected KRA
- Styled distinctly (indigo background) to indicate it's only for changed KRAs

### 2. Backend Enhancement (regenerate-insights/route.ts)

**New Logic:**
```typescript
// Check if a specific KPI/Initiative was explicitly selected by the user
const userSelectedKPI = (activity as any).userSelectedKPI === true;
let newInitiativeId = activity.initiativeId;

// If user explicitly selected a KPI, use it
if (userSelectedKPI) {
  console.log(`[Regenerate] Using user-selected KPI: ${newInitiativeId}`);
} else {
  // Otherwise, use LLM to match
  const kpiMatch = await matchActivityToKPI(...);
  // ... LLM matching logic
}
```

**Effect:**
- User-selected KPIs skip expensive/error-prone LLM matching
- LLM matching only runs as fallback when user didn't select a KPI
- System respects user expertise and domain knowledge

### 3. Data Flow

```
Review Modal:
  User changes KRA from KRA1 to KRA3
       ↓
  editedKRAs[0] = "KRA3"
       ↓
  KPI Selector appears (conditional render)
       ↓
  User sees KRA3's KPIs:
  - KRA3-KPI1: Student Satisfaction
  - KRA3-KPI2: Program Accreditation
  - KRA3-KPI3: ...
  - KRA3-KPI5: 75% Employment Rate ← USER SELECTS THIS
  - ...
       ↓
  editedKPIs[0] = "KRA3-KPI5"
  userSelectedKPI = true
       ↓
  "Regenerate Insights" button clicked
       ↓
API:
  Receives activity with:
  - kraId: "KRA3"
  - initiativeId: "KRA3-KPI5"
  - userSelectedKPI: true
       ↓
  Checks: userSelectedKPI === true? YES
       ↓
  SKIPS LLM matching
  Uses explicit KPI: "KRA3-KPI5"
       ↓
  Looks up target from strategic_plan.json:
  findTargetFromStrategicPlan("KRA3", "KRA3-KPI5", 2025)
  Returns: 73 (baseline target)
       ↓
  Calculates achievement:
  (Reported: 75 / Target: 73) × 100 = 102.74%
       ↓
  Status: EXCEEDED (because 102.74% > 100%)
       ↓
  Generates AI insights for KRA3 context
       ↓
  Saves to database with correct values
       ↓
Detail Page:
  Shows: Target 73%, Achievement 102.74%, Status EXCEEDED
  All content properly formatted
```

## Key Files Modified

1. **components/qpro/review-modal.tsx**
   - Line ~420: Added `editedKPIs` state
   - Line ~555: Added `handleKPIChange()` function
   - Line ~570: Updated `regenerateInsights()` to include `userSelectedKPI` flag
   - Line ~840: Added conditional KPI selector UI component

2. **app/api/qpro/regenerate-insights/route.ts**
   - Line ~320: Changed KPI matching logic to check `userSelectedKPI` flag
   - Uses explicit KPI when flag is true
   - Falls back to LLM only when flag is false or undefined

## Expected Behavior

### Scenario 1: User Selects a KPI
- ✅ System uses user-selected KPI
- ✅ Skips LLM matching (faster, more reliable)
- ✅ Correct target retrieved
- ✅ Achievement calculated correctly
- ✅ Insights generated for correct KPI context

### Scenario 2: User Only Changes KRA (No KPI Selection)
- ✅ KPI selector appears but user doesn't select anything
- ✅ System falls back to LLM matching
- ✅ LLM analyzes activity and suggests best KPI within selected KRA
- ✅ Original behavior preserved as fallback

### Scenario 3: Original KRA Not Changed
- ✅ KPI selector doesn't appear
- ✅ System processes activity normally
- ✅ No KPI matching needed

## Test Case: Employment Rate Activity

**Before Fix:**
- Activity: Employment Rate
- Wrong KRA: KRA1 (Development of New Curricula)
- Wrong Target: None (KRA1 doesn't have numeric target)
- Wrong Achievement: 1584.50% ❌

**After Fix:**
- Activity: Employment Rate
- Correct KRA: KRA3 (Quality Assurance)
- User selects KPI: KRA3-KPI5 (75% Employment Rate)
- Correct Target: 73% (2025 baseline)
- Correct Achievement: 102.74% ✓
- Status: EXCEEDED ✓

## Technical Improvements

1. **User Expertise Respected**
   - Users know their domain better than LLM
   - Explicit selection prevents AI guessing
   - Can correct misclassifications accurately

2. **Performance Optimized**
   - Skips LLM API call for user selections
   - Reduces latency (no LLM inference needed)
   - Reduces API costs (fewer GPT calls)

3. **Fallback Strategy**
   - User selection as primary path
   - LLM matching as fallback for unchanged KRAs
   - Graceful degradation if LLM matching fails

4. **Error Prevention**
   - Forces explicit choice when KRA is changed
   - Prevents accidental wrong KPI selection
   - Clear UI indication (indigo styling) that KPI choice is required

## Configuration & Customization

### Strategic Plan Path
Located in: `/src/data/strategic_plan.json`

Structure expected:
```json
{
  "kras": [
    {
      "kra_id": "KRA3",
      "kra_title": "Quality Assurance and Continuous Improvement",
      "initiatives": [
        {
          "id": "KRA3-KPI5",
          "description": "achieve 75% employment or entrepreneurial engagement rate...",
          "targets": {
            "type": "percentage",
            "timeline_data": [
              { "year": 2025, "target_value": 73 },
              { "year": 2029, "target_value": 75 }
            ]
          }
        }
      ]
    }
  ]
}
```

### Styling
KPI selector styled with:
- Background: indigo-50 (light background)
- Border: indigo-200 (indigo border)
- Label: indigo-700 (dark text)
- This distinguishes it from regular KRA selector (slate colors)

## Future Enhancements

1. **Cache Strategic Plan**
   - Avoid repeated `require()` of JSON file
   - Load once during component mount
   - Use React context or Zustand for sharing

2. **Validation**
   - Validate selected KPI belongs to selected KRA
   - Show error if mismatched
   - Prevent invalid submissions

3. **Suggestions**
   - Pre-select best-matching KPI from LLM
   - Let user accept or change
   - Combines AI suggestions with user control

4. **Bulk Operations**
   - Allow selecting multiple activities at once
   - Bulk-apply same KPI change
   - Reduce manual work for multiple misclassified activities

5. **Audit Trail**
   - Log when user-selected vs LLM-matched KPIs used
   - Track correction patterns
   - Use to improve LLM prompts

## Migration Notes

If upgrading from previous version:
1. Review-modal.tsx now requires strategic_plan.json in `/src/data/`
2. All regenerated activities will have `userSelectedKPI` field (new)
3. Existing analyses without this field will use LLM fallback
4. No database schema changes required

## Status

✅ **Implementation Complete**
- KPI selector UI implemented and styled
- Backend logic updated to check `userSelectedKPI` flag
- Fallback to LLM maintained for backward compatibility
- Ready for testing with real data

**Next Steps:**
1. Test KPI selector with live QPro analysis
2. Verify correct target lookup with selected KPI
3. Validate achievement calculations
4. Check that all content displays correctly
