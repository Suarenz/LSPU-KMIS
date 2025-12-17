# Technical Architecture: QPRO System Fix - Detailed Implementation Guide

## System Architecture Overview

The fix requires **5 new/modified service layers** working together:

```
User Upload (PDF/DOCX)
         ↓
    [1] Text Extraction
         ↓
    [2] Section Detection  ← NEW: Identify document type/sections
         ↓
    [3] Summary Extraction ← NEW: Extract aggregate metrics
         ↓
    [4] Section-aware LLM Processing (Updated Prompt)
         ↓
    [5] Activity Classification ← ENHANCED: Rule-based mapping
         ↓
    [6] Target Validation
         ↓
    Database Storage + Dashboard
```

---

## Service Layer Details

### [NEW] Service 1: Document Section Detector

**File**: `lib/services/document-section-detector.ts`

**Purpose**: Identify document type and extract sections before LLM processing

**API**:
```typescript
interface DocumentSection {
  type: 'ALUMNI_EMPLOYMENT' | 'RESEARCH_OUTPUT' | 'TRAINING_RECORDS' | 'HEALTH_PROGRAM' | 'OTHER';
  title: string;
  startPage: number;
  endPage: number;
  content: string;
  headerKeywords: string[];
  confidence: number; // 0.5-1.0
}

class DocumentSectionDetector {
  /**
   * Detect sections in raw document text
   */
  detectSections(text: string): DocumentSection[] {
    // 1. Split text by common section headers
    // 2. Identify section type by keywords
    // 3. Extract header info, page numbers
    // 4. Return array of detected sections
  }

  /**
   * Get section type with confidence
   */
  private identifySectionType(
    headerText: string,
    contentPreview: string
  ): { type: string; confidence: number } {
    // Check against QPRO_DOCUMENT_FORMATS patterns
  }
}

export const documentSectionDetector = new DocumentSectionDetector();
```

**Usage in Analysis Engine**:
```typescript
// In analysisEngineService.processQPRO()
const sections = documentSectionDetector.detectSections(userText);

console.log('[SECTION DETECTION]');
sections.forEach(section => {
  console.log(`  Detected: ${section.type} (confidence: ${section.confidence})`);
  console.log(`  Pages: ${section.startPage}-${section.endPage}`);
});

// Process each section with context
const allActivities = [];
for (const section of sections) {
  const sectionActivities = await processSection(section);
  allActivities.push(...sectionActivities);
}
```

