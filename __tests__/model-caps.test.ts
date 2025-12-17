import QwenGenerationService from '@/lib/services/qwen-generation-service';
import GeminiGenerationService from '@/lib/services/gemini-generation-service';

describe('Model output caps', () => {
  test('QwenGenerationService clamps gpt-4o-mini to <= 4096 tokens', () => {
    const svc = new QwenGenerationService({ apiKey: 'test', model: 'gpt-4o-mini' } as any);
    const max = svc['config']?.generationConfig?.maxOutputTokens;
    expect(typeof max).toBe('number');
    expect(max).toBeLessThanOrEqual(4096);
  });

  test('GeminiGenerationService clamps gpt-4o-mini to <= 4096 tokens', () => {
    const svc = new GeminiGenerationService({ apiKey: 'test', model: 'gpt-4o-mini' } as any);
    const max = svc['config']?.generationConfig?.maxOutputTokens;
    expect(typeof max).toBe('number');
    expect(max).toBeLessThanOrEqual(4096);
  });
});
