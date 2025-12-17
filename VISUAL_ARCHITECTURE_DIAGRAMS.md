# QPRO System Fix Plan - Visual Architecture & Diagrams

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER UPLOADS DOCUMENT                          │
│                      (PDF/DOCX with 3+ Reports)                         │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │   TEXT EXTRACTION (Existing)           │
        │   ├─ PDF → text (pdf2json)            │
        │   └─ DOCX → text (mammoth)            │
        └────────────────┬───────────────────────┘
                         │
                         ▼
      ┌──────────────────────────────────────────────┐
      │ [1] DOCUMENT SECTION DETECTOR (NEW)         │
      │ ├─ Input: Raw text                         │
      │ ├─ Process:                                │
      │ │  ├─ Scan for section headers             │
      │ │  ├─ Match against QPRO_DOCUMENT_FORMATS  │
      │ │  └─ Extract boundaries (pages/lines)     │
      │ └─ Output:                                 │
      │    ├─ Section type (ALUMNI, RESEARCH, etc) │
      │    ├─ Content boundaries                   │
      │    └─ Confidence score                     │
      └────────────┬─────────────────────────────────┘
                   │
        ┌──────────┴──────────────────────────────────────┐
        │                                                 │
        ▼                                                 ▼
    SECTION 1:                                       SECTION 2:
    ALUMNI                                           RESEARCH
    EMPLOYMENT                                       PROJECTS
        │                                                │
        ▼                                                ▼
    [2] SUMMARY EXTRACTOR (NEW)                    [2] SUMMARY EXTRACTOR (NEW)
    ├─ Find: "Employment Rate: 16.36%"             ├─ Find: "Total Papers: 4"
    └─ Extract: {"employment_rate": 16.36}         └─ Extract: {"paper_count": 4}
        │                                                │
        └──────────────┬───────────────────────────────┘
                       │
                       ▼ (+ SECTION 3: TRAINING)
    ┌──────────────────────────────────────────────────────┐
    │  MERGED SECTION DATA + SUMMARIES                    │
    ├─ Alumni: [employment_rate: 16.36%, 31.69%]         │
    ├─ Research: [4 papers found]                        │
    └─ Training: [total_attendees: 9, 30 rows]           │
    └──────────────────────────────────────────────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────────────────────┐
    │  [3] STRATEGIC CONTEXT RETRIEVAL (Existing)         │
    │  ├─ Get top 15 KRAs from vector search              │
    │  └─ Prepare Strategic Plan context                  │
    └───────────────────┬──────────────────────────────────┘
                        │
                        ▼
    ┌──────────────────────────────────────────────────────────────────┐
    │  [4] ENHANCED LLM ANALYSIS (UPDATED PROMPT)                      │
    │                                                                  │
    │  Input to GPT-4o-mini:                                          │
    │  ├─ Strategic Plan context (KRAs, initiatives, strategies)      │
    │  ├─ Raw document text                                           │
    │  ├─ Detected sections metadata (NEW)                            │
    │  ├─ Extracted summaries (NEW)                                   │
    │  └─ Enhanced extraction instructions:                           │
    │     ├─ "Extract EVERY training row separately"                  │
    │     ├─ "Use summary metrics, not row counts"                    │
    │     └─ "Map activities to KRAs using rules"                     │
    │                                                                  │
    │  Process:                                                       │
    │  ├─ For each section:                                          │
    │  │  ├─ Identify activity type                                  │
    │  │  ├─ Extract all activities (no sampling)                    │
    │  │  ├─ Use summary as reported value if available              │
    │  │  └─ Match to Strategic Plan KRAs                            │
    │  └─ Output: JSON with all activities + metadata                │
    │                                                                  │
    │  Output:                                                        │
    │  {                                                              │
    │    "activities": [                                              │
    │      { name: "BS CS Employment", reported: 16.36, kraId: "KRA 10" },  │
    │      { name: "BS Info Tech Employment", reported: 31.69, kraId: "KRA 10" },  │
    │      { name: "IT Infrastructure Analysis", reported: 1, kraId: "KRA 3" },  │
    │      { name: "Bawal Bastos App", reported: 1, kraId: "KRA 3" },  │
    │      { name: "Training Session 1", reported: 1, kraId: "KRA 11" },  │
    │      ... (30 more training activities)                          │
    │    ],                                                            │
    │    "extractionMetadata": {                                       │
    │      "sectionsDetected": ["ALUMNI_EMPLOYMENT", "RESEARCH_OUTPUT", "TRAINING_RECORDS"],  │
    │      "summariesFound": [                                         │
    │        { metric: "total_attendees", value: 9 }                  │
    │      ]                                                           │
    │    }                                                             │
    │  }                                                               │
    └───────────────────┬──────────────────────────────────────────────┘
                        │
                        ▼
    ┌──────────────────────────────────────────────────────┐
    │  [5] ACTIVITY VALIDATION & CLASSIFICATION (UPDATED)  │
    │                                                      │
    │  For each activity:                                 │
    │  ├─ Validate KRA assignment using:                  │
    │  │  ├─ Strategy matching (highest priority)        │
    │  │  ├─ Type-based rules (KRA mapping)              │
    │  │  └─ Semantic similarity (fallback)              │
    │  │                                                  │
    │  ├─ Activity Type → KRA Rules:                      │
    │  │  ├─ Alumni/Employment → KRA 10 (confidence 0.95) │
    │  │  ├─ Research/Papers → KRA 3/4/5 (conf 0.95)    │
    │  │  ├─ Training → KRA 11/13 (confidence 0.90)      │
    │  │  ├─ Digital Systems → KRA 17 (conf 0.90)        │
    │  │  └─ Health/Wellness → KRA 13 (conf 0.95)        │
    │  │                                                  │
    │  └─ Output: Activities with validated KRAs         │
    │     └─ Includes classification reason & confidence  │
    └───────────────────┬──────────────────────────────────┘
                        │
                        ▼
    ┌──────────────────────────────────────────────────────┐
    │  [6] TARGET AGGREGATION & CALCULATION (Existing)     │
    │                                                      │
    │  For each activity:                                 │
    │  ├─ Get reported value (from summary OR row count)  │
    │  ├─ Get target from Strategic Plan timeline_data    │
    │  ├─ Calculate achievement%: (reported/target)*100   │
    │  └─ Determine status: MET | MISSED | ON_TRACK       │
    │                                                      │
    │  Example:                                           │
    │  ├─ Activity: "Training Records"                    │
    │  ├─ Reported: 9 (from summary)                      │
    │  ├─ Target: 80                                      │
    │  ├─ Achievement: 11.25%                             │
    │  └─ Status: MISSED                                  │
    └───────────────────┬──────────────────────────────────┘
                        │
                        ▼
    ┌──────────────────────────────────────────────────────┐
    │  DATABASE STORAGE                                    │
    │  ├─ qpro_analyses table                             │
    │  │  ├─ id, title, analysis_output (JSON)            │
    │  │  └─ extraction_metadata (NEW)                    │
    │  │                                                  │
    │  ├─ kra_aggregations table                          │
    │  │  ├─ Per-KRA metrics (reported, target, achieved) │
    │  │  └─ Status per KRA                               │
    │  │                                                  │
    │  └─ aggregation_activities table                    │
    │     └─ Individual activities linked to KRAs         │
    └───────────────────┬──────────────────────────────────┘
                        │
                        ▼
    ┌──────────────────────────────────────────────────────┐
    │  DASHBOARD DISPLAY (UPDATED)                         │
    │                                                      │
    │  ┌─────────────────────────────────────────────┐   │
    │  │ ALUMNI EMPLOYMENT SECTION                   │   │
    │  ├─────────────────────────────────────────────┤   │
    │  │ BS Computer Science: 16.36%                 │   │
    │  │ BS Info Tech: 31.69%                        │   │
    │  └─────────────────────────────────────────────┘   │
    │                                                      │
    │  ┌─────────────────────────────────────────────┐   │
    │  │ RESEARCH PROJECTS SECTION                   │   │
    │  ├─────────────────────────────────────────────┤   │
    │  │ ✓ IT Infrastructure Analysis (KRA 3)        │   │
    │  │ ✓ Bawal Bastos App (KRA 3)                 │   │
    │  │ ✓ [2 more papers]                          │   │
    │  └─────────────────────────────────────────────┘   │
    │                                                      │
    │  ┌─────────────────────────────────────────────┐   │
    │  │ TRAINING RECORDS SECTION                    │   │
    │  ├─────────────────────────────────────────────┤   │
    │  │ Total Attendees: 9 (from summary)           │   │
    │  │ Activities Extracted: 30 (from rows)        │   │
    │  │ Achievement: 11.25% (9/80)                  │   │
    │  │                                              │   │
    │  │ Individual Sessions:                         │   │
    │  │ ✓ Introduction to AI - John Doe (KRA 11)   │   │
    │  │ ✓ Data Privacy - Jane Smith (KRA 13)       │   │
    │  │ ✓ ... (28 more individual trainings)       │   │
    │  └─────────────────────────────────────────────┘   │
    │                                                      │
    │  ┌─────────────────────────────────────────────┐   │
    │  │ OVERALL METRICS                             │   │
    │  ├─────────────────────────────────────────────┤   │
    │  │ Total Activities: 36+                        │   │
    │  │ Alumni KRAs: Visible ✓                      │   │
    │  │ Research KRAs: Visible ✓                    │   │
    │  │ HR/Dev KRAs: 30+ activities shown ✓         │   │
    │  │ Achievement: Accurate across all sections   │   │
    │  └─────────────────────────────────────────────┘   │
    └──────────────────────────────────────────────────────┘
