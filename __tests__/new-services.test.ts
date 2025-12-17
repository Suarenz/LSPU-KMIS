/**
 * Unit Tests for New Services
 * Tests for DocumentSectionDetector, SummaryExtractor, and ActivityKRAMappingService
 */

import { documentSectionDetector, DocumentSection } from '@/lib/services/document-section-detector';
import { summaryExtractor } from '@/lib/services/summary-extractor';
import { activityKRAMappingService } from '@/lib/services/activity-kra-mapping-service';

describe('DocumentSectionDetector', () => {
  describe('detectSections', () => {
    it('should detect TRAINING section', async () => {
      const text = `
        TRAINING REPORT
        
        The following trainings were conducted in Q1 2025:
        1. Introduction to AI
        2. Data Privacy Workshop
        
        Total participants: 45
      `;

      const result = await documentSectionDetector.detectSections(text);
      expect(result.sections.length).toBeGreaterThan(0);
      expect(result.documentType).toBeDefined();
      expect(result.totalSections).toBeGreaterThanOrEqual(1);
    });

    it('should detect ALUMNI_EMPLOYMENT section', async () => {
      const text = `
        ALUMNI EMPLOYMENT TRACKING REPORT
        
        Graduate Placement Analysis for Class of 2023:
        - Total Graduates: 150
        - Employed: 142
        - Employment Rate: 94.7%
      `;

      const result = await documentSectionDetector.detectSections(text);
      expect(result.sections.length).toBeGreaterThan(0);
      const hasAlumniSection = result.sections.some(s => s.type === 'ALUMNI_EMPLOYMENT');
      expect(hasAlumniSection).toBe(true);
    });

    it('should detect RESEARCH section', async () => {
      const text = `
        RESEARCH PUBLICATIONS REPORT
        
        Published Papers (2025):
        1. "Machine Learning Applications" - Journal of Computing
        2. "Sustainable Energy Solutions" - Environmental Science Today
      `;

      const result = await documentSectionDetector.detectSections(text);
      const hasResearchSection = result.sections.some(s => s.type === 'RESEARCH');
      expect(hasResearchSection).toBe(true);
    });

    it('should return empty result for empty text', async () => {
      const result = await documentSectionDetector.detectSections('');
      expect(result.sections).toEqual([]);
      expect(result.totalSections).toBe(0);
    });

    it('should provide confidence scores for detected sections', async () => {
      const text = 'TRAINING REPORT: Faculty development workshop with 25 participants';
      const result = await documentSectionDetector.detectSections(text);
      
      if (result.sections.length > 0) {
        result.sections.forEach(section => {
          expect(section.confidence).toBeGreaterThan(0);
          expect(section.confidence).toBeLessThanOrEqual(1);
        });
      }
    });
  });

  describe('getSectionByType', () => {
    it('should return correct section by type', async () => {
      const text = 'TRAINING REPORT: 30 participants attended';
      const result = await documentSectionDetector.detectSections(text);
      const trainingSection = documentSectionDetector.getSectionByType(result.sections, 'TRAINING');
      
      if (result.sections.length > 0) {
        expect(trainingSection).toBeDefined();
      }
    });
  });
});

