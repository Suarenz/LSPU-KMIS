# KPI-Level Classification - Quick Start Guide

## What's New

Your system now automatically:
1. **Extracts activities** from QPRO documents (Pass 1)
2. **Classifies to KRA-KPI level** with type detection (Pass 2)
3. **Fetches targets** from strategic plan for 2025
4. **Calculates achievement %** = (reported / target) × 100
5. **Shows status** (MET/ON_TRACK/PARTIAL/NOT_STARTED)

## How It Works in 3 Steps

### Step 1: Activity Extraction
The system reads a QPRO document and extracts:
- Activity name/description
- Reported value (e.g., "2 trainings delivered")
- Type (training, curriculum, digital, research, extension)

**Example from QPRO:**
```
"Faculty training conducted: 2 trainings delivered
 Focus: Emerging technologies and digital skills"
```

### Step 2: KPI Classification
The system automatically:
1. Detects activity type → "training" (0.85 confidence)
2. Maps to KRA → "KRA 13" (Human Resources Development)
3. Finds best-fit KPI → "KRA13-KPI2" (Enhance Staff Competency)
4. Looks up 2025 target → "5 trainings expected"
5. Calculates achievement → 2/5 = 40%

**Why this happens:**
- Type detection identifies "training" keywords
- KRA 13 is best fit for "training" type activities
- Within KRA 13, KPI 2 about "emerging technologies" matches best
- Strategic plan says target is 5 for 2025
- Reported is 2, so achievement = 40%

### Step 3: API Response Shows KPI-Level Data

**Endpoint**: `GET /api/qpro/analyses/[analysisId]`

**Response includes:**
```json
{
  "organizedActivities": [
    {
      "kraId": "KRA 13",
      "kraTitle": "Human Resources Development",
      "kpiId": "KRA13-KPI2",                    // ← KPI level!
      "kpiTitle": "Enhance Staff Competency in Emerging Technologies",
      "activities": [
        {
          "title": "Faculty training conducted",
          "target": 5,
          "reported": 2,
          "achievement": 40,                   // ← Auto-calculated!
          "status": "PARTIAL",                 // ← Auto-determined!
          "confidence": 0.87
        }
      ],
      "totalTarget": 5,                       // ← Sum of all activities
      "totalReported": 2,
      "completionPercentage": 40,             // ← Overall % for this KPI
      "status": "PARTIAL"                     // ← Overall status
    }
  ]
}
```

## Key Features Explained

### Achievement Percentage
```
Calculation: (Reported Value / Target Value) × 100
Example: 2 trainings delivered / 5 target = 40% achievement
Display: "40% (2/5 trainings completed)"
```

### Status Determination
```
≥ 100%   → MET        (Green)    ✓ Target achieved
70-99%   → ON_TRACK   (Yellow)   ◐ Good progress
1-69%    → PARTIAL    (Orange)   ◑ Some progress
0%       → NOT_STARTED (Red)     ✗ No progress yet
```

### Confidence Score
```
Range: 0.55 - 0.95 (1 = 100% confident)
Example: 0.87 = 87% confident this KPI assignment is correct

Components:
- Type detection confidence: 0-0.5
- Semantic matching confidence: 0-0.5
- Combined = up to 0.95
```

### Year-Specific Targets
```
Targets are automatically fetched from strategic plan:
- Activity classification happens → determines KPI
- KPI lookup in strategic plan → fetch 2025 targets
- If 2025 target = 5, system uses 5 for calculation
- Achievement = reported / 2025_target × 100
```

## Dashboard Integration

### Current Display (Before KPI)
```
KRA 13: 3 activities reported
```

### New Display (With KPI)
```
KRA 13 - Human Resources Development
  └─ KPI 2: Enhance Staff Competency in Emerging Technologies
     ├─ Target (2025): 5 trainings
     ├─ Reported: 2 trainings
     ├─ Completion: 40% (2/5)
     ├─ Status: PARTIAL ◑
     └─ Confidence: 87%
       Activities:
       ├─ Faculty training conducted
       └─ Emerging tech certification program
```

## Example: Multiple Activities Per KPI

If a QPRO has multiple activities for the same KPI:

**QPRO Content:**
```
1. Faculty training workshop - 2 trainings completed
2. Staff certification program - 1 person certified
3. Digital skills bootcamp - 1 participant
```

