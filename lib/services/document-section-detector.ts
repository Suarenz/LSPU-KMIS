/**
 * DocumentSectionDetector Service
 * 
 * Identifies and extracts document sections (e.g., Alumni Employment, Research Projects, Training)
 * before text extraction to provide context for LLM analysis.
 * 
 * Solves Problem #1: Missing Document Sections
 * - Detects document structure before processing
 * - Provides section boundaries to LLM
 * - Enables targeted extraction per section
 */

export interface DocumentSection {
  type: 'TRAINING' | 'ALUMNI_EMPLOYMENT' | 'RESEARCH' | 'COMMUNITY_ENGAGEMENT' | 'NARRATIVE' | 'UNKNOWN';
  title: string;
  startIndex: number;
  endIndex: number;
  content: string;
  confidence: number; // 0-1 confidence score for section type detection
}

export interface SectionDetectionResult {
  sections: DocumentSection[];
  documentType: 'TABLE' | 'NARRATIVE' | 'MIXED' | 'UNSTRUCTURED';
  totalSections: number;
  analysisMetadata: {
    textLength: number;
    detectionConfidence: number;
    sectionsDetected: string[];
  };
}

class DocumentSectionDetector {
  /**
   * Section patterns organized by type with priority ordering
   * Higher priority patterns are checked first
   */
  private readonly sectionPatterns = {
    TRAINING: [
      // Primary patterns - highest confidence
      { pattern: /(?:training|seminar|workshop|conference)[\s\w]*(?:report|accomplished)?(?:\n|:|$)/i, priority: 1, confidence: 0.95 },
      { pattern: /training.*table|training.*entries/i, priority: 1, confidence: 0.95 },
      { pattern: /^(faculty|staff)?\s*training\s+(report|activities)?/im, priority: 1, confidence: 0.90 },
      
      // Secondary patterns
      { pattern: /conducted\s+(training|workshop|seminar)/i, priority: 2, confidence: 0.85 },
      { pattern: /participants?\s*:.*\d+|attendee|trained/i, priority: 2, confidence: 0.80 },
      { pattern: /introduction\s+to|orientation|skill\s+development/i, priority: 2, confidence: 0.75 },
    ],
    
    ALUMNI_EMPLOYMENT: [
      // Primary patterns
      { pattern: /alumni\s+(employment|tracking|survey|profile|database)/i, priority: 1, confidence: 0.98 },
      { pattern: /graduate.*employment|employment.*graduate/i, priority: 1, confidence: 0.95 },
      { pattern: /alumni\s+(?:activities|report|data)/i, priority: 1, confidence: 0.92 },
      
      // Secondary patterns
      { pattern: /employed|placement|job\s+placement|career/i, priority: 2, confidence: 0.80 },
      { pattern: /alumni|graduate\s+tracking/i, priority: 2, confidence: 0.78 },
    ],
    
    RESEARCH: [
      // Primary patterns
      { pattern: /research\s+(output|project|publication|activity|paper|study)/i, priority: 1, confidence: 0.97 },
      { pattern: /published|publication|journal.*article/i, priority: 1, confidence: 0.95 },
      { pattern: /research\s+(?:accomplishment|report|result)/i, priority: 1, confidence: 0.93 },
      
      // Secondary patterns
      { pattern: /study|investigation|scholarly\s+work/i, priority: 2, confidence: 0.75 },
      { pattern: /conference\s+paper|research\s+grant/i, priority: 2, confidence: 0.85 },
    ],
    
    COMMUNITY_ENGAGEMENT: [
      // Primary patterns
      { pattern: /extension|outreach|community\s+(service|program|engagement)/i, priority: 1, confidence: 0.96 },
      { pattern: /community.*service|outreach.*program/i, priority: 1, confidence: 0.94 },
      { pattern: /livelihood|skills?\s+training.*community/i, priority: 1, confidence: 0.92 },
      
      // Secondary patterns
      { pattern: /beneficiary|assisted|served.*community/i, priority: 2, confidence: 0.80 },
      { pattern: /program.*community|community.*initiative/i, priority: 2, confidence: 0.78 },
    ],
  };

