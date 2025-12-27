/**
 * KPI Type-Aware Analysis Logic
 * 
 * This module implements the "Type-Aware Analysis" pattern to solve the
 * "Unit of Measure Blindness" problem. The system must modify its prescriptive
 * logic based on the KPI_TYPE (count, rate, boolean, etc.) defined in the strategic plan.
 * 
 * Logic Matrix:
 * | KPI Type Group | Specific Types               | Interpretation       | Root Cause Focus                    | Prescriptive Action |
 * |----------------|------------------------------|----------------------|-------------------------------------|---------------------|
 * | Volume         | count                        | Quantity Deficit     | Pipeline, Funding, Frequency, Lag   | Scale Up            |
 * | Efficiency     | rate, percentage, ratio      | Quality/Conversion   | Curriculum, Training, Standards     | Optimize Quality    |
 * | Milestone      | boolean, status, milestone   | Project Delay        | Bureaucracy, Approvals, Resources   | Intervention        |
 * | Performance    | score, value                 | Satisfaction Deficit | User Experience, Facilities         | Root Cause Analysis |
 * | Text           | text                         | N/A                  | Qualitative Context                 | Summarize           |
 */

// KPI Type Categories
export type KpiTypeCategory = 'VOLUME' | 'EFFICIENCY' | 'MILESTONE' | 'PERFORMANCE' | 'TEXT' | 'UNKNOWN';

// Raw KPI types as they appear in strategic_plan.json
export type RawKpiType = 'count' | 'percentage' | 'rate' | 'ratio' | 'milestone' | 'boolean' | 'status' | 'score' | 'value' | 'text' | string;

/**
 * Maps a raw KPI type string to its category for analysis logic
 */
export function getKpiTypeCategory(kpiType: RawKpiType | undefined | null): KpiTypeCategory {
  if (!kpiType) return 'UNKNOWN';
  
  const normalized = String(kpiType).toLowerCase().trim();
  
  // Volume types - quantity-based metrics
  if (['count', 'low_count', 'high_count', 'number', 'quantity'].includes(normalized)) {
    return 'VOLUME';
  }
  
  // Efficiency types - rate/conversion metrics
  if (['rate', 'percentage', 'ratio', 'percent', '%'].includes(normalized)) {
    return 'EFFICIENCY';
  }
  
  // Milestone types - binary/status metrics
  if (['milestone', 'boolean', 'status', 'binary', 'yes/no', 'yes-no', 'achieved', 'completed'].includes(normalized)) {
    return 'MILESTONE';
  }
  
  // Performance types - score/satisfaction metrics
  if (['score', 'value', 'rating', 'index', 'satisfaction'].includes(normalized)) {
    return 'PERFORMANCE';
  }
  
  // Text types - qualitative metrics
  if (['text', 'narrative', 'description', 'qualitative'].includes(normalized)) {
    return 'TEXT';
  }
  
  return 'UNKNOWN';
}

/**
 * Gap interpretation based on KPI type category
 */
export interface GapInterpretation {
  category: KpiTypeCategory;
  gapType: string;
  rootCauseFocus: string[];
  actionArchetype: string;
  antiPattern: string | null; // What NOT to suggest
}

/**
 * Get the gap interpretation for a KPI type category
 */
