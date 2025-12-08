import { embeddingService } from './embedding-service';
import { vectorService } from './vector-service';
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from 'zod';
import { redisService } from './redis-service';
import { createHash } from 'crypto';

// Import pdf2json and mammoth using CommonJS style since they use export = syntax
import mammoth from 'mammoth';
const PDFParser = require('pdf2json');

// Zod schemas for structured output validation
export const ActivitySchema = z.object({
  name: z.string().describe('Activity description from QPRO document'),
  kraId: z.string().describe('Matched KRA ID (e.g., "KRA 1")'),
  initiativeId: z.string().optional().describe('Matched initiative ID (e.g., "KRA1-KPI1")'),
  reported: z.number().describe('Reported/accomplished value'),
  target: z.number().describe('Target value from Strategic Plan timeline_data for the reporting year'),
  achievement: z.number().min(0).max(100).describe('Achievement percentage'),
  status: z.enum(["MET", "MISSED"]).describe('Status of target achievement - MET if achievement >= 100%, MISSED otherwise'),
  authorizedStrategy: z.string().describe('Exact strategy text copied from Strategic Plan context'),
  aiInsight: z.string().describe('AI-generated insight for this activity'),
  prescriptiveAnalysis: z.string().describe('Prescriptive analysis based on CALCULATED status (not raw numbers). Always reference the status field. For MET: focus on sustainability. For MISSED: focus on immediate corrective actions.'),
  confidence: z.number().min(0).max(1).describe('Confidence score for KRA matching (0-1)'),
  unit: z.string().optional().describe('Unit mentioned in context'),
});

export const KRASummarySchema = z.object({
  kraId: z.string(),
  kraTitle: z.string(),
  achievementRate: z.number().min(0).max(100),
  activities: z.union([
    z.array(ActivitySchema),
    z.array(z.string()),
    z.array(z.any())
  ]).transform((val) => {
    // If activities are strings, convert to activity name references
    if (val.length > 0 && typeof val[0] === 'string') {
      return val.map((name: string) => ({
        name: name,
        kraId: '',
        reported: 0,
        target: 0,
        achievement: 0,
        status: 'MISSED',
        authorizedStrategy: '',
        aiInsight: '',
        prescriptiveAnalysis: '',
        confidence: 0
      }));
    }
    return val;
  }),
  strategicAlignment: z.string().describe('How this KRA aligns with strategic plan'),
});

export const QPROAnalysisOutputSchema = z.object({
  activities: z.array(ActivitySchema).describe('All extracted activities with KRA matches'),
  kras: z.array(KRASummarySchema).describe('Summary grouped by KRA'),
  alignment: z.string().describe('Overall strategic alignment analysis'),
  opportunities: z.union([z.string(), z.array(z.string())]).transform((val) => {
    // Convert array to bullet-point string
    return Array.isArray(val) ? '• ' + val.join('\n• ') : val;
  }).describe('Strategic opportunities identified'),
  gaps: z.string().describe('Gaps or conflicts identified'),
  recommendations: z.union([z.string(), z.array(z.string())]).transform((val) => {
    // Convert array to bullet-point string
    return Array.isArray(val) ? '• ' + val.join('\n• ') : val;
  }).describe('Actionable recommendations'),
  overallAchievement: z.number().min(0).max(100).describe('Overall achievement score'),
});

export type QPROAnalysisOutput = z.infer<typeof QPROAnalysisOutputSchema>;

