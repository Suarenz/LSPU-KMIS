/**
 * KPI Type-Aware Analysis Logic Tests
 * 
 * Tests the "Type-Aware Analysis" implementation that solves the
 * "Unit of Measure Blindness" problem in prescriptive analysis.
 */

import {
  getKpiTypeCategory,
  getGapInterpretation,
  generateTypeSpecificLogicInstruction,
  generateTypeAwareRecommendation,
  validatePrescriptiveAnalysis,
  getKpiTypeDescription,
  buildTypeAwarePromptContext,
} from '@/lib/utils/kpi-type-logic';

describe('KPI Type-Aware Analysis Logic', () => {
  
  describe('getKpiTypeCategory', () => {
    test('should correctly categorize VOLUME types', () => {
      expect(getKpiTypeCategory('count')).toBe('VOLUME');
      expect(getKpiTypeCategory('low_count')).toBe('VOLUME');
      expect(getKpiTypeCategory('high_count')).toBe('VOLUME');
      expect(getKpiTypeCategory('number')).toBe('VOLUME');
      expect(getKpiTypeCategory('quantity')).toBe('VOLUME');
    });

    test('should correctly categorize EFFICIENCY types', () => {
      expect(getKpiTypeCategory('rate')).toBe('EFFICIENCY');
      expect(getKpiTypeCategory('percentage')).toBe('EFFICIENCY');
      expect(getKpiTypeCategory('ratio')).toBe('EFFICIENCY');
      expect(getKpiTypeCategory('percent')).toBe('EFFICIENCY');
      expect(getKpiTypeCategory('%')).toBe('EFFICIENCY');
    });

    test('should correctly categorize MILESTONE types', () => {
      expect(getKpiTypeCategory('milestone')).toBe('MILESTONE');
      expect(getKpiTypeCategory('boolean')).toBe('MILESTONE');
      expect(getKpiTypeCategory('status')).toBe('MILESTONE');
      expect(getKpiTypeCategory('binary')).toBe('MILESTONE');
      expect(getKpiTypeCategory('completed')).toBe('MILESTONE');
    });

    test('should correctly categorize PERFORMANCE types', () => {
      expect(getKpiTypeCategory('score')).toBe('PERFORMANCE');
      expect(getKpiTypeCategory('value')).toBe('PERFORMANCE');
      expect(getKpiTypeCategory('rating')).toBe('PERFORMANCE');
      expect(getKpiTypeCategory('satisfaction')).toBe('PERFORMANCE');
    });

    test('should correctly categorize TEXT types', () => {
      expect(getKpiTypeCategory('text')).toBe('TEXT');
      expect(getKpiTypeCategory('narrative')).toBe('TEXT');
      expect(getKpiTypeCategory('qualitative')).toBe('TEXT');
    });

    test('should return UNKNOWN for undefined or unknown types', () => {
      expect(getKpiTypeCategory(undefined)).toBe('UNKNOWN');
      expect(getKpiTypeCategory(null)).toBe('UNKNOWN');
      expect(getKpiTypeCategory('')).toBe('UNKNOWN');
      expect(getKpiTypeCategory('unknown_type')).toBe('UNKNOWN');
    });

    test('should be case-insensitive', () => {
      expect(getKpiTypeCategory('PERCENTAGE')).toBe('EFFICIENCY');
      expect(getKpiTypeCategory('Count')).toBe('VOLUME');
      expect(getKpiTypeCategory('MILESTONE')).toBe('MILESTONE');
    });
  });

  describe('getGapInterpretation', () => {
    test('should return correct interpretation for VOLUME', () => {
      const interpretation = getGapInterpretation('VOLUME');
      expect(interpretation.gapType).toBe('Quantity Deficit');
      expect(interpretation.actionArchetype).toBe('Scale Up');
      expect(interpretation.antiPattern).toBeNull();
      expect(interpretation.rootCauseFocus).toContain('Insufficient pipeline or production capacity');
    });

    test('should return correct interpretation for EFFICIENCY with anti-pattern warning', () => {
      const interpretation = getGapInterpretation('EFFICIENCY');
      expect(interpretation.gapType).toBe('Quality/Conversion Deficit');
      expect(interpretation.actionArchetype).toBe('Optimize Quality');
      expect(interpretation.antiPattern).toContain('Do NOT suggest');
      expect(interpretation.antiPattern).toContain('data collection');
      expect(interpretation.rootCauseFocus).toContain('Curriculum relevance and alignment with industry needs');
    });

    test('should return correct interpretation for MILESTONE', () => {
      const interpretation = getGapInterpretation('MILESTONE');
      expect(interpretation.gapType).toBe('Project Delay');
      expect(interpretation.actionArchetype).toBe('Intervention');
      expect(interpretation.rootCauseFocus).toContain('Bureaucratic bottlenecks and approval delays');
    });

    test('should return correct interpretation for PERFORMANCE', () => {
      const interpretation = getGapInterpretation('PERFORMANCE');
      expect(interpretation.gapType).toBe('Satisfaction/Standard Deficit');
      expect(interpretation.actionArchetype).toBe('Root Cause Analysis');
      expect(interpretation.rootCauseFocus).toContain('User experience and service delivery quality');
    });
  });

  describe('generateTypeSpecificLogicInstruction', () => {
    test('should generate VOLUME-specific instruction for count types', () => {
      const instruction = generateTypeSpecificLogicInstruction('count');
      expect(instruction).toContain('VOLUME METRIC');
      expect(instruction).toContain('QUANTITY DEFICIT');
      expect(instruction).toContain('Scale Up');
      expect(instruction).toContain('Increasing frequency');
    });

    test('should generate EFFICIENCY-specific instruction for rate/percentage types', () => {
      const instruction = generateTypeSpecificLogicInstruction('percentage');
      expect(instruction).toContain('EFFICIENCY/QUALITY METRIC');
      expect(instruction).toContain('QUALITY/CONVERSION DEFICIT');
      expect(instruction).toContain('Optimize Quality');
      expect(instruction).toContain('Do NOT');
      expect(instruction).toContain('data collection');
      expect(instruction).toContain('curriculum');
    });

    test('should generate MILESTONE-specific instruction for boolean/status types', () => {
      const instruction = generateTypeSpecificLogicInstruction('milestone');
      expect(instruction).toContain('MILESTONE/STATUS METRIC');
      expect(instruction).toContain('PROJECT DELAY');
      expect(instruction).toContain('Intervention');
      expect(instruction).toContain('fast-tracking');
    });
  });

  describe('validatePrescriptiveAnalysis', () => {
    describe('EFFICIENCY metrics anti-pattern detection', () => {
      test('should flag "reporting bottleneck" as anti-pattern for EFFICIENCY metrics', () => {
        const analysis = 'The issue is a reporting bottleneck. We need to collect more data.';
        const result = validatePrescriptiveAnalysis(analysis, 'percentage');
        expect(result.isValid).toBe(false);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0]).toContain('EFFICIENCY');
      });

      test('should flag "batch collection" as anti-pattern for EFFICIENCY metrics', () => {
        const analysis = 'Implement batch collection of employment data.';
        const result = validatePrescriptiveAnalysis(analysis, 'rate');
        expect(result.isValid).toBe(false);
      });

      test('should flag "data collection delay" as anti-pattern for EFFICIENCY metrics', () => {
        const analysis = 'The gap is due to data collection delays.';
        const result = validatePrescriptiveAnalysis(analysis, 'percentage');
        expect(result.isValid).toBe(false);
      });

      test('should pass valid EFFICIENCY recommendations', () => {
        const analysis = 'Review curriculum alignment with industry needs and strengthen industry partnerships.';
        const result = validatePrescriptiveAnalysis(analysis, 'percentage');
        expect(result.isValid).toBe(true);
        expect(result.warnings.length).toBe(0);
      });
    });

    test('should pass volume-type recommendations for VOLUME metrics', () => {
      const analysis = 'Scale up data collection and address reporting backlogs.';
      const result = validatePrescriptiveAnalysis(analysis, 'count');
      expect(result.isValid).toBe(true);
    });
  });

  describe('generateTypeAwareRecommendation', () => {
    test('should generate Scale Up recommendation for VOLUME metrics', () => {
      const rec = generateTypeAwareRecommendation('count', 'Research Outputs', 10, 50, 20);
      expect(rec.title).toContain('Scale Up');
      expect(rec.issue).toContain('quantity deficit');
      expect(rec.action).toContain('frequency');
      expect(rec.kpiType).toBe('VOLUME');
    });

    test('should generate Optimize Quality recommendation for EFFICIENCY metrics', () => {
      const rec = generateTypeAwareRecommendation('percentage', 'Employment Rate', 16, 73, 21.9);
      expect(rec.title).toContain('Optimize Quality');
      expect(rec.issue).toContain('conversion/quality gap');
      expect(rec.action).toContain('curriculum');
      expect(rec.action).not.toContain('reporting');
      expect(rec.kpiType).toBe('EFFICIENCY');
    });

    test('should generate Intervention recommendation for MILESTONE metrics', () => {
      const rec = generateTypeAwareRecommendation('milestone', 'ISO Certification Status', 0, 1, 0);
      expect(rec.title).toContain('Fast-Track');
      expect(rec.issue).toContain('incomplete');
      expect(rec.action).toContain('blocker');
      expect(rec.kpiType).toBe('MILESTONE');
    });
  });

  /**
   * Test Case 1: Employment Rate (The "Problem" Case)
   * Input: Type=rate, Target=73, Actual=16
   * Expected: Mentions "Curriculum alignment", "Industry partners", or "Skills gap"
   * Fail Condition: Mentions "Reporting bottleneck" or "Batch collection"
   */
  describe('Test Case 1: Employment Rate (EFFICIENCY metric)', () => {
    const kpiType = 'rate';
    const kpiName = 'BSCS Employment Rate';
    const targetValue = 73;
    const actualValue = 16;
    const achievementPercent = (actualValue / targetValue) * 100;

    test('should categorize as EFFICIENCY', () => {
      expect(getKpiTypeCategory(kpiType)).toBe('EFFICIENCY');
    });

    test('should NOT suggest reporting bottleneck for low employment rate', () => {
      const instruction = generateTypeSpecificLogicInstruction(kpiType);
      expect(instruction).toContain('Do NOT');
      expect(instruction.toLowerCase()).not.toContain('reporting bottleneck');
    });

    test('should suggest curriculum/quality improvements for low employment rate', () => {
      const rec = generateTypeAwareRecommendation(kpiType, kpiName, actualValue, targetValue, achievementPercent);
      expect(rec.action.toLowerCase()).toContain('curriculum');
      expect(rec.action.toLowerCase()).not.toContain('reporting');
      expect(rec.action.toLowerCase()).not.toContain('batch');
    });

    test('should validate that generated analysis does not contain anti-patterns', () => {
      const rec = generateTypeAwareRecommendation(kpiType, kpiName, actualValue, targetValue, achievementPercent);
      const validation = validatePrescriptiveAnalysis(rec.action, kpiType);
      expect(validation.isValid).toBe(true);
    });

    test('should correctly interpret gap as quality/conversion deficit', () => {
      const interpretation = getGapInterpretation('EFFICIENCY');
      expect(interpretation.gapType).toBe('Quality/Conversion Deficit');
    });
  });

  /**
   * Test Case 2: Number of ISO Procedures (The "Volume" Case)
   * Input: Type=count, Target=50, Actual=10
   * Expected: Mentions "Scaling production", "Hiring more staff", or "Reporting backlog"
   */
  describe('Test Case 2: Number of ISO Procedures (VOLUME metric)', () => {
    const kpiType = 'count';
    const kpiName = 'Number of ISO Procedures';
    const targetValue = 50;
    const actualValue = 10;
    const achievementPercent = (actualValue / targetValue) * 100;

    test('should categorize as VOLUME', () => {
      expect(getKpiTypeCategory(kpiType)).toBe('VOLUME');
    });

    test('should suggest scaling up for count-based metrics', () => {
      const rec = generateTypeAwareRecommendation(kpiType, kpiName, actualValue, targetValue, achievementPercent);
      expect(rec.title).toContain('Scale Up');
      expect(rec.issue).toContain('quantity deficit');
    });

    test('should allow reporting backlog suggestions for VOLUME metrics', () => {
      const analysis = 'Address reporting backlogs and scale up production.';
      const validation = validatePrescriptiveAnalysis(analysis, kpiType);
      expect(validation.isValid).toBe(true);
    });

    test('should correctly interpret gap as quantity deficit', () => {
      const interpretation = getGapInterpretation('VOLUME');
      expect(interpretation.gapType).toBe('Quantity Deficit');
    });
  });

  describe('buildTypeAwarePromptContext', () => {
    test('should build complete context with type-specific rules', () => {
      const context = buildTypeAwarePromptContext(
        'percentage',
        'Employment Rate',
        'KRA 3',
        73,
        16,
        57
      );
      expect(context).toContain('KPI Name: Employment Rate');
      expect(context).toContain('KPI Type: percentage');
      expect(context).toContain('Category: EFFICIENCY');
      expect(context).toContain('Target: 73');
      expect(context).toContain('Actual: 16');
      expect(context).toContain('LOGIC RULE');
    });
  });

  describe('getKpiTypeDescription', () => {
    test('should return human-readable description', () => {
      expect(getKpiTypeDescription('percentage')).toContain('EFFICIENCY');
      expect(getKpiTypeDescription('percentage')).toContain('Quality/Conversion');
      expect(getKpiTypeDescription('count')).toContain('VOLUME');
      expect(getKpiTypeDescription('milestone')).toContain('MILESTONE');
    });
  });
});
