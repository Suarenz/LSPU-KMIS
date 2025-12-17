# Comprehensive QPRO Document Processing & KRA Classification Fix Plan

**Issue Date**: December 8, 2025  
**Severity**: Critical  
**Impact**: Affects all 22 KRAs - Data extraction, classification, aggregation, and dashboard accuracy

---

## Executive Summary

The QPRO analysis system has **four interconnected failures** that prevent accurate processing of multi-report documents:

1. **Incomplete Text Extraction** - Tables/structured data not fully extracted from documents
2. **Missing Report Type Recognition** - System doesn't identify Alumni, Research, Health sections
3. **Selective Activity Parsing** - Only 5-6 items extracted when 30+ exist in document
4. **Hard-coded Target Mismatches** - System uses incorrect target values instead of extracting summaries

**Root Cause**: The LLM prompt assumes documents contain narrative descriptions with explicit counts, but real QPRO documents contain:
- Structured tables (training attendees, research papers, employment data)
- Summary sections with aggregate metrics
- Mixed formats (Alumni data on page 1, Research on page 3, Training on pages 4-6)

---

## Problem Analysis

### Problem 1: Completely Missing Sections

**What's Happening**:
- Alumni Employment report on Page 1 not recognized
- Research Projects list on Page 3 completely missing
- System only detects Training seminars (partial)

**Why It Happens**:
- Prompt doesn't include instructions for "Alumni Employment" or "Completed Research" document types
- Text extraction from PDF/DOCX works but sections aren't categorized/labeled
- No pre-processing step to identify document sections before LLM analysis

**Impact on KRAs**:
- Alumni employment data (should map to "Student Success" metrics, possibly KRA 10-12) → 0% detection
- Research outputs (should map to KRA 3, 4, 5) → 0% detection
- Training detected but incomplete

### Problem 2: Incomplete Data Extraction (Sampling Issue)

**What's Happening**:
- PDF has 30+ training entries (rows)
- Dashboard shows only 5-6 items
- Example missing: "Cybersecurity Proficiency Upskilling", "Info-Session: Learn ChatGPT"

**Why It Happens**:
- LLM prompt says "extract EVERY row" but doesn't enforce it in output validation
- No de-duplication of training sessions (same training attended by multiple people)
- LLM may be grouping similar trainings (e.g., all "Introduction to AI" entries as one activity)
- Token/context limits may cause truncation for large tables

**Impact on Metrics**:
```
Expected: 30 training entries
Actual: 6 entries
Achievement: 6/80 = 7.5% (SEVERELY MISSED)
Correct: 30/80 = 37.5% (closer to actual)
```

### Problem 3: Target vs. Actual Logic Errors

**What's Happening**:
- Dashboard shows Target = 80 (hard-coded from Strategic Plan)
- PDF explicitly states "Total No. of Attendees: 9"
- System counts extracted rows (6), sees 6 < 80, marks as MISSED with 7.5% achievement

**Why It Happens**:
- Prompt says: "Do NOT count QPRO entries as target. Target comes from Strategic Plan."
- BUT system doesn't extract summary sections from PDF (e.g., "Total No. of Attendees: 9")
- Missing summary extraction means wrong calculation
- Prompt assumes Strategic Plan targets are always correct, but they need validation against actual document summaries

**Impact on Metrics**:
```
Wrong Logic:
- Reported = 6 (counted extracted rows, not actual attendees)
- Target = 80 (from Strategic Plan)
- Achievement = 6/80 = 7.5% ❌ WRONG

Correct Logic (if summary extracted):
- Reported = 9 (from "Total No. of Attendees: 9")
- Target = 80 (from Strategic Plan)
- Achievement = 9/80 = 11.25% (still MISSED but accurate)
```

### Problem 4: Classification Confusion

**What's Happening**:
- "Introduction to AI, ML and DP" → KRA 13 (Human Resources)
- "Introduction to Low-Code with Google" → KRA 17 (Digital Transformation)
- Both are technical trainings but split arbitrarily