class AnalysisEngineService {
  private llm: BaseLanguageModel;
  private promptTemplate: PromptTemplate;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0,
      modelKwargs: {
        response_format: { type: "json_object" },
        seed: 42
      },
    });
    
    this.promptTemplate = PromptTemplate.fromTemplate(`
You are an expert strategic planning analyst for Laguna State Polytechnic University. Analyze a Quarterly Physical Report of Operations (QPRO) document against the university's strategic plan.

## Strategic Plan Context (Top 10 Most Relevant KRAs/Initiatives):
{strategic_context}

## QPRO Document Text:
{user_input}

## Document Format Recognition:
- If the document is a **table/spreadsheet format** (e.g., "Training/Seminar Report", "Faculty/Staff Training"), extract EVERY single row as a separate activity
- If the document is a **narrative format**, extract all mentioned activities with quantifiable metrics
- Each row in a training table = one individual activity entry

## Your Task:
Extract ALL activities from the QPRO document. For training tables, create one activity entry per row (do not skip any rows).

For each activity:
1. **Identify the activity name** (exact title from the document, e.g., "Introduction to AI, ML and DP")
2. **Extract reported/accomplished value**:
   - For training tables: reported = 1 (one instance of this training attended)
   - For narrative reports: extract the actual number from the text
3. **Look up target value** from the Strategic Plan Context above. Find the matched initiative's "Targets" object and use the target_value from timeline_data for year 2025. DO NOT extract targets from the QPRO document text. The target MUST come from the Strategic Plan's timeline_data.

## CRITICAL: KRA MATCHING STRATEGY - PRIORITIZE KPI & STRATEGIES
**Match activities to KRAs using this PRIORITY ORDER:**

**STEP 1: STRATEGY MATCHING (Highest Priority)**
- First, check if the QPRO activity directly implements one of the **Strategies** listed in the KRA
- Example: If KRA 13 has strategy "conduct health and wellness program twice a week" and QPRO reports "health and wellness program", this is a STRONG match
- Use exact or near-exact keyword matching for strategy alignment

**STEP 2: KPI VALIDATION (Second Priority)**
- Verify if the activity contributes to the **Key Performance Indicator (KPI)** outputs/outcomes
- Example: If KRA 13 KPI output is "100% faculty and staff attended health and wellness program" and QPRO reports staff attending health program, this validates the KRA match
- Check if reported outcomes align with expected KPI outcomes (e.g., improvements in fitness levels, wellness metrics)

**STEP 3: TYPE-BASED CATEGORIZATION (Tertiary Priority)**
- If neither strategy nor KPI directly match, use activity TYPE to narrow down:
  - **Training/Seminars/Workshops/Conferences** → Only KRA 11 or KRA 13 (HR Development)
  - **Curriculum Development/Course Updates** → Only KRA 1
  - **Research/Publications** → Only KRA 3, 4, 5 (Research KRAs)
  - **Digital Systems/Infrastructure** → Only KRA 17
  - **Health/Wellness Programs** → Only KRA 13
  - **Community/Extension Programs** → Only KRA 6, 7, 8 (Community Engagement)

**STEP 4: SEMANTIC SIMILARITY (Lowest Priority)**
- Only use general semantic similarity if strategies and KPI don't provide clear alignment
- Ensure the selected KRA is compatible with the activity type from Step 3

4. **Calculate achievement percentage** = (reported / target) * 100
5. **Determine status**: If achievement >= 100%, status = "MET"; otherwise, status = "MISSED".
6. **Copy authorized strategy**: Select and copy the EXACT text of the most relevant strategy from the "Strategies" field in the Strategic Plan Context above for the specific KRA being matched. Do not paraphrase or create new strategies.
7. **AI Insight**: Write a concise, professional insight for this activity (1-2 sentences, analytical and actionable).
8. **Prescriptive Analysis**: Based on the CALCULATED STATUS and authorized strategy, write ACTION-ORIENTED prescriptive analysis (do NOT just state the gap - provide concrete steps). CRITICAL: Use the status value, NOT raw number comparison:
   - If status is "MET": "To sustain this achievement, continue implementing [exact authorized strategy]. Consider [specific sustainability action like expanding scope, documenting best practices, or mentoring other units]."
   - If status is "MISSED": "To close this gap, immediately implement [exact authorized strategy]. Specific actions: [concrete steps with timeline like 'Schedule 2 additional sessions before Q4 ends' or 'Partner with 3 industry experts by December 2025']."
   - Be SPECIFIC with timelines (e.g., "by Q4 2025", "before semester end", "by [month] [year]") and quantifiable actions (e.g., "2 additional sessions", "3 partner organizations", "increase by 50%")
   - NEVER use the raw comparison (reported vs target) to determine advice tone; ALWAYS use the calculated status field.
9. **Assign confidence score** (0.0-1.0) for the KRA match based on strategy alignment first, then KPI validation, then semantic similarity:
   - 0.95-1.0: Perfect strategy + KPI match
   - 0.85-0.94: Strong strategy match + partial KPI alignment
   - 0.75-0.84: Type match + some semantic alignment
   - Below 0.75: Only semantic similarity available
10. **Extract unit/office** mentioned if available.

## VALIDATION BEFORE OUTPUT:
1. **Check for duplicates**: Scan your activities array. If any activity name appears more than once, DELETE all duplicates except the one with the highest confidence score.
2. **Verify target source**: Ensure every target value comes from the Strategic Plan's timeline_data, NOT from counting QPRO entries.
3. **Verify strategy-based matching**: For each activity, ensure it was matched using the priority order above (Strategy > KPI > Type > Semantic).
4. **Verify type alignment**: Ensure training/seminars are ONLY matched to HR/staff development KRAs, health programs to KRA 13, etc.

## Important Guidelines:
- **COUNT ALL TRAINING SESSIONS**: For training/seminar tables, extract EVERY single row as individual activities with reported=1 each
- **STRICT NO DUPLICATES**: Each activity name can appear ONLY ONCE in the activities array. If you're tempted to add the same activity to multiple KRAs, choose the SINGLE best match only.
- **CRITICAL - TARGETS FROM STRATEGIC PLAN JSON**: 
  - Targets MUST come from the Strategic Plan's timeline_data for year 2025, NOT from QPRO document content
  - For each activity, look up the matched KRA's initiative and extract target_value from timeline_data[2025]
  - If the KRA has multiple initiatives (KPIs), select the one with highest semantic match to the activity
  - If target_value is non-numeric (e.g., "Curriculum Updated"), convert to 1 (treat as 1 milestone unit)
  - DO NOT count how many activities you extracted as the target
  - DO NOT use the number of rows in the QPRO document as the target
  - The target is a FIXED number from the strategic plan JSON, independent of the QPRO document content
  - Example: If Strategic Plan says target_value = 2 for 2025, use 2 even if QPRO has 9 training entries. Achievement = 9/2 = 450%
- **STRATEGY-FIRST MATCHING**: Always check the Strategies field first before considering semantic similarity
- **SINGLE BEST-FIT KRA**: Each activity matches to ONLY ONE KRA based on strategy alignment first, then type matching
- **Return initiativeId**: Include the specific initiative/KPI ID (e.g., "KRA13-KPI1") to enable post-processing validation and proper target lookup
- The authorizedStrategy field MUST be an exact copy from the Strategic Plan Context strategies list for the matched KRA

## Output Format:
Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:

{{
  "activities": [
    {{
      "name": "Faculty training workshops",
      "kraId": "KRA 1",
      "initiativeId": "KRA1-KPI1",
      "reported": 8,
      "target": 10,
      "achievement": 80.0,
      "status": "MISSED",
      "authorizedStrategy": "collaborate with industry experts, tech companies and research institutions to design relevant course content",
      "aiInsight": "Training completion at 80% indicates good progress but falls short of the annual target.",
      "prescriptiveAnalysis": "Based on Strategic Plan strategy: collaborate with industry experts, tech companies and research institutions to design relevant course content. To address the gap of 2 workshops, prioritize partnerships with at least 2 additional industry experts before Q4.",
      "confidence": 0.95,
      "unit": "Office of the VP for Academic Affairs"
    }}
  ],
  "kras": [
    {{
      "kraId": "KRA 1",
      "kraTitle": "Development of New Curricula...",
      "achievementRate": 75.5,
      "activities": [...activities for this KRA...],
      "strategicAlignment": "This KRA shows strong alignment with curriculum development initiatives..."
    }}
  ],
  "alignment": "Overall strategic alignment analysis (2-3 paragraphs)",
  "opportunities": "Strategic opportunities identified (bullet points or paragraphs)",
  "gaps": "Gaps or conflicts between QPRO and strategic plan (specific gaps with numbers)",
  "recommendations": "Actionable recommendations (prioritized list)",
  "overallAchievement": 72.3
}}

## Calculation Notes:
- **achievementRate per KRA** = average of all activities' achievement % for that KRA
- **overallAchievement** = weighted average of all KRAs' achievementRate

Return ONLY the JSON object. No additional text.
    `);
  }

  async processQPRO(fileBuffer: Buffer, fileType: string, unitId?: string): Promise<QPROAnalysisOutput> {
    try {
      // Validate input
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error('File buffer is empty');
      }

      let userText: string;

      // Extract text based on file type
      if (fileType.toLowerCase() === 'application/pdf') {
        // Extract text from PDF using pdf2json
        const pdfParser = new PDFParser();
        // Create a promise to handle the event-driven pdf2json
        userText = await new Promise((resolve, reject) => {
          pdfParser.on('pdfParser_dataError', (errData: any) => {
            reject(errData.parserError);
          });
          pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
            let textContent = '';
            if (pdfData && pdfData.formImage && pdfData.formImage.Pages) {
              pdfData.formImage.Pages.forEach((page: any) => {
                if (page.Texts) {
                  page.Texts.forEach((textItem: any) => {
                    textContent += (textItem.R && Array.isArray(textItem.R)) ?
                      textItem.R.map((run: any) => this.decodeText(run.T)).join(' ') + ' ' :
                      this.decodeText(textItem.T) + ' ';
                  });
                  textContent += '\n';
                }
              });
            }
            resolve(textContent);
          });
          pdfParser.parseBuffer(fileBuffer);
        });
      } else if (fileType.toLowerCase() === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        userText = result.value;
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      // Diagnostic logging: output raw extracted text metadata
      console.log('[QPRO DIAGNOSTIC] ========== RAW TEXT EXTRACTION ==========');
      console.log('[QPRO DIAGNOSTIC] File type:', fileType);
      console.log('[QPRO DIAGNOSTIC] Raw text length (chars):', userText?.length || 0);
      console.log('[QPRO DIAGNOSTIC] Raw text preview (first 500 chars):', userText?.substring(0, 500));
      console.log('[QPRO DIAGNOSTIC] Raw text preview (last 500 chars):', userText?.substring(userText.length - 500));
      
      // Count training/seminar entries in the text
      const trainingMatches = userText.match(/Introduction to|Data Privacy|Cybersecurity|Digital Marketing|Empowering|UI & UX|AI for Beginners/gi);
      console.log('[QPRO DIAGNOSTIC] Detected training entries in text:', trainingMatches ? trainingMatches.length : 0);
      
      console.log('[QPRO DIAGNOSTIC] ==========================================');

      // Validate extracted text
      if (!userText || userText.trim().length === 0) {
        throw new Error('No text could be extracted from the document');
      }

      // Generate embedding for user input (always fresh, no cache for embeddings)
      const userEmbedding = await embeddingService.generateEmbedding(userText);

      // Search for relevant strategic plan data - ALWAYS fresh search (no cache to ensure stability)
      console.log('[QPRO DIAGNOSTIC] ========== VECTOR SEARCH ==========');
      let allResults = await vectorService.searchVectors(userEmbedding, 15);
      console.log('[QPRO DIAGNOSTIC] Total vector search results:', allResults.length);
      
      let searchResults: any[];
      
      // Filter by unitId if provided (match responsible offices)
      if (unitId) {
        console.log('[QPRO DIAGNOSTIC] Filtering by unitId:', unitId);
        searchResults = allResults.filter(result => {
          const metadata = result.metadata;
          if (!metadata) return true;
          
          const responsibleOffices = metadata.responsible_offices || [];
          return responsibleOffices.some((office: string) => 
            office.toLowerCase().includes(unitId.toLowerCase())
          );
        });
        
        console.log('[QPRO DIAGNOSTIC] Filtered results count:', searchResults.length);
        
        // If filtering reduces results too much, fall back to top 10 unfiltered
        if (searchResults.length < 5) {
          console.log('[QPRO DIAGNOSTIC] Too few filtered results, using top 10 unfiltered');
          searchResults = allResults.slice(0, 10);
        } else {
          searchResults = searchResults.slice(0, 10);
        }
      } else {
        searchResults = allResults.slice(0, 10);
      }
      
      // DEDUPLICATION: Implement "Winner Takes All" logic
      // Group search results by their semantic content to identify potential duplicates
      // Keep only the highest-scoring result for each semantic cluster
      const deduplicatedResults = this.deduplicateSearchResults(searchResults);
      
      console.log('[QPRO DIAGNOSTIC] Matched KRAs in strategic context:');
      deduplicatedResults.forEach((result, idx) => {
        const metadata = result.metadata || {};
        console.log(`  [${idx + 1}] ${metadata.kra_id || 'Unknown'}: ${metadata.kra_title || 'No title'} (score: ${result.score?.toFixed(3)})`);
      });
      console.log('[QPRO DIAGNOSTIC] =====================================');
      
      // Format strategic context from search results with full details
      let strategicContext = deduplicatedResults.map((result, index) => {
        const metadata = result.metadata || {};
        return `
### [${index + 1}] ${metadata.kra_id || 'Unknown KRA'}: ${metadata.kra_title || 'No title'}
**Initiative ID:** ${metadata.initiative_id || 'N/A'}
**Key Performance Indicator:**
- Outputs: ${metadata.key_performance_indicator?.outputs || 'N/A'}
- Outcomes: ${metadata.key_performance_indicator?.outcomes || 'N/A'}
**Strategies:** ${Array.isArray(metadata.strategies) ? metadata.strategies.join('; ') : 'N/A'}
**Activities:** ${Array.isArray(metadata.programs_activities) ? metadata.programs_activities.join('; ') : 'N/A'}
**Responsible Offices:** ${Array.isArray(metadata.responsible_offices) ? metadata.responsible_offices.join(', ') : 'N/A'}
**Targets:** ${JSON.stringify(metadata.targets || {})}
**Similarity Score:** ${result.score?.toFixed(3) || 'N/A'}
        `;
      }).join('\n---\n');

      // Validate strategic context is not empty
      if (!strategicContext || strategicContext.trim().length === 0) {
        strategicContext = 'No relevant strategic plan data found. Proceed with generic analysis based on QPRO document.';
      }

      // Validate user text is not empty
      if (!userText || userText.trim().length === 0) {
        throw new Error('QPRO document text is empty after extraction');
      }

      // Attempt analysis with retry and fallback logic
      const analysis = await this.analyzeWithRetry(strategicContext, userText);
      return analysis;
    } catch (error) {
      console.error('Error in processQPRO:', error);
      throw error;
    }
  }

  /**
   * Analyze with exponential backoff retry and LLM fallback
   */
  private async analyzeWithRetry(
    strategicContext: string, 
    userText: string, 
    maxRetries: number = 3
  ): Promise<QPROAnalysisOutput> {
    let lastError: any;
    
    // Validate inputs before attempting LLM call
    if (!strategicContext || strategicContext.trim().length === 0) {
      throw new Error('strategicContext cannot be empty');
    }
    if (!userText || userText.trim().length === 0) {
      throw new Error('userText cannot be empty');
    }
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[AnalysisEngine] Attempt ${attempt}/${maxRetries} with GPT-4o-mini`);
        console.log(`[AnalysisEngine] strategicContext length: ${strategicContext.length}`);
        console.log(`[AnalysisEngine] userText length: ${userText.length}`);
        
        // Combine user input with strategic context
        const chain = this.promptTemplate.pipe(this.llm);
        const result = await chain.invoke({
          strategic_context: strategicContext,
          user_input: userText
        });

        // Parse and validate JSON response
        const rawContent = result.content as string;
        return this.parseAndValidateLLMResponse(rawContent);
      } catch (error) {
        lastError = error;
        console.error(`[AnalysisEngine] Attempt ${attempt} failed:`, error);
        
        // If this was the last retry, try fallback providers
        if (attempt === maxRetries) {
          console.log('[AnalysisEngine] All GPT-4o-mini attempts failed, trying fallback providers...');
          
          // Try Qwen fallback
          try {
            return await this.analyzeWithQwen(strategicContext, userText);
          } catch (qwenError) {
            console.error('[AnalysisEngine] Qwen fallback failed:', qwenError);
            
            // Try Gemini as last resort
            try {
              return await this.analyzeWithGemini(strategicContext, userText);
            } catch (geminiError) {
              console.error('[AnalysisEngine] Gemini fallback failed:', geminiError);
              throw new Error(`All LLM providers failed. Last error: ${lastError.message}`);
            }
          }
        }
        
        // Exponential backoff: wait 2^attempt seconds
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`[AnalysisEngine] Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError;
  }

  /**
   * Fallback analysis using Qwen
   */
  private async analyzeWithQwen(strategicContext: string, userText: string): Promise<QPROAnalysisOutput> {
    console.log('[AnalysisEngine] Using Qwen fallback provider');
    
    const qwenClient = new ChatOpenAI({
      modelName: "qwen/qwen-2.5-72b-instruct",
      temperature: 0.2,
      configuration: {
        baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENAI_API_KEY,
      },
      modelKwargs: {
        response_format: { type: "json_object" }
      },
    });
    
    const chain = this.promptTemplate.pipe(qwenClient);
    const result = await chain.invoke({
      strategic_context: strategicContext,
      user_input: userText
    });
    
    return this.parseAndValidateLLMResponse(result.content as string);
  }

  /**
   * Fallback analysis using Gemini
   */
  private async analyzeWithGemini(strategicContext: string, userText: string): Promise<QPROAnalysisOutput> {
    console.log('[AnalysisEngine] Using Gemini fallback provider');
    
    // Note: Gemini doesn't support JSON mode the same way, so we rely on prompt engineering
    const geminiPrompt = `${this.promptTemplate.template}\n\nIMPORTANT: Return ONLY valid JSON in the exact format specified above. No markdown, no code blocks, just the JSON object.`;
    
    const geminiClient = new ChatOpenAI({
      modelName: "gemini-2.0-flash-001",
      temperature: 0.2,
      configuration: {
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
        apiKey: process.env.GOOGLE_AI_API_KEY,
      },
    });
    
    const geminiTemplate = PromptTemplate.fromTemplate(geminiPrompt);
    const chain = geminiTemplate.pipe(geminiClient);
    const result = await chain.invoke({
      strategic_context: strategicContext,
      user_input: userText
    });
    
    return this.parseAndValidateLLMResponse(result.content as string);
  }

  /**
   * Helper method to decode hex-encoded text from pdf2json
   */
  private decodeText(hexText: string): string {
    if (!hexText) return '';
    try {
      // Remove the forward slash and replace #20 with space if needed
      hexText = hexText.replace(/\//g, '').replace(/#20/g, ';');
      // Decode hex to string
      const text = hexText.replace(/#([0-9A-Fa-f]{2})/g, (match, hex) => {
        return String.fromCharCode(parseInt(hex, 16));
      });
      return decodeURIComponent(escape(text));
    } catch (error) {
      console.error('Error decoding text:', error);
      return hexText || '';
    }
  }

  /**
   * Generate cache key for vector search results
   */
  private generateCacheKey(text: string, unitId?: string): string {
    const textHash = createHash('md5').update(text.slice(0, 1000)).digest('hex');
    return `qpro:vector-search:${textHash}:${unitId || 'all'}`;
  }

  /**
   * Implement "Winner Takes All" deduplication
   * Removes semantic duplicates from search results, keeping only the highest-scoring entry
   * for each KRA/initiative combination to prevent double-counting activities
   */
  private deduplicateSearchResults(results: any[]): any[] {
    if (results.length === 0) return results;

    // Group results by KRA ID to identify duplicates
    const kraMap = new Map<string, any>();
    
    results.forEach((result) => {
      const kraId = result.metadata?.kra_id;
      
      if (!kraId) {
        return; // Skip results without KRA ID
      }
      
      // If we haven't seen this KRA yet, or this result has a higher score, keep it
      if (!kraMap.has(kraId) || (result.score || 0) > (kraMap.get(kraId).score || 0)) {
        kraMap.set(kraId, result);
        console.log(`[DEDUP] KRA ${kraId}: score=${result.score?.toFixed(3)}`);
      } else {
        console.log(`[DEDUP] Skipping duplicate KRA ${kraId} (lower score: ${result.score?.toFixed(3)} < ${kraMap.get(kraId).score?.toFixed(3)})`);
      }
    });
    
    // Convert map back to array, sorted by score descending
    const deduped = Array.from(kraMap.values())
      .sort((a, b) => (b.score || 0) - (a.score || 0));
    
    console.log(`[DEDUP] Deduplicated ${results.length} results to ${deduped.length} unique KRAs`);
    return deduped;
  }

  /**
   * Parse and validate LLM JSON response
   */
  private parseAndValidateLLMResponse(rawContent: string | any): QPROAnalysisOutput {
    try {
      let parsed: any;
      
      // If rawContent is already an object, use it directly
      if (typeof rawContent === 'object' && rawContent !== null) {
        console.log('[AnalysisEngine] Content is already an object, using directly');
        parsed = rawContent;
      } else {
        // If it's a string, parse it
        let cleanedContent = String(rawContent).trim();
        
        // Remove markdown code blocks if present
        if (cleanedContent.startsWith('```')) {
          cleanedContent = cleanedContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        }
        
        // Parse JSON
        parsed = JSON.parse(cleanedContent);
      }
      
      // Validate with Zod schema
      const validated = QPROAnalysisOutputSchema.parse(parsed);
      
      console.log('[AnalysisEngine] Successfully validated LLM response');
      console.log(`[AnalysisEngine] Extracted ${validated.activities.length} activities across ${validated.kras.length} KRAs`);
      
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[AnalysisEngine] Zod validation failed:', error.errors);
        throw new Error(`LLM output validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
      }
      console.error('[AnalysisEngine] JSON parsing failed:', error);
      console.error('[AnalysisEngine] Raw content type:', typeof rawContent);
      console.error('[AnalysisEngine] Raw content preview:', String(rawContent).substring(0, 200));
      throw new Error(`Failed to parse LLM response as JSON: ${error}`);
    }
  }
}

export const analysisEngineService = new AnalysisEngineService();
export default AnalysisEngineService;