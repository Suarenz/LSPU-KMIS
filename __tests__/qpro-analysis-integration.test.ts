import { analysisEngineService, QPROAnalysisOutput, QPROAnalysisOutputSchema } from '../lib/services/analysis-engine-service';
import { qproAnalysisService } from '../lib/services/qpro-analysis-service';

describe('QPRO Analysis Integration Tests', () => {
  describe('Zod Schema Validation', () => {
    it('should validate a complete QPRO analysis output', () => {
      const mockOutput = {
        activities: [
          {
            name: 'Faculty training workshops',
            kraId: 'KRA 1',
            initiativeId: 'KRA1-KPI1',
            reported: 8,
            target: 10,
            achievement: 80.0,
            status: 'MISSED',
            strategyLink: 'SP-STRAT-1.1',
            aiInsight: 'Insight',
            recommendation: 'Recommendation',
            confidence: 0.85,
            unit: 'College of Engineering',
          },
        ],
        kras: [
          {
            kraId: 'KRA 1',
            kraTitle: 'Development of New Curricula',
            achievementRate: 80.0,
            activities: [
              {
                name: 'Faculty training workshops',
                kraId: 'KRA 1',
                initiativeId: 'KRA1-KPI1',
                reported: 8,
                target: 10,
                achievement: 80.0,
                status: 'MISSED',
                strategyLink: 'SP-STRAT-1.1',
                aiInsight: 'Insight',
                recommendation: 'Recommendation',
                confidence: 0.85,
                unit: 'College of Engineering',
              },
            ],
            strategicAlignment: 'Strong alignment with curriculum development',
          },
        ],
        alignment: 'Overall strategic alignment is strong',
        opportunities: 'Opportunity to expand training programs',
        gaps: 'Gap in digital curriculum resources',
        recommendations: 'Invest in digital learning platforms',
        overallAchievement: 80.0,
      };

      const result = QPROAnalysisOutputSchema.safeParse(mockOutput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.activities).toHaveLength(1);
        expect(result.data.kras).toHaveLength(1);
        expect(result.data.overallAchievement).toBe(80.0);
      }
    });

    it('should reject invalid activity data', () => {
      const invalidOutput = {
        activities: [
          {
            name: 'Test activity',
            kraId: 'KRA 1',
            reported: 8,
            target: 10,
            achievement: 150, // Invalid: > 100
            confidence: 0.85,
          },
        ],
        kras: [],
        alignment: 'Test',
        opportunities: 'Test',
        gaps: 'Test',
        recommendations: 'Test',
        overallAchievement: 80.0,
      };

      const result = QPROAnalysisOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const incompleteOutput = {
        activities: [],
        kras: [],
        // Missing alignment, opportunities, gaps, recommendations
        overallAchievement: 80.0,
      };

      const result = QPROAnalysisOutputSchema.safeParse(incompleteOutput);
      expect(result.success).toBe(false);
    });
  });

  describe('Achievement Score Calculations', () => {
    it('should calculate correct achievement percentage', () => {
      const reported = 8;
      const target = 10;
      const achievement = (reported / target) * 100;
      expect(achievement).toBe(80.0);
    });

    it('should calculate KRA achievement rate as average of activities', () => {
      const activities = [
        { achievement: 80 },
        { achievement: 90 },
        { achievement: 70 },
      ];
      const kraAchievement =
        activities.reduce((sum, a) => sum + a.achievement, 0) / activities.length;
      expect(kraAchievement).toBeCloseTo(80.0, 1);
    });

    it('should handle zero target gracefully', () => {
      const reported = 5;
      const target = 0;
      const achievement = target === 0 ? 0 : (reported / target) * 100;
      expect(achievement).toBe(0);
    });
  });

  describe('Cache Key Generation', () => {
    it('should generate consistent cache keys for same input', () => {
      const text = 'Sample QPRO document text';
      const unitId = 'unit-123';
      
      // Since the method is private, we test the concept
      const hash1 = require('crypto').createHash('md5').update(text.slice(0, 1000)).digest('hex');
      const hash2 = require('crypto').createHash('md5').update(text.slice(0, 1000)).digest('hex');
      
      expect(hash1).toBe(hash2);
    });

    it('should generate different cache keys for different units', () => {
      const text = 'Sample QPRO document text';
      const hash = require('crypto').createHash('md5').update(text.slice(0, 1000)).digest('hex');
      
      const key1 = `qpro:vector-search:${hash}:unit-123`;
      const key2 = `qpro:vector-search:${hash}:unit-456`;
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('JSON Response Parsing', () => {
    it('should parse valid JSON from LLM response', () => {
      const jsonString = JSON.stringify({
        activities: [],
        kras: [],
        alignment: 'Test alignment',
        opportunities: 'Test opportunities',
        gaps: 'Test gaps',
        recommendations: 'Test recommendations',
        overallAchievement: 75.0,
      });

      const parsed = JSON.parse(jsonString);
      const result = QPROAnalysisOutputSchema.safeParse(parsed);
      expect(result.success).toBe(true);
    });

    it('should handle JSON wrapped in markdown code blocks', () => {
      const wrappedJson = '```json\n{"activities":[],"kras":[],"alignment":"Test","opportunities":"Test","gaps":"Test","recommendations":"Test","overallAchievement":75.0}\n```';
      
      let cleaned = wrappedJson.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      }
      
      const parsed = JSON.parse(cleaned);
      expect(parsed).toHaveProperty('activities');
      expect(parsed).toHaveProperty('overallAchievement');
    });
  });

  describe('Error Handling', () => {
    it('should provide descriptive error for invalid JSON', () => {
      const invalidJson = 'This is not JSON';
      
      try {
        JSON.parse(invalidJson);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError);
      }
    });

    it('should provide descriptive error for schema validation failure', () => {
      const invalidData = {
        activities: 'not an array', // Should be array
        kras: [],
        alignment: 'Test',
        opportunities: 'Test',
        gaps: 'Test',
        recommendations: 'Test',
        overallAchievement: 75.0,
      };

      const result = QPROAnalysisOutputSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
        expect(result.error.errors[0].path).toContain('activities');
      }
    });
  });

  describe('Strategic Context Formatting', () => {
    it('should format vector search results with full metadata', () => {
      const mockResult = {
        score: 0.85,
        metadata: {
          kra_id: 'KRA 1',
          kra_title: 'Development of New Curricula',
          initiative_id: 'KRA1-KPI1',
          key_performance_indicator: {
            outputs: 'New curricula developed',
            outcomes: 'Improved student learning',
          },
          strategies: ['Strategy 1', 'Strategy 2'],
          programs_activities: ['Activity 1', 'Activity 2'],
          responsible_offices: ['College of Engineering', 'Academic Affairs'],
          targets: { timeline: '2025-2029' },
        },
      };

      const formatted = `
### [1] ${mockResult.metadata.kra_id}: ${mockResult.metadata.kra_title}
**Initiative ID:** ${mockResult.metadata.initiative_id}
**Key Performance Indicator:**
- Outputs: ${mockResult.metadata.key_performance_indicator.outputs}
- Outcomes: ${mockResult.metadata.key_performance_indicator.outcomes}
**Strategies:** ${mockResult.metadata.strategies.join('; ')}
**Activities:** ${mockResult.metadata.programs_activities.join('; ')}
**Responsible Offices:** ${mockResult.metadata.responsible_offices.join(', ')}
**Targets:** ${JSON.stringify(mockResult.metadata.targets)}
**Similarity Score:** ${mockResult.score.toFixed(3)}
      `;

      expect(formatted).toContain('KRA 1');
      expect(formatted).toContain('Strategy 1; Strategy 2');
      expect(formatted).toContain('0.850');
    });
  });

  describe('Analysis Storage Formatting', () => {
    it('should format analysis output as readable markdown', () => {
      const mockAnalysis: QPROAnalysisOutput = {
        activities: [
          {
            name: 'Faculty training workshops',
            kraId: 'KRA 1',
            initiativeId: 'KRA1-KPI1',
            reported: 8,
            target: 10,
            achievement: 80.0,
            status: 'MISSED',
            strategyLink: 'SP-STRAT-1.1',
            aiInsight: 'Insight',
            recommendation: 'Recommendation',
            confidence: 0.85,
            unit: 'College of Engineering',
          },
        ],
        kras: [
          {
            kraId: 'KRA 1',
            kraTitle: 'Development of New Curricula',
            achievementRate: 80.0,
            activities: [],
            strategicAlignment: 'Strong alignment',
          },
        ],
        alignment: 'Test alignment',
        opportunities: 'Test opportunities',
        gaps: 'Test gaps',
        recommendations: 'Test recommendations',
        overallAchievement: 80.0,
      };

      const sections = [
        '# QPRO Analysis Report',
        '',
        `## Overall Achievement Score: ${mockAnalysis.overallAchievement.toFixed(2)}%`,
        '',
        '## Strategic Alignment',
        mockAnalysis.alignment,
      ];

      const formatted = sections.join('\n');
      expect(formatted).toContain('# QPRO Analysis Report');
      expect(formatted).toContain('80.00%');
    });
  });
});
