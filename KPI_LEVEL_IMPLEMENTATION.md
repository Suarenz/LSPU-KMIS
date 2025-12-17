# KPI-Level Classification Implementation Summary

## Overview
Implemented KPI-level classification for QPRO activities, enabling granular tracking of performance against year-specific targets.

## What Was Implemented

### 1. Enhanced Activity Data Structure
Activities now include KPI-level information:
```typescript
{
  name: "Faculty Training Workshop",
  kraId: "KRA 13",
  kraTitle: "Human Resources Development", // NEW
  initiativeId: "KRA13-KPI2",
  kpiTitle: "Enhance Staff Competency in Emerging Technologies", // NEW
  target: 2,
  reported: 1,
  achievement: 50, // Calculated: (reported/target)*100
  status: "PARTIAL", // NEW: MET, PARTIAL, NOT_STARTED
  confidence: 0.85,
  timestamp: "2025-01-15T08:30:00Z"
}
```

### 2. Modified Files

#### `/lib/services/qpro-analysis-service.ts`
**Function**: `validateAndFixActivityKRAMatches()`
- ✅ Extracts `kraTitle` from strategic plan
- ✅ Extracts `kpiTitle` from initiative data
- ✅ Stores year-specific targets from `timeline_data`
- ✅ Calculates achievement percentage for each activity
- ✅ Sets status: MET, PARTIAL, NOT_STARTED based on achievement
- ✅ Enriches ALL activities (not just reassigned ones) with titles

**Logic Flow**:
1. For each activity, look up its KRA ID in strategic plan
2. If KRA exists, fetch its title
3. If activity has initiativeId, find the matching initiative
4. Extract KPI title from initiative's `key_performance_indicator.outputs`
5. Calculate achievement = (reported / target) * 100
6. Determine status based on achievement percentage

#### `/app/api/qpro/analyses/[id]/route.ts`
**Function**: `organizeActivitiesByKRA()`
- ✅ Changed organization from KRA-only to KRA-KPI pairs
- ✅ Uses composite key: `${kraId}|${initiativeId}` for grouping
- ✅ Aggregates metrics at KPI level:
  - `totalTarget`: Sum of all activity targets for this KPI
  - `totalReported`: Sum of all reported values for this KPI
  - `completionPercentage`: (totalReported / totalTarget) * 100
  - `status`: MET (≥100%), ON_TRACK (≥70%), PARTIAL (>0%), NOT_STARTED (0%)

**Response Structure**:
```json
{
  "kraId": "KRA 13",
  "kraTitle": "Human Resources Development",
  "kpiId": "KRA13-KPI2",
  "kpiTitle": "Enhance Staff Competency",
  "activities": [
    {
      "title": "Faculty Training Workshop",
      "target": 2,
      "reported": 1,
      "achievement": 50,
      "status": "PARTIAL",
      "confidence": 0.85
    }
  ],
  "totalTarget": 2,
  "totalReported": 1,
  "completionPercentage": 50,
  "status": "PARTIAL"
}
```

### 3. KPI Status Logic
| Completion % | Status | Interpretation |
|---|---|---|
| ≥ 100% | MET | Target achieved or exceeded |
| 70-99% | ON_TRACK | Good progress toward target |
| 1-69% | PARTIAL | Some progress but below target |
| 0% | NOT_STARTED | No activities reported |

### 4. Dashboard Display Benefits

#### Before (KRA-only):
```
KRA 13 - Human Resources Development
├─ Activity 1: Faculty Training (no target shown)
├─ Activity 2: Certification Program
└─ Activity 3: Capacity Building Workshop
Status: 3 activities (no quantitative measure)
```

#### After (KRA-KPI with targets):
```
KRA 13.2 - Human Resources Development > Enhance Staff Competency
├─ Target: 5 trainings for 2025
├─ Activities:
│  ├─ Faculty Training Workshop (1/2 target met)
│  └─ Certification Program (1/2 target met)
├─ Overall: 2/5 = 40% completed
└─ Status: PARTIAL (Progress: 40%, Target: 5)
```

## Key Features

### ✅ Year-Specific Targets
```typescript
// Targets pulled from strategic plan timeline_data
if (bestInitiative.targets && bestInitiative.targets.timeline_data) {
  const timelineData = bestInitiative.targets.timeline_data.find((t: any) => t.year === 2025);
  targetValue = timelineData.target_value; // e.g., 5 trainings
}
```

### ✅ Confidence Scoring
- Type detection confidence (0-0.5)
- Semantic matching confidence (0-0.5)
- Combined score: 0.55-0.95 range
- Indicates reliability of KPI assignment

### ✅ Automatic Achievement Calculation
- No manual input needed
- Calculated as: `(reported / target) * 100`
- Automatically determines MET/PARTIAL/NOT_STARTED status
- Shown in dashboard without extra computation

