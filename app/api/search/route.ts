import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import enhancedDocumentService from '@/lib/services/enhanced-document-service';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import ColivaraService from '@/lib/services/colivara-service';

const colivaraService = new ColivaraService();

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10'))); // Limit to 50 max
    const unitId = searchParams.get('unit') || undefined;
    const category = searchParams.get('category') || undefined;
    const useSemantic = searchParams.get('semantic') === 'true' || true; // Default to true for semantic search
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const userId = user.id;

    if (useSemantic) {
      // Use Colivara semantic search
      try {
        const colivaraResults = await colivaraService.performHybridSearch(
          query,
          { unitId, category },
          userId
        );
        
        // Format Colivara results to match expected response structure
        return NextResponse.json({
          results: colivaraResults.results,
          total: colivaraResults.total,
          page,
          limit,
          totalPages: Math.ceil(colivaraResults.total / limit),
          query: colivaraResults.query,
          processingTime: colivaraResults.processingTime,
          searchType: 'hybrid',
        });
      } catch (colivaraError) {
        console.error('Colivara search failed, falling back to traditional search:', colivaraError);
        // Fall back to traditional search if Colivara fails
        // Use traditional search
        const traditionalResults = await enhancedDocumentService.searchDocuments(
          query,
          unitId,
          category,
          undefined, // tags
          userId,
          page,
          limit
        );
        
        // Format traditional results to match expected response structure
        // Map traditional results to the same format as Colivara results
        const formattedResults = traditionalResults.documents.map(doc => ({
          documentId: doc.id,
          title: doc.title,
          content: doc.description,
          score: 0.5, // Default score for traditional search
          pageNumbers: [],
          documentSection: 'description',
          confidenceScore: 0.5,
          snippet: doc.description.substring(0, 200) + '...',
          document: doc
        }));

        return NextResponse.json({
          results: formattedResults,
          total: traditionalResults.total,
          page,
          limit,
          totalPages: Math.ceil(traditionalResults.total / limit),
          query,
          processingTime: 0, // We don't track processing time for traditional search here
          searchType: 'traditional',
        });
      }
    } else {
      // Use traditional search
      const traditionalResults = await enhancedDocumentService.searchDocuments(
        query,
        unitId,
        category,
        undefined, // tags
        userId,
        page,
        limit
      );
      
      // Format traditional results to match expected response structure
      // Map traditional results to the same format as Colivara results
      const formattedResults = traditionalResults.documents.map(doc => ({
        documentId: doc.id,
        title: doc.title,
        content: doc.description,
        score: 0.5, // Default score for traditional search
        pageNumbers: [],
        documentSection: 'description',
        confidenceScore: 0.5,
        snippet: doc.description.substring(0, 200) + '...',
        document: doc
      }));

      return NextResponse.json({
        results: formattedResults,
        total: traditionalResults.total,
        page,
        limit,
        totalPages: Math.ceil(traditionalResults.total / limit),
        query,
        processingTime: 0, // We don't track processing time for traditional search here
        searchType: 'traditional',
      });
    }
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Internal server error during search' },
      { status: 500 }
    );
  }
}

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
    const { query, unitId, category, filters, page = 1, limit = 10, useSemantic = true } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const userId = user.id;

    let searchResults;
    
    if (useSemantic) {
      // Use Colivara semantic search
      try {
        const colivaraResults = await colivaraService.performHybridSearch(
          query,
          { unitId, category, ...filters },
          userId
        );
        
        // Format Colivara results to match expected response structure
        return NextResponse.json({
          results: colivaraResults.results,
          total: colivaraResults.total,
          page,
          limit,
          totalPages: Math.ceil(colivaraResults.total / limit),
          query: colivaraResults.query,
          processingTime: colivaraResults.processingTime,
          searchType: 'hybrid',
        });
      } catch (colivaraError) {
        console.error('Colivara search failed, falling back to traditional search:', colivaraError);
        // Fall back to traditional search if Colivara fails
        // Use traditional search
        const traditionalResults = await enhancedDocumentService.searchDocuments(
          query,
          unitId,
          category,
          undefined, // tags
          userId,
          page,
          limit
        );
        
        // Format traditional results to match expected response structure
        // Map traditional results to the same format as Colivara results
        const formattedResults = traditionalResults.documents.map(doc => ({
          documentId: doc.id,
          title: doc.title,
          content: doc.description,
          score: 0.5, // Default score for traditional search
          pageNumbers: [],
          documentSection: 'description',
          confidenceScore: 0.5,
          snippet: doc.description.substring(0, 200) + '...',
          document: doc
        }));

        return NextResponse.json({
          results: formattedResults,
          total: traditionalResults.total,
          page,
          limit,
          totalPages: Math.ceil(traditionalResults.total / limit),
          query,
          processingTime: 0, // We don't track processing time for traditional search here
          searchType: 'traditional',
        });
      }
    } else {
      // Use traditional search
      const traditionalResults = await enhancedDocumentService.searchDocuments(
        query,
        unitId,
        category,
        undefined, // tags
        userId,
        page,
        limit
      );
      
      // Format traditional results to match expected response structure
      // Map traditional results to the same format as Colivara results
      const formattedResults = traditionalResults.documents.map(doc => ({
        documentId: doc.id,
        title: doc.title,
        content: doc.description,
        score: 0.5, // Default score for traditional search
        pageNumbers: [],
        documentSection: 'description',
        confidenceScore: 0.5,
        snippet: doc.description.substring(0, 200) + '...',
        document: doc
      }));

      return NextResponse.json({
        results: formattedResults,
        total: traditionalResults.total,
        page,
        limit,
        totalPages: Math.ceil(traditionalResults.total / limit),
        query,
        processingTime: 0, // We don't track processing time for traditional search here
        searchType: 'traditional',
      });
    }
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Internal server error during search' },
      { status: 500 }
    );
  }
}