**Configuration** (`lib/config/document-formats.ts`):
```typescript
export const QPRO_DOCUMENT_FORMATS = {
  ALUMNI_EMPLOYMENT: {
    headerPatterns: [
      /alumni\s+(employment|job\s+placement|graduate)/i,
      /employment\s+(rate|data|report)/i,
      /graduate\s+(employment|placement)/i,
      /where\s+are\s+graduates\s+now/i
    ],
    contentPatterns: [
      /employment\s+rate/i,
      /bs\s+(computer\s+science|info\s+tech|engineering)/i,
      /^\d+\.?\d*%/m  // percentages
    ],
    expectedMetrics: ['employment_rate', 'number_employed', 'job_titles'],
    defaultKRAs: ['KRA 10', 'KRA 11', 'KRA 12'],
    sampleStructure: `
      Program | Employment Rate | Count Employed | Avg Salary
      BS CS   | 16.36%         | 9              | PHP 25k
    `
  },

  RESEARCH_OUTPUT: {
    headerPatterns: [
      /research\s+(projects?|papers?|outputs?|publications?)/i,
      /completed\s+research/i,
      /research\s+output/i,
      /publications\s+and\s+research/i
    ],
    contentPatterns: [
      /research\s+project/i,
      /paper\s+title/i,
      /author/i,
      /journal|publication/i
    ],
    expectedMetrics: ['paper_count', 'publication_count', 'research_output_count'],
    defaultKRAs: ['KRA 3', 'KRA 4', 'KRA 5'],
    sampleStructure: `
      Research Title | Authors | Publication | Year
      IT Infrastructure | John, Jane | Conference | 2025
    `
  },

  TRAINING_RECORDS: {
    headerPatterns: [
      /training.*(?:report|records?|seminars?|workshops?)/i,
      /faculty.*training/i,
      /seminar.*attendance/i,
      /professional\s+development/i
    ],
    contentPatterns: [
      /attendee|participant/i,
      /training\s+title|seminar|workshop/i,
      /date|month|year/i,
      /total\s+no\.\s+of\s+(attendees|participants)/i
    ],
    expectedMetrics: ['attendee_count', 'training_count', 'total_attendees'],
    defaultKRAs: ['KRA 11', 'KRA 13'],
    sampleStructure: `
      Training Title | Attendee | Department | Date
      Intro to AI | John Doe | CCS | Jan 2025
      Data Privacy | Jane Smith | CCS | Jan 2025
    `,
    hasTableFormat: true,
    allowMultiplePerDocument: true
  },

  HEALTH_WELLNESS: {
    headerPatterns: [
      /health|wellness|fitness|mental\s+health/i,
      /employee\s+wellness/i,
      /sport|athletic/i
    ],
    contentPatterns: [
      /wellness\s+program/i,
      /participation|attendee/i
    ],
    expectedMetrics: ['participant_count', 'activity_count'],
    defaultKRAs: ['KRA 13'],
    sampleStructure: `
      Program | Participants | Month | Department
      Zumba | 25 | Jan | HR
    `
  }
};
```

---

### [NEW] Service 2: Summary Extractor

**File**: `lib/services/summary-extractor.ts`

**Purpose**: Extract aggregate metrics like "Total No. of Attendees: 9"

**API**:
```typescript
interface ExtractedSummary {
  metric: string;  // 'total_attendees', 'employment_rate', 'paper_count'
  value: number | string;
  unit?: string;   // '%', 'persons', 'papers'
  source: string;  // 'Summary Section' or 'Page X'
  confidence: number; // 0.7-1.0
  rawText: string; // For verification
}

class SummaryExtractor {
  /**
   * Extract summary metrics from document text
   */
  extractSummaries(text: string, sectionType: string): ExtractedSummary[] {
    // 1. Look for "Total No. of...", "Summary:", "Overall Results"
    // 2. Extract metric name and value
    // 3. Validate format (must be number or percentage)
    // 4. Return array of summaries
  }

  /**
   * Extract specific summary pattern
   */
  private extractPatternMatch(
    text: string,
    patterns: RegExp[]
  ): ExtractedSummary | null {
    // Match against patterns and extract values
  }
}

export const summaryExtractor = new SummaryExtractor();
```

**Extraction Patterns**:
```typescript
private SUMMARY_PATTERNS = [
  // Training/Attendance patterns
  {
    pattern: /total\s+no\.\s+of\s+(?:attendees|participants|people).*?(\d+)/i,
    metric: 'total_attendees',
    unit: 'persons'
  },
  {
    pattern: /total\s+attendees?\s*:?\s*(\d+)/i,
    metric: 'total_attendees',
    unit: 'persons'
  },
  {
    pattern: /(\d+)\s+(?:attendees|participants|people)\s+total/i,
    metric: 'total_attendees',
    unit: 'persons'
  },

  // Research/Publication patterns
  {
    pattern: /total\s+(?:research\s+)?(?:papers?|publications?)\s*:?\s*(\d+)/i,
    metric: 'paper_count',
    unit: 'papers'
  },
  {
    pattern: /completed\s+(\d+)\s+(?:research\s+)?(?:papers?|studies?)/i,
    metric: 'paper_count',
    unit: 'papers'
  },

  // Employment/Alumni patterns
  {
    pattern: /employment\s+rate.*?(\d+\.?\d*)%/i,
    metric: 'employment_rate',
    unit: '%'
  },
  {
    pattern: /(\d+\.?\d*)%?\s+(?:employed|in\s+jobs?)/i,
    metric: 'employment_rate',
    unit: '%'
  },

  // General summary patterns
  {
    pattern: /summary\s*:?\s*([^\.]+)/i,
    metric: 'summary_text',
    unit: 'text'
  }
];
```

