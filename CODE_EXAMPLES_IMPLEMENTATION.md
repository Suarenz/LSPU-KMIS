# QPRO Fix Plan - Code Examples & Implementation Snippets

## Quick Start: What To Build

This document provides ready-to-implement code snippets for each tier of the fix.

---

## [NEW] Service 1: Document Section Detector

**File**: `lib/services/document-section-detector.ts` (200 LOC)

```typescript
import { QPRO_DOCUMENT_FORMATS } from '@/lib/config/document-formats';

export interface DocumentSection {
  type: 'ALUMNI_EMPLOYMENT' | 'RESEARCH_OUTPUT' | 'TRAINING_RECORDS' | 'HEALTH_PROGRAM' | 'OTHER';
  title: string;
  startLineNumber: number;
  endLineNumber: number;
  content: string;
  headerKeywords: string[];
  confidence: number;
  pageRange?: { start: number; end: number };
}

class DocumentSectionDetector {
  /**
   * Detect and extract all sections in document text
   */
  detectSections(text: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    
    // Split into lines for easier processing
    const lines = text.split('\n');
    
    // Scan for section headers
    let currentSection: Partial<DocumentSection> | null = null;
    let sectionStartLine = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line.length) continue;
      
      // Check if this line is a section header
      const headerMatch = this.identifyHeaderLine(line);
      
      if (headerMatch) {
        // Save previous section if exists
        if (currentSection) {
          const content = lines.slice(sectionStartLine, i).join('\n');
          sections.push({
            type: currentSection.type!,
            title: currentSection.title!,
            startLineNumber: sectionStartLine,
            endLineNumber: i - 1,
            content,
            headerKeywords: currentSection.headerKeywords!,
            confidence: currentSection.confidence!
          });
        }
        
        // Start new section
        const [type, confidence, keywords] = headerMatch;
        currentSection = {
          type,
          title: line,
          headerKeywords: keywords,
          confidence
        };
        sectionStartLine = i;
      }
    }
    
    // Save final section
    if (currentSection && currentSection.type) {
      const content = lines.slice(sectionStartLine).join('\n');
      sections.push({
        type: currentSection.type,
        title: currentSection.title!,
        startLineNumber: sectionStartLine,
        endLineNumber: lines.length - 1,
        content,
        headerKeywords: currentSection.headerKeywords!,
        confidence: currentSection.confidence!
      });
    }
    
    return sections;
  }

  /**
   * Identify if a line is a section header
   * Returns: [sectionType, confidence, keywords] or null
   */
  private identifyHeaderLine(
    line: string
  ): [string, number, string[]] | null {
    const lowerLine = line.toLowerCase();
    
    // Check against all configured formats
    for (const [formatKey, format] of Object.entries(QPRO_DOCUMENT_FORMATS)) {
      for (const pattern of format.headerPatterns) {
        if (pattern.test(lowerLine)) {
          // Extract keywords from header
          const keywords = lowerLine.split(/\s+/).filter(w => w.length > 3);
          return [formatKey, 0.95, keywords];
        }
      }
    }
    
    return null;
  }

  /**
   * Get detected sections grouped by type
   */
  getSectionsByType(sections: DocumentSection[]): Map<string, DocumentSection[]> {
    const grouped = new Map<string, DocumentSection[]>();
    
    sections.forEach(section => {
      if (!grouped.has(section.type)) {
        grouped.set(section.type, []);
      }
      grouped.get(section.type)!.push(section);
    });
    
    return grouped;
  }
}

export const documentSectionDetector = new DocumentSectionDetector();
```

---

## [NEW] Service 2: Summary Extractor

**File**: `lib/services/summary-extractor.ts` (150 LOC)