```

---

## Data Flow Comparison: Before vs After

### BEFORE (Broken)

```
Input Document (3 Reports)
    │
    └─→ Text Extraction
         │
         └─→ LLM Analysis (No Section Context)
              │
              ├─→ Alumni Section: NOT RECOGNIZED ❌
              │
              ├─→ Research Section: NOT RECOGNIZED ❌
              │
              └─→ Training Section: Detected (partially)
                   │
                   ├─ Extract rows: 6 items (30+ in document) ❌
                   ├─ Count rows: 6
                   ├─ Target from Strategic Plan: 80
                   ├─ Achievement: 6/80 = 7.5% ❌ WRONG
                   │
                   └─→ Database
                        │
                        └─→ Dashboard: Shows 7.5% MISSED (incorrect)
```

### AFTER (Fixed)

```
Input Document (3 Reports)
    │
    └─→ Text Extraction
         │
         ├─→ [1] Section Detector
         │    ├─ Alumni Section: DETECTED ✓
         │    ├─ Research Section: DETECTED ✓
         │    └─ Training Section: DETECTED ✓
         │
         ├─→ [2] Summary Extractor (per section)
         │    ├─ Alumni: [employment_rate: 16.36%, 31.69%]
         │    ├─ Research: [paper_count: 4]
         │    └─ Training: [total_attendees: 9]
         │
         └─→ [3] Enhanced LLM Analysis (with section context)
              │
              ├─→ Alumni Employment: 2 activities extracted ✓
              │    └─ KRA 10 (confidence: 0.95)
              │
              ├─→ Research Projects: 4 activities extracted ✓
              │    └─ KRA 3/4/5 (confidence: 0.95)
              │
              └─→ Training Records: 30+ activities extracted ✓
                   │
                   ├─ All 30 individual trainings kept
                   ├─ Summary used: "Total Attendees: 9"
                   ├─ Target from Strategic Plan: 80
                   ├─ Achievement: 9/80 = 11.25% ✓ CORRECT
                   │
                   └─→ [4] Classification (rule-based)
                        ├─ All training → KRA 11/13 ✓
                        ├─ No training in KRA 17 ✓
                        └─ Confidence scores visible
                             │
                             └─→ Database
                                  │
                                  └─→ Dashboard:
                                       ├─ Alumni section visible
                                       ├─ Research section visible
                                       ├─ Training: 30+ activities, 11.25% achievement
                                       ├─ All metrics accurate
                                       └─ Sections properly separated