  /**
   * Detects document format by analyzing structural patterns
   */
  private detectDocumentType(text: string): 'TABLE' | 'NARRATIVE' | 'MIXED' | 'UNSTRUCTURED' {
    // Count table indicators
    const tableIndicators = (text.match(/\t|\|/g) || []).length;
    const lineBreaks = (text.match(/\n/g) || []).length;
    const tableRatio = tableIndicators / Math.max(lineBreaks, 1);

    // Count narrative indicators
    const sentences = (text.match(/\.\s+[A-Z]/g) || []).length;
    const paragraphs = (text.match(/\n\n+/g) || []).length;

    // Determine type based on ratios
    if (tableRatio > 0.3) {
      return 'TABLE';
    } else if (sentences > 5 && paragraphs > 2) {
      return 'NARRATIVE';
    } else if (tableRatio > 0.1 && sentences > 3) {
      return 'MIXED';
    } else {
      return 'UNSTRUCTURED';
    }
  }

  /**
   * Identifies section boundaries using pattern matching
   */
  private identifySectionBoundaries(
    text: string
  ): Array<{ startIndex: number; endIndex: number; title: string; type: string }> {
    const boundaries: Array<{
      startIndex: number;
      endIndex: number;
      title: string;
      type: string;
    }> = [];

    // Search for each section type
    for (const [sectionType, patterns] of Object.entries(this.sectionPatterns)) {
      for (const { pattern } of patterns) {
        let match;
        const regex = new RegExp(pattern.source, 'gi');

        while ((match = regex.exec(text)) !== null) {
          const startIndex = match.index;
          
          // Find next section boundary or end of text
          let endIndex = text.length;
          const nextSectionMatch = this.findNextSectionBoundary(text, startIndex + match[0].length);
          if (nextSectionMatch) {
            endIndex = nextSectionMatch;
          }

          boundaries.push({
            startIndex,
            endIndex,
            title: match[0].trim(),
            type: sectionType,
          });
        }
      }
    }

    // Remove overlapping boundaries and sort by start index
    return this.deduplicateBoundaries(boundaries).sort((a, b) => a.startIndex - b.startIndex);
  }

  /**
   * Finds the next section boundary by looking for section headers
   */
  private findNextSectionBoundary(text: string, startFrom: number): number | null {
    const headerPattern = /\n[A-Z][A-Z\s:]+\n/g;
    let match;

    while ((match = headerPattern.exec(text)) !== null) {
      if (match.index > startFrom) {
        return match.index;
      }
    }

    return null;
  }

  /**
   * Removes overlapping boundaries, keeping the one with higher priority
   */
  private deduplicateBoundaries(
    boundaries: Array<{ startIndex: number; endIndex: number; title: string; type: string }>
  ): Array<{ startIndex: number; endIndex: number; title: string; type: string }> {
    const sorted = boundaries.sort((a, b) => {
      // Sort by start index, then by span size
      if (a.startIndex !== b.startIndex) {
        return a.startIndex - b.startIndex;
      }
      return a.endIndex - b.endIndex;
    });

    const deduplicated: Array<{ startIndex: number; endIndex: number; title: string; type: string }> = [];
    for (const boundary of sorted) {
      const overlaps = deduplicated.some(
        (b) => boundary.startIndex >= b.startIndex && boundary.startIndex < b.endIndex
      );
      if (!overlaps) {
        deduplicated.push(boundary);
      }
    }

    return deduplicated;
  }

  /**
   * Calculates confidence score for section type detection
   */
  private calculateConfidence(content: string, sectionType: keyof typeof this.sectionPatterns): number {
    const patterns = this.sectionPatterns[sectionType];
    let maxConfidence = 0;
    let matchCount = 0;

    for (const { pattern, confidence } of patterns) {
      if (pattern.test(content)) {
        matchCount++;
        maxConfidence = Math.max(maxConfidence, confidence);
      }
    }

    // Boost confidence if multiple patterns match
    const confidenceBoost = Math.min(matchCount * 0.05, 0.1);
    return Math.min(maxConfidence + confidenceBoost, 1.0);
  }