export function getGapInterpretation(category: KpiTypeCategory): GapInterpretation {
  switch (category) {
    case 'VOLUME':
      return {
        category: 'VOLUME',
        gapType: 'Quantity Deficit',
        rootCauseFocus: [
          'Insufficient pipeline or production capacity',
          'Limited funding or resource allocation',
          'Low frequency of activities/events',
          'Reporting lag or data collection delays',
          'Staff/resource availability constraints'
        ],
        actionArchetype: 'Scale Up',
        antiPattern: null // Volume metrics can suggest scaling
      };
      
    case 'EFFICIENCY':
      return {
        category: 'EFFICIENCY',
        gapType: 'Quality/Conversion Deficit',
        rootCauseFocus: [
          'Curriculum relevance and alignment with industry needs',
          'Training quality and delivery effectiveness',
          'Difficulty of standards or assessments',
          'Retention policies and student support',
          'Industry partnership and placement programs'
        ],
        actionArchetype: 'Optimize Quality',
        antiPattern: 'Do NOT suggest "collecting more data" or "scaling data collection" - the data is likely correct, but performance is low'
      };
      
    case 'MILESTONE':
      return {
        category: 'MILESTONE',
        gapType: 'Project Delay',
        rootCauseFocus: [
          'Bureaucratic bottlenecks and approval delays',
          'Resource or budget availability issues',
          'Stakeholder coordination challenges',
          'Dependency on external approvals',
          'Change management resistance'
        ],
        actionArchetype: 'Intervention',
        antiPattern: 'Do NOT suggest incremental improvements - focus on unblocking specific delays'
      };
      
    case 'PERFORMANCE':
      return {
        category: 'PERFORMANCE',
        gapType: 'Satisfaction/Standard Deficit',
        rootCauseFocus: [
          'User experience and service delivery quality',
          'Facilities and infrastructure conditions',
          'Process efficiency and responsiveness',
          'Communication and feedback mechanisms',
          'Staff competency and service attitude'
        ],
        actionArchetype: 'Root Cause Analysis',
        antiPattern: 'Do NOT assume the issue without user feedback data - investigate surveys and feedback first'
      };
      
    case 'TEXT':
      return {
        category: 'TEXT',
        gapType: 'Qualitative Context',
        rootCauseFocus: [
          'Narrative completeness and clarity',
          'Key themes and patterns',
          'Sentiment and stakeholder perspectives'
        ],
        actionArchetype: 'Summarize',
        antiPattern: 'Do NOT apply numeric gap analysis to text-based metrics'
      };
      
    default:
      return {
        category: 'UNKNOWN',
        gapType: 'Standard Variance',
        rootCauseFocus: ['General performance review required'],
        actionArchetype: 'Standard Analysis',
        antiPattern: null
      };
  }
}

/**
 * Generate type-specific logic instruction for LLM prompts
 * This is the dynamic injection based on KPI type
 */
export function generateTypeSpecificLogicInstruction(kpiType: RawKpiType | undefined | null): string {
  const category = getKpiTypeCategory(kpiType);
  const interpretation = getGapInterpretation(category);
  
  const rootCauseList = interpretation.rootCauseFocus
    .map((cause, i) => `   ${i + 1}. ${cause}`)
    .join('\n');
  
  const antiPatternWarning = interpretation.antiPattern 
    ? `\n⚠️ WARNING: ${interpretation.antiPattern}`
    : '';
  
  switch (category) {
    case 'VOLUME':
      return `
[LOGIC RULE: VOLUME METRIC]
Since this KPI is a COUNT/VOLUME type:
1. Interpret any gap as a QUANTITY DEFICIT - not enough outputs are being produced.
2. Potential root causes to investigate:
${rootCauseList}
3. Recommended action archetype: "${interpretation.actionArchetype}"
   - Suggest increasing frequency of activities
   - Suggest allocating more resources/funding
   - Suggest batch-processing or fixing reporting backlogs
   - Suggest hiring/training more staff if capacity is limited
${antiPatternWarning}
`;
      
    case 'EFFICIENCY':
      return `
[LOGIC RULE: EFFICIENCY/QUALITY METRIC]
Since this KPI is a RATE/PERCENTAGE type:
1. Interpret any gap as a QUALITY/CONVERSION DEFICIT - outcomes are poor despite activity.
   Example: If employment rate is low, students ARE graduating but are NOT getting hired.
   Example: If passing rate is low, students ARE taking exams but are NOT passing.
2. Potential root causes to investigate:
${rootCauseList}
3. Recommended action archetype: "${interpretation.actionArchetype}"
   - Focus on curriculum review and industry alignment
   - Suggest skills training and competency enhancement
   - Recommend retention and support programs
   - Consider industry partnership improvements
${antiPatternWarning}

CRITICAL: A low percentage does NOT mean "reporting problems" or "data collection issues."
The data is likely correct - the ACTUAL PERFORMANCE is the problem.
`;
      
    case 'MILESTONE':
      return `
[LOGIC RULE: MILESTONE/STATUS METRIC]
Since this KPI is a MILESTONE/BOOLEAN type:
1. Interpret any gap as a PROJECT DELAY - something is blocked or incomplete.
2. Potential root causes to investigate:
${rootCauseList}
3. Recommended action archetype: "${interpretation.actionArchetype}"
   - Suggest fast-tracking approvals
   - Recommend task force assignment
   - Suggest budget/resource reallocation
   - Consider executive intervention for critical blockers
${antiPatternWarning}
`;
      
    case 'PERFORMANCE':
      return `
[LOGIC RULE: PERFORMANCE/SCORE METRIC]
Since this KPI is a SCORE/VALUE type:
1. Interpret any gap as a SATISFACTION/STANDARD DEFICIT - quality perception is low.
2. Potential root causes to investigate:
${rootCauseList}
3. Recommended action archetype: "${interpretation.actionArchetype}"
   - Conduct user surveys and feedback analysis
   - Review service delivery processes
   - Assess facilities and infrastructure
   - Implement improvement based on feedback data
${antiPatternWarning}
`;
      
    case 'TEXT':
      return `
[LOGIC RULE: TEXT/QUALITATIVE METRIC]
Since this KPI is a TEXT/NARRATIVE type:
1. This metric requires qualitative analysis, not numeric gap calculation.
2. Focus areas:
${rootCauseList}
3. Recommended action archetype: "${interpretation.actionArchetype}"
   - Extract key themes and patterns
   - Identify sentiment and stakeholder perspectives
   - Provide narrative summary
${antiPatternWarning}
`;
      
    default:
      return `
[LOGIC RULE: STANDARD ANALYSIS]
KPI type not clearly defined. Apply standard variance analysis:
1. Compare actual vs target values
2. Identify the magnitude of the gap
3. Provide general improvement recommendations based on context
`;
  }
}

