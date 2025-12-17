/**
 * SummaryExtractor Service
 * 
 * Extracts summary metrics and aggregate values from documents
 * (e.g., "Total No. of Attendees: 9") to use for achievement calculations
 * instead of counting extracted rows.
 * 
 * Solves Problems #2 and #3:
 * - Problem #2: Incomplete Data Extraction (system should use summary totals)
 * - Problem #3: Wrong Achievement Calculations (prioritize summary metrics)
 */

export interface ExtractedSummary {
  metricType: 'COUNT' | 'TOTAL' | 'PERCENTAGE' | 'FINANCIAL' | 'MILESTONE' | 'UNKNOWN';
  metricName: string;
  value: number | string;
  unit?: string;
  confidence: number; // 0-1 confidence score
  rawText: string; // Original text where metric was found
}

export interface SummaryExtractionResult {
  summaries: ExtractedSummary[];
  totalExtracted: number;
  prioritizedValue?: {
    metricName: string;
    value: number | string;
    metricType: string;
    confidence: number;
  };
  extractionMetadata: {
    textLength: number;
    metricsFound: number;
    highConfidenceCount: number;
    recommendedTargetValue?: number;
  };
}

class SummaryExtractor {
  /**
   * Patterns for extracting summary metrics
   * Organized by priority and metric type
   */
  private readonly summaryPatterns = {
    // Highest priority: "Total No. of X" patterns
    totalMetrics: [
      {
        pattern: /total\s+(?:no\.|number)\s+(?:of\s+)?([a-z\s]+)[\s:]*(\d+)/gi,
        metricType: 'TOTAL',
        confidence: 0.98,
        valueGroup: 2,
      },
      {
        pattern: /total\s+([a-z\s]+)[\s:]*(\d+)/gi,
        metricType: 'TOTAL',
        confidence: 0.95,
        valueGroup: 2,
      },
      {
        pattern: /(?:total|sum|cumulative)\s+([a-z\s]+)[\s:]*(\d+)/gi,
        metricType: 'COUNT',
        confidence: 0.92,
        valueGroup: 2,
      },
    ],

    // Attendance/participant metrics
    participantMetrics: [
      {
        pattern: /attendee|participant|trained|beneficiary[\s\w]*[\s:]*(\d+)/gi,
        metricType: 'COUNT',
        confidence: 0.90,
        valueGroup: 1,
      },
      {
        pattern: /(?:no\.|number)\s+of\s+(?:attendee|participant|trainee|beneficiary)[\s:]*(\d+)/gi,
        metricType: 'COUNT',
        confidence: 0.93,
        valueGroup: 1,
      },
      {
        pattern: /attended|participated[\s\w]*:\s*(\d+)/gi,
        metricType: 'COUNT',
        confidence: 0.88,
        valueGroup: 1,
      },
    ],

    // Financial metrics
    financialMetrics: [
      {
        pattern: /(?:budget|cost|amount|fund)[\s\w]*[\s:]*(?:php|₱)?[\s]*([0-9,\.]+)/gi,
        metricType: 'FINANCIAL',
        confidence: 0.90,
        valueGroup: 1,
      },
      {
        pattern: /(?:peso|php)[\s]*([0-9,\.]+)/gi,
        metricType: 'FINANCIAL',
        confidence: 0.92,
        valueGroup: 1,
      },
    ],

    // Percentage metrics
    percentageMetrics: [
      {
        pattern: /(\d+(?:\.\d+)?)\s*%/g,
        metricType: 'PERCENTAGE',
        confidence: 0.85,
        valueGroup: 1,
      },
      {
        pattern: /(?:completion|success|achievement)\s+rate[\s:]*(\d+(?:\.\d+)?)\s*%/gi,
        metricType: 'PERCENTAGE',
        confidence: 0.92,
        valueGroup: 1,
      },
    ],

    // Milestone metrics (yes/no, completed, achieved)
    milestoneMetrics: [
      {
        pattern: /(?:completed|achieved|accomplished|finished|done)[\s\w]*[:=]\s*(?:yes|true|1|done|completed)/gi,
        metricType: 'MILESTONE',
        confidence: 0.90,
        valueGroup: 0,
      },
    ],
  };