```typescript
export interface ExtractedSummary {
  metric: string;
  value: number | string;
  unit?: string;
  source: string;
  confidence: number;
  rawText: string;
}

class SummaryExtractor {
  private SUMMARY_PATTERNS = [
    // Training/Attendance
    {
      pattern: /total\s+no\.\s+of\s+(?:attendees|participants|people).*?:?\s*(\d+)/i,
      metric: 'total_attendees',
      unit: 'persons'
    },
    {
      pattern: /(\d+)\s+(?:attendees|participants|people)\s+total/i,
      metric: 'total_attendees',
      unit: 'persons'
    },
    
    // Research
    {
      pattern: /total\s+(?:research\s+)?(?:papers?|publications?|projects?).*?:?\s*(\d+)/i,
      metric: 'paper_count',
      unit: 'papers'
    },
    {
      pattern: /completed\s+(\d+)\s+(?:research\s+)?(?:papers?|studies?|projects?)/i,
      metric: 'paper_count',
      unit: 'papers'
    },
    
    // Employment/Alumni
    {
      pattern: /employment\s+rate.*?(\d+\.?\d*)%/i,
      metric: 'employment_rate',
      unit: '%'
    },
    {
      pattern: /(\d+\.?\d*)%?\s+(?:employed|in\s+jobs?|job\s+placement)/i,
      metric: 'employment_rate',
      unit: '%'
    },
    
    // Generic count
    {
      pattern: /total\s+(?:count|items?).*?:?\s*(\d+)/i,
      metric: 'total_count',
      unit: 'items'
    }
  ];

  /**
   * Extract all summary metrics from section content
   */
  extractSummaries(text: string, sectionType: string): ExtractedSummary[] {
    const summaries: ExtractedSummary[] = [];
    
    // Look for summary-like sections
    const summaryLines = text.split('\n').filter(line => 
      line.toLowerCase().includes('total') ||
      line.toLowerCase().includes('summary') ||
      line.toLowerCase().includes('overall') ||
      line.toLowerCase().includes('grand total')
    );
    
    // Try to extract values from summary lines
    summaryLines.forEach(line => {
      for (const patternDef of this.SUMMARY_PATTERNS) {
        const match = line.match(patternDef.pattern);
        
        if (match && match[1]) {
          const value = isNaN(Number(match[1])) ? match[1] : Number(match[1]);
          
          summaries.push({
            metric: patternDef.metric,
            value,
            unit: patternDef.unit,
            source: `Summary Section`,
            confidence: 0.95,
            rawText: line.trim()
          });
          
          break;  // Found a match, move to next line
        }
      }
    });
    
    return summaries;
  }

  /**
   * Get most relevant summary for a metric type
   */
  getBestSummary(
    summaries: ExtractedSummary[],
    metricType: string
  ): ExtractedSummary | null {
    return (
      summaries.find(s => s.metric === metricType) ||
      null
    );
  }
}

export const summaryExtractor = new SummaryExtractor();
```

---

## [NEW] Configuration: Document Formats

**File**: `lib/config/document-formats.ts` (200 LOC)