**Usage in Analysis Engine**:
```typescript
// After section detection
const summaries = summaryExtractor.extractSummaries(
  section.content,
  section.type
);

console.log('[SUMMARY EXTRACTION]');
summaries.forEach(summary => {
  console.log(`  Metric: ${summary.metric}`);
  console.log(`  Value: ${summary.value} ${summary.unit || ''}`);
  console.log(`  Source: ${summary.source}`);
  console.log(`  Confidence: ${summary.confidence}`);
});

// Use summaries in activity creation
const reportedValue = summaries.find(s => s.metric === 'total_attendees')?.value || null;
```

---

### [ENHANCED] Service 3: Activity Classification with KRA Mapping

**File**: `lib/config/activity-kra-mapping.ts` (NEW) + `lib/services/qpro-analysis-service.ts` (MODIFIED)

**Configuration Structure**:
```typescript
export interface ActivityTypeMapping {
  category: string;           // 'HR', 'RESEARCH', 'STUDENT_SUCCESS', 'DIGITAL'
  primaryKRAs: string[];      // Primary KRA options
  activityPatterns: RegExp[];
  subTypes?: {
    [subType: string]: {
      KRA: string;
      patterns: RegExp[];
      keywords: string[];
      confidence: number;
    }
  };
  excludePatterns?: RegExp[];  // Patterns to exclude from this category
}

export const ACTIVITY_CLASSIFICATION_RULES = {
  HR_DEVELOPMENT: {
    category: 'HR',
    primaryKRAs: ['KRA 11', 'KRA 13'],
    activityPatterns: [
      /training|seminar|workshop|course|certification|upskilling|development/i
    ],
    subTypes: {
      FACULTY_TRAINING: {
        KRA: 'KRA 11',
        patterns: [
          /professional\s+development/i,
          /skills?\s+training/i,
          /technical\s+certification/i
        ],
        keywords: ['professional', 'development', 'skills', 'certification'],
        confidence: 0.95
      },
      HEALTH_WELLNESS: {
        KRA: 'KRA 13',
        patterns: [
          /wellness|health|fitness|mental\s+health/i,
          /employee\s+wellness/i
        ],
        keywords: ['wellness', 'health', 'fitness'],
        confidence: 0.95
      },
      STAFF_ENGAGEMENT: {
        KRA: 'KRA 13',
        patterns: [
          /engagement|satisfaction|recognition|morale/i
        ],
        keywords: ['engagement', 'satisfaction'],
        confidence: 0.90
      }
    },
    excludePatterns: [
      /system.*training|infrastructure.*implementation/i  // These are digital
    ]
  },

  RESEARCH_OUTPUT: {
    category: 'RESEARCH',
    primaryKRAs: ['KRA 3', 'KRA 4', 'KRA 5'],
    activityPatterns: [
      /research|publication|paper|study|journal/i
    ],
    subTypes: {
      RESEARCH_PAPER: {
        KRA: 'KRA 3',
        patterns: [/research\s+paper|publication|journal/i],
        keywords: ['research', 'paper', 'publication'],
        confidence: 0.95
      },
      RESEARCH_COLLABORATION: {
        KRA: 'KRA 4',
        patterns: [/collaborative\s+research|partnership|institution/i],
        keywords: ['collaboration', 'partnership'],
        confidence: 0.90
      },
      INNOVATION: {
        KRA: 'KRA 5',
        patterns: [/innovation|patent|product\s+development/i],
        keywords: ['innovation', 'new'],
        confidence: 0.85
      }
    }
  },

  STUDENT_SUCCESS: {
    category: 'STUDENT_SUCCESS',
    primaryKRAs: ['KRA 10', 'KRA 11', 'KRA 12'],
    activityPatterns: [
      /alumni|employment|graduate|student\s+achievement|job\s+placement/i
    ],
    subTypes: {
      ALUMNI_EMPLOYMENT: {
        KRA: 'KRA 10',
        patterns: [
          /alumni.*employment|employment\s+rate|graduate.*placement/i
        ],
        keywords: ['alumni', 'employment', 'job', 'graduate'],
        confidence: 0.95
      },
      STUDENT_SERVICES: {
        KRA: 'KRA 11',
        patterns: [/student\s+services|counseling|support/i],
        keywords: ['student', 'services'],
        confidence: 0.90
      },
      STUDENT_ORGANIZATIONS: {
        KRA: 'KRA 12',
        patterns: [/student\s+(?:clubs?|organizations?|activities?|associations?)/i],
        keywords: ['student', 'clubs', 'organizations'],
        confidence: 0.85
      }
    }
  },

  DIGITAL_TRANSFORMATION: {
    category: 'DIGITAL',
    primaryKRAs: ['KRA 17'],
    activityPatterns: [
      /system|platform|infrastructure|implementation|deployment|digital\s+(?:system|tool|infrastructure)/i
    ],
    excludePatterns: [
      /training|workshop|seminar|course/i  // Training is HR, not digital
    ]
  }
};
```

