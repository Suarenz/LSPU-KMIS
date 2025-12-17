# KPI Classification Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    QPRO DOCUMENT UPLOAD                          │
│  (PDF/DOCX with activities and reported values)                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PASS 1: EXTRACTION                            │
│  Extract raw activities from document                            │
│  - Activity name                                                 │
│  - Reported value (e.g., 2 trainings)                            │
│  - Description/context                                          │
│  Result: 81/81 activities extracted ✅                           │
│  Cached in Redis (24-hour TTL)                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               PASS 2: KPI CLASSIFICATION                         │
│                                                                   │
│  For each activity:                                              │
│  1. TYPE DETECTION                                               │
│     └─ Semantic analysis: training|curriculum|digital|research   │
│        Confidence: 0.55-0.95 ✅                                  │
│                                                                   │
│  2. KRA MAPPING                                                  │
│     └─ Type → KRA: training → KRA 13, KRA 11                     │
│                     digital → KRA 17, KRA 4, KRA 5               │
│                     ...etc                                        │
│                                                                   │
│  3. KPI SELECTION                                                │
│     └─ Semantic match within KRA initiatives                    │
│        Best matching KPI ID (e.g., KRA13-KPI2) ✅               │
│                                                                   │
│  4. TARGET LOOKUP                                                │
│     └─ Strategic plan → KPI → timeline_data[year=2025]          │
│        Get 2025 target value (e.g., 5 trainings) ✅             │
│                                                                   │
│  5. ACHIEVEMENT CALCULATION                                      │
│     └─ Formula: (reported / target) × 100                        │
│        Example: 2 / 5 = 40% ✅                                   │
│                                                                   │
│  6. STATUS DETERMINATION                                         │
│     └─ If achievement ≥100% → MET                                │
│        If achievement 70-99% → ON_TRACK                          │
│        If achievement 1-69% → PARTIAL                            │
│        If achievement 0% → NOT_STARTED                           │
│        (40% → PARTIAL) ✅                                         │
│                                                                   │
│  7. ENRICHMENT                                                   │
│     └─ Add kraTitle, kpiTitle from strategic plan ✅            │
│        Add confidence score from type detection ✅               │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│            ACTIVITY OBJECT (Enhanced)                            │
│                                                                   │
│  {                                                                │
│    name: "Faculty training conducted",                           │
│    kraId: "KRA 13",                    ◄── From Type Detection   │
│    kraTitle: "Human Resources Dev",    ◄── From Strategic Plan   │
│    initiativeId: "KRA13-KPI2",         ◄── From KPI Selection    │
│    kpiTitle: "Enhance Staff Competency", ◄── From Strat. Plan    │
│    reported: 2,                        ◄── From QPRO             │
│    target: 5,                          ◄── From Strategic Plan   │
│    achievement: 40,                    ◄── CALCULATED: 2/5*100   │
│    status: "PARTIAL",                  ◄── AUTO: 40% = PARTIAL   │
│    confidence: 0.87,                   ◄── Type + Semantic Blend │
│    timestamp: "2025-01-15T08:30Z"      ◄── From QPRO             │
│  }                                                                 │
│                                                                   │
│  Result: Activity with FULL KPI context ✅                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│         STORAGE: QPROAnalysis.activities (JSON)                  │
│                                                                   │
│  [                                                                │
│    {...activity1 with kraId, kpiId, target, achievement...},   │
│    {...activity2 with kraId, kpiId, target, achievement...},   │
│    {...activity3 with kraId, kpiId, target, achievement...}    │
│  ]                                                                │
│                                                                   │
│  Result: All activities stored with KPI-level data ✅            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│        API RESPONSE: /qpro/analyses/[id]                         │
│                                                                   │
│  GET /api/qpro/analyses/123                                      │
│  ↓                                                                │
│  Response: organizeActivitiesByKRA()                             │
│                                                                   │
│  Groups activities by composite key: kraId|kpiId                │
│  ↓                                                                │
│  Aggregates per KPI:                                             │
│  - totalTarget = SUM(activity targets)                           │
│  - totalReported = SUM(activity reported)                        │
│  - completionPercentage = (totalReported/totalTarget) × 100     │
│  - status = MET|ON_TRACK|PARTIAL|NOT_STARTED                    │
│                                                                   │
│  {                                                                │
│    organizedActivities: [                                        │
│      {                                                            │
│        kraId: "KRA 13",                                          │
│        kraTitle: "Human Resources Development",                  │
│        kpiId: "KRA13-KPI2",                 ◄── KPI LEVEL ✅     │
│        kpiTitle: "Enhance Staff Competency",                     │
│        activities: [                                             │
│          {title, target, reported, achievement, status, ...}    │
│        ],                                                         │
│        totalTarget: 5,                      ◄── AGGREGATED      │
│        totalReported: 2,                                         │
│        completionPercentage: 40,            ◄── CALCULATED      │
│        status: "PARTIAL"                    ◄── AUTO-DETERMINED │
│      },                                                           │
│      {...more KPI groups...}                                    │
│    ]                                                              │
│  }                                                                │
│                                                                   │
│  Result: KPI-level metrics ready for dashboard ✅                │
└─────────────────────────────────────────────────────────────────┘
```

## Data Enrichment Flow

```
QPRO Document
  │
  ├─ Activity Name: "Faculty training conducted"
  │   Reported: 2
  │
  └─ Pass 1 Extraction (Cached)
      │
      └─ Pass 2 Classification
          │
          ├─ Type Detection
          │   │
          │   Keywords found: train, training, workshop
          │   Semantic score: 0.85
          │   Type: "training" ✅
          │
          ├─ KRA Mapping
          │   │
          │   training type → KRA 13 (HR Development)
          │   Expected: [KRA 13, KRA 11] ✅
          │
          ├─ KPI Selection (Semantic Match)
          │   │
          │   Look in KRA 13 initiatives:
          │   - KRA13-KPI1: Train technical staff → score 0.72
          │   - KRA13-KPI2: Enhance competency in tech → score 0.92 ✅ BEST
          │   - KRA13-KPI3: Build organizational capacity → score 0.68
          │   │
          │   Selected: KRA13-KPI2 ✅
          │
          ├─ Target Lookup
          │   │
          │   KPI: KRA13-KPI2
          │   Timeline data:
          │     2025: 5 trainings
          │     2026: 7 trainings
          │   │
          │   Selected for 2025: 5 ✅
          │
          ├─ Achievement Calculation
          │   │
          │   Reported: 2
          │   Target: 5
          │   Achievement: 2/5 = 0.4 = 40% ✅
          │
          └─ Status Determination
              │
              Achievement: 40%
              ├─ ≥100%? NO
              ├─ 70-99%? NO
              ├─ 1-69%? YES → PARTIAL ✅
              