### ✅ Composite Grouping
Activities automatically grouped by KRA-KPI pair:
```typescript
const compositeKey = `${kraId}|${initiativeId}`;
// Groups activities for same KRA-KPI together
// Aggregates: totalTarget, totalReported, completionPercentage
```

## Data Flow Example

### Input: QPRO Document
```
"Faculty training conducted: 2 trainings delivered
 Focus: Emerging technologies and digital skills
 Target: 5 trainings expected in 2025"
```

### Processing (Pass 2 - Classification)
1. **Type Detection**: Semantic score identifies as "training" type (score: 0.85)
2. **KRA Mapping**: Assigns to KRA 13 (Human Resources Development)
3. **KPI Selection**: Matches to KRA13-KPI2 (Enhance Staff Competency in Emerging Technologies)
4. **Target Lookup**: Finds 2025 target = 5 trainings from strategic plan
5. **Achievement**: Calculates reported=2 / target=5 = 40% completion

### Output: Activity Record
```json
{
  "name": "Faculty training conducted",
  "kraId": "KRA 13",
  "kraTitle": "Human Resources Development",
  "initiativeId": "KRA13-KPI2",
  "kpiTitle": "Enhance Staff Competency in Emerging Technologies",
  "reported": 2,
  "target": 5,
  "achievement": 40,
  "status": "PARTIAL",
  "confidence": 0.87
}
```

### API Response (Group by KRA-KPI)
```json
{
  "kraId": "KRA 13",
  "kraTitle": "Human Resources Development",
  "kpiId": "KRA13-KPI2",
  "kpiTitle": "Enhance Staff Competency in Emerging Technologies",
  "totalTarget": 5,
  "totalReported": 2,
  "completionPercentage": 40,
  "status": "PARTIAL",
  "activities": [
    {
      "title": "Faculty training conducted",
      "target": 5,
      "reported": 2,
      "achievement": 40,
      "status": "PARTIAL"
    }
  ]
}
```

## Testing

### How to Verify KPI-Level Classification

1. **Upload a QPRO document** with training activities
2. **Check API response** at `/api/qpro/analyses/[id]`
3. **Verify response includes**:
   - ✅ `kpiId` field
   - ✅ `kpiTitle` field
   - ✅ `totalTarget` from strategic plan
   - ✅ `totalReported` from QPRO
   - ✅ `completionPercentage` calculated
   - ✅ `status` (MET/ON_TRACK/PARTIAL/NOT_STARTED)

### Expected Output Structure
```json
{
  "organizedActivities": [
    {
      "kraId": "KRA 13",
      "kraTitle": "Human Resources Development",
      "kpiId": "KRA13-KPI2",
      "kpiTitle": "Enhance Staff Competency in Emerging Technologies",
      "totalTarget": 5,
      "totalReported": 2,
      "completionPercentage": 40,
      "status": "PARTIAL",
      "activities": [...]
    }
  ]
}
```

## Benefits

1. **Granular Tracking**: See performance at KRA-KPI level, not just KRA
2. **Automatic Progress**: Achievement calculated from reported vs target
3. **Visual Status**: Quick status indicator (MET/ON_TRACK/PARTIAL/NOT_STARTED)
4. **Year-Specific**: Targets automatically pulled from 2025 strategic plan
5. **Confidence Scoring**: Know how reliable the KPI assignment is
6. **No Manual Calculation**: Dashboard can display completion % directly

## Next Steps

1. **Dashboard Component**: Update to display KPI-level groupings
2. **Progress Charts**: Show completion % per KPI graphically
3. **Status Indicators**: Color-coded status badges (green/yellow/red)
4. **Drill Down**: Click KPI to see constituent activities
5. **Comparison**: Track progress across quarters (2025 Q1 vs Q2)

## Database Schema Notes

The activity data is stored as JSON in `QPROAnalysis.activities` field:
```prisma
model QPROAnalysis {
  activities    Json?    // Array of activity objects with KPI-level data
}
```

No schema changes needed - KPI data stored as properties in JSON object.

## Known Limitations & Future Improvements

1. **Multiple Activities per KPI**: Currently aggregates all activities for a KPI
   - Future: Track individual activity details separately
2. **Year-Specific Targets**: Currently fixed to 2025
   - Future: Support multiple years (2025, 2026, 2027)
3. **Quarter-level Targets**: Not yet implemented
   - Future: Break targets down by quarter

## Troubleshooting

### Issue: `kpiTitle` is empty
- **Cause**: Initiative doesn't have `key_performance_indicator.outputs` field
- **Fix**: Strategic plan structure issue - verify KPI structure

### Issue: `completionPercentage` is 0
- **Cause**: No activities matched to this KPI
- **Fix**: Verify activity classification in validation logs

### Issue: `status` always shows NOT_STARTED
- **Cause**: `reported` values not being set correctly
- **Fix**: Check QPRO document has quantified results (e.g., "2 trainings")