/**
 * Generate type-specific prescriptive recommendations based on gap analysis
 */
export interface PrescriptiveRecommendation {
  title: string;
  issue: string;
  action: string;
  nextStep: string;
  kpiType: KpiTypeCategory;
}

/**
 * Generate default prescriptive recommendations based on KPI type and performance
 */
export function generateTypeAwareRecommendation(
  kpiType: RawKpiType | undefined | null,
  kpiName: string,
  actualValue: number,
  targetValue: number,
  achievementPercent: number
): PrescriptiveRecommendation {
  const category = getKpiTypeCategory(kpiType);
  const interpretation = getGapInterpretation(category);
  const gap = targetValue - actualValue;
  
  switch (category) {
    case 'VOLUME':
      return {
        title: 'Scale Up Production Volume',
        issue: `${kpiName} shows a quantity deficit: ${actualValue} achieved vs ${targetValue} target (${achievementPercent.toFixed(1)}% achievement). Need ${gap} more outputs.`,
        action: 'Increase activity frequency, allocate additional resources, and address any reporting backlogs. Consider batch-processing pending submissions.',
        nextStep: `Identify immediate actions to produce ${Math.ceil(gap * 0.5)} additional outputs within the next reporting period.`,
        kpiType: category
      };
      
    case 'EFFICIENCY':
      return {
        title: 'Optimize Quality and Conversion',
        issue: `${kpiName} indicates a conversion/quality gap: ${actualValue.toFixed(1)}% achieved vs ${targetValue}% target. This suggests outcome quality issues, NOT reporting problems.`,
        action: 'Review curriculum alignment with industry needs, enhance skills training programs, strengthen industry partnerships, and implement retention support mechanisms.',
        nextStep: 'Conduct a curriculum review meeting with industry partners within 30 days to identify skills gaps.',
        kpiType: category
      };
      
    case 'MILESTONE':
      return {
        title: 'Fast-Track Project Completion',
        issue: `${kpiName} milestone is incomplete or delayed. This requires administrative intervention to unblock progress.`,
        action: 'Identify the specific blocker (approvals, resources, dependencies), escalate to appropriate authority, and create a fast-track action plan.',
        nextStep: 'Schedule a project review meeting within 7 days to identify and address all blockers.',
        kpiType: category
      };
      
    case 'PERFORMANCE':
      return {
        title: 'Investigate User Feedback',
        issue: `${kpiName} shows satisfaction/standard deficit: ${actualValue} vs ${targetValue} target. Root cause analysis needed before prescribing solutions.`,
        action: 'Gather and analyze user feedback, conduct surveys if needed, review service delivery processes, and implement targeted improvements.',
        nextStep: 'Review recent feedback data and conduct focus group sessions within 14 days.',
        kpiType: category
      };
      
    case 'TEXT':
      return {
        title: 'Qualitative Assessment',
        issue: `${kpiName} requires qualitative evaluation rather than numeric gap analysis.`,
        action: 'Extract key themes, identify patterns, and summarize stakeholder perspectives.',
        nextStep: 'Complete narrative analysis and summary within the current reporting period.',
        kpiType: category
      };
      
    default:
      return {
        title: 'Address Performance Gap',
        issue: `${kpiName} is at ${achievementPercent.toFixed(1)}% achievement (${actualValue} vs ${targetValue} target).`,
        action: 'Review the specific factors contributing to the gap and develop a targeted improvement plan.',
        nextStep: 'Assign ownership and create an action plan within 14 days.',
        kpiType: category
      };
  }
}

