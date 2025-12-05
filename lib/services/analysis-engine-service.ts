import { embeddingService } from './embedding-service';
import { vectorService } from './vector-service';
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

// Import pdf2json and mammoth using CommonJS style since they use export = syntax
import mammoth from 'mammoth';
const PDFParser = require('pdf2json');

class AnalysisEngineService {
  private llm: BaseLanguageModel;
  private promptTemplate: PromptTemplate;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: "gpt-4-turbo", // or gpt-3.5-turbo
      temperature: 0.3,
    });
    
    this.promptTemplate = PromptTemplate.fromTemplate(`
You are an expert strategic planning analyst. The user has provided a QPRO document that needs to be analyzed against the university's strategic plan.

Strategic Plan Context:
{strategic_context}

User QPRO Input:
{user_input}

Please provide a prescriptive analysis that:
1. Identifies alignment between the QPRO and strategic plan
2. Highlights potential strategic opportunities
3. Points out any gaps or conflicts
4. Provides actionable recommendations
5. Suggests relevant KRA/Strategy connections

Format your response in a structured manner with clear headings.
    `);
  }

  async processQPRO(fileBuffer: Buffer, fileType: string): Promise<string> {
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

      // Generate embedding for user input
      const userEmbedding = await embeddingService.generateEmbedding(userText);

      // Search for relevant strategic plan data
      const searchResults = await vectorService.searchVectors(userEmbedding, 5);
      
      // Format strategic context from search results
      const strategicContext = searchResults.map(result =>
        `${result.metadata?.text || ''}`
      ).join('\n\n');

      // Combine user input with strategic context
      const chain = this.promptTemplate.pipe(this.llm);
      const result = await chain.invoke({
        strategic_context: strategicContext,
        user_input: userText
      });

      return result.content as string;
    } catch (error) {
      console.error('Error in processQPRO:', error);
      throw error;
    }
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
}

export const analysisEngineService = new AnalysisEngineService();
export default AnalysisEngineService;