# KPI Selection Flow - Complete Test Guide

## Overview
This test verifies the complete flow of explicit KPI selection when changing KRA classifications in the QPro review modal.

## Test Scenario: Employment Rate Activity

**Activity Name**: Employment Rate  
**Current (Wrong) KRA**: KRA1 (Development of New Curricula)  
**Current (Wrong) Achievement**: 1584.50% (because KRA1 doesn't have a numeric target for this)  
**Correct KRA**: KRA3 (Quality Assurance and Continuous Improvement)  
**Correct KPI**: KRA3-KPI5 (75% Employment Rate)  
**Expected Target**: 73-75% (depending on year)  
**Expected Achievement**: Should be ~100% (since 75% reported against 73-75% target)

## Step-by-Step Test

### 1. Upload QPro Analysis
- Create a QPro analysis with the "Employment Rate" activity
- Verify it's initially classified to wrong KRA1
- Confirm achievement shows as inflated (~1584.50%)

### 2. Open Review Modal
- Click "Review & Approve" button
- Modal should open showing the analysis data

### 3. Change KRA
- In the review modal, find the "Employment Rate" activity
- Click the KRA dropdown
- Select **KRA3** (Quality Assurance and Continuous Improvement)
- **Expected UI Change**: 
  - KRA selector shows "KRA Changed ✓" indicator
  - **NEW**: KPI selector appears below showing available KPIs in KRA3

### 4. Select Correct KPI
- In the new KPI selector, you should see multiple options:
  - KRA3-KPI1: Student Satisfaction
  - KRA3-KPI2: Program Accreditation
  - ...
  - **KRA3-KPI5**: Achieve 75% employment or entrepreneurial engagement rate...
  - ...
  - KRA3-KPI16: ...
- Click on **KRA3-KPI5** option
- **Expected State**: 
  - KPI selector shows selected value
  - `editedKPIs[index]` = "KRA3-KPI5"
  - `userSelectedKPI` flag = true (will be sent to API)

### 5. Regenerate Insights
- Click "Regenerate Insights" button
- **Frontend Flow**:
  - `activitiesForRegen` includes:
    ```json
    {
      "name": "Employment Rate",
      "kraId": "KRA3",
      "initiativeId": "KRA3-KPI5",
      "userSelectedKPI": true,
      "reported": 75,
      ...
    }
    ```
  - API call to `/api/qpro/regenerate-insights`

### 6. Backend Processing
- **API receives request** with `userSelectedKPI: true`
- **KPI Matching Logic**:
  1. Checks `activity.userSelectedKPI === true`
  2. Since TRUE, **SKIPS** LLM matching
  3. Uses explicit `initiativeId: "KRA3-KPI5"`
  4. Logs: `"[Regenerate] Using user-selected KPI: KRA3-KPI5"`
- **Target Lookup**:
  1. Calls `findTargetFromStrategicPlan()` with:
     - `kraId: "KRA3"`
     - `initiativeId: "KRA3-KPI5"`
     - `reportYear: 2025`
  2. Retrieves **target: 73** (2025 baseline for 75% by 2029)
- **Achievement Calculation**:
  1. Reported: 75%
  2. Target: 73%
  3. Achievement: (75/73) × 100 = **102.74%**
  4. Status: EXCEEDED (>100%)
- **Insights Generation**:
  - LLM generates AI insights based on correct KRA3 context
  - Insights show proper alignment with employment KPI

### 7. Verify Results
- Modal shows updated achievement: **102.74%** (EXCEEDED)
- Activity details show correct KRA: **KRA3**
- Recommended actions align with employment goals
- No markdown artifacts (###, **) in displayed text

### 8. Approve and Save
- Click "Approve & Save" button
- Analysis saved to database with:
  - `kraId: "KRA3"`
  - `initiativeId: "KRA3-KPI5"`
  - `target: 73`
  - `achievement: 102.74`
  - `status: "EXCEEDED"`
  - Updated `aiInsight` and `prescriptiveAnalysis` fields

### 9. View Detail Page
- Navigate to QPro Analysis Detail page
- **Stage 3: Key Classifications** shows:
  - KRA: KRA3 ✓
  - KPI: KRA3-KPI5 ✓
- **Stage 4: AI Analysis** shows:
  - Target: 73%
  - Achievement: 102.74% (EXCEEDED)
  - All content sections properly formatted (no markdown artifacts)

## Success Criteria

✅ **UI Layer**:
- KPI selector appears when KRA is changed
- KPI dropdown shows available KPIs for selected KRA
- Selecting KPI updates `editedKPIs` state
- All content properly formatted (no ###, **)

✅ **API Layer**:
- Receives `userSelectedKPI: true` flag
- Skips LLM matching when flag is true
- Uses explicit KPI for target lookup
- Correct target retrieved: 73%

✅ **Calculation Layer**:
- Achievement: (75 / 73) × 100 = 102.74%
- Status: EXCEEDED (>100%)

✅ **Database Layer**:
- `kraId` updated to KRA3
- `initiativeId` updated to KRA3-KPI5
- `target` updated to 73
- `achievement` updated to 102.74
- `status` updated to EXCEEDED

✅ **Display Layer**:
- Detail page shows all 4 stages correctly
- Correct KRA and KPI displayed
- Correct target and achievement shown
- No markdown artifacts in generated content

## What Changed

### Frontend Changes
1. **review-modal.tsx**:
   - Added `editedKPIs` state to track user-selected KPIs
   - Added `handleKPIChange()` function
   - Added conditional KPI selector UI (shown when KRA changed)
   - Added `userSelectedKPI: true` flag in activities sent to API

### Backend Changes
1. **regenerate-insights/route.ts**:
   - Check `activity.userSelectedKPI === true` flag
   - Skip LLM matching if user selected KPI explicitly
   - Use explicit KPI for target lookup
   - Log which path was taken (user-selected vs LLM-matched)

### Data Flow
```
User selects KPI in modal
    ↓
editedKPIs[index] = "KRA3-KPI5"
userSelectedKPI = true
    ↓
API receives request
    ↓
Check: userSelectedKPI === true?
    ↓ YES
Skip LLM matching
Use initiativeId: "KRA3-KPI5"
    ↓
findTargetFromStrategicPlan("KRA3", "KRA3-KPI5", 2025)
    ↓ Returns: 73
achievement = (75/73) × 100 = 102.74%
    ↓
Save to database with correct values
    ↓
Display on detail page: 102.74% EXCEEDED
```

## Testing Commands

If running tests, verify:

```bash
# Check that KPI selector appears in modal
npm test -- components/qpro/review-modal.test.ts -t "KPI selector"

# Check that userSelectedKPI flag is sent
npm test -- components/qpro/review-modal.test.ts -t "userSelectedKPI flag"

# Check that API skips LLM when flag is true
npm test -- app/api/qpro/regenerate-insights.test.ts -t "skips LLM with user selection"

# Check correct target is retrieved
npm test -- app/api/qpro/regenerate-insights.test.ts -t "finds correct target"

# Check achievement calculation
npm test -- app/api/qpro/regenerate-insights.test.ts -t "calculates achievement"
```

## Common Issues & Fixes

### Issue: KPI selector not showing
- **Cause**: `editedKRAs[index]` not being set or equals original `activity.kraId`
- **Fix**: Verify `handleKRAChange()` is called and setting state correctly

### Issue: LLM still matching even with userSelectedKPI
- **Cause**: API not checking `userSelectedKPI` flag
- **Fix**: Verify flag is being sent from frontend and checked in API

### Issue: Wrong target still being used
- **Cause**: `findTargetFromStrategicPlan()` not finding KPI
- **Fix**: Verify strategic_plan.json has correct KPI IDs and targets

### Issue: Old achievement still showing in modal
- **Cause**: Modal not updating after API response
- **Fix**: Verify `setAnalysis()` is called with new data from API

## Next Steps

Once test passes:
1. Document in README that users should explicitly select KPI when misclassified
2. Consider adding UI tooltip: "If KRA was misclassified, select the correct KPI"
3. Monitor logs for which activities use user-selection vs LLM matching
4. Consider caching strategic_plan.json in frontend to avoid repeated loading