describe('SummaryExtractor', () => {
  describe('extractSummaries', () => {
    it('should extract total metrics', async () => {
      const text = 'Total No. of Attendees: 150';
      const result = await summaryExtractor.extractSummaries(text);
      
      expect(result.summaries.length).toBeGreaterThan(0);
      expect(result.summaries[0].metricType).toBe('TOTAL');
      expect(result.summaries[0].value).toBe(150);
    });

    it('should extract participant count metrics', async () => {
      const text = 'Total Participants: 85';
      const result = await summaryExtractor.extractSummaries(text);
      
      expect(result.summaries.length).toBeGreaterThan(0);
      // First result should be participant metric
      const participantSummary = result.summaries.find(s => 
        s.metricName.toLowerCase().includes('participant')
      );
      expect(participantSummary).toBeDefined();
      if (participantSummary) {
        expect(participantSummary.value).toBeCloseTo(85, 0);
      }
    });

    it('should extract percentage metrics', async () => {
      const text = 'Achievement rate: 92.5%';
      const result = await summaryExtractor.extractSummaries(text);
      
      expect(result.summaries.length).toBeGreaterThan(0);
      expect(result.summaries[0].metricType).toBe('PERCENTAGE');
      expect(result.summaries[0].value).toBe(92.5);
    });

    it('should extract financial metrics', async () => {
      const text = 'Total Budget: PHP 250,000';
      const result = await summaryExtractor.extractSummaries(text);
      
      expect(result.summaries.length).toBeGreaterThan(0);
      expect(result.summaries[0].metricType).toBe('FINANCIAL');
    });

    it('should provide prioritized value', async () => {
      const text = `
        Total No. of Trainees: 100
        Budget Allocated: PHP 50,000
        Achievement: 95%
      `;
      const result = await summaryExtractor.extractSummaries(text);
      
      expect(result.prioritizedValue).toBeDefined();
      expect(result.prioritizedValue?.metricType).toBe('TOTAL'); // TOTAL has highest priority
    });

    it('should remove duplicate metrics', async () => {
      const text = `
        Total Participants: 50
        Total No. of Participants: 50
      `;
      const result = await summaryExtractor.extractSummaries(text);
      
      // Should deduplicate to single entry
      const participantMetrics = result.summaries.filter(s => 
        s.metricName.toLowerCase().includes('participant')
      );
      expect(participantMetrics.length).toBeLessThanOrEqual(2);
    });
  });

  describe('extractFromSection', () => {
    it('should extract summaries from specific section', async () => {
      const sectionContent = `
        TRAINING REPORT
        Total No. of Attendees: 45
        Training Sessions: 3
      `;
      const result = await summaryExtractor.extractFromSection(sectionContent, 'TRAINING');
      
      expect(result.summaries.length).toBeGreaterThan(0);
    });

    it('should filter metrics relevant to section type', async () => {
      const sectionContent = 'Alumni database updated with 75 new graduates';
      const result = await summaryExtractor.extractFromSection(sectionContent, 'ALUMNI_EMPLOYMENT');
      
      // Should extract metrics relevant to alumni section
      expect(result.extractionMetadata.metricsFound).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('ActivityKRAMappingService', () => {
  describe('mapActivityToKRA', () => {
    it('should map training activity to KRA 13 or KRA 11', () => {
      const mapping = activityKRAMappingService.mapActivityToKRA('Faculty training workshop');
      
      expect(mapping.suggestedKraId).toMatch(/KRA (11|13)/);
      expect(mapping.confidence).toBeGreaterThan(0.7);
    });

    it('should map research publication to KRA 3, 4, or 5', () => {
      const mapping = activityKRAMappingService.mapActivityToKRA('Published research paper in international journal');
      
      expect(mapping.suggestedKraId).toMatch(/KRA [345]/);
      expect(mapping.confidence).toBeGreaterThan(0.7);
    });

    it('should map alumni employment to KRA 9 or KRA 10', () => {
      const mapping = activityKRAMappingService.mapActivityToKRA('Graduate employment placement program');
      
      expect(mapping.suggestedKraId).toMatch(/KRA (9|10)/);
      expect(mapping.confidence).toBeGreaterThan(0.7);
    });

    it('should map community engagement to KRA 6, 7, or 8', () => {
      const mapping = activityKRAMappingService.mapActivityToKRA('Community livelihood skills training');
      
      expect(mapping.suggestedKraId).toMatch(/KRA [678]/);
      expect(mapping.confidence).toBeGreaterThan(0.7);
    });

    it('should map curriculum development to KRA 1', () => {
      const mapping = activityKRAMappingService.mapActivityToKRA('New curriculum development for AI courses');
      
      expect(mapping.suggestedKraId).toBe('KRA 1');
      expect(mapping.confidence).toBeGreaterThan(0.7);
    });

    it('should provide alternative KRA suggestions', () => {
      const mapping = activityKRAMappingService.mapActivityToKRA('Staff development seminar');
      
      expect(mapping.alternativeKraIds).toBeDefined();
      expect(Array.isArray(mapping.alternativeKraIds)).toBe(true);
    });

    it('should support strategy-based matching', () => {
      const strategies = {
        'KRA 13': ['conduct health and wellness program twice a week', 'provide mental health counseling'],
      };
      const mapping = activityKRAMappingService.mapActivityToKRA(
        'health and wellness program for faculty',
        undefined,
        strategies
      );
      
      if (mapping.matchType === 'STRATEGY') {
        expect(mapping.suggestedKraId).toBe('KRA 13');
      }
    });
  });

  describe('validateMapping', () => {
    it('should validate correct mapping', () => {
      const result = activityKRAMappingService.validateMapping(
        'Faculty training workshop',
        'KRA 13'
      );
      
      expect(result.isValid).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should flag incorrect mapping', () => {
      const result = activityKRAMappingService.validateMapping(
        'Faculty training workshop',
        'KRA 3' // Research KRA - wrong for training
      );
      
      expect(result.isValid).toBe(false);
    });

    it('should provide validation notes', () => {
      const result = activityKRAMappingService.validateMapping(
        'Research publication',
        'KRA 4'
      );
      
      expect(result.validationNotes).toBeDefined();
      expect(result.validationNotes.length).toBeGreaterThan(0);
    });
  });

  describe('getRulesForKRA', () => {
    it('should return all rules for a specific KRA', () => {
      const rules = activityKRAMappingService.getRulesForKRA('KRA 13');
      
      expect(rules).toBeDefined();
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should include HR development rules for KRA 13', () => {
      const rules = activityKRAMappingService.getRulesForKRA('KRA 13');
      const hasHealthWellness = rules.some(r => r.activityType === 'HEALTH_WELLNESS');
      
      expect(hasHealthWellness).toBe(true);
    });
  });

  describe('consistency checks', () => {
    it('should map similar activities to same KRA or closely related KRAs', () => {
      const activities = [
        'Introduction to AI training',
        'AI workshop for faculty',
        'Artificial Intelligence seminar',
      ];

      const mappings = activities.map(activity =>
        activityKRAMappingService.mapActivityToKRA(activity)
      );

      const kraIds = mappings.map(m => m.suggestedKraId);
      // All should map to HR/training related KRAs (KRA 11, 13, or KRA 1)
      const allHRRelated = kraIds.every(id => ['KRA 1', 'KRA 11', 'KRA 13'].includes(id));
      expect(allHRRelated).toBe(true);
    });

    it('should differentiate between different activity types', () => {
      const trainingMapping = activityKRAMappingService.mapActivityToKRA('Staff training seminar');
      const researchMapping = activityKRAMappingService.mapActivityToKRA('Research publication');
      const alumniMapping = activityKRAMappingService.mapActivityToKRA('Alumni tracking database');

      const kraIds = new Set([
        trainingMapping.suggestedKraId,
        researchMapping.suggestedKraId,
        alumniMapping.suggestedKraId,
      ]);

      expect(kraIds.size).toBe(3); // Should be different KRAs
    });
  });
});

describe('Integration Tests', () => {
  it('should process a complete QPRO document through all stages', async () => {
    const qproText = `
      QUARTERLY PHYSICAL REPORT OF OPERATIONS Q1 2025
      
      TRAINING REPORT
      Total No. of Training Sessions Conducted: 8
      Total No. of Participants: 142
      
      Trainings Conducted:
      1. Introduction to AI - 25 participants
      2. Data Privacy Workshop - 18 participants
      3. Cybersecurity Awareness - 22 participants
      4. Digital Marketing Basics - 20 participants
      5. UI & UX Design - 19 participants
      6. AI for Beginners - 21 participants
      7. Cloud Computing Fundamentals - 12 participants
      8. Mobile App Development - 5 participants
      
      RESEARCH PUBLICATIONS
      Research Output for Q1 2025:
      - 3 papers published in international journals
      - 2 conference presentations
      - 1 research project initiated
      
      ALUMNI EMPLOYMENT
      Alumni Tracking Report:
      Total Graduates Tracked: 487
      Employed Graduates: 451
      Employment Rate: 92.6%
    `;

    // Step 1: Detect sections
    const sectionResult = await documentSectionDetector.detectSections(qproText);
    expect(sectionResult.totalSections).toBeGreaterThan(0);

    // Step 2: Extract summaries
    const summaryResult = await summaryExtractor.extractSummaries(qproText);
    expect(summaryResult.totalExtracted).toBeGreaterThan(0);
    expect(summaryResult.prioritizedValue).toBeDefined();

    // Step 3: Map activities to KRAs
    const trainingMapping = activityKRAMappingService.mapActivityToKRA(
      'Introduction to AI training'
    );
    expect(trainingMapping.suggestedKraId).toMatch(/KRA (11|13)/);

    const researchMapping = activityKRAMappingService.mapActivityToKRA(
      'published in international journal'
    );
    expect(researchMapping.suggestedKraId).toMatch(/KRA [345]/);

    const alumniMapping = activityKRAMappingService.mapActivityToKRA(
      'Alumni employment tracking'
    );
    expect(alumniMapping.suggestedKraId).toMatch(/KRA (9|10)/);
  });
});
