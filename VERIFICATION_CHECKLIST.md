# QPRO Integration - Verification Checklist

## ✅ Code Implementation Complete

All planned features have been implemented successfully:

### 1. Core Functionality
- [x] GPT-4o-mini integration with JSON mode
- [x] Zod schema validation (ActivitySchema, KRASummarySchema, QPROAnalysisOutputSchema)
- [x] Enhanced prompt template with detailed extraction instructions
- [x] Activity extraction with reported/target/achievement calculations
- [x] KRA matching with confidence scores
- [x] Redis caching for vector search results (24h TTL)
- [x] Error handling with exponential backoff retry (3 attempts)
- [x] LLM fallback chain (GPT-4o-mini → Qwen → Gemini)

### 2. Service Layer Updates
- [x] `analysis-engine-service.ts` - Main analysis engine
- [x] `qpro-analysis-service.ts` - Database operations
- [x] Removed broken regex parsing
- [x] Added structured JSON parsing with validation

### 3. Testing & Documentation
- [x] Comprehensive test suite (`__tests__/qpro-analysis-integration.test.ts`)
- [x] Full integration guide (`docs/qpro-gpt4o-mini-integration.md`)
- [x] Quick reference for developers (`docs/qpro-quick-reference.md`)
- [x] Implementation summary (`docs/qpro-integration-summary.md`)

## 🔍 Manual Verification Steps

### Before Testing
```bash
# 1. Install dependencies (if needed)
npm install

# 2. Generate Prisma client
npm run db:generate

# 3. Run unit tests
npm test -- qpro-analysis-integration
```

### Environment Variables Check
Verify these are set in `.env`:
```env
✓ OPENAI_API_KEY (for GPT-4o-mini)
✓ OPENAI_BASE_URL (https://openrouter.ai/api/v1)
✓ UPSTASH_REDIS_REST_URL
✓ UPSTASH_REDIS_REST_TOKEN
✓ UPSTASH_VECTOR_REST_URL
✓ UPSTASH_VECTOR_REST_TOKEN
✓ GOOGLE_AI_API_KEY (optional, for Gemini fallback)
```

### Integration Test
1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Login as ADMIN or FACULTY user**
   - Navigate to `http://localhost:3000`
   - Use admin credentials

3. **Navigate to QPRO page**
   - Go to `http://localhost:3000/qpro`

4. **Upload test QPRO document**
   - Use ActionZonePanel (right panel)
   - Upload PDF or DOCX with quantifiable activities
   - Example content:
     ```
     Activities Q1 2025:
     1. Faculty training: 8/10 workshops completed (80%)
     2. Curriculum updates: 5/5 sessions completed (100%)
     3. Student surveys: 350/500 responses (70%)
     ```

5. **Monitor analysis process**
   - Check browser console for progress
   - Expected processing time: 15-40 seconds
   - Watch for:
     - ✅ "Analysis started"
     - ✅ "Vector search results" (should show cache hit/miss)
     - ✅ "Successfully validated LLM response"
     - ✅ "Extracted X activities across Y KRAs"

6. **Verify results in UI**
   - **TargetBoardPanel** (left):
     - KRA cards should show status colors
     - Green (≥80%), Yellow (50-79%), Red (<50%)
   - **ActionZonePanel** (right):
     - Should show "Analysis complete" message
   - **InsightFeed** (if visible):
     - Should display individual activities with achievement %

7. **Verify database storage**
   ```bash
   # Open Prisma Studio
   npm run db:studio
   ```
   - Navigate to `QPROAnalysis` table
   - Check latest record:
     - `achievementScore` should be a number (not 0)
     - `kras` should be JSON array with KRA summaries
     - `activities` should be JSON array with extracted activities
     - `alignment`, `opportunities`, `gaps`, `recommendations` should have text

### Database Query Verification
```sql
-- In Prisma Studio or PostgreSQL client:
SELECT 
  id,
  document_title,
  achievement_score,
  jsonb_array_length(kras::jsonb) as kra_count,
  jsonb_array_length(activities::jsonb) as activity_count,
  created_at
FROM "QPROAnalysis"
ORDER BY created_at DESC
LIMIT 1;
```

Expected result:
- `achievement_score`: 60-90 (reasonable range)
- `kra_count`: 1-5 (based on document)
- `activity_count`: 3-20 (based on document)

### Check Individual Activity Details
```sql
-- In PostgreSQL:
SELECT 
  jsonb_array_elements(activities::jsonb) as activity
FROM "QPROAnalysis"
WHERE id = '<your-analysis-id>';
```

