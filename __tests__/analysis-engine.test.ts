import { analysisEngineService } from '@/lib/services/analysis-engine-service';

// Mock the dependencies since we're just validating the implementation
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

// Mock pdf2json
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
                  R: [{ T: '53616d706c65205150524f20646f63756d656e7420636f6e74656e7420666f722074657374696e6720707572706f736573' }] // Hex encoded version of "Sample QPRO document content for testing purposes"
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

describe('QPRO Analysis Engine', () => {
  test('should process QPRO PDF and return analysis', async () => {
    // Create a mock PDF buffer
    const mockPdfBuffer = Buffer.from('fake pdf content');
    
    // Call the processQPRO method with file type
    const result = await analysisEngineService.processQPRO(mockPdfBuffer, 'application/pdf');
    
    // Validate the result is a string (the analysis output)
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
  
  test('should handle empty PDF buffer', async () => {
    const emptyBuffer = Buffer.from('');
    
    await expect(analysisEngineService.processQPRO(emptyBuffer, 'application/pdf')).rejects.toThrow();
  });
});