```

---

## KRA Classification Logic Flow

```
Activity: "Introduction to AI, ML and DP"

     ↓

[STEP 1: STRATEGY MATCHING]
Is this activity mentioned in KRA strategies?
├─ KRA 11 strategies: "Professional development for faculty"
│  └─ MATCH: "Training in modern tech contributes to prof dev" ✓
├─ KRA 13 strategies: "HR focus on wellness, engagement, health"
│  └─ NO MATCH (this is technical, not wellness) ✗
├─ KRA 17 strategies: "Digital infrastructure implementation"
│  └─ NO MATCH (this is training, not implementation) ✗
└─ Winner: KRA 11 (confidence: 0.95)

     ↓

[STEP 2: TYPE-BASED VALIDATION]
Activity type detected: TRAINING

Classification rules:
├─ Training → KRA 11 or KRA 13 (HR Development) ✓
├─ Training → NOT KRA 17 (Digital) ✗
└─ Confirmed: KRA 11 is correct

     ↓

[STEP 3: CONFIDENCE SCORING]
- Strategy match: +0.95
- Type alignment: Confirmed
- KPI validation: Faculty development KPI includes "technical training"
- Final confidence: 0.95 ✓

     ↓

[OUTPUT]
{
  "name": "Introduction to AI, ML and DP",
  "kraId": "KRA 11",
  "confidence": 0.95,
  "classificationReason": "Direct match to KRA 11 strategy 'Professional Development'; Type confirmed as Training/Workshop",
  "reported": 1,
  "target": 10,
  "achievement": 10%,
  "status": "MISSED"
}
```

---

## Multi-Report Processing Workflow

```
┌─ DOCUMENT WITH 3 REPORTS ─────────────────────────────────┐
│                                                            │
│  Page 1-2:  Alumni Employment Report                      │
│             └─ Table: Program | Employment Rate | Count   │
│                ├─ BS CS: 16.36%                          │
│                └─ BS Info Tech: 31.69%                   │
│                                                            │
│  Page 3-4:  Research Projects Completed                   │
│             └─ List:                                      │
│                ├─ IT Infrastructure Analysis              │
│                ├─ Bawal Bastos App                        │
│                ├─ [2 more papers]                         │
│                                                            │
│  Page 5-7:  Training & Development Records                │
│             └─ Summary: Total No. of Attendees: 9        │
│             └─ Table: Training Title | Attendee | Date    │
│                ├─ Introduction to AI - John Doe - Jan     │
│                ├─ Data Privacy - Jane Smith - Jan         │
│                ├─ ... (27 more rows)                      │
│                                                            │
└────────────────────────────────────────────────────────────┘

                         │
                         ▼

            [SECTION DETECTION & PARSING]

    ┌─ SECTION 1 ─────────────────────────┐
    │ Type: ALUMNI_EMPLOYMENT             │
    │ Pages: 1-2                          │
    │ Summary Found: 2 programs           │
    │ Activities to Extract: 2            │
    └─────────────────────────────────────┘

    ┌─ SECTION 2 ─────────────────────────┐
    │ Type: RESEARCH_OUTPUT               │
    │ Pages: 3-4                          │
    │ Summary Found: 4 papers             │
    │ Activities to Extract: 4            │
    └─────────────────────────────────────┘

    ┌─ SECTION 3 ─────────────────────────┐
    │ Type: TRAINING_RECORDS              │
    │ Pages: 5-7                          │
    │ Summary Found: 9 attendees          │
    │ Activities to Extract: 30 (rows)    │
    └─────────────────────────────────────┘

                         │
                         ▼

        [EXTRACT ACTIVITIES PER SECTION]

    Section 1 Activities:
    ├─ { name: "BS CS Employment", value: 16.36, unit: "%", kraId: "KRA 10" }
    └─ { name: "BS IT Employment", value: 31.69, unit: "%", kraId: "KRA 10" }

    Section 2 Activities:
    ├─ { name: "IT Infrastructure Analysis", kraId: "KRA 3" }
    ├─ { name: "Bawal Bastos App", kraId: "KRA 3" }
    └─ { name: "...", kraId: "KRA 3/4/5" }

    Section 3 Activities:
    ├─ { name: "Intro to AI - John Doe", reported: 1, kraId: "KRA 11" }
    ├─ { name: "Data Privacy - Jane Smith", reported: 1, kraId: "KRA 13" }
    ├─ { ... 28 more individual activities ... }
    └─ { name: "Training Summary", reported: 9, source: "summary", kraId: "KRA 11/13" }

                         │
                         ▼

        [AGGREGATE BY KRA FOR DASHBOARD]

    KRA 10 (Student Success - Alumni):
    ├─ Achievement: Mixed (16.36% + 31.69%)
    └─ Status: Varies by program

    KRA 3/4/5 (Research):
    ├─ Reported: 4 research papers
    ├─ Target: 2 (from Strategic Plan)
    ├─ Achievement: 200%
    └─ Status: MET

    KRA 11/13 (HR Development):
    ├─ Reported: 30 activities (or 9 from summary)
    ├─ Target: 80
    ├─ Achievement: 37.5% (or 11.25%)
    └─ Status: MISSED

                         │
                         ▼

    [DASHBOARD DISPLAY - SECTIONS VISIBLE]
    
    Alumni Section: Shows employment data
    Research Section: Shows 4 papers
    Training Section: Shows 30+ individual trainings + 11.25% achievement
