# QPRO Analysis System - Quick Reference

## For Developers

### Key Files Modified

| File | Changes |
|------|---------|
| `lib/services/analysis-engine-service.ts` | ✅ GPT-4o-mini with JSON mode<br>✅ Zod schemas<br>✅ Enhanced prompts<br>✅ Redis caching<br>✅ Retry + fallback logic |
| `lib/services/qpro-analysis-service.ts` | ✅ Use structured output<br>✅ Remove regex parsing<br>✅ Format analysis for storage |
| `__tests__/qpro-analysis-integration.test.ts` | ✅ Comprehensive test suite |
| `docs/qpro-gpt4o-mini-integration.md` | ✅ Full documentation |

### How It Works (Simple Version)

1. **User uploads** PDF/DOCX QPRO document
2. **Extract text** using Mammoth (DOCX) or PDF2JSON (PDF)
3. **Check Redis cache** for vector search results
4. **Vector search** strategic plan (Top 10 KRAs matching unit)
5. **Call GPT-4o-mini** with JSON mode
6. **Validate output** with Zod schemas
7. **Store in PostgreSQL** with structured JSON
8. **Display in UI** (TargetBoardPanel, InsightFeed)

### Code Examples

#### Using the Analysis Engine
```typescript
import { analysisEngineService } from '@/lib/services/analysis-engine-service';

const fileBuffer = await readFileFromAzure(documentPath);
const analysis = await analysisEngineService.processQPRO(
  fileBuffer,
  'application/pdf',
  'unit-123' // optional unit ID for filtering
);

console.log(analysis.activities); // Array of extracted activities
console.log(analysis.overallAchievement); // 75.5
```

#### Creating QPRO Analysis
```typescript
import { qproAnalysisService } from '@/lib/services/qpro-analysis-service';

const qproAnalysis = await qproAnalysisService.createQPROAnalysis({
  documentId: 'doc-123',
  documentTitle: 'Q1 2025 Report',
  documentPath: 'user-id/file.pdf',
  documentType: 'application/pdf',
  uploadedById: 'user-123',
  unitId: 'unit-123',
  year: 2025,
  quarter: 1,
});

console.log(qproAnalysis.achievementScore); // 75.5
console.log(qproAnalysis.kras); // JSON array of KRA summaries
```

#### Validating Analysis Output
```typescript
import { QPROAnalysisOutputSchema } from '@/lib/services/analysis-engine-service';

const rawLLMOutput = {
  activities: [...],
  kras: [...],
  alignment: '...',
  // ... other fields
};

const validated = QPROAnalysisOutputSchema.parse(rawLLMOutput);
// Throws ZodError if invalid
```

### Environment Setup

```bash
# 1. Ensure environment variables are set
cp .env.example .env
# Edit .env with your API keys

# 2. Install dependencies (if not already)
npm install

# 3. Generate Prisma client
npm run db:generate

# 4. Run tests
npm test -- qpro-analysis-integration

# 5. Start dev server
npm run dev
```

### Debugging Tips

#### Check LLM Response
```typescript
// In analysis-engine-service.ts, add logging:
console.log('[DEBUG] Raw LLM Response:', result.content);
```

#### Verify Vector Search Results
```typescript
// In analysis-engine-service.ts:
console.log('[DEBUG] Vector Search Results:', searchResults.length);
searchResults.forEach((r, i) => {
  console.log(`[${i}] KRA: ${r.metadata?.kra_id}, Score: ${r.score}`);
});
```

#### Test Redis Cache
```typescript
import { redisService } from '@/lib/services/redis-service';

const cacheKey = 'qpro:vector-search:test';
await redisService.set(cacheKey, JSON.stringify({ test: 'data' }), 60);
const cached = await redisService.get(cacheKey);
console.log('Cached data:', cached);
```

#### Validate Zod Schema
```typescript
import { ActivitySchema } from '@/lib/services/analysis-engine-service';

const testActivity = {
  name: 'Test activity',
  kraId: 'KRA 1',
  reported: 8,
  target: 10,
  achievement: 80,
  confidence: 0.85,
};

const result = ActivitySchema.safeParse(testActivity);
if (!result.success) {
  console.error('Validation errors:', result.error.errors);
}
```

### Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `LLM output validation failed` | Zod schema mismatch | Check LLM response format, verify JSON structure |
| `No text could be extracted` | Empty/corrupted PDF | Verify file upload, check PDF structure |
| `Vector search returned 0 results` | Strategic plan not indexed | Run `scripts/ingest-strategic-plan.ts` |
| `Redis connection failed` | Invalid Redis credentials | Check `UPSTASH_REDIS_REST_URL` and `TOKEN` |
| `OpenAI API error` | Rate limit or invalid key | Check `OPENAI_API_KEY`, wait for rate limit reset |

### Performance Optimization

1. **Enable Redis caching** - Reduces vector search from ~2s to ~500ms
2. **Filter by unit** - Reduces vector search results, faster processing
3. **Batch processing** - Process multiple documents in queue (not parallel)
4. **Lower temperature** - 0.2 for more deterministic, faster responses

### Testing Checklist

Before deploying:
- [ ] Run full test suite: `npm test`
- [ ] Upload sample QPRO PDF and verify extraction
- [ ] Check PostgreSQL for populated `kras` and `activities` JSON
- [ ] Verify UI displays achievement scores correctly
- [ ] Test with low-quality QPRO document (sparse data)
- [ ] Test LLM fallback by temporarily breaking OpenAI key
- [ ] Check Redis cache hit rate in logs
- [ ] Verify error logging and monitoring

### Monitoring in Production

```typescript
// Add custom logging in analysis-engine-service.ts
console.log('[MONITOR] Analysis started', {
  unitId,
  documentType,
  textLength: userText.length,
  timestamp: new Date().toISOString(),
});

console.log('[MONITOR] Analysis completed', {
  activitiesExtracted: analysis.activities.length,
  krasMatched: analysis.kras.length,
  achievementScore: analysis.overallAchievement,
  cacheHit: !!cachedResults,
  processingTime: Date.now() - startTime,
});
```

### Next Steps

1. **Deploy to production** - Test with real QPRO documents
2. **Monitor LLM costs** - Track OpenRouter API usage
3. **Collect feedback** - Review low-confidence activity matches
4. **Optimize prompts** - Improve extraction accuracy based on user feedback
5. **Add batch processing** - Allow multiple QPRO uploads at once

---

**Need Help?**
- Check full docs: `docs/qpro-gpt4o-mini-integration.md`
- Review tests: `__tests__/qpro-analysis-integration.test.ts`
- See strategic plan data: `scripts/ingest-strategic-plan.ts`
