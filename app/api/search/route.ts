import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import enhancedDocumentService from '@/lib/services/enhanced-document-service';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import ColivaraService from '@/lib/services/colivara-service';
import { Document } from '@/lib/api/types';
import SuperMapper from '@/lib/utils/super-mapper';
import prisma from '@/lib/prisma';

const colivaraService = new ColivaraService();

// Helper function to deduplicate search results based on document ID
function deduplicateResults(results: any[]): any[] {
  const seenIds = new Set<string>();
  const uniqueResults: any[] = [];
  
  for (const result of results) {
    // Use the document ID for deduplication - try multiple possible locations
    const docId = result.id ||
                  result.documentId ||
                  (result.document && result.document.id) ||
                  (result.metadata && result.metadata.documentId) ||
                  (result.document && result.document.metadata.documentId) ||
                  undefined;
    
    if (docId && !seenIds.has(docId)) {
      seenIds.add(docId);
      uniqueResults.push(result);
    } else if (!docId) {
      // If no ID is available, add it anyway (though this shouldn't happen with proper data)
      console.warn('Result without valid document ID in deduplicateResults:', result);
      uniqueResults.push(result);
    }
   }
  
  return uniqueResults;
}

// Group similar search results by document ID to consolidate duplicates
function groupResults(results: any[]): any[] {
  const groupedMap = new Map<string, any>();
  
  for (const result of results) {
    // Use the document ID as the grouping key - try multiple possible locations
    const docId = result.id ||
                  result.documentId ||
                  (result.document && result.document.id) ||
                  (result.metadata && result.metadata.documentId) ||
                  (result.document && result.document.metadata.documentId) ||
                  undefined;
    
    if (docId) {
      if (groupedMap.has(docId)) {
        // If we already have a result for this document, we'll keep the one with higher score
        const existingResult = groupedMap.get(docId);
        const currentScore = result.score || result.confidenceScore || 0;
        const existingScore = existingResult.score || existingResult.confidenceScore || 0;
        
        // Keep the result with higher score
        if (currentScore > existingScore) {
          groupedMap.set(docId, result);
        }
      } else {
        groupedMap.set(docId, result);
      }
    } else {
      // If no ID, add it directly (shouldn't happen in normal cases after our filtering)
      console.warn('Result without valid document ID:', result);
      groupedMap.set(`fallback_${results.indexOf(result)}`, result);
    }
   }
  
  return Array.from(groupedMap.values());
}