  /**
   * Extracts all summary metrics from text
   */
  async extractSummaries(text: string): Promise<SummaryExtractionResult> {
    if (!text || text.trim().length === 0) {
      return {
        summaries: [],
        totalExtracted: 0,
        extractionMetadata: {
          textLength: 0,
          metricsFound: 0,
          highConfidenceCount: 0,
        },
      };
    }

    const summaries: ExtractedSummary[] = [];
    const seenMetrics = new Set<string>();

    // Extract from each pattern category
    for (const [categoryName, patterns] of Object.entries(this.summaryPatterns)) {
      for (const patternObj of patterns) {
        let match;
        const regex = new RegExp(patternObj.pattern.source, 'gi');

        while ((match = regex.exec(text)) !== null) {
          // Extract value from the appropriate group
          const rawValue = patternObj.valueGroup === 0 ? 1 : match[patternObj.valueGroup];
          
          // Skip if value doesn't exist
          if (rawValue === undefined) {
            continue;
          }
          
          const value = String(rawValue);
          const metricName = match[1] || categoryName;
          const metricKey = `${patternObj.metricType}:${metricName}:${value}`;

          // Skip duplicates
          if (seenMetrics.has(metricKey)) {
            continue;
          }
          seenMetrics.add(metricKey);

          const extractedSummary: ExtractedSummary = {
            metricType: patternObj.metricType as ExtractedSummary['metricType'],
            metricName: this.normalizeName(metricName),
            value: this.parseValue(value, patternObj.metricType),
            confidence: patternObj.confidence,
            rawText: match[0],
            unit: this.extractUnit(match[0], patternObj.metricType),
          };

          summaries.push(extractedSummary);
        }
      }
    }

    // Remove near-duplicates and sort by confidence
    const deduplicated = this.deduplicateSummaries(summaries);
    deduplicated.sort((a, b) => b.confidence - a.confidence);

    // Identify prioritized/recommended value
    let prioritizedValue: SummaryExtractionResult['prioritizedValue'] | undefined;
    if (deduplicated.length > 0) {
      // Priority: TOTAL > COUNT > PERCENTAGE > FINANCIAL > MILESTONE
      const priorityOrder = ['TOTAL', 'COUNT', 'PERCENTAGE', 'FINANCIAL', 'MILESTONE'];
      const topMetric = deduplicated.sort((a, b) => {
        const priorityDiff =
          priorityOrder.indexOf(a.metricType) - priorityOrder.indexOf(b.metricType);
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      })[0];

      prioritizedValue = {
        metricName: topMetric.metricName,
        value: topMetric.value,
        metricType: topMetric.metricType,
        confidence: topMetric.confidence,
      };
    }

    const highConfidenceCount = deduplicated.filter((s) => s.confidence >= 0.9).length;

    return {
      summaries: deduplicated,
      totalExtracted: deduplicated.length,
      prioritizedValue,
      extractionMetadata: {
        textLength: text.length,
        metricsFound: deduplicated.length,
        highConfidenceCount,
        recommendedTargetValue:
          prioritizedValue && typeof prioritizedValue.value === 'number'
            ? prioritizedValue.value
            : undefined,
      },
    };
  }

  /**
   * Extracts summary metrics from a specific section
   */
  async extractFromSection(sectionContent: string, sectionType: string): Promise<SummaryExtractionResult> {
    const result = await this.extractSummaries(sectionContent);

    // Filter metrics relevant to this section type
    const contextualSummaries = result.summaries.filter((summary) => {
      return this.isRelevantToSection(summary.metricName, sectionType);
    });

    return {
      summaries: contextualSummaries,
      totalExtracted: contextualSummaries.length,
      prioritizedValue: contextualSummaries[0]
        ? {
            metricName: contextualSummaries[0].metricName,
            value: contextualSummaries[0].value,
            metricType: contextualSummaries[0].metricType,
            confidence: contextualSummaries[0].confidence,
          }
        : undefined,
      extractionMetadata: {
        textLength: sectionContent.length,
        metricsFound: contextualSummaries.length,
        highConfidenceCount: contextualSummaries.filter((s) => s.confidence >= 0.9).length,
        recommendedTargetValue:
          contextualSummaries[0] && typeof contextualSummaries[0].value === 'number'
            ? contextualSummaries[0].value
            : undefined,
      },
    };
  }