Result Activity Object:
  {
    name: "Faculty training conducted",
    kraId: "KRA 13",
    kraTitle: "Human Resources Development",
    initiativeId: "KRA13-KPI2",
    kpiTitle: "Enhance Staff Competency in Emerging Technologies",
    reported: 2,
    target: 5,
    achievement: 40,
    status: "PARTIAL",
    confidence: 0.87
  }
```

## Status Determination Logic

```
Achievement % → Status Decision

100% or more
  │
  ├─ Reported ≥ Target
  │
  └─ Status = "MET" ✅ (Target achieved)
     Color: GREEN

70% to 99%
  │
  ├─ Good progress toward target
  │
  └─ Status = "ON_TRACK" ◐ (On course)
     Color: YELLOW

1% to 69%
  │
  ├─ Some progress but below target
  │
  └─ Status = "PARTIAL" ◑ (Some progress)
     Color: ORANGE

0%
  │
  ├─ No activities reported
  │
  └─ Status = "NOT_STARTED" ✗ (No progress)
     Color: RED

Example Scenarios:
─────────────────

Scenario 1: 2 trainings, target 5
  Achievement: 2/5 = 40%
  Status: PARTIAL ◑

Scenario 2: 5 trainings, target 5
  Achievement: 5/5 = 100%
  Status: MET ✅

Scenario 3: 8 trainings, target 5
  Achievement: 8/5 = 160%
  Status: MET ✅

Scenario 4: 4 trainings, target 5
  Achievement: 4/5 = 80%
  Status: ON_TRACK ◐

Scenario 5: 0 trainings, target 5
  Achievement: 0/5 = 0%
  Status: NOT_STARTED ✗
```

## KPI Grouping Aggregation

```
Activities for KRA13-KPI2:

Activity 1: "Faculty training"
  reported: 2, target: 5

Activity 2: "Staff certification"
  reported: 1, target: 1

Activity 3: "Tech bootcamp"
  reported: 1, target: 2

Aggregation:
─────────────
totalTarget = 5 + 1 + 2 = 8
totalReported = 2 + 1 + 1 = 4
completionPercentage = 4/8 = 50%

