/**
 * Activity-KRA Mapping Configuration Service
 * 
 * Provides consistent, rule-based classification of activities to KRAs
 * using priority-ordered matching rules instead of semantic similarity.
 * 
 * Solves Problem #4: Arbitrary KRA Classification
 * - Implements STRICT type-to-KRA mapping rules
 * - Consistent classification across similar activities
 * - Confidence scoring based on rule match quality
 */

export interface ActivityTypeRule {
  activityType: string;
  kraIds: string[]; // Ordered list of valid KRA IDs for this type
  keywords: string[]; // Keywords that identify this activity type
  confidenceMultiplier: number; // 0-1: boost/penalty for match confidence
  priority: number; // 1-10: higher priority types matched first
}

export interface ActivityKRAMapping {
  activityName: string;
  suggestedKraId: string;
  alternativeKraIds: string[];
  matchedRule: ActivityTypeRule;
  matchedStrategies: string[]; // Strategies from Strategic Plan that this activity matches
  confidence: number; // 0-1 confidence score
  matchType: 'STRATEGY' | 'TYPE' | 'KEYWORD' | 'SEMANTIC'; // How the match was made
}

export interface MappingValidationResult {
  isValid: boolean;
  confidence: number;
  matchType: 'STRATEGY' | 'TYPE' | 'KEYWORD' | 'SEMANTIC';
  suggestions: ActivityKRAMapping[];
  validationNotes: string[];
}