/**
 * Validate that a prescriptive analysis doesn't contain anti-patterns for its KPI type
 */
export function validatePrescriptiveAnalysis(
  analysis: string,
  kpiType: RawKpiType | undefined | null
): { isValid: boolean; warnings: string[] } {
  const category = getKpiTypeCategory(kpiType);
  const warnings: string[] = [];
  const analysisLower = analysis.toLowerCase();
  
  if (category === 'EFFICIENCY') {
    // Check for volume-type recommendations being applied to efficiency metrics
    const volumePatterns = [
      /reporting\s+(bottleneck|backlog|delay|lag)/i,
      /batch\s+(collection|processing|data)/i,
      /collect\s+more\s+(data|lists|reports)/i,
      /scale\s+up\s+(data|collection|reporting)/i,
      /data\s+collection\s+(delay|issue|problem)/i,
      /increase\s+(data|reporting)\s+frequency/i
    ];
    
    for (const pattern of volumePatterns) {
      if (pattern.test(analysis)) {
        warnings.push(
          `Anti-pattern detected: Suggesting data collection/reporting fixes for an EFFICIENCY metric. ` +
          `For rate/percentage KPIs, focus on quality improvement (curriculum, training, standards), not data volume.`
        );
        break;
      }
    }
  }
  
  if (category === 'MILESTONE') {
    // Check for incremental improvement suggestions instead of intervention
    const incrementalPatterns = [
      /gradual(ly)?\s+improve/i,
      /incremental\s+(improvement|progress|change)/i,
      /slow(ly)?\s+increase/i
    ];
    
    for (const pattern of incrementalPatterns) {
      if (pattern.test(analysis)) {
        warnings.push(
          `Anti-pattern detected: Suggesting incremental improvements for a MILESTONE metric. ` +
          `For milestone/status KPIs, focus on unblocking specific delays through intervention.`
        );
        break;
      }
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}

/**
 * Get a human-readable description of the KPI type for display
 */
export function getKpiTypeDescription(kpiType: RawKpiType | undefined | null): string {
  const category = getKpiTypeCategory(kpiType);
  const interpretation = getGapInterpretation(category);
  
  return `${category} (${interpretation.gapType}) - ${interpretation.actionArchetype}`;
}

/**
 * Build the complete dynamic prompt section for type-aware prescriptive analysis
 */
export function buildTypeAwarePromptContext(
  kpiType: RawKpiType | undefined | null,
  kpiName: string,
  kraName: string,
  targetValue: number | string,
  actualValue: number | string,
  gap: number | string
): string {
  const category = getKpiTypeCategory(kpiType);
  const logicInstruction = generateTypeSpecificLogicInstruction(kpiType);
  
  return `
[DATA CONTEXT]
KPI Name: ${kpiName}
KRA: ${kraName}
KPI Type: ${kpiType || 'Unknown'} (Category: ${category})
Target: ${targetValue}
Actual: ${actualValue}
Gap: ${gap}

${logicInstruction}
`;
}
