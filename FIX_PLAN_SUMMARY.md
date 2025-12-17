# QPRO System Fix Plan - Executive Summary

## Problem Statement

When processing a Word document containing **3 different reports** (Alumni Employment + Research Projects + Training Records), the LSPU KMIS system exhibits **4 critical failures**:

| # | Problem | Impact | Status |
|---|---------|--------|--------|
| 1 | 2 entire report types missing (Alumni, Research) | 0% detection = 0% achievement score | 🔴 BROKEN |
| 2 | Only 6 of 30+ training entries extracted | 80% data loss = wrong metrics | 🔴 BROKEN |
| 3 | Wrong achievement math (counts rows instead of summaries) | 7.5% vs 11.25% achievement | 🔴 BROKEN |
| 4 | Similar activities scattered across unrelated KRAs | Fragmented reporting | 🔴 BROKEN |

**Root Cause**: LLM prompt designed for narrative reports, not structured documents with multiple sections

---

## Solution Overview

A **5-tier architecture** that processes documents in stages:

```
Raw Document
    ↓
[1] Detect Sections (Alumni, Research, Training, etc.)
    ↓
[2] Extract Summaries ("Total Attendees: 9")
    ↓
[3] Classify Activities to Correct KRAs (with rules)
    ↓
[4] Validate Targets
    ↓
[5] Handle Multi-Report Aggregation
    ↓
Accurate Dashboard
```

---

## Deliverables

### 📋 Documentation Created

1. **COMPREHENSIVE_FIX_PLAN.md** ← Full technical specification
   - 4 problems analyzed in depth
   - 5-tier solution architecture
   - File change summary
   - Testing strategy
   - Success criteria

2. **FIX_PLAN_QUICK_REFERENCE.md** ← Management-level overview
   - Before/after comparison
   - Timeline and priorities
   - Quick reference tables

3. **TECHNICAL_IMPLEMENTATION_GUIDE.md** ← Developer implementation guide
   - Service layer details with API signatures
   - Code examples and patterns
   - Database schema changes
   - Deployment checklist

---

## Implementation Plan

### Phase 1: Critical Path (Weeks 1-2) 🔴 DO THIS FIRST

**Tier 1 & 2**: Section Detection + Summary Extraction

**Deliverables**:
- `lib/services/document-section-detector.ts` (200 LOC)
- `lib/services/summary-extractor.ts` (150 LOC)
- `lib/config/document-formats.ts` (200 LOC)
- Unit tests

**Impact**: Fixes Problems #1, #2, and #3

**Testing**: Upload 3-report document → Verify all sections + summaries extracted

**Success Metric**: 
- ✅ Alumni section detected
- ✅ Research section detected  
- ✅ All 30+ training entries extracted (not 6)
- ✅ "Total Attendees: 9" found and used

---

### Phase 2: Classification Improvements (Weeks 3-4) 🟠 DO THIS SECOND

**Tier 3**: Activity-to-KRA Classification Rules

**Deliverables**:
- `lib/config/activity-kra-mapping.ts` (300 LOC)
- Enhanced `validateAndFixActivityKRAMatches()` in qpro-analysis-service.ts
- Classification validation tests

**Impact**: Fixes Problem #4 (scattered classifications)

**Success Metric**:
- ✅ All training activities in KRA 11 or KRA 13 (not KRA 17)
- ✅ All research in KRA 3, 4, or 5 (not mixed with HR)
- ✅ All alumni data in KRA 10, 11, or 12 (if those KRAs exist)
- ✅ Classification confidence scores logged

---

### Phase 3: Validation (Week 5) 🟡 TESTING

- End-to-end integration testing
- Manual validation with real documents
- Dashboard accuracy verification

**Success Metric**:
- ✅ All 4 problems resolved
- ✅ 95%+ classification accuracy
- ✅ Dashboard shows correct metrics

---

## Code Changes Summary

### New Files (6)
```
lib/services/
  ├── document-section-detector.ts       (200 LOC) NEW
  └── summary-extractor.ts               (150 LOC) NEW

lib/config/
  ├── document-formats.ts                (200 LOC) NEW
  └── activity-kra-mapping.ts            (300 LOC) NEW

__tests__/
  ├── document-section-detector.test.ts  (200 LOC) NEW
  └── summary-extractor.test.ts          (150 LOC) NEW

Total New Code: ~1,200 LOC
```

### Modified Files (4)
```
lib/services/
  ├── analysis-engine-service.ts         (Prompt + section handling)
  └── qpro-analysis-service.ts           (Classification logic)

app/api/
  └── qpro-with-aggregation/route.ts    (Add metadata to response)

components/
  └── qpro-results-with-aggregation.tsx (Display improvements)
```

---

## Before vs After

### BEFORE (Current - Broken)

**Upload**: 3-report document (Alumni 2 items + Research 4 items + Training 30+ items)

**System Output**:
```
Alumni:   NOT FOUND ❌
Research: NOT FOUND ❌
Training: 6 items extracted (24 missing) ❌

Achievement Metrics:
- Training reported: 6
- Training target: 80
- Achievement: 7.5% ❌ SEVERELY MISSED (wrong)

Dashboard: Shows fragmented data, missing sections
```