class ActivityKRAMappingService {
  /**
   * Activity type rules organized by priority
   * CRITICAL: These rules define the STRICT mapping from activity types to KRAs
   */
  private readonly activityTypeRules: ActivityTypeRule[] = [
    // Tier 1: HR/Staff Development (KRA 11, KRA 13)
    {
      activityType: 'TRAINING_SEMINAR',
      kraIds: ['KRA 13', 'KRA 11', 'KRA 1'], // Faculty training → KRA 13 first
      keywords: ['training', 'seminar', 'workshop', 'conference', 'course', 'orientation'],
      confidenceMultiplier: 1.0,
      priority: 10,
    },
    {
      activityType: 'HEALTH_WELLNESS',
      kraIds: ['KRA 13'], // Health programs → ONLY KRA 13
      keywords: ['health', 'wellness', 'fitness', 'mental health', 'wellbeing', 'counseling'],
      confidenceMultiplier: 1.0,
      priority: 9,
    },
    {
      activityType: 'FACULTY_DEVELOPMENT',
      kraIds: ['KRA 11', 'KRA 1', 'KRA 13'],
      keywords: ['faculty', 'staff development', 'professional development', 'skill enhancement'],
      confidenceMultiplier: 0.95,
      priority: 9,
    },

    // Tier 2: Curriculum & Academic (KRA 1)
    {
      activityType: 'CURRICULUM_DEVELOPMENT',
      kraIds: ['KRA 1'],
      keywords: ['curriculum', 'course development', 'course design', 'syllabus', 'instructional material'],
      confidenceMultiplier: 1.0,
      priority: 9,
    },
    {
      activityType: 'ACADEMIC_INNOVATION',
      kraIds: ['KRA 1', 'KRA 17'],
      keywords: ['new curriculum', 'revised curriculum', 'course update', 'modernize', 'update courses'],
      confidenceMultiplier: 0.95,
      priority: 8,
    },
    {
      activityType: 'INSTRUCTION_DELIVERY',
      kraIds: ['KRA 1'],
      keywords: ['instruction', 'teaching', 'lessons', 'classes', 'lecture'],
      confidenceMultiplier: 0.85,
      priority: 7,
    },

    // Tier 3: Research & Publications (KRA 3, 4, 5)
    {
      activityType: 'RESEARCH_PROJECT',
      kraIds: ['KRA 4', 'KRA 3', 'KRA 5'],
      keywords: ['research', 'study', 'investigation', 'research project', 'research activity'],
      confidenceMultiplier: 1.0,
      priority: 9,
    },
    {
      activityType: 'PUBLICATION',
      kraIds: ['KRA 3', 'KRA 4', 'KRA 5'],
      keywords: [
        'publication',
        'published',
        'journal',
        'article',
        'paper',
        'proceeding',
        'conference publication',
      ],
      confidenceMultiplier: 1.0,
      priority: 9,
    },
    {
      activityType: 'RESEARCH_OUTPUT',
      kraIds: ['KRA 4', 'KRA 5'],
      keywords: ['research output', 'intellectual property', 'research product', 'research technology'],
      confidenceMultiplier: 0.95,
      priority: 8,
    },
    {
      activityType: 'EXTENSION_RESEARCH',
      kraIds: ['KRA 6', 'KRA 4'],
      keywords: ['extension research', 'development research', 'applied research'],
      confidenceMultiplier: 0.90,
      priority: 8,
    },

    // Tier 4: Community Engagement (KRA 6, 7, 8)
    {
      activityType: 'EXTENSION_OUTREACH',
      kraIds: ['KRA 6', 'KRA 7', 'KRA 8'],
      keywords: ['extension', 'outreach', 'community engagement', 'community program', 'livelihood'],
      confidenceMultiplier: 1.0,
      priority: 9,
    },
    {
      activityType: 'COMMUNITY_SERVICE',
      kraIds: ['KRA 6', 'KRA 7'],
      keywords: ['community service', 'community assistance', 'community support', 'social responsibility'],
      confidenceMultiplier: 0.95,
      priority: 8,
    },
    {
      activityType: 'ENVIRONMENTAL_ENGAGEMENT',
      kraIds: ['KRA 8', 'KRA 6'],
      keywords: ['environment', 'environmental', 'green', 'sustainability', 'eco-friendly'],
      confidenceMultiplier: 0.90,
      priority: 8,
    },
    {
      activityType: 'LIVELIHOOD_PROGRAM',
      kraIds: ['KRA 7', 'KRA 6'],
      keywords: ['livelihood', 'skills training', 'income generation', 'entrepreneurship'],
      confidenceMultiplier: 0.95,
      priority: 8,
    },

    // Tier 5: Alumni & Placement (KRA 9, 10)
    {
      activityType: 'ALUMNI_TRACKING',
      kraIds: ['KRA 9', 'KRA 10'],
      keywords: ['alumni', 'graduate tracking', 'alumni database', 'alumni engagement'],
      confidenceMultiplier: 1.0,
      priority: 9,
    },
    {
      activityType: 'EMPLOYMENT_PLACEMENT',
      kraIds: ['KRA 10', 'KRA 9'],
      keywords: [
        'employment',
        'placement',
        'job placement',
        'career placement',
        'employed',
        'employment rate',
      ],
      confidenceMultiplier: 1.0,
      priority: 9,
    },
    {
      activityType: 'CAREER_DEVELOPMENT',
      kraIds: ['KRA 10'],
      keywords: ['career', 'career advancement', 'career guidance', 'job matching'],
      confidenceMultiplier: 0.90,
      priority: 8,
    },

    // Tier 6: Technology & Infrastructure (KRA 17)
    {
      activityType: 'DIGITAL_SYSTEMS',
      kraIds: ['KRA 17'],
      keywords: [
        'digital',
        'system',
        'technology',
        'infrastructure',
        'IT',
        'software',
        'hardware',
        'network',
      ],
      confidenceMultiplier: 1.0,
      priority: 9,
    },
    {
      activityType: 'DIGITAL_TRANSFORMATION',
      kraIds: ['KRA 17', 'KRA 1'],
      keywords: ['digitalization', 'digital transformation', 'automation', 'e-learning'],
      confidenceMultiplier: 0.95,
      priority: 8,
    },

    // Tier 7: General/Miscellaneous
    {
      activityType: 'ADMINISTRATIVE',
      kraIds: ['KRA 2', 'KRA 11'],
      keywords: ['administrative', 'management', 'governance', 'organization'],
      confidenceMultiplier: 0.75,
      priority: 3,
    },
    {
      activityType: 'GENERAL_ACTIVITY',
      kraIds: ['KRA 1', 'KRA 11', 'KRA 6'], // Default fallback
      keywords: ['activity', 'program', 'initiative', 'project', 'accomplishment'],
      confidenceMultiplier: 0.50,
      priority: 1,
    },
  ];

  /**
   * Priority multipliers for match types
   * STRATEGY > TYPE > KEYWORD > SEMANTIC
   */
  private readonly matchTypePriority: { [key in 'STRATEGY' | 'TYPE' | 'KEYWORD' | 'SEMANTIC']: number } = {
    STRATEGY: 1.0,
    TYPE: 0.95,
    KEYWORD: 0.85,
    SEMANTIC: 0.70,
  };