Result Group:
{
  kpiId: "KRA13-KPI2",
  kpiTitle: "Enhance Staff Competency",
  activities: [Activity 1, Activity 2, Activity 3],
  totalTarget: 8,
  totalReported: 4,
  completionPercentage: 50,
  status: "PARTIAL"
}

Display on Dashboard:
KRA 13 > KPI 2: Enhance Staff Competency
├─ Target: 8
├─ Reported: 4
├─ Completion: 50% (4/8) ◑
└─ Activities:
   ├─ Faculty training (2/5)
   ├─ Staff certification (1/1) ✅
   └─ Tech bootcamp (1/2)
```

## Confidence Score Calculation

```
Confidence = Type Detection Confidence + Semantic Match Confidence

Max: 0.95 (very confident)
Min: 0.55 (less confident but valid)
Range: [0.55, 0.95]

Example Calculation:
───────────────────

Activity: "Faculty training conducted"

Type Detection Confidence:
  Keyword matches: train, training, workshop, seminar
  Scoring: High matches = 0.85
  Capped at 0.5: min(0.85/2, 0.5) = 0.425
  → Type Confidence = 0.42 (contribution)

Semantic Match Confidence:
  KRA 13 text about HR development
  Activity text about training
  Similarity: 0.92
  Capped at 0.5: min(0.92/10, 0.5) = 0.092
  → Semantic Confidence = 0.46 (contribution)

Combined:
  Total = 0.42 + 0.46 = 0.88
  Adjusted: min(0.95, max(0.55, 0.88)) = 0.88
  Final Confidence: 0.88 (88% confident)

Interpretation:
  0.88 = 88% certain this is the correct KPI
  Good confidence, can trust the assignment ✅
```

## Year-Specific Target Selection

```
Strategic Plan Structure:

KRA 13 (Human Resources Development)
  └─ Initiative: KRA13-KPI2
     └─ Targets (timeline_data):
        ├─ Year 2025
        │  └─ target_value: 5
        │
        ├─ Year 2026
        │  └─ target_value: 7
        │
        └─ Year 2027
           └─ target_value: 10

Target Selection Logic:
─────────────────────

When classifying a 2025 QPRO:
  1. Identify KPI: KRA13-KPI2 ✅
  2. Look in KRA13-KPI2 targets
  3. Find year === 2025
  4. Extract target_value: 5 ✅
  5. Use 5 for achievement calculation

Result:
  Activity reported: 2
  Target (from 2025): 5
  Achievement: 2/5 = 40%

Future (2026 QPRO):
  Year: 2026
  Target: 7 (different!)
  Same activity reported 2: 2/7 = 29%
  (Lower because target is higher)
```

## Dashboard Integration Example

```
Current Display (KRA-only):
────────────────────────────

┌─ KRA 13: Human Resources Development
│  ├─ 3 activities
│  ├─ Status: Reported
│  └─ (no quantitative target information)

Next Display (KPI-level):
────────────────────────

┌─ KRA 13: Human Resources Development
│  │
│  ├─ KPI 1: Improve Faculty Skills
│  │  ├─ Target: 10 | Reported: 8 | Completion: 80% ◐
│  │  ├─ Activities:
│  │  │  ├─ Faculty development program
│  │  │  ├─ International collaboration
│  │  │  └─ Certification programs
│  │  └─ Status: ON_TRACK
│  │
│  ├─ KPI 2: Enhance Competency in Tech
│  │  ├─ Target: 5 | Reported: 2 | Completion: 40% ◑
│  │  ├─ Activities:
│  │  │  ├─ Digital skills training
│  │  │  └─ Tech bootcamp
│  │  └─ Status: PARTIAL
│  │
│  └─ KPI 3: Build Organizational Capacity
│     ├─ Target: 12 | Reported: 12 | Completion: 100% ✅
│     ├─ Activities:
│     │  ├─ Orientation programs
│     │  ├─ Leadership training
│     │  └─ Team building
│     └─ Status: MET

Overall KRA 13: 27/27 activities = 100% achieved ✅
```

---

This architecture ensures:
✅ Automatic KPI assignment (no manual classification)
✅ Year-specific targets (supports 2025, 2026, etc.)
✅ Achievement auto-calculated (no formula entry needed)
✅ Status auto-determined (MET/ON_TRACK/PARTIAL/NOT_STARTED)
✅ Confidence scoring (know how reliable each assignment is)
✅ KPI-level aggregation (see total progress per KPI)