**Enhanced Classification Method**:
```typescript
// In qpro-analysis-service.ts
private classifyActivityToKRA(activity: any, strategicPlan: any): {
  kraId: string;
  confidence: number;
  reason: string;
  alternativeKRAs: string[];
} {
  const activityName = activity.name.toLowerCase();
  const activityContext = (activity.description || '').toLowerCase();
  
  // Step 1: Exact Strategy Match (highest priority)
  const strategyMatch = this.matchActivityToStrategies(
    activityName,
    strategicPlan
  );
  if (strategyMatch) {
    return {
      kraId: strategyMatch.kraId,
      confidence: 0.95,
      reason: `Exact match to strategy: "${strategyMatch.strategy}"`,
      alternativeKRAs: []
    };
  }

  // Step 2: Type-based Classification (using rules above)
  const typeMatch = this.matchActivityByType(
    activityName,
    activityContext,
    ACTIVITY_CLASSIFICATION_RULES
  );
  if (typeMatch && typeMatch.confidence >= 0.85) {
    return {
      kraId: typeMatch.kraId,
      confidence: typeMatch.confidence,
      reason: `Type match: ${typeMatch.subType || typeMatch.category}`,
      alternativeKRAs: typeMatch.alternatives || []
    };
  }

  // Step 3: Semantic Similarity (fallback)
  const semanticMatch = this.matchActivityBySemantic(
    activityName,
    strategicPlan,
    typeMatch?.category  // constrain to category if available
  );
  
  return {
    kraId: semanticMatch.kraId,
    confidence: semanticMatch.confidence,
    reason: `Semantic similarity: ${semanticMatch.similarity}`,
    alternativeKRAs: semanticMatch.alternatives
  };
}

private matchActivityByType(
  activityName: string,
  context: string,
  rules: typeof ACTIVITY_CLASSIFICATION_RULES
): { kraId: string; category: string; subType?: string; confidence: number; alternatives?: string[] } | null {
  
  for (const [ruleKey, rule] of Object.entries(rules)) {
    // Check if activity matches category pattern
    const matchesCategory = rule.activityPatterns.some(
      pattern => pattern.test(activityName)
    );
    
    if (!matchesCategory) continue;

    // Check if excluded
    if (rule.excludePatterns?.some(pattern => pattern.test(activityName))) {
      continue;
    }

    // Try sub-type matching first
    if (rule.subTypes) {
      for (const [subTypeName, subType] of Object.entries(rule.subTypes)) {
        const matchesSubType = subType.patterns.some(
          pattern => pattern.test(activityName)
        );

        if (matchesSubType) {
          return {
            kraId: subType.KRA,
            category: rule.category,
            subType: subTypeName,
            confidence: subType.confidence,
            alternatives: rule.primaryKRAs.filter(k => k !== subType.KRA)
          };
        }
      }
    }

    // Fall back to primary KRA
    const primaryKRA = rule.primaryKRAs[0];
    const confidence = rule.subTypes ? 0.80 : 0.85;
    
    return {
      kraId: primaryKRA,
      category: rule.category,
      confidence,
      alternatives: rule.primaryKRAs.slice(1)
    };
  }

  return null;
}
```