  /**
   * Maps activity to most appropriate KRA(s) using rule-based matching
   */
  mapActivityToKRA(
    activityName: string,
    activityType?: string,
    strategies?: { [kraId: string]: string[] }
  ): ActivityKRAMapping {
    let bestMatch: ActivityKRAMapping | null = null;
    let bestConfidence = 0;

    // Step 1: Try STRATEGY matching (highest priority)
    if (strategies && Object.keys(strategies).length > 0) {
      for (const [kraId, kraStrategies] of Object.entries(strategies)) {
        for (const strategy of kraStrategies) {
          const strategyConfidence = this.calculateStrategyMatch(activityName, strategy);
          if (strategyConfidence > 0.7) {
            // Strong match
            const mapping: ActivityKRAMapping = {
              activityName,
              suggestedKraId: kraId,
              alternativeKraIds: [],
              matchedRule: this.getDefaultRule(),
              matchedStrategies: [strategy],
              confidence: strategyConfidence * this.matchTypePriority['STRATEGY'],
              matchType: 'STRATEGY',
            };

            if (mapping.confidence > bestConfidence) {
              bestMatch = mapping;
              bestConfidence = mapping.confidence;
            }
          }
        }
      }
    }

    // Step 2: Try TYPE-based matching
    if (!bestMatch || bestConfidence < 0.85) {
      const typeMatch = this.matchByActivityType(activityName, activityType);
      if (typeMatch && typeMatch.confidence > bestConfidence) {
        bestMatch = typeMatch;
        bestConfidence = typeMatch.confidence;
      }
    }

    // Step 3: Try KEYWORD matching
    if (!bestMatch || bestConfidence < 0.75) {
      const keywordMatch = this.matchByKeywords(activityName);
      if (keywordMatch && keywordMatch.confidence > bestConfidence) {
        bestMatch = keywordMatch;
        bestConfidence = keywordMatch.confidence;
      }
    }

    // Step 4: Fallback to default rule
    if (!bestMatch) {
      bestMatch = {
        activityName,
        suggestedKraId: 'KRA 1',
        alternativeKraIds: ['KRA 11', 'KRA 6'],
        matchedRule: this.getDefaultRule(),
        matchedStrategies: [],
        confidence: 0.5,
        matchType: 'SEMANTIC',
      };
    }

    // Add alternative KRA suggestions
    bestMatch.alternativeKraIds = this.getAlternativeKRAs(
      bestMatch.suggestedKraId,
      bestMatch.matchedRule
    );

    return bestMatch;
  }

  /**
   * Validates a proposed activity-to-KRA mapping
   */
  validateMapping(
    activityName: string,
    proposedKraId: string,
    strategies?: { [kraId: string]: string[] }
  ): MappingValidationResult {
    const suggestedMapping = this.mapActivityToKRA(activityName, undefined, strategies);
    const isValid = suggestedMapping.suggestedKraId === proposedKraId;
    const matchType = suggestedMapping.matchType;

    return {
      isValid,
      confidence: suggestedMapping.confidence,
      matchType,
      suggestions: [suggestedMapping],
      validationNotes: this.generateValidationNotes(
        activityName,
        proposedKraId,
        suggestedMapping,
        isValid
      ),
    };
  }

  /**
   * Calculates strategy match confidence using fuzzy matching
   */
  private calculateStrategyMatch(activityName: string, strategy: string): number {
    const activityLower = activityName.toLowerCase();
    const strategyLower = strategy.toLowerCase();

    // Exact match
    if (activityLower.includes(strategyLower) || strategyLower.includes(activityLower)) {
      return 0.98;
    }

    // Check for key keyword overlap
    const activityWords = activityLower.split(/\s+/);
    const strategyWords = strategyLower.split(/\s+/);

    const commonWords = activityWords.filter(
      (word) =>
        strategyWords.includes(word) &&
        word.length > 3 && // Ignore short words
        !this.isStopWord(word)
    );

    if (commonWords.length >= 2) {
      return 0.85; // Multiple key words match
    }
    if (commonWords.length === 1) {
      return 0.70; // One key word matches
    }

    return 0;
  }

  /**
   * Matches activity by inferred type
   */
  private matchByActivityType(activityName: string, activityType?: string): ActivityKRAMapping | null {
    const searchType = (activityType || activityName).toLowerCase();

    // Find best matching rule
    let bestRule: ActivityTypeRule | null = null;
    let bestScore = 0;

    for (const rule of this.activityTypeRules) {
      if (searchType.includes(rule.activityType.toLowerCase().replace(/_/g, ' '))) {
        const score = rule.priority * 10;
        if (score > bestScore) {
          bestRule = rule;
          bestScore = score;
        }
      }
    }

    if (bestRule) {
      return {
        activityName,
        suggestedKraId: bestRule.kraIds[0],
        alternativeKraIds: bestRule.kraIds.slice(1),
        matchedRule: bestRule,
        matchedStrategies: [],
        confidence: (bestRule.priority / 10) * bestRule.confidenceMultiplier * this.matchTypePriority['TYPE'],
        matchType: 'TYPE',
      };
    }

    return null;
  }

