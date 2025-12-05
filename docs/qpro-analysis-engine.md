# QPRO Analysis Engine Documentation

## Overview
The QPRO Analysis Engine serves as the "Brain" component that connects user QPRO inputs with strategic plan data to generate prescriptive analysis. It accepts user input (PDF and DOCX files), searches the vector database for relevant KRA/Strategy data, and generates insights using LLMs.

## Architecture

### Core Components
1. **QPRO Input Processor** - Handles PDF and DOCX uploads and text extraction
2. **Vector Search Service** - Queries the vector database for relevant strategic plan data
3. **LLM Service** - Uses LangChain to generate prescriptive analysis
4. **Analysis Generator** - Combines user input with strategic plan data to produce insights

### Data Flow
```
User QPRO Document (PDF/DOCX) → Text Extraction → Embedding Generation → Vector Search → LLM Analysis → Prescriptive Output
```

## Services

### AnalysisEngineService
Located at `lib/services/analysis-engine-service.ts`, this service:
- Extracts text from PDF using pdf-parse or DOCX using mammoth
- Generates embeddings using the existing embedding service
- Searches for relevant strategic plan data using the vector service
- Uses LangChain with OpenAI to generate analysis
- Returns structured, prescriptive analysis

### API Endpoint
Located at `app/api/analyze-qpro/route.ts`, this endpoint:
- Accepts PDF and DOCX file uploads via POST request
- Processes the file using the AnalysisEngineService
- Returns the analysis results as JSON

### Frontend Component
Located at `components/qpro-analyzer.tsx`, this component:
- Provides a file upload interface for PDFs and DOCX files
- Submits files to the API endpoint
- Displays the analysis results

## Environment Variables Required
- `OPENAI_API_KEY` - For LLM access
- `UPSTASH_VECTOR_REST_URL` - Vector database URL
- `UPSTASH_VECTOR_REST_TOKEN` - Vector database token

## How to Test

1. Ensure all environment variables are set in your `.env` file
2. Make sure the vector database has been populated with strategic plan data
3. Upload a PDF or DOCX file using the QPRO analyzer component
4. Review the generated analysis for strategic alignment, opportunities, gaps, and recommendations
5. Verify that the document and analysis are stored in the database
6. Check that previous analyses can be retrieved and displayed

## Quality Validation

The QPRO Analysis Engine has been implemented with the following quality measures:
- Proper error handling in all components
- Type safety using TypeScript
- Modular architecture following existing code patterns
- Integration with existing services (embedding and vector)
- Input validation for file uploads
- Support for both PDF and DOCX formats
- Secure authentication for API endpoints
- Persistent storage of documents and their analyses
- Ability to retrieve and display historical analyses

## Integration Points
- Leverages existing `embeddingService` and `vectorService`
- Uses the same vector database populated by the ingestion script
- Integrates with existing authentication system
- Follows the same error handling patterns as other services
- Uses existing Document model for file storage metadata
- Creates new QPROAnalysis model for analysis storage

## Architecture Components

### Database Model: QPROAnalysis
- Links to original Document record
- Stores the full analysis result
- Contains parsed sections (alignment, opportunities, gaps, recommendations)
- Links to user who performed the analysis
- Timestamps for creation and updates

### Storage Architecture
- QPRO documents are stored in a dedicated Azure Blob Storage container named 'qpro-files'
- Original documents are organized by user ID within the container
- Analysis results are stored in the database while documents are in blob storage
- This separation allows for efficient document management and retrieval

### Services
- `qpro-analysis-service.ts`: Handles database operations for QPRO analyses
- `analysis-engine-service.ts`: Processes documents and generates analyses

### API Endpoints
- `/api/analyze-qpro`: Processes documents and stores analyses
- `/api/qpro-analyses`: Retrieves stored analyses

### Frontend Component
- `qpro-analyzer.tsx`: Allows document titling and shows historical analyses

## Performance Considerations
- Uses efficient vector search with top 5 results
- Implements proper buffer handling for file uploads
- Caches LLM instance to avoid repeated initialization