---

### [UPDATED] Service 4: Enhanced LLM Prompt

**File**: `lib/services/analysis-engine-service.ts` (MODIFY promptTemplate)

**Key Prompt Changes**:

```
## Document Processing Strategy (NEW SECTION)

This document may contain multiple report types. Follow these steps:

### Step 1: Identify Document Sections
Before extracting activities, identify all distinct sections in the document:
- ALUMNI EMPLOYMENT (employment rates, job titles by program)
- RESEARCH OUTPUT (completed research papers/projects)
- TRAINING RECORDS (training seminars/workshops attended)
- HEALTH/WELLNESS PROGRAMS (fitness, wellness activities)
- OTHER ACADEMIC ACTIVITIES

For each section identified:
1. Extract section type and header
2. Summarize section content
3. Process independently

### Step 2: CRITICAL - Extract Summary Metrics
For EVERY section, scan for and extract summary statistics:
- "Total No. of Attendees: X" 
- "Total Attendees: X"
- "Summary: X people participated"
- "Employment Rate: Y%"
- "Total Papers: Z"
- Any line starting with "Total", "Summary", "Overall", "Grand Total"

IMPORTANT: If a summary metric exists, USE IT as the REPORTED value instead of 
counting individual rows. The summary is the authoritative count from the document creator.

Example:
- If document says "Total No. of Attendees: 9", use 9 as reported value
- If document has 30 training rows but no summary, create aggregate activity with reported=30

### Step 3: Table Extraction for Training/Attendance Records
For documents with TRAINING TABLES containing rows of attendees:

MUST extract ONE ACTIVITY PER ROW (minimum).
Each row represents one distinct activity instance.

Example table:
| Training Title | Attendee | Department | Date |
| Introduction to AI | John Doe | CCS | Jan 2025 |
| Data Privacy | Jane Smith | COE | Jan 2025 |
| Introduction to AI | Mark Lee | CAS | Feb 2025 |

MUST create 3 activities:
1. { name: "Introduction to AI - John Doe", reported: 1, ... }
2. { name: "Data Privacy - Jane Smith", reported: 1, ... }
3. { name: "Introduction to AI - Mark Lee", reported: 1, ... }

Then create 1 aggregate summary:
{ name: "Training Programs Total", reported: 3, source: "row_count" }

DO NOT group rows with same title into single activity - keep all rows separate.

### Step 4: Reported vs Target Values

For REPORTED value (what was accomplished):
- PRIORITY 1: Use SUMMARY metrics from document (e.g., "Total Attendees: 9")
- PRIORITY 2: Use aggregate headers from tables (e.g., "Subtotal: 15")
- PRIORITY 3: Count extracted rows/items if no summary available
- ALWAYS log which method was used in activity.reportedSource field

For TARGET value:
- ALWAYS use Strategic Plan timeline_data[2025]
- DO NOT extract target from QPRO document
- If target seems unreasonable (e.g., target=500 for 10 research papers), 
  proceed anyway but set confidence <= 0.80

### Step 5: Activity Deduplication
After extracting all activities:
1. Scan for duplicate names (e.g., "Introduction to AI" appearing 3 times)
2. For true duplicates (same person, same training, same date), keep only ONE
3. For same-training-different-people, keep ALL (these are distinct attendance instances)

Example of DUPLICATES to remove:
- "Introduction to AI - Jan 2025" (appears 2 times with identical details)
→ Remove one, keep one

Example of LEGITIMATE different entries to KEEP:
- "Introduction to AI - John Doe - Jan 2025"
- "Introduction to AI - Jane Smith - Jan 2025"  
- "Introduction to AI - John Doe - Feb 2025"
→ Keep all 3 (different people or dates)

## VALIDATION BEFORE OUTPUT (UPDATED)
...

## Output Format (UPDATED)
Return JSON with new fields:

{
  "activities": [
    {
      "name": "Faculty training workshops",
      "kraId": "KRA 1",
      "reported": 30,
      "reportedSource": "row_count",  ← NEW: Where did reported value come from?
      "target": 10,
      ...
    }
  ],
  "extractionMetadata": {  ← NEW: Provide visibility into what was found
    "sectionsDetected": ["TRAINING_RECORDS"],
    "summariesFound": [{ metric: "total_attendees", value: 9 }],
    "rowsExtracted": 30,
    "mergedDuplicates": 2
  }
  ...
}
```