// Mapper function to convert Colivara search results to the standard format expected by the frontend
async function mapColivaraResultsToDocuments(colivaraResults: any[]) {
  // Create a set of document IDs from the search results to fetch from the database, ensuring they are valid strings
  // Extract document IDs from the Colivara results - the ID should come from the metadata of the Colivara document
  const allIds = colivaraResults
    .map((result: any) => {
      // Try multiple possible locations for the document ID
      return result.documentId ||
             result.id ||
             (result.document && result.document.id) ||
             (result.metadata && result.metadata.documentId) || // Check in metadata for the original document ID
             (result.document && result.document.metadata && result.document.metadata.documentId) || // Nested check
             undefined;
    });
  
  // Log problematic IDs for debugging
  const problematicIds = allIds.filter((id: any) => typeof id !== 'string' || id === undefined || id === null || id.trim() === '' || id.length === 0);
  if (problematicIds.length > 0) {
    console.warn('Found problematic document IDs in mapColivaraResultsToDocuments:', problematicIds);
    console.warn('Sample of problematic results:', colivaraResults.slice(0, 5).map((r: any) => ({
      documentId: r.documentId,
      id: r.id,
      metadata: r.metadata,
      document: r.document,
      hasDocument: !!r.document,
      documentIdFromDoc: r.document?.id,
      documentIdFromMetadata: r.metadata?.documentId
    })));
  }
  
  const documentIds = allIds
    .filter((id: any) => {
      // Only include IDs that are valid strings
      return typeof id === 'string' && id.trim() !== '' && id.length > 0;
    });
  
  // Remove duplicates from documentIds
  const uniqueDocumentIds = [...new Set(documentIds)];
  
  // Fetch actual document data from the database to ensure correct titles and descriptions
  let dbDocMap = new Map();
  if (uniqueDocumentIds.length > 0) {
    const dbDocuments = await prisma.document.findMany({
      where: {
        id: { in: uniqueDocumentIds },
        status: 'ACTIVE' // Only include active documents
      },
      include: {
        uploadedByUser: true,
        documentUnit: true,
      }
    });
    
    // Create a map for quick lookup of database document data
    dbDocMap = new Map(dbDocuments.map((doc: any) => [doc.id, doc]));
  }
  
 // Process results and map them to proper document format
  const mappedResults = [];
  for (const result of colivaraResults) {
    // Get the document ID from the result - try multiple possible locations
    const rawId = result.documentId ||
                  result.id ||
                  (result.document && result.document.id) ||
                  (result.metadata && result.metadata.documentId) ||
                  (result.document && result.document.metadata && result.document.metadata.documentId) ||
                  undefined;
    
    // Only process if we have a valid document ID
    if (typeof rawId === 'string' && rawId.trim() !== '' && rawId.length > 0) {
      // Get the corresponding database document if it exists
      const dbDoc = dbDocMap.get(rawId);
      
      // If the document exists in the database, use its data as the primary source
      if (dbDoc) {
        // Use database document as primary source but override with search-specific data
        const mappedDocument = {
          ...dbDoc,
          tags: Array.isArray(dbDoc.tags) ? dbDoc.tags as string[] : [],
          unitId: dbDoc.unitId ?? undefined,
          versionNotes: dbDoc.versionNotes ?? undefined,
          uploadedBy: dbDoc.uploadedByUser?.name || dbDoc.uploadedBy,
          status: dbDoc.status as 'ACTIVE' | 'ARCHIVED' | 'PENDING_REVIEW',
          unit: dbDoc.documentUnit ? {
            id: dbDoc.documentUnit.id,
            name: dbDoc.documentUnit.name,
            code: dbDoc.documentUnit.code,
            description: dbDoc.documentUnit.description || undefined,
            createdAt: dbDoc.documentUnit.createdAt,
            updatedAt: dbDoc.documentUnit.updatedAt,
          } : undefined,
          uploadedAt: new Date(dbDoc.uploadedAt),
          createdAt: new Date(dbDoc.createdAt),
          updatedAt: new Date(dbDoc.updatedAt),
          // Colivara fields
          colivaraDocumentId: dbDoc.colivaraDocumentId ?? undefined,
          colivaraProcessingStatus: dbDoc.colivaraProcessingStatus as 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' ?? undefined,
          colivaraProcessedAt: dbDoc.colivaraProcessedAt ? new Date(dbDoc.colivaraProcessedAt) : undefined,
          colivaraChecksum: dbDoc.colivaraChecksum ?? undefined,
        };
        
        // Override with search-specific data if available in the result
        mappedResults.push({
          ...mappedDocument,
          title: dbDoc.title, // Always use the database title
          // For snippet, try Colivara result first, then fallback to database description
          snippet: result.snippet || result.content?.substring(0, 200) + '...' || result.text?.substring(0, 200) + '...' || dbDoc.description?.substring(0, 200) + '...' || '',
          // Add search-specific fields
          score: result.score || result.confidenceScore || 0,
          pageNumbers: result.pageNumbers || [],
          documentSection: result.documentSection || '',
          confidenceScore: result.confidenceScore || result.score || 0,
        });
      } else {
        // If no database document exists (shouldn't happen after zombie filtering), log a warning
        console.warn(`Document with ID ${rawId} not found in database but returned by Colivara search`);
      }
    } else {
      // If no valid document ID found, log for debugging but skip this result
      console.warn('Skipping result with no valid document ID:', {
        documentId: result.documentId,
        id: result.id,
        metadata: result.metadata,
        document: result.document,
      });
    }
  }
  
  return mappedResults;
}

