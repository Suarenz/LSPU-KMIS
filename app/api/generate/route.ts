import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import GeminiGenerationService from '@/lib/services/gemini-generation-service';
import ColivaraService from '@/lib/services/colivara-service';
import { requireAuth } from '@/lib/middleware/auth-middleware';

const geminiService = new GeminiGenerationService();
const colivaraService = new ColivaraService();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;

    // Parse request body
    const body = await request.json();
    const { 
      query, 
      searchResults, 
      generationType = 'text-only', // 'text-only' or 'multimodal'
      maxResults = 5,
      customPrompt 
    } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(searchResults) || searchResults.length === 0) {
      return NextResponse.json(
        { error: 'Search results are required and must be an array' },
        { status: 400 }
      );
    }

    const userId = user.id;

    try {
    // Generate response based on the requested generation type
    let generatedResponse;
    
    if (generationType === 'multimodal') {
      // For multimodal generation, we would need to process visual content
      // For now, we'll use the enhanced search results that include visual content
      generatedResponse = await geminiService.generateResponse(
        query,
        searchResults,
        {
          textOnly: false,
          maxResults,
          customPrompt
        },
        userId
      );
    } else {
      // Text-only generation
      generatedResponse = await geminiService.generateResponse(
        query,
        searchResults,
        {
          textOnly: true,
          maxResults,
          customPrompt
        },
        userId
      );
    }

    // Return the generated response
    return NextResponse.json({
      query,
      generatedResponse,
      generationType,
      searchResultsUsed: searchResults.length,
      userId,
      timestamp: new Date().toISOString()
    });
  } catch (geminiError) {
    console.error('Gemini generation failed:', geminiError);
    
    return NextResponse.json(
      {
        error: 'Failed to generate response with Gemini AI',
        details: geminiError instanceof Error ? geminiError.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
 } catch (error) {
    console.error('Error in generation API:', error);
    return NextResponse.json(
      { error: 'Internal server error during generation' },
      { status: 500 }
    );
  }
}

// Health check endpoint for the generation service
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }

    // Check if both services are healthy
    const geminiHealthy = await geminiService.healthCheck();
    const colivaraHealthy = await colivaraService.validateApiKey();

    return NextResponse.json({
      status: 'healthy',
      services: {
        gemini: geminiHealthy,
        colivara: colivaraHealthy
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Health check failed'
      },
      { status: 500 }
    );
  }
}