**API Response (Aggregated):**
```json
{
  "kpiId": "KRA13-KPI2",
  "kpiTitle": "Enhance Staff Competency",
  "totalTarget": 5,
  "totalReported": 4,              // 2 + 1 + 1 = 4
  "completionPercentage": 80,      // 4/5 = 80%
  "status": "ON_TRACK",            // 80% is between 70-99%
  "activities": [
    {"title": "Faculty training workshop", "reported": 2, ...},
    {"title": "Staff certification program", "reported": 1, ...},
    {"title": "Digital skills bootcamp", "reported": 1, ...}
  ]
}
```

## API Endpoint Details

### Get Analysis with KPI Data
```
GET /api/qpro/analyses/{id}
Headers: 
  Authorization: Bearer {token}

Response: {
  id, title, year, quarter, uploadedDate, status,
  extractedSections, kraClassifications,
  organizedActivities: [     // ← NOW WITH KPI LEVEL
    {
      kraId, kraTitle,
      kpiId, kpiTitle,       // ← NEW!
      activities,
      totalTarget,           // ← NEW!
      totalReported,         // ← NEW!
      completionPercentage,  // ← NEW!
      status                 // ← NEW!
    }
  ],
  insights, recommendations,
  achievementMetrics
}
```

## Testing the Feature

### Step 1: Upload a QPRO Document
1. Go to QPRO upload page
2. Upload a document with activities like "5 trainings conducted"
3. Wait for analysis to complete

### Step 2: Check the Response
1. Navigate to analysis result page
2. Open browser DevTools (F12) → Network tab
3. Look for GET `/api/qpro/analyses/[id]` request
4. Check response JSON for:
   - ✅ `kpiId` field (e.g., "KRA13-KPI2")
   - ✅ `kpiTitle` field
   - ✅ `totalTarget` field
   - ✅ `totalReported` field
   - ✅ `completionPercentage` field
   - ✅ `status` field (MET/ON_TRACK/PARTIAL/NOT_STARTED)

### Step 3: Verify Calculations
- If reported = 2, target = 5
- Then completionPercentage should = 40
- And status should = PARTIAL

## Configuration

### Year for Targets
Currently configured for **2025** in the code:
```typescript
const timelineData = bestInitiative.targets.timeline_data.find((t: any) => t.year === 2025);
```

To change year: Edit `lib/services/qpro-analysis-service.ts`, function `validateAndFixActivityKRAMatches()`, search for `t.year === 2025`

### KRA-Type Mapping
Activities are matched to KRAs based on detected type:

| Activity Type | Assigned to KRAs |
|---|---|
| training | KRA 13, KRA 11 |
| curriculum | KRA 1, KRA 13 |
| digital | KRA 17, KRA 4, KRA 5 |
| research | KRA 3, KRA 4, KRA 5 |
| extension | KRA 6, KRA 7 |

To customize: Edit `validateAndFixActivityKRAMatches()` in `qpro-analysis-service.ts`

## Troubleshooting

### Problem: `kpiId` is empty in response
**Cause**: Activity matched to KRA but no matching initiative found
**Solution**: Check strategic plan structure has initiatives with `id` field

### Problem: `totalTarget` is 0
**Cause**: Strategic plan doesn't have target for 2025
**Solution**: Verify strategic plan has `timeline_data[{year: 2025, target_value: 5}]`

### Problem: `completionPercentage` is 0 when it should have a value
**Cause**: `reported` value not extracted from QPRO
**Solution**: Make sure QPRO has quantified results like "2 trainings", not just "training"

### Problem: Status shows NOT_STARTED when activities exist
**Cause**: `reported` field is null/undefined
**Solution**: Check activity extraction includes reported values

## Files Modified

1. **`lib/services/qpro-analysis-service.ts`**
   - Enhanced `validateAndFixActivityKRAMatches()` function
   - Now extracts and stores `kraTitle`, `kpiTitle`
   - Calculates `achievement` and `status`

2. **`app/api/qpro/analyses/[id]/route.ts`**
   - Modified `organizeActivitiesByKRA()` function
   - Now groups by KRA-KPI pairs (composite key)
   - Adds `totalTarget`, `totalReported`, `completionPercentage`, `status`

3. **Documentation**
   - `KPI_LEVEL_IMPLEMENTATION.md` - Complete technical details
   - This file - User-friendly quick start guide

## Next Enhancements

- [ ] Update dashboard component to show KPI-level groupings
- [ ] Add progress bars showing % completion
- [ ] Color-code status (green/yellow/orange/red)
- [ ] Show achievements across multiple quarters
- [ ] Compare actual vs target visually
- [ ] Drill-down to see individual activities
- [ ] Support multiple years (2025, 2026, 2027)