```

---

## Implementation Timeline Visualization

```
Week 1-2: CRITICAL PATH (Tier 1-2)
──────────────────────────────────
│
├─ Day 1-2: Create DocumentSectionDetector
│           ├─ File: lib/services/document-section-detector.ts
│           ├─ Config: lib/config/document-formats.ts
│           └─ Tests: __tests__/document-section-detector.test.ts
│
├─ Day 3-4: Create SummaryExtractor
│           ├─ File: lib/services/summary-extractor.ts
│           └─ Tests: __tests__/summary-extractor.test.ts
│
├─ Day 5-6: Update LLM Prompt & Processing
│           ├─ File: lib/services/analysis-engine-service.ts
│           ├─ Integrate section detection
│           ├─ Integrate summary extraction
│           └─ Update prompt template
│
├─ Day 7-8: Update Classification Logic
│           ├─ File: lib/services/qpro-analysis-service.ts
│           └─ Integrate new classification rules
│
└─ Day 9-10: Phase 1 Testing
             ├─ Unit tests passing
             ├─ Integration test with 3-report doc
             └─ Verify: All sections detected, 30+ trainings extracted

Result: ✅ Problems #1, #2, #3 FIXED

──────────────────────────────────────────────────────────────

Week 3-4: TIER 3 IMPLEMENTATION
────────────────────────────────
│
├─ Day 1-3: Create Activity-KRA Mapping Rules
│           ├─ File: lib/config/activity-kra-mapping.ts
│           └─ Tests: Update existing test suite
│
├─ Day 4-7: Enhance Classification Logic
│           ├─ File: lib/services/qpro-analysis-service.ts
│           ├─ Implement classification confidence
│           ├─ Add reasoning/explanations
│           └─ Classification validation tests
│
└─ Day 8-10: Phase 2 Testing
              ├─ Classification accuracy 95%+
              ├─ Confidence scores visible
              ├─ No trainings in wrong KRAs
              └─ Reasoning logged for each activity

