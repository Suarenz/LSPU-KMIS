# QPRO System Fix Plan - Quick Reference

## The 4 Critical Problems

### 1️⃣ Missing Sections (Alumni, Research)
**Problem**: Alumni Employment (Page 1) and Research Projects (Page 3) completely missing from output  
**Root Cause**: System doesn't recognize these document types; only looks for training seminars  
**Fix**: Add Document Section Detector to identify "Alumni Employment", "Research Projects", "Training Records" sections

---

### 2️⃣ Incomplete Extraction (Only 6 of 30+ items)
**Problem**: PDF has 30+ training entries but dashboard shows only 5-6 items  
**Examples**: Missing "Cybersecurity Proficiency Upskilling", "Learn ChatGPT" sessions  
**Root Cause**: 
- LLM groups similar trainings into 1 activity instead of keeping separate
- No validation that "extract EVERY row" is actually happening
- Token limits may cause truncation

**Fix**: 
- Add validation to ensure N rows → N activities
- Chunk large tables before LLM processing
- Add JSON validation + fallback parsing

---

### 3️⃣ Wrong Target Logic (80 vs. 9)
**Problem**: Dashboard uses target=80 from Strategic Plan, but PDF summary says "Total No. of Attendees: 9"  
**System Logic**:
```
Extracted 6 rows → 6/80 = 7.5% achievement ❌ WRONG
Should be: 9 attendees (from summary) / 80 target = 11.25%
```

**Root Cause**: System counts extracted rows instead of extracting document summary sections

**Fix**: Prioritize summary extraction ("Total No. of Attendees: X") BEFORE row counting

---

### 4️⃣ Arbitrary Classification 
**Problem**: Similar trainings split across different KRAs
- "Introduction to AI, ML and DP" → KRA 13 (HR)
- "Introduction to Low-Code with Google" → KRA 17 (Digital Transformation)

**Root Cause**: No consistent classification rules; system relies on keyword guessing

**Fix**: Create comprehensive Activity-KRA mapping with strict type-to-KRA rules:
```
Training/Workshops/Seminars → KRA 11 or KRA 13 (HR Development)
Research/Publications → KRA 3, 4, 5 (Research)
Alumni/Employment → KRA 10, 11, 12 (Student Success)
Digital Systems → KRA 17 (Digital Transformation)
Health/Wellness → KRA 13 (HR)
```

---

## 5-Tier Fix Architecture

```
┌─────────────────────────────────────────────────────────┐
│ TIER 1: Section Recognition                             │
│ Identify: Alumni | Research | Training | Health | etc.  │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│ TIER 2: Summary Extraction                              │
│ Extract: "Total Attendees: 9" instead of counting rows  │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│ TIER 3: Activity Classification                         │
│ Map: Activity Type → Correct KRA (with confidence)      │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│ TIER 4: Target Validation                               │
│ Validate: Does Strategic Plan target make sense?        │
│ Flag mismatches for manual review                       │
└────────────────┬────────────────────────────────────────┘
                 ▼
┌─────────────────────────────────────────────────────────┐
│ TIER 5: Multi-Report Aggregation                        │
│ Handle: 3+ report types in single document              │
│ Return: Separate activities for each section            │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Timeline

| Phase | Focus | Duration | Priority |
|-------|-------|----------|----------|
| **Phase 1** | Section Detection + Summary Extraction | Week 1 | 🔴 Critical |
| **Phase 2** | Activity Classification Rules | Week 2 | 🟠 High |
| **Phase 3** | Testing & Validation | Week 3 | 🟡 Medium |
| **Phase 4** | Multi-Report Aggregation | Week 4 | 🟡 Medium |

---

## Files to Create (New)

```
lib/services/
  ├── document-section-detector.ts      ← Identify document sections
  └── summary-extractor.ts              ← Extract "Total No. of..." metrics

lib/config/
  ├── document-formats.ts               ← Define Alumni, Research, Training types
  └── activity-kra-mapping.ts           ← Comprehensive type→KRA rules

__tests__/
  ├── document-section-detector.test.ts
  └── summary-extractor.test.ts
```

---

## Files to Modify (Existing)

```
lib/services/
  ├── analysis-engine-service.ts        ← Update prompt + section handling
  └── qpro-analysis-service.ts          ← Enhanced classification logic

app/api/
  └── qpro-with-aggregation/route.ts    ← Add section detection step

components/
  └── qpro-results-with-aggregation.tsx ← Show section breakdown
```

---

## Critical Before/After Comparison

### BEFORE (Current Broken State)

**Input**: 3-Report Document (Alumni + Research + Training)
```
Page 1-2:   Alumni Employment Report (2 data rows)
Page 3-4:   Research Projects (4 papers)
Page 5-7:   Training Records (30+ attendee rows)
```

**Output**:
```
✗ Alumni section: NOT FOUND
✗ Research section: NOT FOUND
✓ Training section: Only 6 items extracted (missing 24+)

Achievement Calculation:
- Reported: 6 (row count from incomplete extraction)
- Target: 80 (from Strategic Plan)
- Achievement: 7.5% ❌ SEVERELY MISSED (should be 37.5%+)
```

**Problems**:
- 2 entire report types missing
- 80% of training data lost
- Wrong achievement %

---

### AFTER (Fixed State)

**Input**: Same 3-Report Document

**Output**:
```
✓ Alumni Employment Section:
  - BS Computer Science Employment: 16.36%
  - BS Info Tech Employment: 31.69%
  
✓ Research Projects Section:
  - IT Infrastructure Analysis
  - Bawal Bastos App
  - [2 more papers]
  
✓ Training Records Section:
  - All 30+ individual entries extracted
  - OR summary used: "Total Attendees: 9"

Achievement Calculation (Training Example):
- Reported: 30 activities (or 9 from summary)
- Target: 80 (from Strategic Plan)
- Achievement: 37.5% (or 11.25% with summary) ✓ ACCURATE
```

**Improvements**:
- All 3 report types detected and processed
- 100% activity extraction (not sampling to 6)
- Accurate achievement calculations
- Clear classification reasoning

---

## Key Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Section Detection | Alumni: 0%, Research: 0% | 100% both | 🔴 Failed |
| Activity Extraction | 6/36 items (17%) | 36/36 (100%) | 🔴 Failed |
| Summary Usage | Not used | Prioritized | 🔴 Failed |
| Classification Consistency | Arbitrary | Rule-based | 🔴 Failed |
| Multi-Report Support | Broken | Works | 🔴 Failed |

---

## Common Questions

**Q: Why are 24 training entries missing?**  
A: LLM groups similar activities (e.g., all "Introduction to AI" → 1 activity) instead of keeping separate per-person records. Prompt says "extract EVERY row" but lacks validation.

**Q: What does "Summary Extraction" solve?**  
A: If PDF says "Total Attendees: 9", use 9 instead of counting extracted rows. Makes achievement calculation accurate to document intent.

**Q: Why need all 3 tiers when Tier 2 should work?**  
A: 
- Tier 1 needed to identify which KRAs should handle each section
- Tier 2 gets metrics but needs context from Tier 1
- Tier 3 prevents "training tech" from mixing HR + Digital KRAs
- All 3 together = complete, accurate system

**Q: Will this apply to ALL KRAs?**  
A: Yes. The architecture is generic - works for any document type/KRA combination.

---

## Next Steps

1. **Review** this plan with stakeholders
2. **Approve** Tier 1 + 2 as critical path
3. **Begin Phase 1** - Document Section Detector
4. **Test** with the 3-report document you provided
5. **Iterate** based on results
