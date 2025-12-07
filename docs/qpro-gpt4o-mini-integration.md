# QPRO Analysis System - GPT-4o-mini Integration Guide

## Overview

The QPRO Analysis System has been upgraded to use **GPT-4o-mini** with structured JSON output for generating insights and prescriptive analysis from Quarterly Physical Report of Operations (QPRO) documents.

## Key Features

### 1. Structured Output with Function Calling
- **LLM Model:** GPT-4o-mini with JSON mode enabled
- **Schema Validation:** Zod schemas ensure type-safe, validated output
- **Consistent Structure:** Every analysis returns standardized JSON with activities, KRAs, insights, and recommendations

### 2. Activity Extraction & KRA Matching
- **Automatic Extraction:** Identifies activities with reported/target values
- **Achievement Calculation:** Computes (reported/target) × 100 for each activity
- **Semantic Matching:** Maps activities to strategic plan KRAs using vector similarity
- **Confidence Scoring:** Assigns 0-1 confidence scores for manual review of low-confidence matches

### 3. Redis Caching for Performance
- **Vector Search Caching:** 24-hour TTL for embedding search results
- **Cache Key Strategy:** MD5 hash of document text + unit ID
- **Cost Reduction:** Minimizes redundant OpenAI API calls

### 4. Enhanced Context Injection
- **Increased Context:** Top 10 strategic plan vectors (up from 5)
- **Unit Filtering:** Pre-filters by responsible offices matching the user's unit
- **Full Metadata:** Includes KPIs, strategies, activities, and targets in prompt

### 5. Error Handling & LLM Fallback
- **Retry Logic:** 3 attempts with exponential backoff (2s, 4s, 8s)
- **Fallback Providers:** Qwen → Gemini if GPT-4o-mini fails
- **Graceful Degradation:** Returns descriptive errors instead of crashing

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    QPRO Upload (PDF/DOCX)                   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              File Processing (Mammoth/PDF2JSON)             │
│                  Extract Text from Document                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Redis Cache Check                         │
│              (MD5 hash + unitId cache key)                  │
└───────────────────┬───────────────────┬─────────────────────┘
                    │                   │
           Cache Hit│                   │Cache Miss
                    │                   │
                    ▼                   ▼
         ┌──────────────────┐  ┌───────────────────────────┐
         │  Return Cached   │  │ Generate Embedding (Ada-002)│
         │  Vector Results  │  │ Search Upstash Vector DB   │
         └────────┬─────────┘  │ Filter by Unit (if present)│
                  │            └────────────┬──────────────┘
                  │                         │
                  └────────────┬────────────┘
                               │
                               ▼
                  ┌────────────────────────────────────┐
                  │  Format Strategic Context          │
                  │  - Top 10 KRAs/Initiatives         │
                  │  - Full metadata (KPIs, strategies)│
                  │  - Similarity scores               │
                  └────────────┬───────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 LLM Analysis (GPT-4o-mini)                  │
│  - JSON mode with Zod schema enforcement                    │
│  - Extract activities (name, reported, target, achievement) │
│  - Match to KRAs with confidence scores                     │
│  - Generate alignment, opportunities, gaps, recommendations │
└───────────────────────────┬─────────────────────────────────┘
                            │
                   Retry on Error (3x)
                            │
                ┌───────────┴──────────┐
                │                      │
         Success│               Failure│
                │                      │
                ▼                      ▼
    ┌───────────────────┐   ┌─────────────────────┐
    │  Parse & Validate │   │ Fallback to Qwen    │
    │  JSON with Zod    │   │ (OpenRouter)        │
    └────────┬──────────┘   └──────────┬──────────┘
             │                          │
             │                   Retry on Error
             │                          │
             │              ┌───────────┴──────────┐
             │              │                      │
             │       Success│               Failure│
             │              │                      │
             │              ▼                      ▼
             │   ┌─────────────────┐   ┌──────────────────┐
             │   │ Parse & Validate│   │ Fallback to Gemini│
             │   │ JSON with Zod   │   │ (Google AI)       │
             │   └────────┬────────┘   └───────┬───────────┘
             │            │                    │
             └────────────┴────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │       Store in PostgreSQL              │
         │  - Structured JSON (kras, activities)  │
         │  - Achievement scores                  │
         │  - Text summaries (alignment, gaps)    │
         │  - Link to document, user, unit        │
         └────────────────┬───────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────────────┐
         │         UI Display                     │
         │  - TargetBoardPanel (KRA status)       │
         │  - InsightFeed (activity achievements) │
         │  - Recommendations                     │
         └────────────────────────────────────────┘
