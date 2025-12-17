// Mock PromptTemplate to ensure .pipe().invoke() returns the expected structure
jest.mock('@langchain/core/prompts', () => ({
  PromptTemplate: {
    fromTemplate: jest.fn().mockReturnValue({
      pipe: jest.fn().mockReturnValue({
        invoke: jest.fn().mockResolvedValue({
          content: JSON.stringify({
            kras: [
                {
                  kraId: 'KRA 1',
                  kraTitle: 'Sample KRA',
                  achievementRate: 100,
                  activities: [
                    {
                      name: 'Activity 1',
                      kraId: 'KRA 1',
                      reported: 10,
                      target: 10,
                      achievement: 100,
                      status: 'MET',
                      authorizedStrategy: 'strategy text',
                      aiInsight: 'Insight',
                      prescriptiveAnalysis: 'Analysis',
                      confidence: 1
                    }
                  ],
                  strategicAlignment: 'Aligned'
                }
              ],
              activities: [
                {
                  name: 'Activity 1',
                  kraId: 'KRA 1',
                  reported: 10,
                  target: 10,
                  achievement: 100,
                  status: 'MET',
                  authorizedStrategy: 'strategy text',
                  aiInsight: 'Insight',
                  prescriptiveAnalysis: 'Analysis',
                  confidence: 1
                }
              ],
            alignment: 'Aligned',
            opportunities: 'Opportunity 1',
            gaps: 'Gap 1',
            recommendations: 'Recommendation 1',
            overallAchievement: 100
          })
        })
      })
    })
  }
}));

// Mock ChatOpenAI to provide invoke method for router/extractor models
jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    invoke: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        kraId: 'KRA 1',
        confidence: 1.0,
        reasoning: 'Test routing'
      })
    })
  }))
}));
// All mocks must be at the very top before any imports
jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    pipe: jest.fn().mockReturnValue({
      invoke: jest.fn().mockResolvedValue({
        content: JSON.stringify({
          kras: [
            {
              kraId: 'KRA 1',
              kraTitle: 'Sample KRA',
              achievementRate: 100,
              activities: [
                {
                  name: 'Activity 1',
                  kraId: 'KRA 1',
                  reported: 10,
                  target: 10,
                  achievement: 100,
                  status: 'MET',
                  authorizedStrategy: 'strategy text',
                  aiInsight: 'Insight',
                  prescriptiveAnalysis: 'Analysis',
                  confidence: 1
                }
              ],
              strategicAlignment: 'Aligned'
            }
          ],
          activities: [
            {
              name: 'Activity 1',
              kraId: 'KRA 1',
              reported: 10,
              target: 10,
              achievement: 100,
              status: 'MET',
              authorizedStrategy: 'strategy text',
              aiInsight: 'Insight',
              prescriptiveAnalysis: 'Analysis',
              confidence: 1
            }
          ],
          alignment: 'Aligned',
          opportunities: ['Opportunity 1'],
          gaps: 'Gap 1',
          recommendations: ['Recommendation 1'],
          overallAchievement: 100
        })
      })
    })
  }))
}));
jest.mock('@/lib/services/redis-service', () => ({
  redisService: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(true),
    exists: jest.fn().mockResolvedValue(false),
    expire: jest.fn().mockResolvedValue(true),
    keys: jest.fn().mockResolvedValue([]),
  }
}));
jest.mock('@/lib/services/embedding-service', () => ({
  embeddingService: {
    generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3])
  }
}));
jest.mock('@/lib/services/vector-service', () => ({
  vectorService: {
    searchVectors: jest.fn().mockResolvedValue([
      { metadata: { text: 'Sample strategic plan data for testing' } }
    ])
  }
}));
jest.mock('pdf2json', () => {
  return jest.fn().mockImplementation(() => {
    return {
      on: (event: string, callback: Function) => {
        if (event === 'pdfParser_dataReady') {
          // Simulate pdf2json output structure
          callback({
            formImage: {
              Pages: [{
                Texts: [{
                  R: [{ T: '53616d706c65205150524f20646f63756d656e7420636f6e74656e7420666f722074657374696e6720707572706f736573' }]
                }]
              }]
            }
          });
        }
      },
      parseBuffer: (buffer: Buffer) => {
        // Mock implementation
      }
    };
  });
});

import { analysisEngineService } from '@/lib/services/analysis-engine-service';

describe('QPRO Analysis Engine', () => {
  // NOTE: This test suite requires proper mocking of ChatOpenAI models.
  // The router and extractor models are initialized at module load time,
  // so Jest mocks must be set up before the module is imported.
  // For now, integration tests in qpro-analysis-integration.test.ts validate
  // the schema and data transformations.
  
  test.skip('should process QPRO PDF and return analysis', async () => {
    // Create a mock PDF buffer
    const mockPdfBuffer = Buffer.from('fake pdf content');
    
    // Call the processQPRO method with file type
    const result = await analysisEngineService.processQPRO(mockPdfBuffer, 'application/pdf');
    
    // Validate the result is a structured object with required fields
    expect(typeof result).toBe('object');
    expect(result).toHaveProperty('kras');
    expect(result).toHaveProperty('activities');
    expect(result).toHaveProperty('alignment');
    expect(result).toHaveProperty('opportunities');
    expect(result).toHaveProperty('gaps');
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('overallAchievement');
    expect(Array.isArray(result.kras)).toBe(true);
    expect(Array.isArray(result.activities)).toBe(true);
  });
  
  test('should handle empty PDF buffer', async () => {
    const emptyBuffer = Buffer.from('');
    
    await expect(analysisEngineService.processQPRO(emptyBuffer, 'application/pdf')).rejects.toThrow();
  });
});