```typescript
export const QPRO_DOCUMENT_FORMATS = {
  ALUMNI_EMPLOYMENT: {
    headerPatterns: [
      /alumni\s+(?:employment|job\s+placement|graduate)/i,
      /employment\s+(?:rate|data|report|status)/i,
      /graduate\s+(?:employment|placement|outcomes?)/i,
      /where\s+are\s+(?:our\s+)?graduates?\s+(?:now|employed|working)/i,
      /alumni\s+(?:outcome|success|tracing)/i
    ],
    contentPatterns: [
      /employment\s+rate|placement\s+rate/i,
      /bs\s+(?:computer\s+science|information\s+technology|engineering|business)/i,
      /^\s*\d+\.?\d*\s*%/m,
      /program\s+|degree\s+/i
    ],
    expectedMetrics: ['employment_rate', 'number_employed', 'placement_count'],
    defaultKRAs: ['KRA 10', 'KRA 11', 'KRA 12'],
    confidence: 0.95
  },

  RESEARCH_OUTPUT: {
    headerPatterns: [
      /research\s+(?:project|projects?|outputs?|publications?|papers?)/i,
      /completed\s+research/i,
      /research\s+(?:output|achievement|accomplishment)/i,
      /publications?\s+and\s+research/i,
      /intellectual\s+property|research\s+dissemination/i
    ],
    contentPatterns: [
      /research\s+(?:project|paper|study|title)/i,
      /author|researcher/i,
      /journal|conference|publication/i,
      /abstract|methodology|findings/i
    ],
    expectedMetrics: ['paper_count', 'publication_count', 'research_output_count'],
    defaultKRAs: ['KRA 3', 'KRA 4', 'KRA 5'],
    confidence: 0.95
  },

  TRAINING_RECORDS: {
    headerPatterns: [
      /training\s+(?:report|records?|seminars?|workshops?|attendance|documentation)/i,
      /faculty\s+(?:training|development|capacity|upskilling)/i,
      /seminar\s+(?:attendance|participation|records?)/i,
      /professional\s+development\s+(?:activities|programs|record)/i,
      /training\s+and\s+development\s+report/i
    ],
    contentPatterns: [
      /attendee|participant|trainer/i,
      /training\s+(?:title|name|topic|program)|seminar|workshop/i,
      /date|month|year|duration/i,
      /total\s+no\.\s+of\s+(?:attendees|participants)/i,
      /institution|venue|location/i
    ],
    expectedMetrics: ['attendee_count', 'training_count', 'total_attendees', 'session_count'],
    defaultKRAs: ['KRA 11', 'KRA 13'],
    confidence: 0.95,
    hasTableFormat: true,
    allowMultiplePerDocument: true
  },

  HEALTH_WELLNESS: {
    headerPatterns: [
      /health|wellness|fitness|sports|athletic|recreation/i,
      /employee\s+wellness\s+program/i,
      /mental\s+health|physical\s+fitness/i
    ],
    contentPatterns: [
      /wellness\s+program|health\s+program|fitness\s+activity/i,
      /participant|attendee|member/i,
      /activity|program|event/i
    ],
    expectedMetrics: ['participant_count', 'activity_count', 'session_count'],
    defaultKRAs: ['KRA 13'],
    confidence: 0.90
  }
};

export type DocumentFormatType = keyof typeof QPRO_DOCUMENT_FORMATS;
```

---

## [NEW] Configuration: Activity-KRA Mapping

**File**: `lib/config/activity-kra-mapping.ts` (300 LOC)