**Why It Happens**:
- Classification logic checks activity type (is_training = true)
- Maps training → KRA 11 or KRA 13 (HR development KRAs)
- But KRA 17 also accepts training if keywords match "digital"
- No priority ordering when multiple KRAs match

**Impact on Dashboard**:
- Same types of activities spread across different KRAs
- Can't track "Faculty Technical Upskilling" as unified metric
- Aggregation shows fragmented picture instead of coherent story

---

## Solution Architecture

### Tier 1: Enhanced Document Structure Recognition (Highest Priority)

**Goal**: Identify document type and sections before LLM processing

**Implementation**:

1. **Add Document Section Detector** (`lib/services/document-section-detector.ts`)
   - Detects section headers: "Alumni Employment", "Research Projects", "Training Records", "Health Programs"
   - Extracts summary sections (marked with "Total No. of...", "Summary:", etc.)
   - Splits document into sections with metadata

2. **Update Text Extraction** (`lib/services/analysis-engine-service.ts`)
   - Enhance PDF/DOCX text extraction to preserve structure
   - Mark table boundaries, list items, summary sections
   - Add section headers as metadata

3. **Create Document Format Catalog** (`lib/config/document-formats.ts`)
   ```typescript
   export const QPRO_DOCUMENT_FORMATS = {
     ALUMNI_EMPLOYMENT: {
       patterns: ['alumni', 'employment', 'graduates', 'job placement'],
       sections: ['employment rates', 'job titles', 'companies'],
       defaultKRAs: ['KRA 10', 'KRA 11', 'KRA 12'],
       expectedMetrics: ['employment_rate', 'number_employed']
     },
     RESEARCH_OUTPUT: {
       patterns: ['research', 'completed papers', 'publications', 'research projects'],
       sections: ['paper titles', 'authors', 'research area'],
       defaultKRAs: ['KRA 3', 'KRA 4', 'KRA 5'],
       expectedMetrics: ['paper_count', 'publication_count']
     },
     TRAINING_RECORDS: {
       patterns: ['training', 'seminar', 'workshop', 'attendance'],
       sections: ['attendee names', 'training titles', 'dates'],
       defaultKRAs: ['KRA 11', 'KRA 13'],
       expectedMetrics: ['attendee_count', 'training_count', 'total_attendees']
     },
     // Add more formats...
   };
   ```

---

### Tier 2: Enhanced Summary & Aggregate Extraction (High Priority)

**Goal**: Extract and use aggregate metrics from documents instead of row counting

**Implementation**:

1. **Add Summary Section Extractor** (`lib/services/summary-extractor.ts`)
   - Scans document for: "Total No. of...", "Total Attendees", "Summary:", "Overall Results"
   - Extracts metrics like: "9 attendees", "4 research papers", "16.36% employment rate"
   - Stores as `{ metric: "total_attendees", value: 9, source: "page_6" }`

2. **Update Prompt to Prioritize Summaries** (`lib/services/analysis-engine-service.ts`)
   ```
   CRITICAL: If the document contains a SUMMARY section (e.g., "Total No. of Attendees: 9"), 
   extract that summary value as the REPORTED metric INSTEAD of counting individual rows.
   
   Priority Order for REPORTED value:
   1. SUMMARY SECTION (if document contains "Total No. of...", use that)
   2. AGGREGATE FROM TABLE HEADERS (if table shows subtotals, use that)
   3. COUNT OF ROWS (only if no summary/subtotal available)
   ```

3. **Map Summaries to Activities** 
   ```typescript
   // Example: If summary says "Total Attendees: 9"
   activities.push({
     name: "Faculty Training Sessions (Total)",
     reported: 9,           // From summary, not row count
     source: "summary_section",
     reliability: "HIGH"
   });
   ```

---

### Tier 3: Comprehensive Activity Type to KRA Mapping (Medium Priority)

**Goal**: Eliminate classification confusion by establishing strict type-to-KRA rules

**Implementation**:

1. **Create Comprehensive Activity-KRA Mapping** (`lib/config/activity-kra-mapping.ts`)
   ```typescript
   export const ACTIVITY_TYPE_TO_KRA_MAPPING = {
     // HUMAN RESOURCES & FACULTY DEVELOPMENT
     HR: {
       KRAs: ['KRA 11', 'KRA 13'],
       patterns: ['HR activities', 'capacity building', 'faculty wellness'],
       subTypes: {
         TRAINING: {
           KRA: 'KRA 11',     // "Professional Development"
           patterns: ['professional development', 'skills training', 'certification', 'upskilling'],
           confidence: 0.95
         },
         HEALTH_WELLNESS: {
           KRA: 'KRA 13',     // "Human Resources"
           patterns: ['wellness', 'health', 'fitness', 'mental health'],
           confidence: 0.95
         },
         FACULTY_ENGAGEMENT: {
           KRA: 'KRA 13',
           patterns: ['engagement', 'satisfaction', 'morale', 'recognition'],
           confidence: 0.90
         }
       }
     },
     
     // DIGITAL TRANSFORMATION
     DIGITAL: {
       KRA: 'KRA 17',
       patterns: ['system', 'platform', 'infrastructure', 'implementation', 'deployment'],
       exclude: ['training', 'workshop', 'seminar'],  // These stay in HR
       confidence: 0.90
     },
     
     // RESEARCH & INNOVATION
     RESEARCH: {
       KRAs: ['KRA 3', 'KRA 4', 'KRA 5'],
       patterns: ['research', 'publication', 'paper', 'study'],
       subTypes: {
         RESEARCH_OUTPUT: { KRA: 'KRA 3', confidence: 0.95 },
         RESEARCH_COLLABORATION: { KRA: 'KRA 4', confidence: 0.90 },
         INNOVATION: { KRA: 'KRA 5', confidence: 0.85 }
       }
     },
     
     // STUDENT SUCCESS
     STUDENT_SUCCESS: {
       KRAs: ['KRA 10', 'KRA 11', 'KRA 12'],
       patterns: ['alumni', 'employment', 'graduation', 'student achievement'],
       subTypes: {
         ALUMNI_EMPLOYMENT: { 
           KRA: 'KRA 10',  // "Student Success" (needs proper mapping)
           patterns: ['employment rate', 'alumni', 'job placement'],
           confidence: 0.95
         },
         STUDENT_SERVICES: { 
           KRA: 'KRA 11', 
           patterns: ['student services', 'counseling', 'support'],
           confidence: 0.90
         },
         STUDENT_CLUBS: { 
           KRA: 'KRA 12',
           patterns: ['clubs', 'organizations', 'activities'],
           confidence: 0.85
         }
       }
     },
     
     // ... more mappings
   };
   ```

2. **Update Classification Service** (`lib/services/qpro-analysis-service.ts`)
   - Replace existing `validateAndFixActivityKRAMatches` with enhanced logic
   - Use strict type detection → sub-type detection → KRA assignment
   - No arbitrary mappings; all decisions traceable

3. **Add Classification Validation**
   ```typescript
   private validateActivityClassification(activity: Activity): {
     kraId: string;
     confidence: number;
     reason: string;  // Explain why this KRA was chosen
     alternativeKRAs: string[];
   }
   ```

---

### Tier 4: Enhanced Target Value Management (Medium Priority)

**Goal**: Use actual document summaries + validate against Strategic Plan

**Implementation**:

1. **Add Document Summary Validation** 
   ```typescript
   // In analysis-engine-service.ts prompt:
   
   For REPORTED value:
   - If document summary exists (e.g., "Total No. of Attendees: 9"), use 9
   - If no summary, count extracted activities
   - Store source (summary vs. counted) in activity metadata
   
   For TARGET value:
   - Always use Strategic Plan timeline_data[2025]
   - BUT validate it makes sense:
     * If activity is "Training Attendees" and target is 80, that's reasonable
     * If activity is "Research Papers" and target is 2, that's reasonable
     * If mismatch exists, flag for manual review
   ```

2. **Update Achievement Calculation**
   - Add `reportedSource` field (summary | counted | extracted)
   - Add confidence score based on source
   - If summary used, confidence = HIGH (0.9+)
   - If counted from rows, confidence = MEDIUM (0.7-0.89)