  /**
   * Main method: Detects all sections in a document
   */
  async detectSections(text: string): Promise<SectionDetectionResult> {
    if (!text || text.trim().length === 0) {
      return {
        sections: [],
        documentType: 'UNSTRUCTURED',
        totalSections: 0,
        analysisMetadata: {
          textLength: 0,
          detectionConfidence: 0,
          sectionsDetected: [],
        },
      };
    }

    // Detect document type
    const documentType = this.detectDocumentType(text);

    // Identify section boundaries
    const boundaries = this.identifySectionBoundaries(text);

    // Extract sections with content
    const sections: DocumentSection[] = boundaries.map((boundary) => ({
      type: this.mapSectionType(boundary.type),
      title: boundary.title,
      startIndex: boundary.startIndex,
      endIndex: boundary.endIndex,
      content: text.substring(boundary.startIndex, boundary.endIndex),
      confidence: this.calculateConfidence(text.substring(boundary.startIndex, boundary.endIndex), boundary.type as keyof typeof this.sectionPatterns),
    }));

    // Calculate overall detection confidence
    const overallConfidence =
      sections.length > 0
        ? sections.reduce((sum, s) => sum + s.confidence, 0) / sections.length
        : 0;

    return {
      sections,
      documentType,
      totalSections: sections.length,
      analysisMetadata: {
        textLength: text.length,
        detectionConfidence: overallConfidence,
        sectionsDetected: [...new Set(sections.map((s) => s.type))],
      },
    };
  }

  /**
   * Maps section type string to enum value
   */
  private mapSectionType(
    type: string
  ): 'TRAINING' | 'ALUMNI_EMPLOYMENT' | 'RESEARCH' | 'COMMUNITY_ENGAGEMENT' | 'NARRATIVE' | 'UNKNOWN' {
    const typeMap: {
      [key: string]: 'TRAINING' | 'ALUMNI_EMPLOYMENT' | 'RESEARCH' | 'COMMUNITY_ENGAGEMENT' | 'NARRATIVE' | 'UNKNOWN';
    } = {
      TRAINING: 'TRAINING',
      ALUMNI_EMPLOYMENT: 'ALUMNI_EMPLOYMENT',
      RESEARCH: 'RESEARCH',
      COMMUNITY_ENGAGEMENT: 'COMMUNITY_ENGAGEMENT',
    };

    return typeMap[type] || 'UNKNOWN';
  }

  /**
   * Extracts specific section by type
   */
  getSectionByType(
    sections: DocumentSection[],
    type: DocumentSection['type']
  ): DocumentSection | undefined {
    return sections.find((s) => s.type === type);
  }

  /**
   * Extracts all sections of a specific type
   */
  getSectionsByType(
    sections: DocumentSection[],
    type: DocumentSection['type']
  ): DocumentSection[] {
    return sections.filter((s) => s.type === type);
  }

  /**
   * Generates section summary for logging/debugging
   */
  generateSectionSummary(result: SectionDetectionResult): string {
    const lines = [
      `Document Type: ${result.documentType}`,
      `Total Sections Detected: ${result.totalSections}`,
      `Overall Detection Confidence: ${(result.analysisMetadata.detectionConfidence * 100).toFixed(1)}%`,
      `Document Length: ${result.analysisMetadata.textLength} characters`,
      '',
      'Sections Found:',
    ];

    for (const section of result.sections) {
      lines.push(
        `  - ${section.type} (${section.title}): ${section.content.length} chars, ${(section.confidence * 100).toFixed(1)}% confidence`
      );
    }

    return lines.join('\n');
  }
}

// Export singleton instance
export const documentSectionDetector = new DocumentSectionDetector();
export default documentSectionDetector;