```typescript
export const ACTIVITY_CLASSIFICATION_RULES = {
  // HUMAN RESOURCES & FACULTY DEVELOPMENT
  HR_TRAINING: {
    category: 'HR_DEVELOPMENT',
    primaryKRAs: ['KRA 11', 'KRA 13'],
    activityPatterns: [
      /training|seminar|workshop|course|certification|upskilling|professional\s+development/i
    ],
    excludePatterns: [
      /system.*training|infrastructure.*training|digital.*implementation/i
    ],
    subTypes: {
      FACULTY_TRAINING: {
        KRA: 'KRA 11',
        patterns: [
          /professional\s+development/i,
          /skills?\s+training|technical\s+training/i,
          /certification|credential/i,
          /faculty\s+development|staff\s+development/i
        ],
        keywords: ['professional', 'development', 'skills', 'technical', 'faculty'],
        confidence: 0.95
      },
      HEALTH_WELLNESS: {
        KRA: 'KRA 13',
        patterns: [
          /wellness|health|fitness|mental\s+health/i,
          /employee\s+wellness|health\s+program/i,
          /sports|recreation|athletic/i
        ],
        keywords: ['wellness', 'health', 'fitness', 'mental'],
        confidence: 0.95
      },
      ENGAGEMENT: {
        KRA: 'KRA 13',
        patterns: [
          /engagement|satisfaction|recognition|morale|retention/i,
          /employee\s+(?:engagement|satisfaction|survey)/i
        ],
        keywords: ['engagement', 'satisfaction', 'morale'],
        confidence: 0.90
      }
    }
  },

  // RESEARCH & INNOVATION
  RESEARCH: {
    category: 'RESEARCH',
    primaryKRAs: ['KRA 3', 'KRA 4', 'KRA 5'],
    activityPatterns: [
      /research|publication|paper|study|journal|research\s+project/i
    ],
    subTypes: {
      RESEARCH_PAPER: {
        KRA: 'KRA 3',
        patterns: [
          /research\s+(?:paper|output|publication)/i,
          /journal\s+article|conference\s+paper/i,
          /published\s+research/i
        ],
        keywords: ['research', 'paper', 'publication', 'journal'],
        confidence: 0.95
      },
      RESEARCH_COLLABORATION: {
        KRA: 'KRA 4',
        patterns: [
          /collaborative\s+research|research\s+partnership/i,
          /inter-institutional\s+research|university\s+collaboration/i
        ],
        keywords: ['collaboration', 'partnership', 'cooperation'],
        confidence: 0.90
      },
      INNOVATION: {
        KRA: 'KRA 5',
        patterns: [
          /innovation|patent|product\s+development|new\s+technology/i,
          /startup|entrepreneurship/i
        ],
        keywords: ['innovation', 'new', 'patent', 'invention'],
        confidence: 0.85
      }
    }
  },

  // STUDENT SUCCESS
  STUDENT_SUCCESS: {
    category: 'STUDENT_SUCCESS',
    primaryKRAs: ['KRA 10', 'KRA 11', 'KRA 12'],
    activityPatterns: [
      /alumni|employment|graduate|student\s+(?:achievement|success)|job\s+placement/i
    ],
    subTypes: {
      ALUMNI_EMPLOYMENT: {
        KRA: 'KRA 10',
        patterns: [
          /alumni\s+employment|employment\s+rate|graduate\s+placement/i,
          /alumni\s+outcome|alumni\s+tracking/i
        ],
        keywords: ['alumni', 'employment', 'graduate', 'placement'],
        confidence: 0.95
      },
      STUDENT_SERVICES: {
        KRA: 'KRA 11',
        patterns: [
          /student\s+services|counseling|student\s+support|advising/i
        ],
        keywords: ['student', 'services', 'support'],
        confidence: 0.90
      },
      STUDENT_ORGS: {
        KRA: 'KRA 12',
        patterns: [
          /student\s+(?:club|organization|association|activities?|council)/i
        ],
        keywords: ['student', 'club', 'organization', 'activity'],
        confidence: 0.85
      }
    }
  },

  // DIGITAL TRANSFORMATION
  DIGITAL: {
    category: 'DIGITAL_TRANSFORMATION',
    primaryKRAs: ['KRA 17'],
    activityPatterns: [
      /system|platform|infrastructure|implementation|deployment|digital\s+(?:system|tool|infrastructure|transformation)/i
    ],
    excludePatterns: [
      /training|workshop|seminar|course|learning/i
    ],
    confidence: 0.90
  }
};

/**
 * Classify an activity and return KRA assignment with reasoning
 */
export function classifyActivityByType(
  activityName: string,
  context?: string
): {
  kraId: string;
  confidence: number;
  reason: string;
  category: string;
} | null {
  const fullText = `${activityName} ${context || ''}`.toLowerCase();

  for (const [ruleKey, rule] of Object.entries(ACTIVITY_CLASSIFICATION_RULES)) {
    // Check if activity matches category pattern
    const matchesCategory = rule.activityPatterns.some(
      pattern => pattern.test(fullText)
    );

    if (!matchesCategory) continue;

    // Check if excluded
    if (rule.excludePatterns?.some(pattern => pattern.test(fullText))) {
      continue;
    }

    // Try sub-type matching
    if (rule.subTypes) {
      for (const [subTypeName, subType] of Object.entries(rule.subTypes)) {
        const matchesSubType = subType.patterns.some(
          pattern => pattern.test(fullText)
        );

        if (matchesSubType) {
          return {
            kraId: subType.KRA,
            confidence: subType.confidence,
            reason: `Matched to ${subTypeName} (${rule.category})`,
            category: rule.category
          };
        }
      }
    }

    // Fall back to primary KRA
    return {
      kraId: rule.primaryKRAs[0],
      confidence: rule.subTypes ? 0.80 : 0.85,
      reason: `Matched to ${rule.category}`,
      category: rule.category
    };
  }

  return null;
}
```