---

### Tier 5: Multi-Report Aggregation in Single Document (Lower Priority but Important)

**Goal**: Handle documents with 3+ different report types

**Implementation**:

1. **Section-Based Processing**
   ```
   Document Input:
   ├── Page 1-2: Alumni Employment Report
   ├── Page 3-4: Research Projects Report  
   └── Page 5-7: Training Records Report
   
   Processing:
   ├── Detect Section 1 → Alumni Employment → Extract metrics → Map to Student Success KRAs
   ├── Detect Section 2 → Research Projects → Extract list → Map to Research KRAs
   └── Detect Section 3 → Training Records → Extract table → Map to HR/Development KRAs
   
   Results:
   └── Return activities array with 3+ distinct activity groups
   ```

2. **Update Prompt to Handle Sections**
   ```
   For each detected SECTION in the document:
   1. Identify section type (Alumni, Research, Training, etc.)
   2. Extract ALL activities in that section
   3. For table sections: create 1 activity per row + 1 summary activity
   4. For list sections: create 1 activity per item
   5. For narrative sections: extract mentioned activities with counts
   
   Example Output for 3 sections:
   {
     "activities": [
       { section: "Alumni Employment", name: "BS Computer Science Employment", reported: 16.36, ... },
       { section: "Alumni Employment", name: "BS Info Tech Employment", reported: 31.69, ... },
       { section: "Research", name: "IT Infrastructure Analysis", reported: 1, ... },
       { section: "Research", name: "Bawal Bastos App", reported: 1, ... },
       { section: "Training", name: "Introduction to AI, ML and DP", reported: 1, unit: "Edward Flores", ... },
       { section: "Training", name: "Data Privacy", reported: 1, unit: "Margarita Villanueva", ... },
       // ... 28 more training entries
     ]
   }
   ```

---

## Implementation Roadmap

### Phase 1: Critical Fixes (Week 1)
- [ ] **Tier 1**: Document Section Detector
- [ ] **Tier 2**: Summary Extractor
- [ ] Update analysis engine prompt to prioritize summaries
- [ ] Add diagnostic logging for extracted summaries

### Phase 2: Classification Improvements (Week 2)
- [ ] **Tier 3**: Create Activity-KRA Mapping config
- [ ] Update `validateAndFixActivityKRAMatches` logic
- [ ] Add classification validation and reasoning

### Phase 3: Validation & Testing (Week 3)
- [ ] **Tier 4**: Document Summary Validation
- [ ] Test with 3-report document
- [ ] Verify all activities extracted (not sampled)
- [ ] Compare extracted summaries to strategic plan targets

### Phase 4: Multi-Report Handling (Week 4)
- [ ] **Tier 5**: Section-based processing
- [ ] Handle 3+ report types in single document
- [ ] Aggregation logic update
- [ ] Dashboard display enhancements

---

## File Changes Summary

### New Files to Create
1. `lib/services/document-section-detector.ts` - Identify sections & formats
2. `lib/services/summary-extractor.ts` - Extract aggregate metrics
3. `lib/config/document-formats.ts` - Document type definitions
4. `lib/config/activity-kra-mapping.ts` - Comprehensive type-to-KRA rules
5. `__tests__/document-section-detector.test.ts` - Unit tests
6. `__tests__/summary-extractor.test.ts` - Unit tests

### Files to Modify
1. `lib/services/analysis-engine-service.ts`
   - Update prompt to prioritize summaries & sections
   - Enhance text extraction to preserve structure
   - Add section-aware processing

2. `lib/services/qpro-analysis-service.ts`
   - Replace `validateAndFixActivityKRAMatches` with enhanced logic
   - Integrate section detector
   - Add source tracking (summary vs. counted)

3. `lib/services/strategic-plan-service.ts`
   - Add validation method to check target reasonableness

4. `app/api/qpro-with-aggregation/route.ts`
   - Add section detection step
   - Return section metadata in response

5. `components/qpro-results-with-aggregation.tsx`
   - Add section breakdown display
   - Show confidence scores and data sources