**Problems**:
- 2 sections completely missing
- 80% of training data lost
- Wrong achievement calculation

---

### AFTER (Fixed - Correct)

**Upload**: Same 3-report document

**System Output**:
```
Alumni Employment:
  ✓ BS Computer Science: 16.36% employment
  ✓ BS Info Tech: 31.69% employment

Research Projects:
  ✓ IT Infrastructure Analysis
  ✓ Bawal Bastos App
  ✓ [2 more papers]

Training Records:
  ✓ All 30 individual entries extracted
  ✓ Summary used: "Total Attendees: 9"

Achievement Metrics:
- Training reported: 30 (or 9 from summary)
- Training target: 80
- Achievement: 37.5% (or 11.25% with summary) ✓ ACCURATE

Classification:
- Alumni → KRA 10 (confidence: 0.95)
- Research → KRA 3/4/5 (confidence: 0.95)
- Training → KRA 11/13 (confidence: 0.90+)

Dashboard: Shows complete picture with all sections
```

**Improvements**:
- ✅ All 3 sections detected
- ✅ 100% activity extraction
- ✅ Correct achievement calculation
- ✅ Consistent classification
- ✅ Confidence scores visible

---

## Resource Requirements

### Team Size
- **1 Backend Developer** (Weeks 1-4)
  - Build Tier 1-2 services
  - Build Tier 3 classification rules
  - Integration testing

- **1 QA Engineer** (Weeks 3-5)
  - Unit test validation
  - Integration testing
  - Manual testing with real documents

### Timeline
- **Total**: 4-5 weeks
- **Critical Path** (Tier 1-2): 2 weeks
- **Testing + Rollout**: 2-3 weeks

### Dependencies
- None - This is a standalone system enhancement
- Can be implemented in parallel with other work

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| LLM context length issues with large tables | Medium | Data loss | Chunk tables before LLM; validation checks |
| JSON parsing errors for 30+ items | Low | Malformed output | Add JSON fallback parsing |
| Target value mismatches with reality | Low | Flag for review | Validation checks + manual review tags |
| Compatibility with existing dashboard | Medium | Display breaks | Gradual rollout; feature flag |

---

## Questions to Resolve Before Implementation

1. **Student Success KRAs**: Should "Alumni Employment" map to KRA 10, 11, or 12? (Currently unclear mapping)

2. **Multi-Person Training**: If training attended by 30 people:
   - Should we extract 30 separate activities (30 rows)?
   - Or 1 summary activity with reported=30?
   - **Recommendation**: Both - individual entries + summary aggregate

3. **Document Variations**: Do all QPRO documents follow same template or are there variations?
   - **Impacts**: Section detection patterns may need adjustment

4. **Classification Confidence**: Is 0.75+ confidence acceptable or should we require 0.85+?
   - **Impacts**: How strict to be on KRA assignment

5. **Dashboard Display**: Should aggregated metrics show sections separately or merged by KRA?
   - **Impacts**: UI component design

---

## Success Criteria

After implementation, this document should pass these tests:

```
✅ All 3 sections detected (Alumni, Research, Training)
✅ All 30+ training entries extracted (not sampled to 6)
✅ Summary metrics extracted ("Total Attendees: 9")
✅ Achievement calculation accurate (11.25%, not 7.5%)
✅ KRA classifications consistent (no training in KRA 17)
✅ Confidence scores visible in dashboard
✅ Multi-report documents handled correctly
✅ Dashboard shows complete picture
```

---

## Files Provided

Three comprehensive planning documents have been created in your workspace:

1. **COMPREHENSIVE_FIX_PLAN.md** (Long-form specification, 700+ lines)
   - For architects and technical leads
   - Detailed analysis of each problem
   - Full solution architecture
   - Testing strategy

2. **FIX_PLAN_QUICK_REFERENCE.md** (Quick overview, 300+ lines)
   - For project managers and stakeholders
   - Before/after comparison
   - Timeline overview
   - Key metrics

3. **TECHNICAL_IMPLEMENTATION_GUIDE.md** (Developer guide, 800+ lines)
   - For implementation team
   - Service APIs with code examples
   - Database schema changes
   - Testing code snippets
   - Deployment checklist

---

## Next Steps

1. **Review** all three planning documents
2. **Clarify** the 5 questions above with stakeholders
3. **Approve** Phase 1 (Tier 1-2) as critical path
4. **Assign** developer and QA resources
5. **Begin Phase 1** implementation
6. **Test** with the 3-report document you provided
7. **Iterate** based on results before Phase 2

---

## Questions?

These plans provide enough detail for implementation. For additional context:

- See **COMPREHENSIVE_FIX_PLAN.md** for full problem analysis
- See **TECHNICAL_IMPLEMENTATION_GUIDE.md** for code examples and APIs
- See **FIX_PLAN_QUICK_REFERENCE.md** for visual overviews

**The system is comprehensive and applies to ALL KRAs** - not just the ones you mentioned. Once implemented, document processing will be accurate across all 22 KRAs.