---

### [UPDATED] Processing Flow

**Modified `processQPRO` method**:

```typescript
async processQPRO(
  fileBuffer: Buffer, 
  fileType: string, 
  unitId?: string
): Promise<QPROAnalysisOutput> {
  
  // Step 1: Extract text from PDF/DOCX (existing code)
  let userText: string;
  userText = await this.extractText(fileBuffer, fileType);
  
  // Step 2: Detect sections (NEW)
  const sections = documentSectionDetector.detectSections(userText);
  console.log('[QPRO ANALYSIS] Detected sections:', sections.map(s => s.type));
  
  // Step 3: Extract summaries per section (NEW)
  const summariesBySection = {};
  sections.forEach(section => {
    const summaries = summaryExtractor.extractSummaries(
      section.content,
      section.type
    );
    summariesBySection[section.type] = summaries;
    console.log(`[QPRO ANALYSIS] Summaries in ${section.type}:`, summaries);
  });
  
  // Step 4: Get strategic context + pass section metadata to LLM
  const strategicContext = await vectorService.searchVectors(...);
  
  // Step 5: Call LLM with enhanced prompt (includes sections + summaries)
  const analysisOutput = await this.llm.call(
    this.promptTemplate.format({
      strategic_context: strategicContext,
      user_input: userText,
      // NEW: Pass metadata for better extraction
      section_info: JSON.stringify({
        detectedSections: sections,
        extractedSummaries: summariesBySection
      })
    })
  );
  
  // Step 6: Validate and fix KRA assignments (using new rules)
  const validatedActivities = this.validateAndFixActivityKRAMatches(
    analysisOutput.activities,
    strategicPlan
  );
  
  // Step 7: Return results with metadata
  return {
    ...analysisOutput,
    activities: validatedActivities,
    extractionMetadata: {
      sectionsDetected: sections.map(s => s.type),
      summariesExtracted: summariesBySection,
      totalActivitiesExtracted: validatedActivities.length,
      confidence: this.calculateOverallConfidence(validatedActivities)
    }
  };
}
```

---

## Database Schema Updates

**Existing `qpro_analyses` table** - Add columns:
```sql
ALTER TABLE qpro_analyses ADD COLUMN IF NOT EXISTS (
  extraction_metadata JSONB,          -- Stores sections, summaries, confidence
  reported_source VARCHAR(50),        -- 'summary', 'row_count', 'aggregate_header'
  sections_detected TEXT[],           -- Array of detected section types
  has_summaries BOOLEAN,
  extraction_confidence NUMERIC(3,2)  -- Overall confidence 0-1
);
```

