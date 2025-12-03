// DEPRECATED: Legacy Gemini service - Use QwenGenerationService instead
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import ConfigService from './config-service';
import MonitoringService from './monitoring-service';

// Define the SearchResult interface to match what's expected
interface SearchResult {
  documentId: string;
  title: string;
  content: string;
  score: number;
  pageNumbers: number[];
  documentSection?: string;
  confidenceScore?: number;
  snippet: string;
  document: any; // Replace with actual Document type if available
  visualContent?: string; // Base64 encoded visual content
  extractedText?: string; // Extracted text content
  screenshots?: string[]; // Array of screenshot base64 strings
  mimeType?: string; // MIME type for the screenshots (e.g., 'image/jpeg', 'image/png')
}

interface GeminiConfig {
  apiKey: string;
  model?: string;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
 safetySettings?: Array<{
    category: HarmCategory;
    threshold: HarmBlockThreshold;
  }>;
}

interface GenerationOptions {
 textOnly?: boolean;
 maxResults?: number;
  customPrompt?: string;
}

class GeminiGenerationService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config: GeminiConfig;
 private configService: ConfigService;
  private monitoringService: MonitoringService;

  constructor(config?: Partial<GeminiConfig>) {
    const apiKey = process.env.GOOGLE_AI_API_KEY || config?.apiKey || '';
    if (!apiKey) {
      throw new Error('Google AI API key is required for Gemini Generation Service');
    }

    this.config = {
      apiKey,
      model: config?.model || 'gemini-2.0-flash-001',
      generationConfig: config?.generationConfig || {
        temperature: 0.2,
        maxOutputTokens: 8192,
        topP: 0.95,
        topK: 40,
      },
      safetySettings: config?.safetySettings || [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    };

    this.genAI = new GoogleGenerativeAI(this.config.apiKey);
    
    // DISABLE ALL SAFETY FILTERS - Required for processing student data/grades
    this.model = this.genAI.getGenerativeModel({
      model: this.config.model!,
      // DISABLE ALL SAFETY FILTERS
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });
    
    this.configService = ConfigService.getInstance();
    this.monitoringService = MonitoringService.getInstance();
  }

  /**
   * Generate a response based on search results and user query
   * @param query User's search query
   * @param searchResults Results from Colivara semantic search
   * @param options Generation options
   * @param userId User identifier for rate limiting
   */
 async generateResponse(
    query: string,
    searchResults: SearchResult[],
    options: GenerationOptions = {},
    userId?: string
  ): Promise<string> {
    const startTime = Date.now();
    try {
      // Use user ID for rate limiting, fallback to a general identifier if not provided
      const identifier = userId || 'anonymous';
      
      // Check if request is allowed based on rate limiting
      if (!this.configService.isRequestAllowed(identifier)) {
        const remainingRequests = this.configService.getRemainingRequests(identifier);
        const resetTime = this.configService.getResetTime(identifier);
        const resetTimeFormatted = new Date(resetTime).toLocaleTimeString();
        
        const error = new Error(
          `Rate limit exceeded. You can make ${remainingRequests} more requests after ${resetTimeFormatted}.`
        );
        
        // Track the failed request
        this.monitoringService.trackGeneration(
          userId || 'unknown',
          query,
          Date.now() - startTime,
          false,
          error.message,
          this.config.model
        );
        
        throw error;
      }

      // Limit the number of results to process
      const maxResults = options.maxResults || 6; // Increased from 5 to 6 for Gemini 2.0 Flash
      const limitedResults = searchResults.slice(0, maxResults);

      if (limitedResults.length === 0) {
        const response = "I couldn't find any relevant documents to answer your query. Please try a different search term.";
        
        // Track the successful request with no results
        this.monitoringService.trackGeneration(
          userId || 'unknown',
          query,
          Date.now() - startTime,
          true,
          undefined,
          this.config.model
        );
        
        return response;
      }

      // Check if the query is asking for comprehensive information (like lists of faculty/trainings)
      const isComprehensiveQuery = query.toLowerCase().includes('list') ||
                                   query.toLowerCase().includes('all') ||
                                   query.toLowerCase().includes('every') ||
                                   query.toLowerCase().includes('faculty') ||
                                   query.toLowerCase().includes('training') ||
                                   query.toLowerCase().includes('seminar') ||
                                   query.toLowerCase().includes('attended') ||
                                   query.toLowerCase().includes('presentation') ||
                                   query.toLowerCase().includes('research') ||
                                   (query.toLowerCase().includes('what') && query.toLowerCase().includes('training')) ||
                                   (query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar')) ||
                                   (query.toLowerCase().includes('which') && query.toLowerCase().includes('training')) ||
                                   (query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar'));
      
      // For comprehensive queries, ensure we use more results
      const resultsForGeneration = isComprehensiveQuery ?
        searchResults.slice(0, 6) : // Use up to 6 results for comprehensive queries
        limitedResults; // Use the limited results for specific queries
      
      // Prepare the content for the model based on options
      // Check if any results have visual content to determine if we should use multimodal processing
      const hasVisualContent = resultsForGeneration.some(result => result.visualContent || (result.screenshots && result.screenshots.length > 0));
      
      let result: string;
      if (options.textOnly || !hasVisualContent) {
        result = await this.generateTextOnlyResponse(query, resultsForGeneration, options);
      } else {
        result = await this.generateMultimodalResponse(query, resultsForGeneration, options);
      }
      
      // Track the successful request
      this.monitoringService.trackGeneration(
        userId || 'unknown',
        query,
        Date.now() - startTime,
        true,
        undefined,
        this.config.model
      );
      
      return result;
    } catch (error) {
      console.error('Error generating response with Gemini:', error);
      
      // Track the failed request
      this.monitoringService.trackGeneration(
        userId || 'unknown',
        query,
        Date.now() - startTime,
        false,
        error instanceof Error ? error.message : 'Unknown error',
        this.config.model
      );
      
      throw error;
    }
  }

  /**
   * Generate a text-only response using search results
   */
  private async generateTextOnlyResponse(
    query: string,
    searchResults: SearchResult[],
    options: GenerationOptions
  ): Promise<string> {
    // Format the search results into a context string
    const context = searchResults
      .map((result, index) => {
        const content = result.content || result.snippet || '';
        const title = result.title || 'Untitled Document';
        const pageNumbers = result.pageNumbers?.length ? ` (pages: ${result.pageNumbers.join(', ')})` : '';
        const score = result.confidenceScore ? ` (relevance: ${(result.confidenceScore * 100).toFixed(1)}%)` : '';
        const hasVisuals = result.screenshots && result.screenshots.length > 0;
        
        let resultText = `Document ${index + 1}: ${title}${pageNumbers}${score}\n`;
        
        if (hasVisuals) {
          resultText += `[VISUAL DATA: This document contains ${result.screenshots!.length} image(s). Read any tables, numbers, or text visually present in the images.]\n`;
        }
        
        resultText += `Content: ${content}\n`;
        
        return resultText;
      })
      .join('\n---\n');

    // Check if the query is asking for comprehensive information (like lists of faculty/trainings)
    const isComprehensiveQuery = query.toLowerCase().includes('list') ||
                                 query.toLowerCase().includes('all') ||
                                 query.toLowerCase().includes('every') ||
                                 query.toLowerCase().includes('faculty') ||
                                 query.toLowerCase().includes('training') ||
                                 query.toLowerCase().includes('seminar') ||
                                 query.toLowerCase().includes('attended') ||
                                 query.toLowerCase().includes('presentation') ||
                                 query.toLowerCase().includes('research') ||
                                 (query.toLowerCase().includes('what') && query.toLowerCase().includes('training')) ||
                                 (query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar')) ||
                                 (query.toLowerCase().includes('which') && query.toLowerCase().includes('training')) ||
                                 (query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar'));

    // Create the prompt with specific instructions for comprehensive queries
    const prompt = options.customPrompt || `Based on the following documents, provide a clear, direct answer to the user's query. If the documents don't contain the information needed to answer the query, state this clearly.

Documents:
${context}

User Query: ${query}

${isComprehensiveQuery ? `### SPECIAL INSTRUCTION FOR COMPREHENSIVE QUERIES: When the user asks for a list of items (such as faculty and their trainings/seminars), you MUST provide ALL the information found in the documents. Do not summarize or abbreviate. If multiple documents contain relevant information, combine and present ALL the data from all documents. Use a clear format like bullet points or structured lists to make the information easy to read. CRITICAL: If you state that you are providing a list, you MUST actually provide the complete list content. Do not just say "Here is the list..." without providing the actual items in the list. READ EVERY DOCUMENT CAREFULLY and extract ALL relevant information BEFORE forming your response. Do not stop at the first few items you find - continue reading through all documents to ensure you have collected all relevant information.` : ''}

Please provide a straightforward, direct answer to the query based on the provided documents. Focus on information that directly addresses the question. If the information is not available in the documents, say so clearly.`;

    // Generate content using the model
    const result = await this.model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: this.config.generationConfig!,
      safetySettings: this.config.safetySettings!,
    });

    const response = await result.response;
    return response.text();
  }

 /**
  * Generate a multimodal response using search results that may include visual content
  */
 private async generateMultimodalResponse(
   query: string,
   searchResults: SearchResult[],
   options: GenerationOptions
 ): Promise<string> {
   // Check if the query is asking for comprehensive information (like lists of faculty/trainings)
   const isComprehensiveQuery = query.toLowerCase().includes('list') ||
                               query.toLowerCase().includes('all') ||
                               query.toLowerCase().includes('every') ||
                               query.toLowerCase().includes('faculty') ||
                               query.toLowerCase().includes('training') ||
                               query.toLowerCase().includes('seminar') ||
                               query.toLowerCase().includes('attended') ||
                               query.toLowerCase().includes('presentation') ||
                               query.toLowerCase().includes('research') ||
                               (query.toLowerCase().includes('what') && query.toLowerCase().includes('training')) ||
                               (query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar')) ||
                               (query.toLowerCase().includes('which') && query.toLowerCase().includes('training')) ||
                               (query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar'));

   // Format the search results into a context string with visual content
   const multimodalParts = [];
   
   multimodalParts.push({
     text: `
You are an intelligent assistant capable of reading documents and extracting specific details.
Your goal is to answer the user's question accurately based ONLY on the provided document images.

### DATA EXTRACTION RULES:
1. **Read the Visuals:** The documents may contain tables, lists, or spreadsheets. Scan them carefully row-by-row.
2. **Be Thorough:** If the user asks for a list (e.g., "all faculty"), extract EVERY name you see in the document images. Do not summarize.
3. ** OCR Handling:** If text is slightly blurry, use your best judgment to correct obvious spelling errors (e.g., interpret "M@rk" as "Mark").

### OUTPUT FORMATTING:
If the data involves multiple items (like names and trainings), you must use a **Nested Bullet List** format:

* **Name of Person**
  * Training Title A
  * Training Title B

If the answer is simple text, use a natural paragraph.

${isComprehensiveQuery ? `### SPECIAL INSTRUCTION FOR COMPREHENSIVE QUERIES: When the user asks for a list of items (such as faculty and their trainings/seminars), you MUST provide ALL the information found in the documents. Do not summarize or abbreviate. If multiple documents contain relevant information, combine and present ALL the data from all documents. Use a clear format like bullet points or structured lists to make the information easy to read. CRITICAL: If you state that you are providing a list, you MUST actually provide the complete list content. Do not just say "Here is the list..." without providing the actual items in the list. READ EVERY DOCUMENT CAREFULLY and extract ALL relevant information BEFORE forming your response. Do not stop at the first few items you find - continue reading through all documents to ensure you have collected all relevant information.` : ''}
-------------------------------------------------------
`
   });

   // Process each result to provide to the model
   for (const result of searchResults.slice(0, 6)) {
     
     const hasVisuals = result.screenshots && result.screenshots.length > 0;
     const hasText = result.extractedText && result.extractedText.trim().length > 0;

     // Divider
     multimodalParts.push({
       text: `\n\n=== Document: "${result.title}" ===\n`
     });

     // 1. Provide the Visuals (Universal for PDF, PNG, Excel, etc.)
     if (hasVisuals && result.screenshots) {
       for (const screenshot of result.screenshots) {
           
       // MAGIC FIX: Detect Type from the string signature
       // Colivara converts PDFs to PNG screenshots, so we must detect 'iVBOR'
       let realMimeType = 'image/jpeg';
       if (typeof screenshot === 'string') {
           if (screenshot.startsWith('iVBOR')) {
               realMimeType = 'image/png'; // <--- This is the key fix for your PDFs
           } else if (screenshot.startsWith('/9j/')) {
               realMimeType = 'image/jpeg';
           } else if (screenshot.startsWith('iVBO')) {
               realMimeType = 'image/png';
           }
       }

       console.log(`Sending to Gemini as: ${realMimeType}`); // Debug log

       multimodalParts.push({
         inlineData: {
           data: screenshot,
           mimeType: realMimeType
         }
       });
       }
       // Prompt for Visuals
       multimodalParts.push({
         text: `\n[VISUAL CONTENT: The above image contains the document content. Extract relevant information to answer: "${query}"]\n`
       });
     }

     // 2. Provide the Text (Universal for PDF, Word, etc.)
     if (hasText) {
       multimodalParts.push({
         text: `\n[TEXT CONTENT: ${result.extractedText}]\n`
       });
     } else {
       // 3. Handle "Visual Only" Files (Scans/Images)
       multimodalParts.push({
         text: `\n[NO TEXT EXTRACTED: Focus on visual content to answer: "${query}"]\n`
       });
     }
   }

   // Add final instruction to ensure the model responds directly to the query
   multimodalParts.push({
     text: `\n\n${isComprehensiveQuery ? `### SPECIAL INSTRUCTION FOR COMPREHENSIVE QUERIES: When the user asks for a list of items (such as faculty and their trainings/seminars), you MUST provide ALL the information found in the documents. Do not summarize or abbreviate. If multiple documents contain relevant information, combine and present ALL the data from all documents. Use a clear format like bullet points or structured lists to make the information easy to read. CRITICAL: If you state that you are providing a list, you MUST actually provide the complete list content. Do not just say "Here is the list..." without providing the actual items in the list. READ EVERY DOCUMENT CAREFULLY and extract ALL relevant information BEFORE forming your response. Do not stop at the first few items you find - continue reading through all documents to ensure you have collected all relevant information.` : ''}\n\nBased on the above documents, provide a clear, direct answer to this query: "${query}". Answer the question directly using specific information from the documents. If the documents don't contain the answer, say so clearly.`
   });

   // Generate content using the model
   const result = await this.model.generateContent({
     contents: [{ role: 'user', parts: multimodalParts }],
     generationConfig: this.config.generationConfig!,
     safetySettings: this.config.safetySettings!,
   });

   const response = await result.response;
   return response.text();
 }

 /**
  * Generate insights from search results
  * @param query User's search query
  * @param searchResults Results from Colivara semantic search
  * @param userId User identifier for rate limiting
  */
async generateInsights(
   query: string,
   searchResults: SearchResult[],
   userId?: string
 ): Promise<{
   summary: string;
   keyPoints: string[];
   sources: Array<{ title: string; documentId: string; confidence: number }>;
 }> {
   const startTime = Date.now();
   try {
     // Use user ID for rate limiting, fallback to a general identifier if not provided
     const identifier = userId || 'anonymous';
     
     // Check if request is allowed based on rate limiting
     if (!this.configService.isRequestAllowed(identifier)) {
       const remainingRequests = this.configService.getRemainingRequests(identifier);
       const resetTime = this.configService.getResetTime(identifier);
       const resetTimeFormatted = new Date(resetTime).toLocaleTimeString();
       
       const error = new Error(
         `Rate limit exceeded. You can make ${remainingRequests} more requests after ${resetTimeFormatted}.`
       );
       
       // Track the failed request
       this.monitoringService.trackGeneration(
         userId || 'unknown',
         query,
         Date.now() - startTime,
         false,
         error.message,
         this.config.model
       );
       
       throw error;
     }

     const maxResults = 6; // Increased from 5 to 6 for Gemini 2.0 Flash
     const limitedResults = searchResults.slice(0, maxResults);

     if (limitedResults.length === 0) {
       const result = {
         summary: "No relevant documents found to generate insights.",
         keyPoints: [],
         sources: [],
       };
       
       // Track the successful request with no results
       this.monitoringService.trackGeneration(
         userId || 'unknown',
         query,
         Date.now() - startTime,
         true,
         undefined,
         this.config.model
       );
       
       return result;
     }

     // For JSON responses, we need to handle multimodal content differently
     // since we can't easily embed images in a JSON response context
     // So we'll use a text-only approach for JSON responses but still indicate visual content
     
     // For insights, we'll use a different approach that better handles multimodal content
     // Since we can't easily embed images in JSON responses, we'll use the multimodal approach but structured for insights
     
     // Format the search results into a context string with visual content for insights
     const multimodalParts = [];
     
     multimodalParts.push({
       text: `
 You are an intelligent assistant capable of reading documents and extracting specific details.
 Your goal is to answer the user's question accurately based ONLY on the provided document images.

 ### DATA EXTRACTION RULES:
 1. **Read the Visuals:** The documents may contain tables, lists, or spreadsheets. Scan them carefully row-by-row.
 2. **Be Thorough:** If the user asks for a list (e.g., "all faculty"), extract EVERY name you see in the document images. Do not summarize.
 3. ** OCR Handling:** If text is slightly blurry, use your best judgment to correct obvious spelling errors (e.g., interpret "M@rk" as "Mark").

 ### OUTPUT FORMATTING:
 If the data involves multiple items (like names and trainings), you must use a **Nested Bullet List** format:

 * **Name of Person**
   * Training Title A
   * Training Title B

 If the answer is simple text, use a natural paragraph.
 -------------------------------------------------------
 `
     });
     
     // Process each result
     for (const result of limitedResults) {
       const hasVisuals = result.screenshots && result.screenshots.length > 0;
       const hasText = result.extractedText && result.extractedText.trim().length > 0;
       const title = result.title || 'Untitled Document';
       const confidence = result.confidenceScore || 0;
       
       // Add document header
       multimodalParts.push({
         text: `\n\n=== Document: "${title}" (relevance: ${(confidence * 100).toFixed(1)}%) ===\n`
       });

       // 1. Provide the Visuals (Universal for PDF, PNG, Excel, etc.)
       if (hasVisuals && result.screenshots) {
         for (const screenshot of result.screenshots) {
             
         // MAGIC FIX: Detect Type from the string signature
         let realMimeType = 'image/jpeg';
         if (typeof screenshot === 'string') {
             if (screenshot.startsWith('iVBOR')) {
                 realMimeType = 'image/png';
             } else if (screenshot.startsWith('/9j/')) {
                 realMimeType = 'image/jpeg';
             } else if (screenshot.startsWith('iVBO')) {
                 realMimeType = 'image/png';
             }
         }

         console.log(`Sending to Gemini as: ${realMimeType}`); // Debug log

         multimodalParts.push({
           inlineData: {
             data: screenshot,
             mimeType: realMimeType
           }
         });
         }
         // Prompt for Visuals
         multimodalParts.push({
           text: `\n[VISUAL CONTENT: The above image contains document information. Extract data relevant to: "${query}"]\n`
         });
       }

       // 2. Provide the Text (Universal for PDF, Word, etc.)
       if (hasText) {
         multimodalParts.push({
           text: `\n[TEXT CONTENT: ${result.extractedText}]\n`
         });
       } else {
         // 3. Handle "Visual Only" Files (Scans/Images)
         multimodalParts.push({
           text: `\n[NO TEXT EXTRACTED: Focus on visual content to answer: "${query}"]\n`
         });
       }
     }

     // Check if the query is asking for comprehensive information (like lists of faculty/trainings)
     const isComprehensiveQuery = query.toLowerCase().includes('list') ||
                                 query.toLowerCase().includes('all') ||
                                 query.toLowerCase().includes('every') ||
                                 query.toLowerCase().includes('faculty') ||
                                 query.toLowerCase().includes('training') ||
                                 query.toLowerCase().includes('seminar') ||
                                 query.toLowerCase().includes('attended') ||
                                 query.toLowerCase().includes('presentation') ||
                                 query.toLowerCase().includes('research') ||
                                 (query.toLowerCase().includes('what') && query.toLowerCase().includes('training')) ||
                                 (query.toLowerCase().includes('what') && query.toLowerCase().includes('seminar')) ||
                                 (query.toLowerCase().includes('which') && query.toLowerCase().includes('training')) ||
                                 (query.toLowerCase().includes('which') && query.toLowerCase().includes('seminar'));

     // Add special instruction for comprehensive queries
     multimodalParts.push({
       text: `\n\n${isComprehensiveQuery ? `### SPECIAL INSTRUCTION FOR COMPREHENSIVE QUERIES: When the user asks for a list of items (such as faculty and their trainings/seminars), you MUST provide ALL the information found in the documents. Do not summarize or abbreviate. If multiple documents contain relevant information, combine and present ALL the data from all documents. Use a clear format like bullet points or structured lists to make the information easy to read. CRITICAL: If you state that you are providing a list, you MUST actually provide the complete list content. Do not just say "Here is the list..." without providing the actual items in the list. READ EVERY DOCUMENT CAREFULLY and extract ALL relevant information BEFORE forming your response. Do not stop at the first few items you find - continue reading through all documents to ensure you have collected all relevant information.` : ''}\n\nBased on the above documents, provide a clear, direct answer to "${query}". Format your response as JSON with the following structure: { "summary": "Direct answer to the user's query based on document content", "keyPoints": ["Concise points that directly address the query", "Relevant information from documents"], "sources": [ { "title": "Document title", "documentId": "Document ID if available", "confidence": "Confidence score between 0 and 1" } ] }`
     });

     const prompt = `Based on the following documents, please provide a summary, key points, and sources related to the query: ${query}

Documents:
[MULTIMODAL CONTENT PROVIDED IN THE REQUEST]

Please format your response as JSON with the following structure:
{
 "summary": "Brief summary of the documents in relation to the query",
 "keyPoints": ["List of key points from the documents", "Each point should be concise and informative"],
 "sources": [
   {
     "title": "Document title",
     "documentId": "Document ID if available",
     "confidence": "Confidence score between 0 and 1"
   }
 ]
}`;

     const insightsResult = await this.model.generateContent({
       contents: [{ role: 'user', parts: multimodalParts }], // Use multimodalParts instead of just text prompt
       generationConfig: {
         ...this.config.generationConfig,
         responseMimeType: 'application/json',
       },
       safetySettings: this.config.safetySettings,
     });

     const response = await insightsResult.response;
     const text = response.text();
     
     // Parse the JSON response
     try {
       const parsed = JSON.parse(text);
       
       // Track the successful request
       this.monitoringService.trackGeneration(
         userId || 'unknown',
         query,
         Date.now() - startTime,
         true,
         undefined,
         this.config.model
       );
       
       return parsed;
     } catch (parseError) {
       console.error('Error parsing Gemini JSON response:', parseError);
       // Fallback: return a basic structure
       const fallbackResult = {
         summary: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
         keyPoints: [text.substring(0, 200)],
         sources: limitedResults.map(result => ({
           title: result.title || 'Untitled Document',
           documentId: result.documentId || '',
           confidence: result.confidenceScore || 0
         }))
       };
       
       // Track the successful request with fallback
       this.monitoringService.trackGeneration(
         userId || 'unknown',
         query,
         Date.now() - startTime,
         true,
         'Fallback due to JSON parsing error',
         this.config.model
       );
       
       return fallbackResult;
     }
   } catch (error) {
     console.error('Error generating insights with Gemini:', error);
     
     // Track the failed request
     this.monitoringService.trackGeneration(
       userId || 'unknown',
       query,
       Date.now() - startTime,
       false,
       error instanceof Error ? error.message : 'Unknown error',
       this.config.model
     );
     
     throw error;
   }
}

  /**
   * Check if the service is properly initialized and API key is valid
   */
  async healthCheck(): Promise<boolean> {
    const startTime = Date.now();
    try {
      // Try to get model information as a basic health check
      await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 5,
        },
        safetySettings: this.config.safetySettings,
      });
      
      // Track the successful health check
      this.monitoringService.logMetric({
        endpoint: 'gemini-health-check',
        responseTime: Date.now() - startTime,
        success: true,
        model: this.config.model
      });
      
      return true;
    } catch (error) {
      console.error('Gemini service health check failed:', error);
      
      // Track the failed health check
      this.monitoringService.logMetric({
        endpoint: 'gemini-health-check',
        responseTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        model: this.config.model
      });
      
      return false;
    }
  }
}

export default GeminiGenerationService;