  /**
   * Matches activity by keywords
   */
  private matchByKeywords(activityName: string): ActivityKRAMapping | null {
    const activityLower = activityName.toLowerCase();
    let bestRule: ActivityTypeRule | null = null;
    let bestScore = 0;

    for (const rule of this.activityTypeRules) {
      const matchedKeywords = rule.keywords.filter((keyword) =>
        activityLower.includes(keyword.toLowerCase())
      );

      if (matchedKeywords.length > 0) {
        const score = (matchedKeywords.length / rule.keywords.length) * rule.priority;
        if (score > bestScore) {
          bestRule = rule;
          bestScore = score;
        }
      }
    }

    if (bestRule && bestScore > 0) {
      return {
        activityName,
        suggestedKraId: bestRule.kraIds[0],
        alternativeKraIds: bestRule.kraIds.slice(1),
        matchedRule: bestRule,
        matchedStrategies: [],
        confidence: bestScore * bestRule.confidenceMultiplier * this.matchTypePriority['KEYWORD'],
        matchType: 'KEYWORD',
      };
    }

    return null;
  }

  /**
   * Gets alternative KRA IDs for a matched rule
   */
  private getAlternativeKRAs(primaryKraId: string, rule: ActivityTypeRule): string[] {
    return rule.kraIds.filter((id) => id !== primaryKraId).slice(0, 2); // Limit to 2 alternatives
  }

  /**
   * Checks if word is a common stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of'];
    return stopWords.includes(word);
  }

  /**
   * Returns a default rule for fallback matching
   */
  private getDefaultRule(): ActivityTypeRule {
    return {
      activityType: 'GENERAL_ACTIVITY',
      kraIds: ['KRA 1', 'KRA 11', 'KRA 6'],
      keywords: ['activity', 'program'],
      confidenceMultiplier: 0.5,
      priority: 1,
    };
  }

  /**
   * Generates validation notes
   */
  private generateValidationNotes(
    activityName: string,
    proposedKraId: string,
    suggestedMapping: ActivityKRAMapping,
    isValid: boolean
  ): string[] {
    const notes: string[] = [];

    if (isValid) {
      notes.push(`✓ Proposed KRA "${proposedKraId}" matches rule-based suggestion`);
      notes.push(`  Match type: ${suggestedMapping.matchType}`);
      notes.push(`  Confidence: ${(suggestedMapping.confidence * 100).toFixed(0)}%`);
    } else {
      notes.push(
        `⚠ Proposed KRA "${proposedKraId}" differs from rule-based suggestion "${suggestedMapping.suggestedKraId}"`
      );
      notes.push(`  Suggested match type: ${suggestedMapping.matchType}`);
      notes.push(
        `  Suggested confidence: ${(suggestedMapping.confidence * 100).toFixed(0)}%`
      );
      notes.push(`  Consider using: ${suggestedMapping.suggestedKraId}`);

      if (suggestedMapping.alternativeKraIds.length > 0) {
        notes.push(`  Other valid options: ${suggestedMapping.alternativeKraIds.join(', ')}`);
      }
    }

    return notes;
  }

  /**
   * Generates mapping summary for logging
   */
  generateMappingSummary(mapping: ActivityKRAMapping): string {
    const lines = [
      `Activity: "${mapping.activityName}"`,
      `Suggested KRA: ${mapping.suggestedKraId}`,
      `Match Type: ${mapping.matchType}`,
      `Confidence: ${(mapping.confidence * 100).toFixed(0)}%`,
      `Rule Used: ${mapping.matchedRule.activityType}`,
    ];

    if (mapping.alternativeKraIds.length > 0) {
      lines.push(`Alternative KRAs: ${mapping.alternativeKraIds.join(', ')}`);
    }

    if (mapping.matchedStrategies.length > 0) {
      lines.push(`Matched Strategies: ${mapping.matchedStrategies.join(' | ')}`);
    }

    return lines.join('\n');
  }

  /**
   * Get all activity type rules for reference
   */
  getAllRules(): ActivityTypeRule[] {
    return this.activityTypeRules;
  }

  /**
   * Get rules for a specific KRA
   */
  getRulesForKRA(kraId: string): ActivityTypeRule[] {
    return this.activityTypeRules.filter((rule) => rule.kraIds.includes(kraId));
  }
}

// Export singleton instance
export const activityKRAMappingService = new ActivityKRAMappingService();
export default activityKRAMappingService;