Result: ✅ Problem #4 FIXED

──────────────────────────────────────────────────────────────

Week 5: VALIDATION & ROLLOUT
─────────────────────────────
│
├─ Day 1-3: Integration Testing
│           ├─ End-to-end with real documents
│           ├─ Edge case testing
│           └─ Dashboard accuracy verification
│
├─ Day 4: Staging Deployment
│         ├─ Deploy to staging environment
│         ├─ Manual testing
│         └─ Stakeholder review
│
└─ Day 5: Production Deployment
          ├─ Deploy to production
          ├─ Monitor for issues
          └─ Feature enabled for all users

Result: ✅ ALL PROBLEMS FIXED IN PRODUCTION

Legend:
───── = Week
│     = Day
├─    = Task
```

---

## Success Metrics Dashboard

```
╔════════════════════════════════════════════════════════════════╗
║              BEFORE IMPLEMENTATION (Current)                   ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Problem 1: Missing Sections                                  ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ Alumni Employment:     NOT DETECTED ❌                   │  ║
║  │ Research Projects:     NOT DETECTED ❌                   │  ║
║  │ Training Records:      PARTIAL ⚠️                        │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  Problem 2: Incomplete Extraction                             ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ Training Activities Extracted:    6 / 30+               │  ║
║  │ Extraction Rate:                  20% ❌                │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  Problem 3: Wrong Metrics                                     ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ Reported Value:       6 (row count, not summary)        │  ║
║  │ Target Value:         80                                │  ║
║  │ Achievement:          7.5% ❌ WRONG                      │  ║
║  │ Correct Achievement:  11.25% (using summary: 9)         │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  Problem 4: Classification Issues                             ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ Consistent KRA Assignment:  NO ❌                        │  ║
║  │ Training in Correct KRA:    Inconsistent ⚠️             │  ║
║  │ Classification Confidence:  Not visible                 │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  OVERALL SYSTEM STATUS:  🔴 BROKEN                            ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

                            ⬇⬇⬇ IMPLEMENTATION ⬇⬇⬇