```

## Data Flow

### Input: QPRO Document
```
PDF/DOCX file containing:
- Activity reports (e.g., "Conducted 8 faculty training workshops")
- Quantitative data (e.g., "Target: 10 workshops, Accomplished: 8")
- Unit/office information
- Time period (year/quarter)
```

### Processing: LLM Analysis
```typescript
{
  strategic_context: "Top 10 KRAs with full metadata",
  user_input: "Extracted QPRO text"
}
→ GPT-4o-mini (JSON mode)
→ Structured JSON Output
```

### Output: Validated QPROAnalysisOutput
```typescript
{
  activities: [
    {
      name: "Faculty training workshops",
      kraId: "KRA 1",
      initiativeId: "KRA1-KPI1",
      reported: 8,
      target: 10,
      achievement: 80.0,      // (8/10) * 100
      confidence: 0.85,        // 85% confident match
      unit: "College of Engineering"
    }
  ],
  kras: [
    {
      kraId: "KRA 1",
      kraTitle: "Development of New Curricula",
      achievementRate: 80.0,   // Average of all activities
      activities: [...],
      strategicAlignment: "Strong alignment with curriculum initiatives"
    }
  ],
  alignment: "2-3 paragraph analysis",
  opportunities: "Strategic opportunities identified",
  gaps: "Specific gaps with numbers",
  recommendations: "Prioritized actionable recommendations",
  overallAchievement: 80.0    // Weighted average across KRAs
}
```

### Storage: PostgreSQL
```sql
QPROAnalysis {
  id: cuid
  documentId: string
  analysisResult: string       -- Markdown formatted summary
  alignment: string
  opportunities: string
  gaps: string
  recommendations: string
  kras: JSON                   -- Full KRA array
  activities: JSON             -- Full activities array
  achievementScore: number     -- overallAchievement
  unitId: string
  year: number
  quarter: number
  createdAt: timestamp
}
```

## API Usage

### Upload & Analyze QPRO Document
```typescript
POST /api/analyze-qpro

FormData:
- file: PDF/DOCX file
- title: Document title
- unitId: Unit UUID
- year: 2025
- quarter: 1-4

Response:
{
  analysis: QPROAnalysis,
  documentId: string,
  analysisId: string
}
```

### Retrieve Analysis
```typescript
GET /api/qpro-analyses?unitId=xxx&year=2025&quarter=1

Response:
{
  analyses: QPROAnalysis[]
}
```

## Configuration

### Environment Variables
```env
# OpenAI (GPT-4o-mini + embeddings)
OPENAI_API_KEY="sk-or-v1-..."
OPENAI_BASE_URL="https://openrouter.ai/api/v1"

# Upstash Vector Database
UPSTASH_VECTOR_REST_URL="https://..."
UPSTASH_VECTOR_REST_TOKEN="..."

# Redis Cache
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Fallback LLMs (optional)
GOOGLE_AI_API_KEY="..."  # For Gemini fallback
```

### Service Configuration
```typescript
// lib/services/analysis-engine-service.ts
new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.2,
  modelKwargs: {
    response_format: { type: "json_object" }
  }
})
```

## Testing

### Run Tests
```bash
npm test -- qpro-analysis-integration
```

### Test Coverage
- ✅ Zod schema validation
- ✅ Achievement score calculations
- ✅ Cache key generation
- ✅ JSON response parsing
- ✅ Error handling
- ✅ Strategic context formatting

### Manual Testing
1. Upload sample QPRO PDF with quantifiable activities
2. Check PostgreSQL `QPROAnalysis` table for populated `kras` and `activities` JSON
3. Verify UI components display achievement percentages
4. Test low-confidence matches (confidence < 0.5)
5. Simulate API failures to test fallback providers

## Troubleshooting

### Issue: Empty `activities` or `kras` arrays
**Cause:** LLM failed to extract structured data from QPRO text  
**Solution:** 
- Check if QPRO document contains quantifiable activities
- Review LLM response in `analysisResult` field
- Lower confidence threshold for KRA matching

### Issue: JSON parsing errors
**Cause:** LLM returned non-JSON response despite JSON mode  
**Solution:**
- Check Zod validation errors in logs
- Verify `response_format: { type: "json_object" }` is set
- Test fallback providers (Qwen, Gemini)

### Issue: Low achievement scores
**Cause:** Activities matched to wrong KRAs or missing targets  
**Solution:**
- Verify vector database has strategic plan data
- Check unit filtering logic
- Review confidence scores for activity-KRA matches

### Issue: Redis cache misses
**Cause:** Cache key mismatch or expired cache  
**Solution:**
- Verify Redis connection (`UPSTASH_REDIS_REST_URL`)
- Check cache TTL (default 24 hours)
- Review cache key generation logic

## Performance Metrics

| Metric | Value |
|--------|-------|
| **PDF Processing** | ~2-5 seconds (10-page document) |
| **Vector Search** | ~500ms (cached) / ~2s (uncached) |
| **LLM Analysis** | ~10-30 seconds (GPT-4o-mini) |
| **Total Processing** | ~15-40 seconds per QPRO document |
| **Cache Hit Rate** | ~60% (24-hour TTL) |
| **API Cost** | ~$0.01-0.05 per analysis (OpenRouter) |

## Best Practices

1. **Document Formatting**: Ensure QPRO documents have clear activity descriptions with numbers
2. **Unit Assignment**: Always provide `unitId` for better KRA filtering
3. **Manual Review**: Check activities with `confidence < 0.5` for accuracy
4. **Batch Processing**: Upload multiple documents sequentially (not parallel) to avoid rate limits
5. **Error Monitoring**: Log LLM failures and fallback usage for debugging

## Future Enhancements

- [ ] Multi-page batch processing for large QPRO documents
- [ ] Historical trend analysis (compare Q1 vs Q2 vs Q3)
- [ ] Auto-suggestion of missing KRA mappings
- [ ] Real-time progress tracking during analysis
- [ ] Export analysis reports as PDF/Excel
- [ ] Integration with notification system for low achievement alerts

## References

- **Zod Documentation**: https://zod.dev
- **OpenAI JSON Mode**: https://platform.openai.com/docs/guides/json-mode
- **LangChain Prompts**: https://js.langchain.com/docs/modules/prompts
- **Upstash Vector**: https://upstash.com/docs/vector
- **Upstash Redis**: https://upstash.com/docs/redis

---

**Last Updated:** December 6, 2025  
**Version:** 2.0.0  
**Status:** Production Ready
