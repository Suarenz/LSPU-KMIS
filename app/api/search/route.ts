import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import enhancedDocumentService from '@/lib/services/enhanced-document-service';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import ColivaraService from '@/lib/services/colivara-service';
import QwenGenerationService from '@/lib/services/qwen-generation-service';
import { Document } from '@/lib/api/types';
import SuperMapper from '@/lib/utils/super-mapper';
import prisma from '@/lib/prisma';
import { cleanDocumentTitle } from '@/lib/utils/document-utils';
import { searchCacheService } from '@/lib/services/search-cache-service';

// Define the source type for the Qwen response
interface Source {
  title: string;
  documentId: string;
  confidence: number;
}

// Helper function to generate consistent cache keys
function generateCacheKey(query: string, unitId?: string, category?: string, filters?: any) {
  // Convert "undefined" string to proper undefined/null for consistent cache keys
  const safeUnitId = (unitId === 'undefined' || unitId === undefined || unitId === null) ? 'all' : unitId;
  const safeCategory = (category === 'undefined' || category === undefined || category === null) ? 'all' : category;
  const safeFilters = (filters === 'undefined' || filters === undefined || filters === null) ? {} : filters;
  return btoa([
    query.toLowerCase().trim(),
    safeUnitId,
    safeCategory,
    JSON.stringify(safeFilters)
  ].join('|')).replace(/[^a-zA-Z0-9]/g, '_');
}

const qwenService = new QwenGenerationService({ model: process.env.QWEN_MODEL || 'qwen/qwen-2.5-vl-72b-instruct' });

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
          title: cleanDocumentTitle(dbDoc.title || result.title || result.originalName || result.document_name || (result.document && result.document.title) || dbDoc.fileName || 'Untitled Document'), // Prioritize database document title over Colivara result
          // For content, use robust fallback logic
          content: (() => {
            const rawContent = result.content || result.text || result.extractedText || dbDoc.description || '';
            const hasRealText = typeof rawContent === 'string' && rawContent.trim().length > 0;
            
            if (hasRealText) {
              return rawContent;
            } else {
              return 'Visual Content'; // This fixes "undefined" in content field
            }
          })(),
          // For snippet, try Colivara result first, then fallback to database description
          snippet: (() => {
            // Robust Text Fallback - check if content exists and is a string with length
            const rawContent = result.content || result.text || result.extractedText || dbDoc.description || '';
            const hasRealText = typeof rawContent === 'string' && rawContent.trim().length > 0;
            
            if (hasRealText) {
              return rawContent.substring(0, 200) + '...';
            } else {
              return dbDoc.description || 'Visual Document (Chart/Table/Image)'; // Use database description if available
            }
          })(),
          // Add search-specific fields
          score: (() => {
            const rawScore = result.score || result.confidenceScore;
            return (typeof rawScore === 'number') ? rawScore : 0.85; // Default to high relevance if Colivara found it
          })(),
          pageNumbers: result.pageNumbers || [],
          documentSection: result.documentSection || '',
          confidenceScore: (() => {
            const rawScore = result.confidenceScore || result.score;
            return (typeof rawScore === 'number') ? rawScore : 0.85; // Default to high relevance if Colivara found it
          })(),
          visualContent: result.visualContent, // Add visual content if available
          extractedText: result.extractedText, // Add extracted text if available
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