  /**
   * Normalizes metric names to standard format
   */
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/^(of|no\.|number)\s+/i, '')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Parses value to appropriate type
   */
  private parseValue(value: string, metricType: string): number | string {
    if (metricType === 'FINANCIAL') {
      // Remove currency symbols and commas
      const cleaned = value.replace(/[^0-9.]/g, '');
      return parseFloat(cleaned) || value;
    }

    if (metricType === 'PERCENTAGE') {
      return parseFloat(value) || 0;
    }

    if (metricType === 'COUNT' || metricType === 'TOTAL') {
      // Remove commas and parse as number
      const cleaned = value.replace(/,/g, '');
      return parseInt(cleaned, 10) || 0;
    }

    if (metricType === 'MILESTONE') {
      return 1; // Milestone achieved = 1
    }

    return value;
  }

  /**
   * Extracts unit from metric text
   */
  private extractUnit(text: string, metricType: string): string | undefined {
    if (metricType === 'FINANCIAL') {
      if (text.match(/php|₱/i)) return 'PHP';
      if (text.match(/peso/i)) return 'PHP';
    }

    if (metricType === 'PERCENTAGE') {
      return '%';
    }

    if (metricType === 'COUNT' || metricType === 'TOTAL') {
      const unitMatch = text.match(/(?:unit|person|participant|attendee|session)/i);
      if (unitMatch) return unitMatch[0];
    }

    return undefined;
  }

  /**
   * Removes near-duplicate summaries
   */
  private deduplicateSummaries(summaries: ExtractedSummary[]): ExtractedSummary[] {
    const seen = new Map<string, ExtractedSummary>();

    for (const summary of summaries) {
      const key = `${summary.metricType}:${summary.metricName}`;
      
      if (!seen.has(key)) {
        seen.set(key, summary);
      } else {
        // Keep the one with higher confidence
        const existing = seen.get(key)!;
        if (summary.confidence > existing.confidence) {
          seen.set(key, summary);
        }
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Checks if metric is relevant to section type
   */
  private isRelevantToSection(metricName: string, sectionType: string): boolean {
    const relevanceMap: { [key: string]: RegExp } = {
      TRAINING: /attendee|participant|trained|person|session/i,
      ALUMNI_EMPLOYMENT: /employed|placement|graduate|alumni|job/i,
      RESEARCH: /publication|paper|study|research|output/i,
      COMMUNITY_ENGAGEMENT: /beneficiary|participant|community|served|assisted/i,
    };

    const pattern = relevanceMap[sectionType];
    return !pattern || pattern.test(metricName);
  }

  /**
   * Generates extraction summary for logging/debugging
   */
  generateExtractionSummary(result: SummaryExtractionResult): string {
    const lines = [
      `Total Metrics Extracted: ${result.totalExtracted}`,
      `High Confidence (≥90%): ${result.extractionMetadata.highConfidenceCount}`,
      `Document Length: ${result.extractionMetadata.textLength} characters`,
      '',
      'Extracted Summaries:',
    ];

    for (const summary of result.summaries) {
      lines.push(
        `  - ${summary.metricType}: ${summary.metricName} = ${summary.value}${summary.unit ? ' ' + summary.unit : ''} (${(summary.confidence * 100).toFixed(0)}% confidence)`
      );
    }

    if (result.prioritizedValue) {
      lines.push('');
      lines.push(
        `Recommended Target Value: ${result.prioritizedValue.value} (${result.prioritizedValue.metricType})`
      );
    }

    return lines.join('\n');
  }
}

// Export singleton instance
export const summaryExtractor = new SummaryExtractor();
export default summaryExtractor;