---

## [UPDATED] Enhanced LLM Prompt Section

**File**: `lib/services/analysis-engine-service.ts` (UPDATE promptTemplate)

```typescript
// In AnalysisEngineService constructor, update the prompt:

this.promptTemplate = PromptTemplate.fromTemplate(`
You are an expert strategic planning analyst for Laguna State Polytechnic University. 
Analyze a Quarterly Physical Report of Operations (QPRO) document against the university's strategic plan.

## Strategic Plan Context (Top 15 Most Relevant KRAs/Initiatives):
{strategic_context}

## QPRO Document Text:
{user_input}

## Document Section Information:
{section_info}

## CRITICAL - Multi-Report Document Processing:

This document may contain multiple distinct reports (Alumni, Research, Training, etc.).

### For Each Detected Section:

1. **Extract ALL Activities**:
   - For TRAINING TABLES: Create ONE ACTIVITY PER ROW (minimum)
   - For RESEARCH LISTS: Create ONE ACTIVITY PER ITEM
   - For EMPLOYMENT DATA: Create ONE ACTIVITY PER PROGRAM/METRIC
   - Do NOT group or aggregate at this stage

2. **Use Summary Metrics If Available**:
   - PRIORITY 1: Use "Total No. of X: Y" if found in document
   - PRIORITY 2: Use section subtotals
   - PRIORITY 3: Count rows only if no summary available
   - Always note the source (summary vs. counted)

3. **Example - Training Section**:
   - If document shows "Total No. of Attendees: 9" → USE 9 as reported
   - If document has 30 training rows → KEEP ALL 30 as separate activities
   - Create summary activity: {"name": "Training Programs Total", "reported": 9, "reportedSource": "summary"}

4. **Activity-to-KRA Mapping** (Use Priority Order):
   - STEP 1: Check if activity name matches any KRA Strategy exactly
   - STEP 2: Validate against KPI outputs/outcomes
   - STEP 3: Apply Type-Based Rules:
     * Training/Seminars/Workshops → KRA 11 or KRA 13 (NOT KRA 17)
     * Research/Publications → KRA 3, 4, 5
     * Alumni/Employment → KRA 10, 11, 12
     * Digital Systems/Implementation → KRA 17
     * Health/Wellness → KRA 13
   - STEP 4: Use semantic similarity as last resort

## Validation Before Output:

1. **No Duplicates**: If same activity appears multiple times, keep only one (highest confidence)
2. **All Rows Extracted**: Count training rows in input. If your output has fewer than input, recount
3. **Summary Used**: If document has "Total X: Y", confirm you used Y not your row count
4. **Type Validation**: Confirm training not in KRA 17, research in KRA 3/4/5, etc.

## Output Format:

Return ONLY valid JSON (no markdown, no code blocks):