╔════════════════════════════════════════════════════════════════╗
║              AFTER IMPLEMENTATION (Target)                     ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Problem 1: Missing Sections                                  ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ Alumni Employment:     DETECTED ✅ (Confidence: 0.95)   │  ║
║  │ Research Projects:     DETECTED ✅ (Confidence: 0.95)   │  ║
║  │ Training Records:      DETECTED ✅ (Confidence: 0.98)   │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  Problem 2: Incomplete Extraction                             ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ Training Activities Extracted:    30+ / 30+             │  ║
║  │ Extraction Rate:                  100% ✅               │  ║
║  │ Individual trainings preserved                          │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  Problem 3: Correct Metrics                                   ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ Reported Value:       9 (from summary: "Total: 9")      │  ║
║  │ Target Value:         80                                │  ║
║  │ Achievement:          11.25% ✅ CORRECT                 │  ║
║  │ Source Logged:        Summary section                   │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  Problem 4: Classification Consistency                        ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ Consistent KRA Assignment:  YES ✅ (95%+)               │  ║
║  │ Training in Correct KRA:    100% ✅ (KRA 11/13 only)    │  ║
║  │ Classification Confidence:  VISIBLE ✅ (0.90-0.95)      │  ║
║  │ Classification Reason:      LOGGED ✅ (per activity)    │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  Dashboard Accuracy                                           ║
║  ┌─────────────────────────────────────────────────────────┐  ║
║  │ Alumni Section:        VISIBLE ✅                        │  ║
║  │ Research Section:      VISIBLE ✅                        │  ║
║  │ Training Section:      VISIBLE ✅ (30+ activities)       │  ║
║  │ All Metrics:           ACCURATE ✅                       │  ║
║  │ Data Source:           TRANSPARENT ✅                    │  ║
║  └─────────────────────────────────────────────────────────┘  ║
║                                                                ║
║  OVERALL SYSTEM STATUS:  🟢 FIXED & WORKING                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Risk Matrix

```
┌─────────────────────────────────────────────────────────────┐
│           RISK ASSESSMENT MATRIX                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Y                                                           │
│  I      HIGH RISK              CRITICAL RISK                │
│  M      (Monitor)              (Address Now)                │
│  P  2   •                      • LLM context overflow       │
│  A      • JSON parse error       (large tables)            │
│  C      • Misclassified         • Schema mismatch          │
│  T        activities (few)                                  │
│          • Format variations                                │
│    1   MEDIUM RISK            MEDIUM-HIGH RISK             │
│        (Low Priority)         (Plan Mitigation)             │
│        • Target mismatches     • UI breaking changes        │
│        • Edge cases            • Dashboard performance      │
│        • Rarely used formats                                │
│        • Missing patterns                                   │
│          ┴─────────────┴──────────────┴───────────┘        │
│           LOW              MEDIUM             HIGH           │
│              PROBABILITY OF OCCURRENCE                       │
│                                                              │
│  Mitigation Strategies:                                     │
│  ✓ Chunk large tables before LLM                           │
│  ✓ Add JSON validation + fallback parsing                  │
│  ✓ Feature flag for gradual rollout                        │
│  ✓ Comprehensive testing coverage                          │
│  ✓ Manual review option for low-confidence matches         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

This completes the comprehensive visual architecture and implementation planning for the QPRO system fix.