// Function to remove zombie documents (documents that exist in Colivara but not in Prisma)
async function filterZombieDocuments(results: any[]): Promise<any[]> {
  // Create a set of document IDs from the search results, ensuring they are valid strings
 // Extract document IDs from the Colivara results - the ID should come from the metadata of the Colivara document
 const allIds = results.map((result: any) => {
    // Try multiple possible locations for the document ID
    return result.documentId ||
           result.id ||
           (result.document && result.document.id) ||
           (result.metadata && result.metadata.documentId) || // Check in metadata for the original document ID
           (result.document && result.document.metadata && result.document.metadata.documentId) || // Nested check
           undefined;
  });
  
  // Log problematic IDs for debugging
  const problematicIds = allIds.filter((id: any) => typeof id !== 'string' || id === undefined || id === null || id.trim() === '' || id.length === 0);
  if (problematicIds.length > 0) {
    console.warn('Found problematic document IDs in search results:', problematicIds);
    console.warn('Sample of search results:', results.slice(0, 3).map((r: any) => ({
      documentId: r.documentId,
      id: r.id,
      metadata: r.metadata,
      hasDocument: !!r.document,
      documentIdFromDoc: r.document?.id,
      documentIdFromMetadata: r.metadata?.documentId
    })));
  }
  
  const documentIds = allIds
    .filter((id: any) => {
      // Only include IDs that are valid strings
      return typeof id === 'string' && id.trim() !== '' && id.length > 0;
    });
  
  // Remove duplicates from documentIds
  const uniqueDocumentIds = [...new Set(documentIds)];
  
  if (uniqueDocumentIds.length === 0) {
    console.warn('No valid document IDs found in search results');
    return results;
  }
  
  // Query Prisma to get the actual documents that exist in the database
  const existingDocs = await prisma.document.findMany({
    where: {
      id: { in: uniqueDocumentIds },
      status: 'ACTIVE' // Only include active documents
    },
    select: { id: true }
 });
  
  // Create a Set of existing document IDs for fast lookup
  const existingDocIds = new Set(existingDocs.map((doc: any) => doc.id));
  
  // Filter out results that don't exist in the database (zombie documents)
  return results.filter((result: any) => {
    // Try multiple possible locations for the document ID
    const docId = result.documentId ||
                  result.id ||
                  (result.document && result.document.id) ||
                  (result.metadata && result.metadata.documentId) ||
                  (result.document && result.document.metadata && result.document.metadata.documentId) ||
                  undefined;
    return typeof docId === 'string' && docId.trim() !== '' && existingDocIds.has(docId);
  });
}

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
        
        // Filter out zombie documents (deleted from Prisma but still in Colivara) first
        let filteredResults = await filterZombieDocuments(colivaraResults.results);
        
        // Map Colivara results to standard document format using database data
        let mappedResults = await mapColivaraResultsToDocuments(filteredResults);
        
        // Group and deduplicate results to avoid showing the same document multiple times
        mappedResults = groupResults(mappedResults);
        
        // Format Colivara results to match expected response structure
        return NextResponse.json({
          results: mappedResults,
          total: mappedResults.length, // Use actual deduplicated count
          page,
          limit,
          totalPages: Math.ceil(mappedResults.length / limit),
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
        // Map traditional results to the same format as Colivara results using SuperMapper
        const formattedResults = traditionalResults.documents.map(doc => ({
          documentId: doc.id,
          title: doc.title,
          content: doc.description,
          score: 0.5, // Default score for traditional search
          pageNumbers: [],
          documentSection: 'description',
          confidenceScore: 0.5,
          snippet: doc.description.substring(0, 200) + '...',
          document: SuperMapper.createStandardDocument(doc) // Process through SuperMapper
        }));

        // Group and deduplicate results to avoid showing the same document multiple times
        const groupedResults = groupResults(formattedResults);

        return NextResponse.json({
          results: groupedResults,
          total: groupedResults.length, // Use actual deduplicated count
          page,
          limit,
          totalPages: Math.ceil(groupedResults.length / limit),
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
      // Map traditional results to the same format as Colivara results using SuperMapper
      const formattedResults = traditionalResults.documents.map(doc => ({
        documentId: doc.id,
        title: doc.title,
        content: doc.description,
        score: 0.5, // Default score for traditional search
        pageNumbers: [],
        documentSection: 'description',
        confidenceScore: 0.5,
        snippet: doc.description.substring(0, 200) + '...',
        document: SuperMapper.createStandardDocument(doc) // Process through SuperMapper
      }));

      // Group and deduplicate results to avoid showing the same document multiple times
      const groupedResults = groupResults(formattedResults);

      return NextResponse.json({
        results: groupedResults,
        total: groupedResults.length, // Use actual deduplicated count
        page,
        limit,
        totalPages: Math.ceil(groupedResults.length / limit),
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
      
      // Filter out zombie documents (deleted from Prisma but still in Colivara) first
      let filteredResults = await filterZombieDocuments(colivaraResults.results);
      
      // Map Colivara results to standard document format using database data
      let mappedResults = await mapColivaraResultsToDocuments(filteredResults);
      
      // Group and deduplicate results to avoid showing the same document multiple times
      mappedResults = groupResults(mappedResults);
      
      // Format Colivara results to match expected response structure
      return NextResponse.json({
        results: mappedResults,
        total: mappedResults.length, // Use actual deduplicated count
        page,
        limit,
        totalPages: Math.ceil(mappedResults.length / limit),
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
        // Map traditional results to the same format as Colivara results using SuperMapper
        const formattedResults = traditionalResults.documents.map(doc => ({
          documentId: doc.id,
          title: doc.title,
          content: doc.description,
          score: 0.5, // Default score for traditional search
          pageNumbers: [],
          documentSection: 'description',
          confidenceScore: 0.5,
          snippet: doc.description.substring(0, 200) + '...',
          document: SuperMapper.createStandardDocument(doc) // Process through SuperMapper
        }));

        // Group and deduplicate results to avoid showing the same document multiple times
        const groupedResults = groupResults(formattedResults);

        return NextResponse.json({
          results: groupedResults,
          total: groupedResults.length, // Use actual deduplicated count
          page,
          limit,
          totalPages: Math.ceil(groupedResults.length / limit),
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
      // Map traditional results to the same format as Colivara results using SuperMapper
      const formattedResults = traditionalResults.documents.map(doc => ({
        documentId: doc.id,
        title: doc.title,
        content: doc.description,
        score: 0.5, // Default score for traditional search
        pageNumbers: [],
        documentSection: 'description',
        confidenceScore: 0.5,
        snippet: doc.description.substring(0, 200) + '...',
        document: SuperMapper.createStandardDocument(doc) // Process through SuperMapper
      }));

      // Group and deduplicate results to avoid showing the same document multiple times
      const groupedResults = groupResults(formattedResults);

      return NextResponse.json({
        results: groupedResults,
        total: groupedResults.length, // Use actual deduplicated count
        page,
        limit,
        totalPages: Math.ceil(groupedResults.length / limit),
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