{
  "activities": [
    {
      "name": "Activity name from document",
      "kraId": "KRA X",
      "initiativeId": "KRAX-KPI1",
      "reported": 1,
      "reportedSource": "row_count",    // NEW: "summary", "aggregate_header", or "row_count"
      "target": 10,
      "achievement": 10.0,
      "status": "MET",
      "confidence": 0.95,
      "authorizedStrategy": "Exact strategy text from Strategic Plan",
      "aiInsight": "Concise insight",
      "prescriptiveAnalysis": "Action-oriented recommendations"
    }
  ],
  "extractionMetadata": {    // NEW: Extraction details
    "sectionsDetected": ["ALUMNI_EMPLOYMENT", "RESEARCH_OUTPUT", "TRAINING_RECORDS"],
    "summariesFound": [
      {"metric": "total_attendees", "value": 9, "source": "summary_section"}
    ],
    "totalActivitiesExtracted": 36,
    "completeness": 1.0
  },
  "kras": [...],
  "alignment": "...",
  "opportunities": "...",
  "gaps": "...",
  "recommendations": "...",
  "overallAchievement": 72.3
}

Return ONLY the JSON object.
`);
```

---

## [UPDATED] Classification Logic Update

**File**: `lib/services/qpro-analysis-service.ts` (REPLACE validateAndFixActivityKRAMatches)

```typescript
import { classifyActivityByType } from '@/lib/config/activity-kra-mapping';

private validateAndFixActivityKRAMatches(activities: any[], strategicPlan: any): any[] {
  const correctedActivities = activities.map(activity => {
    const activityName = activity.name.toLowerCase();
    const description = (activity.description || '').toLowerCase();
    
    // Step 1: Try strategy matching first
    const strategyMatch = this.matchActivityToStrategy(
      activityName,
      strategicPlan
    );
    
    if (strategyMatch && strategyMatch.confidence >= 0.85) {
      return {
        ...activity,
        kraId: strategyMatch.kraId,
        confidence: strategyMatch.confidence,
        classificationReason: `Strategy match: "${strategyMatch.strategy}"`,
        classificationMethod: 'STRATEGY_MATCH'
      };
    }
    
    // Step 2: Type-based classification (using rules)
    const typeMatch = classifyActivityByType(activityName, description);
    
    if (typeMatch) {
      return {
        ...activity,
        kraId: typeMatch.kraId,
        confidence: typeMatch.confidence,
        classificationReason: typeMatch.reason,
        classificationMethod: 'TYPE_BASED_RULES'
      };
    }
    
    // Step 3: Fallback to semantic matching
    const semanticMatch = this.matchActivityBySemantic(
      activityName,
      strategicPlan
    );
    
    return {
      ...activity,
      kraId: semanticMatch.kraId,
      confidence: semanticMatch.confidence,
      classificationReason: `Semantic similarity: ${semanticMatch.description}`,
      classificationMethod: 'SEMANTIC_MATCH'
    };
  });
  
  // Log classification results
  console.log('[CLASSIFICATION SUMMARY]');
  const byMethod = {};
  correctedActivities.forEach(activity => {
    const method = activity.classificationMethod;
    byMethod[method] = (byMethod[method] || 0) + 1;
  });
  
  Object.entries(byMethod).forEach(([method, count]) => {
    console.log(`  ${method}: ${count} activities`);
  });
  
  return correctedActivities;
}

private matchActivityToStrategy(
  activityName: string,
  strategicPlan: any
): { kraId: string; strategy: string; confidence: number } | null {
  // Search all KRA strategies for keyword matches
  for (const kra of strategicPlan.kras || []) {
    for (const initiative of kra.initiatives || []) {
      for (const strategy of initiative.strategies || []) {
        const strategyLower = strategy.toLowerCase();
        
        // Calculate similarity
        const keywordsInActivity = activityName
          .split(/\s+/)
          .filter(w => w.length > 3);
        const keywordsInStrategy = strategyLower
          .split(/\s+/)
          .filter(w => w.length > 3);
        
        const matchCount = keywordsInActivity.filter(kw =>
          keywordsInStrategy.some(sw => sw.includes(kw) || kw.includes(sw))
        ).length;
        
        const similarity = matchCount / Math.max(keywordsInActivity.length, 1);
        
        if (similarity >= 0.6) {
          return {
            kraId: kra.kra_id,
            strategy,
            confidence: Math.min(0.95, 0.75 + similarity * 0.2)
          };
        }
      }
    }
  }
  
  return null;
}
```

