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
  target: z.number().describe('Target value'),
  achievement: z.number().min(0).max(100).describe('Achievement percentage'),
  status: z.enum(["MET", "MISSED"]).describe('Status of target achievement'),
  strategyLink: z.string().describe('Strategic Plan strategy reference'),
  aiInsight: z.string().describe('AI-generated insight for this activity'),
  recommendation: z.string().describe('AI-generated recommendation for this activity'),
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
        strategyLink: '',
        aiInsight: '',
        recommendation: '',
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
      temperature: 0.2,
      modelKwargs: {
        response_format: { type: "json_object" }
      },
    });
    
    this.promptTemplate = PromptTemplate.fromTemplate(`
You are an expert strategic planning analyst for Laguna State Polytechnic University. Analyze a Quarterly Physical Report of Operations (QPRO) document against the university's strategic plan.

## Strategic Plan Context (Top 10 Most Relevant KRAs/Initiatives):
{strategic_context}

## QPRO Document Text:
{user_input}

## Your Task:
Extract all activities mentioned in the QPRO document and match them to the strategic plan KRAs above. For each activity:
1. **Identify the activity name** (e.g., "Faculty training workshops", "Curriculum development sessions")
2. **Extract reported/accomplished value** (e.g., if document says "conducted 8 workshops", reported = 8)
3. **Extract target value** (e.g., if document says "target of 10 workshops", target = 10)
4. **Calculate achievement percentage** = (reported / target) * 100
5. **Determine status**: If achievement >= 100%, status = "MET"; otherwise, status = "MISSED".
6. **Link to strategy**: Provide the most relevant Strategic Plan strategy reference (e.g., "SP-STRAT-3.2").
7. **AI Insight**: Write a concise, professional insight for this activity (1-2 sentences, analytical and actionable).
8. **Recommendation**: Write a prescriptive, actionable recommendation for this activity.
9. **Assign confidence score** (0.0-1.0) for the KRA match based on semantic similarity.
10. **Extract unit/office** mentioned if available.

## Important Guidelines:
- Look for quantifiable activities with numbers (e.g., "completed 5 out of 7 tasks", "achieved 85% satisfaction")
- If only reported value is given without target, estimate a reasonable target based on context
- Match activities to KRAs and strategies based on keywords, responsible offices, and semantic meaning
- A single QPRO activity may map to multiple KRAs if relevant (create separate entries)
- If confidence < 0.5, still include but mark for manual review

## Output Format:
Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:

{{
  "activities": [
    {{
      "name": "Activity description",
      "kraId": "KRA 1",
      "initiativeId": "KRA1-KPI1",
      "reported": 8,
      "target": 10,
      "achievement": 80.0,
      "status": "MET",
      "strategyLink": "SP-STRAT-3.2",
      "aiInsight": "Consistent achievement of faculty training targets demonstrates strong operational execution.",
      "recommendation": "Maintain current training frequency and explore advanced topics.",
      "confidence": 0.85,
      "unit": "College of Engineering"
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
            // Extract text from the pdf2json output structure
            let textContent = '';
            
            if (pdfData && pdfData.formImage && pdfData.formImage.Pages) {
              pdfData.formImage.Pages.forEach((page: any) => {
                if (page.Texts) {
                  page.Texts.forEach((textItem: any) => {
                    // pdf2json encodes text as hex, so we need to decode it
                    textContent += (textItem.R && Array.isArray(textItem.R)) ?
                      textItem.R.map((run: any) => this.decodeText(run.T)).join(' ') + ' ' :
                      this.decodeText(textItem.T) + ' ';
                  });
                  textContent += '\n'; // Add page break
                }
              });
            }
            
            resolve(textContent);
          });
          
          pdfParser.parseBuffer(fileBuffer);
        });
      } else if (fileType.toLowerCase() === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Extract text from DOCX using mammoth
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        userText = result.value;
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }
      

      // Validate extracted text
      if (!userText || userText.trim().length === 0) {
        throw new Error('No text could be extracted from the document');
      }

      // Check Redis cache for vector search results
      const cacheKey = this.generateCacheKey(userText, unitId);
      let searchResults: any[];
      
      const cachedResults = await redisService.get(cacheKey);
      if (cachedResults) {
        console.log('[AnalysisEngine] Using cached vector search results');
        // Handle both string and already-parsed object from Redis
        searchResults = typeof cachedResults === 'string' ? JSON.parse(cachedResults) : cachedResults;
      } else {
        // Generate embedding for user input
        const userEmbedding = await embeddingService.generateEmbedding(userText);

        // Search for relevant strategic plan data (increased from 5 to 10)
        let allResults = await vectorService.searchVectors(userEmbedding, 15);
        
        // Filter by unitId if provided (match responsible offices)
        if (unitId) {
          // Try to get unit name from database for better filtering
          searchResults = allResults.filter(result => {
            const metadata = result.metadata;
            if (!metadata) return true; // Include if no metadata
            
            // Check if unit matches responsible offices
            const responsibleOffices = metadata.responsible_offices || [];
            return responsibleOffices.some((office: string) => 
              office.toLowerCase().includes(unitId.toLowerCase())
            );
          });
          
          // If filtering reduces results too much, fall back to top 10 unfiltered
          if (searchResults.length < 5) {
            searchResults = allResults.slice(0, 10);
          } else {
            searchResults = searchResults.slice(0, 10);
          }
        } else {
          searchResults = allResults.slice(0, 10);
        }
        
        // Cache results for 24 hours
        await redisService.set(cacheKey, JSON.stringify(searchResults), 86400);
      }
      
      // Format strategic context from search results with full details
      const strategicContext = searchResults.map((result, index) => {
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
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[AnalysisEngine] Attempt ${attempt}/${maxRetries} with GPT-4o-mini`);
        
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