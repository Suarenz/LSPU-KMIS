# QPRO Analysis Engine (Phase 2) - "Brain" Component Plan

## Overview
The Analysis Engine will serve as the "Brain" that connects user QPRO inputs with strategic plan data to generate prescriptive analysis. It will accept user input (PDF and DOCX files), search the vector database for relevant KRA/Strategy data, and generate insights using LLMs.

## Architecture Design

### Core Components
1. **QPRO Input Processor** - Handles PDF and DOCX uploads and text extraction
2. **Vector Search Service** - Queries the vector database for relevant strategic plan data
3. **LLM Service** - Uses LangChain to generate prescriptive analysis
4. **Analysis Generator** - Combines user input with strategic plan data to produce insights

### Data Flow
```
User QPRO Document (PDF/DOCX) → Text Extraction → Embedding Generation → Vector Search → LLM Analysis → Prescriptive Output
```

## Services and Dependencies

### Required Dependencies
- `@langchain/openai` - For LLM integration
- `@langchain/community` - For LangChain utilities
- `pdf-parse` - For PDF text extraction
- `mammoth` - For DOCX text extraction
- Existing services: `embedding-service.ts`, `vector-service.ts`
- `@upstash/vector` - For vector database access

### Required Environment Variables
- `OPENAI_API_KEY` - For LLM access
- `UPSTASH_VECTOR_REST_URL` - Vector database URL
- `UPSTASH_VECTOR_REST_TOKEN` - Vector database token

## Implementation Plan

### 1. Create Analysis Engine Service
```typescript
// lib/services/analysis-engine-service.ts
import { embeddingService } from './embedding-service';
import { vectorService } from './vector-service';
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

// Import pdf-parse and mammoth using CommonJS style since they use export = syntax
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

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
        // Extract text from PDF
        const pdfData = await pdfParse(fileBuffer);
        userText = pdfData.text;
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
}
```

### 2. API Endpoint
```typescript
// app/api/analyze-qpro/route.ts
import { analysisEngineService } from '@/lib/services/analysis-engine-service';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('qproFile');
    
    // Validate file exists and is a Blob
    if (!file || !(file instanceof Blob)) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type (support both PDF and DOCX)
    if (!file.type || (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      return Response.json({ error: 'Only PDF and DOCX files are allowed' }, { status: 400 });
    }

    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Convert Blob to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const analysis = await analysisEngineService.processQPRO(buffer, file.type);
    
    return Response.json({ analysis });
  } catch (error: any) {
    console.error('Analysis error:', error);
    
    // Return more specific error messages based on error type
    if (error.message?.includes('PDF') || error.message?.includes('document')) {
      return Response.json({ error: 'Invalid document file' }, { status: 400 });
    }
    
    return Response.json({ error: 'Analysis failed: ' + error.message }, { status: 500 });
  }
}
```

### 3. Frontend Component
```tsx
// components/qpro-analyzer.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QPROAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('qproFile', file);

    try {
      const response = await fetch('/api/analyze-qpro', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>QPRO Analysis Engine</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            disabled={loading}
          />
          <Button onClick={handleSubmit} disabled={!file || loading}>
            {loading ? 'Analyzing...' : 'Analyze QPRO'}
          </Button>
          
          {analysis && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Analysis Results:</h3>
              <div className="whitespace-pre-wrap">{analysis}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Processing Workflow

### 1. Input Processing
- Accept PDF or DOCX file upload from user with document title
- Authenticate user and validate permissions
- Store the original document in the system
- Extract text content from PDF using pdf-parse or from DOCX using mammoth.js
- Generate embedding for the extracted text

### 2. Vector Search
- Use the generated embedding to search the vector database
- Retrieve top 5 most relevant strategic plan fragments
- Format retrieved data as context for LLM

### 3. LLM Analysis
- Combine user input with strategic plan context
- Use LangChain to format prompt and send to LLM
- Generate prescriptive analysis based on alignment

### 4. Output Generation and Storage
- Return structured analysis with strategic recommendations
- Highlight relevant KRA/Strategy connections
- Identify gaps and opportunities
- Store the analysis result in the database linked to the original document
- Associate analysis with the uploading user

### 5. Data Persistence
- Create QPROAnalysis record linking to the original document
- Store analysis results, document metadata, and user information
- Enable retrieval of historical analyses for the same document
- Allow users to access their previous analyses

### 6. Storage Architecture
- QPRO documents are stored in a dedicated Azure Blob Storage container named 'qpro-files'
- Original documents are organized by user ID within the container
- Analysis results are stored in the database while documents are in blob storage
- This separation allows for efficient document management and retrieval

## Implementation Roadmap

### Phase 1: Core Services (Day 1)
1. Install LangChain and mammoth.js dependencies
2. Create AnalysisEngineService
3. Implement PDF and DOCX text extraction
4. Implement vector search functionality

### Phase 2: Database Schema (Day 2)
1. Define QPROAnalysis model in Prisma schema
2. Add relations to Document and User models
3. Create database migration
4. Generate Prisma client

### Phase 3: Storage Configuration (Day 3)
1. Configure Azure Blob Storage for QPRO documents
2. Set up dedicated 'qpro-documents' container
3. Implement file upload logic to separate container
4. Create file retrieval mechanism

### Phase 4: API Integration (Day 4)
1. Create API endpoint for processing QPRO files with authentication
2. Handle file uploads and validation
3. Connect with existing embedding and vector services
4. Create endpoint for retrieving stored analyses
5. Implement proper error handling and validation

### Phase 5: Frontend Integration (Day 5)
1. Update QPRO analyzer component with document title input
2. Implement file upload UI with authentication
3. Display analysis results
4. Add UI for viewing previous analyses
5. Enable navigation between stored analyses

### Phase 6: Testing and Refinement (Day 6)
1. Test with sample QPRO documents
2. Validate analysis quality
3. Test document persistence functionality
4. Optimize performance and error handling

## Integration Points
- Leverages existing `embeddingService` and `vectorService`
- Uses the same vector database populated by the ingestion script
- Integrates with existing authentication system
- Follows the same error handling patterns as other services
- Uses existing Document model for file storage metadata
- Creates new QPROAnalysis model for analysis storage
- Implements Azure Blob Storage for document files

## Architecture Components

### New Database Model: QPROAnalysis
- Links to original Document record
- Stores the full analysis result
- Contains parsed sections (alignment, opportunities, gaps, recommendations)
- Links to user who performed the analysis
- Timestamps for creation and updates

### New Services
- `qpro-analysis-service.ts`: Handles database operations for QPRO analyses
- Updated `analysis-engine-service.ts`: Now stores results in database

### New API Endpoints
- `/api/analyze-qpro`: Processes documents and stores analyses
- `/api/qpro-analyses`: Retrieves stored analyses

### Updated Frontend Component
- `qpro-analyzer.tsx`: Now allows document titling and shows historical analyses

This analysis engine will serve as the intelligent "Brain" that connects user QPRO inputs with the strategic plan data, providing valuable prescriptive insights based on the university's strategic objectives. The system now persists both the original documents and their analyses in a dedicated storage container, allowing users to review historical analyses and track changes over time.