---

## Testing Example

**File**: `__tests__/qpro-multi-report.test.ts` (excerpt)

```typescript
import { documentSectionDetector } from '@/lib/services/document-section-detector';
import { summaryExtractor } from '@/lib/services/summary-extractor';
import { analysisEngineService } from '@/lib/services/analysis-engine-service';
import fs from 'fs/promises';

describe('QPRO Multi-Report Document Processing', () => {
  let testFileBuffer: Buffer;

  beforeAll(async () => {
    testFileBuffer = await fs.readFile('test-data/three-reports.docx');
  });

  test('detects all 3 sections', () => {
    const text = `
      Alumni Employment Report
      Program: BS Computer Science
      Employment Rate: 16.36%
      
      Completed Research Projects
      1. IT Infrastructure Analysis
      2. Bawal Bastos App
      
      Training Attendance
      Total No. of Attendees: 9
      Introduction to AI | John Doe | Jan 2025
      Data Privacy | Jane Smith | Jan 2025
    `;
    
    const sections = documentSectionDetector.detectSections(text);
    
    expect(sections.length).toBeGreaterThanOrEqual(3);
    expect(sections.map(s => s.type)).toContain('ALUMNI_EMPLOYMENT');
    expect(sections.map(s => s.type)).toContain('RESEARCH_OUTPUT');
    expect(sections.map(s => s.type)).toContain('TRAINING_RECORDS');
  });

  test('extracts summary metrics', () => {
    const trainingSection = `
      Training Summary
      Total No. of Attendees: 9
      Total Sessions: 2
    `;
    
    const summaries = summaryExtractor.extractSummaries(
      trainingSection,
      'TRAINING_RECORDS'
    );
    
    expect(summaries.length).toBeGreaterThan(0);
    
    const attendeesSummary = summaries.find(s => s.metric === 'total_attendees');
    expect(attendeesSummary?.value).toBe(9);
    expect(attendeesSummary?.confidence).toBeGreaterThan(0.9);
  });

  test('extracts all training entries without sampling', async () => {
    const analysisResult = await analysisEngineService.processQPRO(
      testFileBuffer,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    const trainingActivities = analysisResult.activities.filter(
      a => a.kraId === 'KRA 11' || a.kraId === 'KRA 13'
    );
    
    expect(trainingActivities.length).toBeGreaterThanOrEqual(30);
  });

  test('uses summary for reported value', async () => {
    const analysisResult = await analysisEngineService.processQPRO(
      testFileBuffer,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    const summaryActivity = analysisResult.activities.find(
      a => a.reportedSource === 'summary'
    );
    
    expect(summaryActivity).toBeDefined();
    expect(summaryActivity?.reported).toBe(9);
  });

  test('classifies activities correctly', async () => {
    const analysisResult = await analysisEngineService.processQPRO(
      testFileBuffer,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    // Check alumni activities
    const alumniActivities = analysisResult.activities.filter(
      a => a.kraId === 'KRA 10'
    );
    expect(alumniActivities.length).toBeGreaterThan(0);
    
    // Check research activities
    const researchActivities = analysisResult.activities.filter(
      a => ['KRA 3', 'KRA 4', 'KRA 5'].includes(a.kraId)
    );
    expect(researchActivities.length).toBeGreaterThan(0);
    
    // Check no training in wrong KRAs
    const wrongTraining = analysisResult.activities.filter(
      a => a.name.toLowerCase().includes('training') && 
           a.kraId !== 'KRA 11' && 
           a.kraId !== 'KRA 13'
    );
    expect(wrongTraining.length).toBe(0);
  });
});
```

---

This provides concrete, ready-to-implement code for all major components of the fix.