### Configuration Updates
1. `strategic_plan.json` (if needed)
   - Verify KRA 10, 11, 12 have proper Student Success mapping

---

## Validation & Testing Strategy

### Unit Tests
```typescript
// Test complete extraction from multi-report document
describe('Multi-Report Document Processing', () => {
  test('Alumni Employment section extracted completely', () => {
    // Assert: 2 employment rates extracted
  });
  
  test('Research Projects section extracted completely', () => {
    // Assert: 4 research papers extracted
  });
  
  test('Training Records section extracts all 30+ entries', () => {
    // Assert: 30+ training entries, not 6
  });
  
  test('Summary metrics used over row counts', () => {
    // Assert: "Total No. of Attendees: 9" used instead of counting rows
  });
  
  test('Classification confidence varies by match type', () => {
    // Assert: Strategy match = 0.95+, Type match = 0.75-0.84, etc.
  });
});
```

### Integration Tests
```typescript
// Test with actual 3-report document
describe('QPRO API with 3-Report Document', () => {
  test('POST /api/qpro-with-aggregation returns all sections', () => {
    const response = await uploadDocument(threeReportFile);
    expect(response.analysis.activities).toHaveLength(36); // 2 + 4 + 30
    expect(response.analysis.sections).toBeDefined();
  });
  
  test('Dashboard aggregation accurate for all KRAs', () => {
    // Alumni KRAs show correct employment data
    // Research KRAs show correct paper count
    // HR/Dev KRAs show correct training count (30+, not 6)
  });
});
```

### Manual Validation
1. Upload 3-report document
2. Verify in dashboard:
   - Alumni Employment section visible
   - Research Projects section visible
   - Training Records show 30+ entries (not 6)
   - Metrics match document summaries
   - Classification reasons logged

---

## Success Criteria

✅ **Problem 1 Fixed**: Alumni Employment and Research Projects sections detected and processed  
✅ **Problem 2 Fixed**: All 30+ training entries extracted, not sampled to 6  
✅ **Problem 3 Fixed**: Actual summaries from PDF used for achievement calculation  
✅ **Problem 4 Fixed**: Consistent KRA classification with clear reasoning  

### Metrics
- **Extraction Completeness**: 100% of document activities extracted (not 20%)
- **Classification Accuracy**: 95%+ activities matched to correct KRA
- **Summary Extraction**: 90%+ of document summary sections identified
- **Multi-Report Handling**: 3+ report types processed as separate sections
- **Target Alignment**: Achievement metrics reflect actual document data, not row counting

---

## Notes & Constraints

### Current System Limitations
1. **LLM Context Limits**: GPT-4o-mini may truncate large table extraction
   - **Solution**: Chunk large tables before sending to LLM
   
2. **JSON Output Format**: LLM may return malformed JSON for 30+ items
   - **Solution**: Add JSON validation + fallback parsing
   
3. **Strategic Plan Targets**: May not align with actual document metrics
   - **Solution**: Flag mismatches for manual review

### Assumptions
1. Documents follow QPRO template structure (sections with headers)
2. Summary sections clearly labeled (e.g., "Total No. of...", "Summary:")
3. Strategic Plan JSON is up-to-date and accurate

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Over-extraction of duplicates | Medium | De-duplication logic in validation |
| Misclassification of cross-cutting activities | Medium | Manual review tags for low-confidence matches |
| Target value mismatches | Low | Validation checks + flags for review |
| Document format variations | Medium | Fallback to generic processing if format not recognized |

---

## Questions for Stakeholder Clarification

1. **Student Success KRAs**: Which KRA should "Alumni Employment" data map to? (Currently unclear - possibly new KRA needed?)
2. **Target Flexibility**: If document summary shows 9 attendees but Strategic Plan target is 80, should we flag this as data quality issue?
3. **Classification Rules**: For trainings that mention both "AI" (technical) and "capacity building" (HR), which KRA takes priority?
4. **Dashboard Display**: Should sections be displayed as separate cards or aggregated into single KRA view?

---

**Next Steps**: Approve this plan and proceed with Phase 1 implementation.