// Function to enhance results with visual content for multimodal processing
async function enhanceResultsWithVisualContent(results: any[], query: string, userId: string): Promise<any[]> {
  // For each result, try to add visual content if it's missing but available from Colivara
  const enhancedResults = [];
  
  for (const result of results) {
    // If the result already has visual content, return as is
    if (result.screenshots && result.screenshots.length > 0) {
      enhancedResults.push(result);
      continue;
    }
    
    // Otherwise, try to fetch visual content from Colivara for this specific document
    try {
      // Try to get visual content for this document from Colivara if available
      // This is a simplified approach - in reality, you'd need to call Colivara to get the visual content
      const enhancedResult = { ...result };
      
      // Add any missing visual content fields that might be needed for multimodal processing
      if (!enhancedResult.screenshots) {
        enhancedResult.screenshots = [];
      }
      if (!enhancedResult.visualContent) {
        enhancedResult.visualContent = result.visualContent || null;
      }
      if (!enhancedResult.extractedText) {
        enhancedResult.extractedText = result.extractedText || '';
      }
      
      enhancedResults.push(enhancedResult);
    } catch (error) {
      console.error(`Error enhancing result with visual content for document ${result.documentId}:`, error);
      // Return the original result if enhancement fails
      enhancedResults.push(result);
    }
  }
  
  return enhancedResults;
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

    // Extract additional parameters for generation
    const generateResponse = searchParams.get('generate') === 'true';
    const generationType = searchParams.get('generationType') || 'text-only'; // 'text-only' or 'multimodal'
    
    // Check cache first before making expensive API calls
    // For GET requests, there are no filters from request body, so pass an empty object to ensure consistent cache keys
    // Using {} instead of undefined ensures cache key consistency between GET and POST requests
    // Normalize "undefined" strings to proper undefined values
    const normalizedUnitId = (unitId === 'undefined') ? undefined : unitId;
    const normalizedCategory = (category === 'undefined') ? undefined : category;
    console.log(`Checking cache for query: "${query}", unitId: "${normalizedUnitId}", category: "${normalizedCategory}"`);
    const cachedResult = await searchCacheService.getCachedResult(query, normalizedUnitId, normalizedCategory, {});
    if (cachedResult) {
      console.log(`Cache hit for query: ${query}`);
      console.log(`Cache key used: ${generateCacheKey(query, unitId, category, {})}`);
      
      // Enhance cached results with visual content if needed for multimodal processing
      let enhancedCachedResults = cachedResult.results;
      if (generateResponse) {
        enhancedCachedResults = await enhanceResultsWithVisualContent(cachedResult.results, query, userId);
      }
      
      // Create a new cached result object with enhanced results
      const enhancedCachedResult = {
        ...cachedResult,
        results: enhancedCachedResults
      };
      
      // If we're generating a response, we still need to call the generation service
      // because the generated content might not be cached or might have expired
      if (generateResponse) {
        try {
          const qwenService = new QwenGenerationService({ model: process.env.QWEN_MODEL || 'qwen/qwen-2.5-vl-72b-instruct' });
          
          // For comprehensive queries (like "what trainings/seminars did..."), use more results
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
          
          // Use more results for comprehensive queries, but make sure we don't exceed what we have
          const resultsForGeneration = isComprehensiveQuery ?
            enhancedCachedResult.results.slice(0, Math.min(6, enhancedCachedResult.results.length)) : // Use up to 6 results for comprehensive queries
            enhancedCachedResult.results.slice(0, 1);  // Use only top result for specific queries
          
          const qwenResult = await qwenService.generateInsights(
            query,
            resultsForGeneration,
            userId
          );
          
          // Add generated response to cached results
          const responseWithGeneration = {
            ...enhancedCachedResult,
            generatedResponse: qwenResult.summary,
            generationType: generationType,
            sources: qwenResult.sources,
          };
          
          // Include the document URL for the relevant document in the response
          if (enhancedCachedResult.results.length > 0 && responseWithGeneration.sources.length > 0) {
            // Find the document that corresponds to the source and add its URL
            const relevantDoc = enhancedCachedResult.results.find(doc => doc.documentId === responseWithGeneration.sources[0].documentId);
            if (relevantDoc) {
              // Access documentUrl from the relevantDoc if it exists
              const docWithUrl = relevantDoc as any;
              if (docWithUrl.documentUrl) {
                (responseWithGeneration as any).relevantDocumentUrl = docWithUrl.documentUrl;
              }
            }
          }
          
          return NextResponse.json(responseWithGeneration);
        } catch (generationError) {
          console.error('Qwen generation failed:', generationError);
          // Return cached results even if generation fails
          return NextResponse.json(enhancedCachedResult);
        }
      }
      
      // Return cached result directly if no generation needed
      return NextResponse.json(enhancedCachedResult);
    }
    
    console.log(`Cache miss for query: ${query}, making API calls...`);
    console.log(`Cache key that was not found: ${generateCacheKey(query, unitId, category, {})}`);
    
    if (useSemantic) {
      // Use Colivara hybrid search
      try {
        const colivaraResults = await colivaraService.performHybridSearch(
          query,
          { unitId, category },
          userId
        );
        
        // --- ADD THIS ---
        console.log("🔍 SEARCH RESULTS LOG:", JSON.stringify(colivaraResults, null, 2));
        // ----------------
        
        // Filter out zombie documents (deleted from Prisma but still in Colivara) first
        let filteredResults = await filterZombieDocuments(colivaraResults.results);
        
        // Map Colivara results to standard document format using database data
        let mappedResults = await mapColivaraResultsToDocuments(filteredResults);
        
        // Group and deduplicate results to avoid showing the same document multiple times
        mappedResults = groupResults(mappedResults);
        
        // Create response object
        let responseResults = mappedResults;
        
        // If generateResponse is true, limit results to the most relevant document
        if (generateResponse && mappedResults && mappedResults.length > 0) {
          // Use only the top result for display when generating AI response
          responseResults = mappedResults.slice(0, 1);
        }

        const response: any = {
          results: responseResults,
          total: responseResults.length, // Use actual count after potential filtering
          page,
          limit,
          totalPages: Math.ceil(mappedResults.length / limit), // Keep original total for pagination reference
          query: colivaraResults.query,
          processingTime: colivaraResults.processingTime,
          searchType: 'hybrid',
        };

        // If generateResponse is true, use Qwen to generate a response based on the search results
        if (generateResponse && mappedResults && mappedResults.length > 0) {
          // First, get valid document IDs to filter zombie documents
          const validDocumentIds = new Set(
            filteredResults.map((result: any) => {
              return result.documentId ||
                     result.id ||
                     (result.document && result.document.id) ||
                     (result.metadata && result.metadata.documentId) ||
                     (result.document && result.document.metadata.documentId) ||
                     undefined;
            }).filter((id: any) => typeof id === 'string' && id.trim() !== '' && id.length > 0)
          );
 
          // 1. MAP (Universal) - This creates the multimodal content needed for Qwen
          // First, collect all Colivara document IDs to map to database IDs in a single query
          const colivaraDocIds = colivaraResults.results
            .filter((item: any) => {
              // Only include items that have a valid document ID that exists in our filtered results
              const docId = item.documentId ||
                           item.id ||
                           (item.document && item.document.id) ||
                           (item.metadata && item.metadata.documentId) ||
                           (item.document && item.document.metadata && item.document.metadata.documentId) ||
                           undefined;
              return typeof docId === 'string' && docId.trim() !== '' && validDocumentIds.has(docId);
            })
            .map((item: any) => {
              // Get the Colivara document ID
              const docData = item.document || item;
              const metadata = docData.metadata || item.metadata || {};
              
              // Validate that the document ID is in proper CUID format before using it
              const documentId = item.documentId || docData.document_id || docData.id?.toString() || "";
              const isValidDocumentId = documentId && documentId !== 'undefined' && !documentId.includes('undefined') && /^[a-z0-9]+$/i.test(documentId) && documentId.length >= 20 && documentId.length <= 30;
              
              // Extract the original database document ID from metadata if available
              const originalDocumentId = metadata.documentId || (docData.metadata && docData.metadata.documentId) || item.metadata?.documentId;
              const hasValidOriginalId = originalDocumentId && typeof originalDocumentId === 'string' && /^[a-z0-9]+$/i.test(originalDocumentId) && originalDocumentId.length >= 20 && originalDocumentId.length <= 30;
              
              return {
                colivaraDocumentId: isValidDocumentId ? documentId : "",
                originalDocumentId: hasValidOriginalId ? originalDocumentId : undefined, // Store the original database ID if available
                item: item, // Keep reference to the original item
                index: colivaraResults.results.indexOf(item) // Keep track of the index
              };
            })
            .filter((mapping: any) => mapping.colivaraDocumentId); // Only keep items with valid Colivara IDs
          
          // Query the database to map Colivara document IDs to database document IDs
          const colivaraIdsToMap = colivaraDocIds
            .filter((mapping: any) => !mapping.originalDocumentId) // Only map if we don't already have the original DB ID
            .map((mapping: any) => mapping.colivaraDocumentId);
            
          let colivaraToDbMap = new Map(); // Initialize as empty map
          
          if (colivaraIdsToMap.length > 0) {
            try {
              // Query the database to find documents that have these colivaraDocumentIds
              const dbDocuments = await prisma.document.findMany({
                where: {
                  colivaraDocumentId: { in: colivaraIdsToMap }
                },
                select: {
                  id: true,
                  colivaraDocumentId: true
                }
              });
              
              // Create a map from Colivara ID to database ID
              colivaraToDbMap = new Map(dbDocuments.map(doc => [doc.colivaraDocumentId, doc.id]));
            } catch (error) {
              console.error('Error querying database for colivara document IDs:', error);
            }
          }
          
          // Now map the results with proper document IDs
          const rawMapped = colivaraResults.results
            .filter((item: any) => {
              // Only include items that have a valid document ID that exists in our filtered results
              const docId = item.documentId ||
                           item.id ||
                           (item.document && item.document.id) ||
                           (item.metadata && item.metadata.documentId) ||
                           (item.document && item.document.metadata && item.document.metadata.documentId) ||
                           undefined;
              return typeof docId === 'string' && docId.trim() !== '' && validDocumentIds.has(docId);
            })
            .map((item: any, index: number) => {
              const docData = item.document || item;
              const metadata = docData.metadata || item.metadata || {};
              
              // 1. Get Raw Image - Try multiple possible locations for image data
              let rawImage = docData.img_base64 ||
                            item.img_base64 ||
                            docData.image ||
                            metadata.image ||
                            item.visualContent ||
                            (item.document && item.document.visualContent) ||
                            (item.extracted_content && item.extracted_content.image) ||
                            null;
 
              // 1. Clean the string if it has data URL prefix
              if (rawImage && typeof rawImage === 'string') {
                  rawImage = rawImage.replace(/^data:image\/[a-z]+;base64,/, "");
              }
 
              // 2. DETECT MIME TYPE FROM DATA (The Fix)
              // Don't rely on the filename. Look at the first few characters of the code.
              let mimeType = 'image/jpeg'; // Default
              if (rawImage && typeof rawImage === 'string') {
                  if (rawImage.startsWith('iVBOR')) {
                      mimeType = 'image/png';
                  } else if (rawImage.startsWith('/9j/')) {
                      mimeType = 'image/jpeg';
                  }
              }
 
              // Helper to find text - Try multiple possible locations for extracted text
              const txt = docData.text ||
                         item.content ||
                         metadata.text ||
                         item.extractedText ||
                         (item.document && item.document.extractedText) ||
                         (item.extracted_content && item.extracted_content.text) ||
                         (item.extracted_content && item.extracted_content.content) ||
                         metadata.extracted_text ||
                         "";
 
              // SCORE FIX: If Colivara returns 0 but it's the top result, imply relevance based on rank
              let score = docData.raw_score || docData.score || item.score || 0;
              if (score === 0 && index === 0) score = 0.99; // Top result is logically relevant
              if (score === 0 && index === 1) score = 0.80;
 
              // IMAGE DEBUG: Log image size and header
              if (rawImage && typeof rawImage === 'string') {
                  console.log(`📸 IMAGE DEBUG [${metadata.originalName || metadata.title || docData.document_name || "Untitled"}]: Size = ${rawImage.length} characters`);
                  console.log(`   Header check: ${rawImage.substring(0, 30)}...`);
              } else {
                  console.log(`❌ NO IMAGE found for ${metadata.originalName || metadata.title || docData.document_name || "Untitled"}`);
              }
 
              // Validate that the document ID is in proper CUID format before using it
              const documentId = item.documentId || docData.document_id || docData.id?.toString() || "";
              const isValidDocumentId = documentId && documentId !== 'undefined' && !documentId.includes('undefined') && /^[a-z0-9]+$/i.test(documentId) && documentId.length >= 20 && documentId.length <= 30;
              
              // Extract the original database document ID from metadata if available
              const originalDocumentId = metadata.documentId || (docData.metadata && docData.metadata.documentId) || item.metadata?.documentId;
              const hasValidOriginalId = originalDocumentId && typeof originalDocumentId === 'string' && /^[a-z0-9]+$/i.test(originalDocumentId) && originalDocumentId.length >= 20 && originalDocumentId.length <= 30;
              
              // Try to get the database document ID by looking up the Colivara ID in our map
              let finalDocumentId = hasValidOriginalId ? originalDocumentId : undefined;
              
              if (!finalDocumentId && isValidDocumentId && colivaraToDbMap.has(documentId)) {
                finalDocumentId = colivaraToDbMap.get(documentId);
              }
              
              // Use the final document ID (database ID) for the URL, fallback to Colivara ID if not found
              const previewDocumentId = finalDocumentId || (isValidDocumentId ? documentId : undefined);
              
              return {
                documentId: isValidDocumentId ? documentId : "",
                originalDocumentId: finalDocumentId, // Store the database document ID if available
                title: cleanDocumentTitle(metadata.originalName || metadata.title || docData.document_name || (docData.title && cleanDocumentTitle(docData.title)) || (item.title && cleanDocumentTitle(item.title)) || "Untitled"),
                content: txt || "Visual content only", // Required field for SearchResult
                
                // UI Snippet: Show what we actually found
                snippet: txt ? txt.substring(0, 150) + "..." : "Visual Document (Table/Chart/Scan)",
                
                score: score,
                pageNumbers: [], // Required field for SearchResult
                document: {}, // Required field for SearchResult
                screenshots: rawImage ? [rawImage] : [],
                mimeType: mimeType, // Pass the TRUE type
                extractedText: txt,
                // Include document URL for redirect functionality - use the database document ID if available
                documentUrl: finalDocumentId ? `/repository/preview/${finalDocumentId}` : undefined
              };
            });

          // 2. DEDUPLICATE (Kill the Zombies)
          const uniqueMap = new Map();
          const cleanResults = [];

          for (const doc of rawMapped) {
              // Use documentId or Title as unique key to prevent duplicates
              const key = doc.documentId || doc.title;
              if (!uniqueMap.has(key)) {
                  uniqueMap.set(key, true);
                  cleanResults.push(doc);
              }
          }
          
          try {
            // Use generateInsights to get both the response and the sources used
            // For queries asking for comprehensive lists (like faculty and their trainings), use more results
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
            
            // Use more results for comprehensive queries, but make sure we don't exceed what we have
            const resultsForGeneration = isComprehensiveQuery ?
              cleanResults.slice(0, Math.min(6, cleanResults.length)) : // Use up to 6 results for comprehensive queries
              cleanResults.slice(0, 1);  // Use only top result for specific queries
            
            const qwenResult = await qwenService.generateInsights(
              query,
              resultsForGeneration
            );
            
            response.generatedResponse = qwenResult.summary;
            response.generationType = generationType;
            
            // Include all relevant sources for comprehensive queries, otherwise just the top one
            // Clean the title in the source and ensure we have the database document ID
            const cleanedSources = qwenResult.sources && qwenResult.sources.length > 0 ?
              qwenResult.sources.map(source => {
                // Try to get the database document ID from the resultsForGeneration
                const originalResult = resultsForGeneration.find(result =>
                  result.documentId === source.documentId || result.originalDocumentId === source.documentId
                );
                
                // Use the database document ID if available, otherwise fallback to the source.documentId
                const databaseDocumentId = originalResult?.originalDocumentId || source.documentId;
                
                return {
                  ...source,
                  title: cleanDocumentTitle(source.title),
                  documentId: databaseDocumentId // Use the database document ID for clicking
                };
              }) : [];
            
            response.sources = cleanedSources;
            
            // Include the document URL for the relevant document in the response
            if (cleanResults.length > 0 && response.sources.length > 0) {
              // Find the document that corresponds to the source and add its URL
              const relevantDoc = cleanResults.find(doc => doc.documentId === response.sources[0].documentId);
              if (relevantDoc && relevantDoc.documentUrl) {
                response.relevantDocumentUrl = relevantDoc.documentUrl;
              } else {
                // Fallback: try to find document by originalDocumentId if documentId doesn't match
                const relevantDocFallback = cleanResults.find(doc => doc.originalDocumentId === response.sources[0].documentId);
                if (relevantDocFallback && relevantDocFallback.documentUrl) {
                  response.relevantDocumentUrl = relevantDocFallback.documentUrl;
                }
              }
            }
            
            // Update the response results to include the visual content for caching
            // This ensures that when the response is cached, it includes the visual content needed for multimodal processing
            if (cleanResults.length > 0) {
              // Map the cleanResults (with visual content) to the response results
              response.results = cleanResults.slice(0, 1); // Use only top result for display when generating AI response
            }
          } catch (generationError) {
            console.error('Qwen generation failed:', generationError);
            // Don't fail the entire request if generation fails, just return search results
          }
        }

        // Store results in cache before returning - use empty object for consistency with cache retrieval
        // Before caching, ensure the response results include visual content if it exists
        await searchCacheService.setCachedResult(query, response, normalizedUnitId, normalizedCategory, {});
        return NextResponse.json(response);
      } catch (colivaraError) {
        console.error('Colivara search failed, falling back to traditional search:', colivaraError);
        // Fall back to traditional search if Colivara fails
        // Use traditional search
        console.log(`Colivara search failed for query: ${query}, falling back to traditional search`);
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
          title: cleanDocumentTitle(doc.title || doc.fileName || 'Untitled Document'),
          content: doc.description || '',
          score: 0.5, // Default score for traditional search
          pageNumbers: [],
          documentSection: 'description',
          confidenceScore: 0.5,
          snippet: doc.description ? doc.description.substring(0, 200) + '...' : 'No preview available',
          document: SuperMapper.createStandardDocument(doc) // Process through SuperMapper
        }));

        // Group and deduplicate results to avoid showing the same document multiple times
        const groupedResults = groupResults(formattedResults);

        // Create response object
        const response: any = {
          results: groupedResults,
          total: groupedResults.length, // Use actual deduplicated count
          page,
          limit,
          totalPages: Math.ceil(groupedResults.length / limit),
          query,
          processingTime: 0, // We don't track processing time for traditional search here
          searchType: 'traditional',
        };

        // If generateResponse is true, use Qwen to generate a response based on the search results
        if (generateResponse && groupedResults && groupedResults.length > 0) {
          try {
            // For traditional search, handle comprehensive queries similarly
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
            
            // Use more results for comprehensive queries, but make sure we don't exceed what we have
            const resultsForGeneration = isComprehensiveQuery ?
              groupedResults.slice(0, Math.min(6, groupedResults.length)) : // Use up to 6 results for comprehensive queries
              groupedResults.slice(0, 1);  // Use only top result for specific queries
            
            // Use generateInsights to get both the response and the sources used
            const qwenService = new QwenGenerationService({ model: process.env.QWEN_MODEL || 'qwen/qwen-2.5-vl-72b-instruct' });
            const qwenResult = await qwenService.generateInsights(
              query,
              resultsForGeneration,
              userId
            );
            
            response.generatedResponse = qwenResult.summary;
            response.generationType = generationType;
            
            // Include all relevant sources for comprehensive queries, otherwise just the top one
            const cleanedSources = qwenResult.sources && qwenResult.sources.length > 0 ?
              qwenResult.sources.map(source => ({
                ...source,
                title: cleanDocumentTitle(source.title)
              })) : [];
            
            response.sources = cleanedSources;
          } catch (generationError) {
            console.error('Qwen generation failed:', generationError);
            // Don't fail the entire request if generation fails, just return search results
          }
        }
        
        // Store results in cache before returning - use empty object for consistency with cache retrieval
        // Before caching, ensure the response results include visual content if it exists
        await searchCacheService.setCachedResult(query, response, normalizedUnitId, normalizedCategory, {});
        return NextResponse.json(response);
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

      // Create response object
      const response: any = {
        results: groupedResults,
        total: groupedResults.length, // Use actual deduplicated count
        page,
        limit,
        totalPages: Math.ceil(groupedResults.length / limit),
        query,
        processingTime: 0, // We don't track processing time for traditional search here
        searchType: 'traditional',
      };

      // If generateResponse is true, use Qwen to generate a response based on the search results
      if (generateResponse && groupedResults && groupedResults.length > 0) {
        try {
          // For traditional search, handle comprehensive queries similarly
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
        
          // Use more results for comprehensive queries, but make sure we don't exceed what we have
          const resultsForGeneration = isComprehensiveQuery ?
            groupedResults.slice(0, Math.min(6, groupedResults.length)) : // Use up to 6 results for comprehensive queries
            groupedResults.slice(0, 1);  // Use only top result for specific queries
        
          // Use generateInsights to get both the response and the sources used
          const qwenService = new QwenGenerationService({ model: process.env.QWEN_MODEL || 'qwen/qwen-2.5-vl-72b-instruct' });
          const qwenResult = await qwenService.generateInsights(
            query,
            resultsForGeneration,
            userId
          );
          
          response.generatedResponse = qwenResult.summary;
          response.generationType = generationType;
          
          // Include all relevant sources for comprehensive queries, otherwise just the top one
          const cleanedSources = qwenResult.sources && qwenResult.sources.length > 0 ?
            qwenResult.sources.map(source => ({
              ...source,
              title: cleanDocumentTitle(source.title)
            })) : [];
        
          response.sources = cleanedSources;
        } catch (generationError) {
          console.error('Qwen generation failed:', generationError);
          // Don't fail the entire request if generation fails, just return search results
        }
      }

      // Store results in cache before returning - use empty object for consistency with cache retrieval
      // Before caching, ensure the response results include visual content if it exists
      await searchCacheService.setCachedResult(query, response, normalizedUnitId, normalizedCategory, {});
      return NextResponse.json(response);
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
    const { query, unitId, category, filters, page = 1, limit = 10, useSemantic = true, generateResponse = false, generationType = 'text-only' } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const userId = user.id;

    // Check cache first before making expensive API calls
    // Using filters object directly for POST requests to maintain consistency with request parameters
    // Normalize "undefined" strings to proper undefined values
    const normalizedUnitId = (unitId === 'undefined') ? undefined : unitId;
    const normalizedCategory = (category === 'undefined') ? undefined : category;
    const normalizedFilters = (filters === 'undefined') ? {} : filters;
    console.log(`Checking cache for POST query: "${query}", unitId: "${normalizedUnitId}", category: "${normalizedCategory}", filters:`, normalizedFilters);
    const cachedResult = await searchCacheService.getCachedResult(query, normalizedUnitId, normalizedCategory, normalizedFilters);
    if (cachedResult) {
      console.log(`Cache hit for POST query: ${query}`);
      console.log(`Cache key used: ${generateCacheKey(query, unitId, category, filters)}`);
      
      // Enhance cached results with visual content if needed for multimodal processing
      let enhancedCachedResults = cachedResult.results;
      if (generateResponse) {
        enhancedCachedResults = await enhanceResultsWithVisualContent(cachedResult.results, query, userId);
      }
      
      // Create a new cached result object with enhanced results
      const enhancedCachedResult = {
        ...cachedResult,
        results: enhancedCachedResults
      };
      
      // If we're generating a response, we still need to call the generation service
      // because the generated content might not be cached or might have expired
      if (generateResponse) {
        try {
          const qwenService = new QwenGenerationService({ model: process.env.QWEN_MODEL || 'qwen/qwen-2.5-vl-72b-instruct' });
          
          // For comprehensive queries (like "what trainings/seminars did..."), use more results
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
          
          // Use more results for comprehensive queries, but make sure we don't exceed what we have
          const resultsForGeneration = isComprehensiveQuery ?
            enhancedCachedResult.results.slice(0, Math.min(6, enhancedCachedResult.results.length)) : // Use up to 6 results for comprehensive queries
            enhancedCachedResult.results.slice(0, 1);  // Use only top result for specific queries
          
          const qwenResult = await qwenService.generateInsights(
            query,
            resultsForGeneration,
            userId
          );
          
          // Add generated response to cached results
          const responseWithGeneration = {
            ...enhancedCachedResult,
            generatedResponse: qwenResult.summary,
            generationType: generationType,
            sources: qwenResult.sources,
          };
          
          // Include the document URL for the relevant document in the response
          if (enhancedCachedResult.results.length > 0 && responseWithGeneration.sources.length > 0) {
            // Find the document that corresponds to the source and add its URL
            const relevantDoc = enhancedCachedResult.results.find(doc => doc.documentId === responseWithGeneration.sources[0].documentId);
            if (relevantDoc) {
              // Access documentUrl from the relevantDoc if it exists
              const docWithUrl = relevantDoc as any;
              if (docWithUrl.documentUrl) {
                (responseWithGeneration as any).relevantDocumentUrl = docWithUrl.documentUrl;
              }
            }
          }
          
          return NextResponse.json(responseWithGeneration);
        } catch (generationError) {
          console.error('Qwen generation failed:', generationError);
          // Return cached results even if generation fails
          return NextResponse.json(enhancedCachedResult);
        }
      }
      
      // Return cached result directly if no generation needed
      return NextResponse.json(enhancedCachedResult);
    }
    
    console.log(`Cache miss for POST query: ${query}, making API calls...`);
    console.log(`Cache key that was not found: ${generateCacheKey(query, unitId, category, filters)}`);

    let searchResults;
    let searchType = '';
    let processingTime = 0;
    
    if (useSemantic) {
      // Use Colivara hybrid search
      try {
        const colivaraResults = await colivaraService.performHybridSearch(
          query,
          {
            unitId: normalizedUnitId,
            category: normalizedCategory,
            ...normalizedFilters
          },
          userId
        );
        
        // --- ADD THIS ---
        console.log("🔍 SEARCH RESULTS LOG:", JSON.stringify(colivaraResults, null, 2));
        // ----------------
        
        searchType = 'hybrid';
        processingTime = colivaraResults.processingTime;
        
        // Filter out zombie documents (deleted from Prisma but still in Colivara) first
        let filteredResults = await filterZombieDocuments(colivaraResults.results);
        
        // Map Colivara results to standard document format using database data
        let mappedResults = await mapColivaraResultsToDocuments(filteredResults);
        
        // Group and deduplicate results to avoid showing the same document multiple times
        mappedResults = groupResults(mappedResults);
        
        // First, get valid document IDs to filter zombie documents
        const validDocumentIds = new Set(
          filteredResults.map((result: any) => {
            return result.documentId ||
                   result.id ||
                   (result.document && result.document.id) ||
                   (result.metadata && result.metadata.documentId) ||
                   (result.document && result.document.metadata.documentId) ||
                   undefined;
          }).filter((id: any) => typeof id === 'string' && id.trim() !== '' && id.length > 0)
        );

        // 1. MAP (Universal) - First, collect all Colivara document IDs to map to database IDs in a single query
        const colivaraDocIds = colivaraResults.results
          .filter((item: any) => {
            // Only include items that have a valid document ID that exists in our filtered results
            const docId = item.documentId ||
                         item.id ||
                         (item.document && item.document.id) ||
                         (item.metadata && item.metadata.documentId) ||
                         (item.document && item.document.metadata && item.document.metadata.documentId) ||
                         undefined;
            return typeof docId === 'string' && docId.trim() !== '' && validDocumentIds.has(docId);
          })
          .map((item: any) => {
            // Get the Colivara document ID
            const docData = item.document || item;
            const metadata = docData.metadata || item.metadata || {};
            
            // Validate that the document ID is in proper CUID format before using it
            const documentId = item.documentId || docData.document_id || docData.id?.toString() || "";
            const isValidDocumentId = documentId && documentId !== 'undefined' && !documentId.includes('undefined') && /^[a-z0-9]+$/i.test(documentId) && documentId.length >= 20 && documentId.length <= 30;
            
            // Extract the original database document ID from metadata if available
            const originalDocumentId = metadata.documentId || (docData.metadata && docData.metadata.documentId) || item.metadata?.documentId;
            const hasValidOriginalId = originalDocumentId && typeof originalDocumentId === 'string' && /^[a-z0-9]+$/i.test(originalDocumentId) && originalDocumentId.length >= 20 && originalDocumentId.length <= 30;
            
            return {
              colivaraDocumentId: isValidDocumentId ? documentId : "",
              originalDocumentId: hasValidOriginalId ? originalDocumentId : undefined, // Store the original database ID if available
              item: item, // Keep reference to the original item
              index: colivaraResults.results.indexOf(item) // Keep track of the index
            };
          })
          .filter((mapping: any) => mapping.colivaraDocumentId); // Only keep items with valid Colivara IDs
        
        // Query the database to map Colivara document IDs to database document IDs
        const colivaraIdsToMap = colivaraDocIds
          .filter((mapping: any) => !mapping.originalDocumentId) // Only map if we don't already have the original DB ID
          .map((mapping: any) => mapping.colivaraDocumentId);
          
        let colivaraToDbMap = new Map(); // Initialize as empty map
        
        if (colivaraIdsToMap.length > 0) {
          try {
            // Query the database to find documents that have these colivaraDocumentIds
            const dbDocuments = await prisma.document.findMany({
              where: {
                colivaraDocumentId: { in: colivaraIdsToMap }
              },
              select: {
                id: true,
                colivaraDocumentId: true
              }
            });
            
            // Create a map from Colivara ID to database ID
            colivaraToDbMap = new Map(dbDocuments.map(doc => [doc.colivaraDocumentId, doc.id]));
          } catch (error) {
            console.error('Error querying database for colivara document IDs:', error);
          }
        }
        
        // Now map the results with proper document IDs
        const rawMapped = colivaraResults.results
          .filter((item: any) => {
            // Only include items that have a valid document ID that exists in our filtered results
            const docId = item.documentId ||
                         item.id ||
                         (item.document && item.document.id) ||
                         (item.metadata && item.metadata.documentId) ||
                         (item.document && item.document.metadata && item.document.metadata.documentId) ||
                         undefined;
            return typeof docId === 'string' && docId.trim() !== '' && validDocumentIds.has(docId);
          })
          .map((item: any, index: number) => {
            const docData = item.document || item;
            const metadata = docData.metadata || item.metadata || {};
            
            // 1. Get Raw Image - Try multiple possible locations for image data
            let rawImage = docData.img_base64 ||
                          item.img_base64 ||
                          docData.image ||
                          metadata.image ||
                          item.visualContent ||
                          (item.document && item.document.visualContent) ||
                          (item.extracted_content && item.extracted_content.image) ||
                          null;

            // 1. Clean the string if it has data URL prefix
            if (rawImage && typeof rawImage === 'string') {
                rawImage = rawImage.replace(/^data:image\/[a-z]+;base64,/, "");
            }

            // 2. DETECT MIME TYPE FROM DATA (The Fix)
            // Don't rely on the filename. Look at the first few characters of the code.
            let mimeType = 'image/jpeg'; // Default
            if (rawImage && typeof rawImage === 'string') {
                if (rawImage.startsWith('iVBOR')) {
                    mimeType = 'image/png';
                } else if (rawImage.startsWith('/9j/')) {
                    mimeType = 'image/jpeg';
                }
            }
            
            // Helper to find text - Try multiple possible locations for extracted text
            const txt = docData.text ||
                       item.content ||
                       metadata.text ||
                       item.extractedText ||
                       (item.document && item.document.extractedText) ||
                       (item.extracted_content && item.extracted_content.text) ||
                       (item.extracted_content && item.extracted_content.content) ||
                       metadata.extracted_text ||
                       "";
            
            // SCORE FIX: If Colivara returns 0 but it's the top result, imply relevance based on rank
            let score = docData.raw_score || docData.score || item.score || 0;
            if (score === 0 && index === 0) score = 0.99; // Top result is logically relevant
            if (score === 0 && index === 1) score = 0.80;
            
            // 2. DETECT MIME TYPE FROM DATA (The Fix)
            // Don't rely on the filename. Look at the first few characters of the code.
            let detectedMimeType = 'image/jpeg'; // Default
            if (rawImage && typeof rawImage === 'string') {
                if (rawImage.startsWith('iVBOR')) {
                    detectedMimeType = 'image/png';
                } else if (rawImage.startsWith('/9j/')) {
                    detectedMimeType = 'image/jpeg';
                }
            }
            
            // IMAGE DEBUG: Log image size and header
            if (rawImage && typeof rawImage === 'string') {
                console.log(`📸 IMAGE DEBUG [${metadata.originalName || metadata.title || docData.document_name || "Untitled"}]: Size = ${rawImage.length} characters`);
                console.log(`   Header check: ${rawImage.substring(0, 30)}...`);
            } else {
                console.log(`❌ NO IMAGE found for ${metadata.originalName || metadata.title || docData.document_name || "Untitled"}`);
            }
            
            // Validate that the document ID is in proper CUID format before using it
            const documentId = item.documentId || docData.document_id || docData.id?.toString() || "";
            const isValidDocumentId = documentId && documentId !== 'undefined' && !documentId.includes('undefined') && /^[a-z0-9]+$/i.test(documentId) && documentId.length >= 20 && documentId.length <= 30;
            
            // Extract the original database document ID from metadata if available
            const originalDocumentId = metadata.documentId || (docData.metadata && docData.metadata.documentId) || item.metadata?.documentId;
            const hasValidOriginalId = originalDocumentId && typeof originalDocumentId === 'string' && /^[a-z0-9]+$/i.test(originalDocumentId) && originalDocumentId.length >= 20 && originalDocumentId.length <= 30;
            
            // Try to get the database document ID by looking up the Colivara ID in our map
            let finalDocumentId = hasValidOriginalId ? originalDocumentId : undefined;
            
            if (!finalDocumentId && isValidDocumentId && colivaraToDbMap.has(documentId)) {
              finalDocumentId = colivaraToDbMap.get(documentId);
            }
            
            // Use the final document ID (database ID) for the URL, fallback to Colivara ID if not found
            const previewDocumentId = finalDocumentId || (isValidDocumentId ? documentId : undefined);
            
            return {
              documentId: isValidDocumentId ? documentId : "",
              originalDocumentId: finalDocumentId, // Store the database document ID if available
              title: cleanDocumentTitle(metadata.originalName || metadata.title || docData.document_name || (docData.title && cleanDocumentTitle(docData.title)) || (item.title && cleanDocumentTitle(item.title)) || "Untitled"),
              content: txt || "Visual content only", // Required field for SearchResult
              
              // UI Snippet: Show what we actually found
              snippet: txt ? txt.substring(0, 150) + "..." : "Visual Document (Table/Chart/Scan)",
              
              score: score,
              pageNumbers: [], // Required field for SearchResult
              document: {}, // Required field for SearchResult
              screenshots: rawImage ? [rawImage] : [],
              mimeType: detectedMimeType, // Pass the TRUE type
              extractedText: txt,
              // Include document URL for redirect functionality - use the database document ID if available
              documentUrl: finalDocumentId ? `/repository/preview/${finalDocumentId}` : undefined
            };
          });

        // 2. DEDUPLICATE (Kill the Zombies)
        const uniqueMap = new Map();
        const cleanResults = [];

        for (const doc of rawMapped) {
            // Use documentId or Title as unique key to prevent duplicates
            const key = doc.documentId || doc.title;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, true);
                cleanResults.push(doc);
            }
        }
        
        // For comprehensive queries (like "what trainings/seminars did..."), use more results
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
        
        searchResults = isComprehensiveQuery ? cleanResults.slice(0, 6) : cleanResults.slice(0, 1); // Use more results for comprehensive queries
        
        // Update the response results to include the visual content for caching
        // This ensures that when the response is cached, it includes the visual content needed for multimodal processing
        if (cleanResults.length > 0) {
          // Map the cleanResults (with visual content) to the searchResults
          searchResults = isComprehensiveQuery ? cleanResults.slice(0, 6) : cleanResults.slice(0, 1);
        }
      } catch (colivaraError) {
        console.error('Colivara search failed, falling back to traditional search:', colivaraError);
        // Fall back to traditional search if Colivara fails
        searchType = 'traditional';
        // Use traditional search
        const traditionalResults = await enhancedDocumentService.searchDocuments(
          query,
          normalizedUnitId,
          normalizedCategory,
          undefined, // tags
          userId,
          page,
          limit
        );
        
        // Format traditional results to match expected response structure
        // Map traditional results to the same format as Colivara results using SuperMapper
        const formattedResults = traditionalResults.documents.map(doc => ({
          documentId: doc.id,
          title: cleanDocumentTitle(doc.title || doc.fileName || 'Untitled Document'),
          content: doc.description || '',
          score: 0.5, // Default score for traditional search
          pageNumbers: [],
          documentSection: 'description',
          confidenceScore: 0.5,
          snippet: doc.description ? doc.description.substring(0, 200) + '...' : 'No preview available',
          document: SuperMapper.createStandardDocument(doc) // Process through SuperMapper
        }));

        // Group and deduplicate results to avoid showing the same document multiple times
        const groupedResults = groupResults(formattedResults);
        searchResults = groupedResults;
      }
    } else {
      // Use traditional search
      searchType = 'traditional';
      const traditionalResults = await enhancedDocumentService.searchDocuments(
        query,
        normalizedUnitId,
        normalizedCategory,
        undefined, // tags
        userId,
        page,
        limit
      );
      
      // Format traditional results to match expected response structure
      // Map traditional results to the same format as Colivara results using SuperMapper
      const formattedResults = traditionalResults.documents.map(doc => ({
        documentId: doc.id,
        title: cleanDocumentTitle(doc.title || doc.fileName || 'Untitled Document'),
        content: doc.description || '',
        score: 0.5, // Default score for traditional search
        pageNumbers: [],
        documentSection: 'description',
        confidenceScore: 0.5,
        snippet: doc.description ? doc.description.substring(0, 200) + '...' : 'No preview available',
        document: SuperMapper.createStandardDocument(doc) // Process through SuperMapper
      }));

      // Group and deduplicate results to avoid showing the same document multiple times
      const groupedResults = groupResults(formattedResults);
      searchResults = groupedResults;
    }

    // If generateResponse is true, use Qwen to generate a response based on the search results
    let generatedResponse = null;
    let sources: Source[] = [];
    let relevantDocumentUrl = null;
    if (generateResponse && searchResults && searchResults.length > 0) {
      try {
        // For queries asking for comprehensive lists (like faculty and their trainings), use more results
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
        
        const resultsForGeneration = isComprehensiveQuery ?
          searchResults.slice(0, Math.min(6, searchResults.length)) : // Use up to 6 results for comprehensive queries
          searchResults.slice(0, 1);  // Use only top result for specific queries
          
        // Use generateInsights to get both the response and the sources used
        const qwenService = new QwenGenerationService({ model: process.env.QWEN_MODEL || 'qwen/qwen-2.5-vl-72b-instruct' });
        const qwenResult = await qwenService.generateInsights(
          query,
          resultsForGeneration,
          userId
        );
        
        generatedResponse = qwenResult.summary;
        
        // Include all relevant sources for comprehensive queries, otherwise just the top one
        // Clean the title in the source and ensure we have the database document ID
        const cleanedSources = qwenResult.sources && qwenResult.sources.length > 0 ?
          qwenResult.sources.map(source => {
            // Try to get the database document ID from the resultsForGeneration
            const originalResult = resultsForGeneration.find(result =>
              result.documentId === source.documentId || result.originalDocumentId === source.documentId
            );
            
            // Use the database document ID if available, otherwise fallback to the source.documentId
            const databaseDocumentId = originalResult?.originalDocumentId || source.documentId;
            
            return {
              ...source,
              title: cleanDocumentTitle(source.title),
              documentId: databaseDocumentId // Use the database document ID for clicking
            };
          }) : [];
            
        sources = cleanedSources;
          
        // Include the document URL for the relevant document in the response
        if (searchResults.length > 0 && sources.length > 0) {
          // Find the document that corresponds to the source and add its URL
          const relevantDoc = searchResults.find(doc => doc.documentId === sources[0].documentId);
          if (relevantDoc && relevantDoc.documentUrl) {
            relevantDocumentUrl = relevantDoc.documentUrl;
          } else {
            // Fallback: try to find document by originalDocumentId if documentId doesn't match
            const relevantDocFallback = searchResults.find(doc => doc.originalDocumentId === sources[0].documentId);
            if (relevantDocFallback && relevantDocFallback.documentUrl) {
              relevantDocumentUrl = relevantDocFallback.documentUrl;
            }
          }
        }
      } catch (generationError) {
        console.error('Qwen generation failed:', generationError);
        // Don't fail the entire request if generation fails, just return search results
        generatedResponse = null;
      }
    }

    // Return search results with optional generated response
    let responseResults = searchResults;
    
    // If generateResponse is true, limit results to the most relevant document
    if (generateResponse && searchResults && searchResults.length > 0) {
      // Use only the top result for display when generating AI response
      responseResults = searchResults.slice(0, 1);
    }

    const response: any = {
      results: responseResults,
      total: responseResults.length, // Use actual count after potential filtering
      page,
      limit,
      totalPages: Math.ceil(searchResults.length / limit), // Keep original total for pagination reference
      query,
      processingTime,
      searchType,
    };

    // Include generated response and sources if available
    if (generatedResponse) {
      response.generatedResponse = generatedResponse;
      response.generationType = generationType;
      response.sources = sources;
      
      // Include the document URL for the relevant document in the response
      if (relevantDocumentUrl) {
        response.relevantDocumentUrl = relevantDocumentUrl;
      }
    }

    // Store results in cache before returning
    // Before caching, ensure the response results include visual content if it exists
    await searchCacheService.setCachedResult(query, response, normalizedUnitId, normalizedCategory, normalizedFilters);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json(
      { error: 'Internal server error during search' },
      { status: 500 }
    );
  }
}