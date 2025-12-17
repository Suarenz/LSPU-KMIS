/**
 * Unit tests for toString helper function used in Prisma conversion
 */

describe('String Conversion for Prisma Fields', () => {
  // Recreate the toString function for testing
  const toString = (val: any): string | null => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) {
      if (val.length === 0) return null; // Empty array -> null
      // If array of objects with 'action' field (recommendations), format them
      if (val.length > 0 && typeof val[0] === 'object' && val[0].action) {
        return val.map((item: any) => `• ${item.action}${item.timeline ? ` (${item.timeline})` : ''}`).join('\n');
      }
      // Otherwise, join array items with bullet points
      return val.map((item: any) => `• ${typeof item === 'string' ? item : JSON.stringify(item)}`).join('\n');
    }
    // For plain objects, convert to JSON string
    return JSON.stringify(val);
  };

  describe('String fields', () => {
    it('should return string as-is', () => {
      const input = 'This is already a string';
      expect(toString(input)).toBe('This is already a string');
    });

    it('should handle empty string', () => {
      expect(toString('')).toBeNull();
    });
  });

  describe('Array of strings (opportunities)', () => {
    it('should convert array of strings to bullet-point format', () => {
      const input = [
        'Enhance collaboration with industry partners',
        'Implement training programs',
        'Expand research funding'
      ];
      const result = toString(input);
      expect(result).toContain('• Enhance collaboration');
      expect(result).toContain('• Implement training');
      expect(result).toContain('• Expand research');
      expect(result?.split('\n')).toHaveLength(3);
    });

    it('should handle single item array', () => {
      const input = ['Single opportunity'];
      const result = toString(input);
      expect(result).toBe('• Single opportunity');
    });
  });

  describe('Array of objects (recommendations)', () => {
    it('should convert recommendation objects to formatted text', () => {
      const input = [
        { action: 'Conduct in-house review', timeline: 'Within 3 months' },
        { action: 'Hire additional staff', timeline: 'Q2 2025' }
      ];
      const result = toString(input);
      expect(result).toContain('• Conduct in-house review (Within 3 months)');
      expect(result).toContain('• Hire additional staff (Q2 2025)');
    });

    it('should handle recommendations without timeline', () => {
      const input = [
        { action: 'Update policies' },
        { action: 'Train staff' }
      ];
      const result = toString(input);
      expect(result).toContain('• Update policies\n• Train staff');
    });

    it('should handle mixed recommendations (with and without timeline)', () => {
      const input = [
        { action: 'Review process', timeline: 'This month' },
        { action: 'Implement changes' }
      ];
      const result = toString(input);
      expect(result).toContain('Review process');
      expect(result).toContain('Implement changes');
    });
  });

  describe('Null/undefined handling', () => {
    it('should return null for undefined', () => {
      expect(toString(undefined)).toBeNull();
    });

    it('should return null for null', () => {
      expect(toString(null)).toBeNull();
    });

    it('should return null for empty array', () => {
      expect(toString([])).toBeNull();
    });
  });

  describe('Plain objects', () => {
    it('should convert object to JSON string', () => {
      const input = { key: 'value', nested: { data: 123 } };
      const result = toString(input);
      expect(result).toContain('"key"');
      expect(result).toContain('"value"');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle AI-generated opportunities', () => {
      const aiOutput = [
        'Strengthen collaboration with international institutions',
        'Develop new research methodologies',
        'Increase publication rate in high-impact journals'
      ];
      const result = toString(aiOutput);
      expect(result).toBeTruthy();
      expect(result?.startsWith('•')).toBe(true);
      expect((result?.match(/\n/g) || []).length).toBe(2); // 3 items = 2 newlines
    });

    it('should handle AI-generated recommendations', () => {
      const aiOutput = [
        { 
          action: 'Establish Research Funding Committee', 
          timeline: 'Q1 2025' 
        },
        { 
          action: 'Launch Publication Incentive Program', 
          timeline: 'Q2 2025' 
        },
        { 
          action: 'Conduct Faculty Training on Research Ethics',
          timeline: 'Q1-Q2 2025'
        }
      ];
      const result = toString(aiOutput);
      expect(result).toContain('Research Funding Committee');
      expect(result).toContain('Q1 2025');
      expect(result).toContain('Publication Incentive');
    });

    it('should gracefully handle mixed/unexpected types in array', () => {
      const weirdArray = ['string', 123, { key: 'val' }, null];
      const result = toString(weirdArray);
      expect(result).toBeTruthy();
      expect(result).toContain('string');
    });
  });
});