**New table for tracking extraction details**:
```sql
CREATE TABLE IF NOT EXISTS extraction_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qpro_analysis_id UUID NOT NULL REFERENCES qpro_analyses(id),
  section_type VARCHAR(50),
  summary_metrics JSONB,              -- Array of found summaries
  extraction_method VARCHAR(50),      -- 'summary', 'row_count', 'aggregate'
  activities_count INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Testing Strategy

### Unit Tests (`__tests__/document-section-detector.test.ts`):
```typescript
describe('Document Section Detector', () => {
  test('detects Alumni Employment section', () => {
    const text = `Alumni Employment Report\n...table with employment rates...`;
    const sections = detector.detectSections(text);
    expect(sections).toContainEqual(
      expect.objectContaining({ type: 'ALUMNI_EMPLOYMENT' })
    );
  });

  test('detects Research Projects section', () => {
    const text = `Completed Research\nProject 1: ...\nProject 2: ...`;
    const sections = detector.detectSections(text);
    expect(sections).toContainEqual(
      expect.objectContaining({ type: 'RESEARCH_OUTPUT' })
    );
  });

  test('detects Training Records with correct confidence', () => {
    const text = `Training Attendance Report\n...training table...`;
    const sections = detector.detectSections(text);
    const training = sections.find(s => s.type === 'TRAINING_RECORDS');
    expect(training!.confidence).toBeGreaterThan(0.85);
  });
});
```

### Integration Tests (`__tests__/qpro-multi-report.test.ts`):
```typescript
describe('QPRO with 3-Report Document', () => {
  let analysisResult: any;

  beforeAll(async () => {
    const fileBuffer = await fs.readFile('test-data/three-reports.docx');
    analysisResult = await analysisEngineService.processQPRO(
      fileBuffer,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  });

  test('extracts all 3 sections', () => {
    expect(analysisResult.extractionMetadata.sectionsDetected).toContain('ALUMNI_EMPLOYMENT');
    expect(analysisResult.extractionMetadata.sectionsDetected).toContain('RESEARCH_OUTPUT');
    expect(analysisResult.extractionMetadata.sectionsDetected).toContain('TRAINING_RECORDS');
  });

  test('extracts 30+ training activities', () => {
    const trainingActivities = analysisResult.activities.filter(
      a => a.kraId.includes('KRA 11') || a.kraId.includes('KRA 13')
    );
    expect(trainingActivities.length).toBeGreaterThanOrEqual(30);
  });

  test('uses summaries for reported values', () => {
    const trainingActivity = analysisResult.activities.find(
      a => a.name.includes('Total')
    );
    expect(trainingActivity?.reportedSource).toBe('summary');
    expect(trainingActivity?.reported).toBeGreaterThan(0);
  });

  test('classifies activities correctly by KRA', () => {
    const alumniActivities = analysisResult.activities.filter(
      a => a.kraId === 'KRA 10'
    );
    expect(alumniActivities.length).toBeGreaterThan(0);
    
    const researchActivities = analysisResult.activities.filter(
      a => ['KRA 3', 'KRA 4', 'KRA 5'].includes(a.kraId)
    );
    expect(researchActivities.length).toBeGreaterThan(0);
  });
});
```

---

## Deployment Checklist

- [ ] Create new services (Section Detector, Summary Extractor)
- [ ] Create new config files (document-formats.ts, activity-kra-mapping.ts)
- [ ] Update analysis-engine-service.ts prompt and processing logic
- [ ] Update qpro-analysis-service.ts classification logic
- [ ] Add database schema updates
- [ ] Write and pass all unit tests
- [ ] Write and pass integration tests with 3-report document
- [ ] Update API documentation
- [ ] Deploy to staging
- [ ] Manual testing with real QPRO documents
- [ ] Deploy to production