Expected activity structure:
```json
{
  "name": "Faculty training workshops",
  "kraId": "KRA 1",
  "initiativeId": "KRA1-KPI1",
  "reported": 8,
  "target": 10,
  "achievement": 80.0,
  "confidence": 0.85,
  "unit": "College of Engineering"
}
```

## 🚨 Common Issues & Solutions

### Issue 1: "LLM output validation failed"
**Symptoms:** Zod validation errors in console  
**Check:**
- Browser console for detailed Zod error messages
- LLM raw response (add debug logging)
- Verify JSON mode is enabled

**Fix:**
```typescript
// In analysis-engine-service.ts, add before validation:
console.log('[DEBUG] Raw LLM Response:', rawContent);
```

### Issue 2: Empty activities/kras arrays
**Symptoms:** Database has `[]` for activities  
**Check:**
- QPRO document has quantifiable activities with numbers
- Vector search returned relevant KRAs
- LLM prompt is being constructed correctly

**Fix:**
- Use more explicit QPRO document with "X/Y completed" format
- Check vector database has strategic plan data
- Review prompt template for clarity

### Issue 3: Redis cache errors
**Symptoms:** "Redis connection failed" in logs  
**Check:**
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct
- Redis service is accessible

**Fix:**
```bash
# Test Redis connection
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://YOUR_REDIS_URL/get/test-key
```

### Issue 4: Vector search returns 0 results
**Symptoms:** "No strategic plan context found"  
**Check:**
- Strategic plan has been ingested
- Upstash Vector database is accessible

**Fix:**
```bash
# Re-ingest strategic plan
npm run db:push
npx ts-node scripts/ingest-strategic-plan.ts
```

### Issue 5: LLM timeout or rate limit
**Symptoms:** "OpenAI API error" after 30+ seconds  
**Check:**
- API key is valid
- OpenRouter account has credits
- Not hitting rate limits

**Fix:**
- Check OpenRouter dashboard for usage
- Wait for rate limit reset
- Verify fallback to Qwen/Gemini works

## 📊 Expected Performance Metrics

After successful test:

| Metric | Expected Value |
|--------|---------------|
| **Processing Time** | 15-40 seconds |
| **Activities Extracted** | 3-20 (depends on document) |
| **KRAs Matched** | 1-5 (depends on activities) |
| **Achievement Score** | 60-90% (reasonable range) |
| **Confidence Scores** | 0.6-0.95 (most activities) |
| **Cache Hit** | 0% first run, 100% immediate retry |
| **LLM Fallback** | 0% (should use GPT-4o-mini) |

## ✨ Success Criteria

Your integration is successful if:

1. ✅ QPRO document uploads without errors
2. ✅ Analysis completes within 40 seconds
3. ✅ Database has populated `kras` and `activities` JSON
4. ✅ Achievement scores are calculated (not 0)
5. ✅ UI displays KRA status colors correctly
6. ✅ Unit tests pass (`npm test`)
7. ✅ No console errors during analysis
8. ✅ Redis cache works (second analysis faster)
9. ✅ LLM stays on GPT-4o-mini (no fallback to Qwen/Gemini)
10. ✅ Confidence scores are reasonable (>0.5 for most)

## 🎯 Next Steps After Verification

Once verification is complete:

1. **Production Deployment**
   - Deploy to staging environment first
   - Test with 5-10 real QPRO documents from different units
   - Collect feedback from faculty users

2. **Monitoring Setup**
   - Configure logging for LLM costs
   - Track cache hit rates
   - Monitor processing times
   - Set up alerts for failures

3. **User Training**
   - Document best practices for QPRO formatting
   - Train faculty on uploading documents
   - Explain confidence scores and manual review process

4. **Optimization**
   - Adjust prompt based on user feedback
   - Fine-tune confidence thresholds
   - Optimize caching strategy

5. **Feature Expansion**
   - Add batch processing for multiple documents
   - Implement historical trend analysis
   - Create export/reporting features

## 📝 Sign-Off Checklist

- [ ] Code review completed
- [ ] Unit tests pass
- [ ] Integration test successful
- [ ] Database verification complete
- [ ] Performance metrics acceptable
- [ ] Documentation reviewed
- [ ] Environment variables configured
- [ ] Redis caching working
- [ ] LLM fallback tested (optional)
- [ ] Ready for staging deployment

---

**Date:** December 6, 2025  
**Version:** 2.0.0  
**Status:** ✅ Implementation Complete - Ready for Verification  

**Next Action:** Run integration test with sample QPRO document
