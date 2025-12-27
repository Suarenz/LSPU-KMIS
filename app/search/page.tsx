"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SearchIcon, FileText, TrendingUp, BotIcon, Eye } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import AuthService from '@/lib/services/auth-service';
import { Document } from '@/lib/api/types';
import SuperMapper from '@/lib/utils/super-mapper';
import QwenResponseDisplay from '@/components/qwen-response-display';
import { cleanDocumentTitle } from '@/lib/utils/document-utils';
import { useToast } from '@/components/ui/use-toast';

export default function SearchPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [hasPerformedSearch, setHasPerformedSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<{
    documents: Document[]
  }>({
    documents: [],
  })
  const [generatedResponse, setGeneratedResponse] = useState<string | null>(null);
  const [generationType, setGenerationType] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]); // State to store the sources used in the AI response
  const [relevantDocumentUrl, setRelevantDocumentUrl] = useState<string | undefined>(undefined); // State to store the relevant document URL
  const [noRelevantDocuments, setNoRelevantDocuments] = useState<boolean>(false); // State to track if no relevant documents were found

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router])

  const performSearch = async () => {
    if (searchQuery.trim()) {
      setHasPerformedSearch(true);
      setLoading(true);
      setIsGenerating(true);
      try {
        const token = await AuthService.getAccessToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Always use semantic search with AI generation by default
        const needsGeneration = true; // Always generate AI response
        
        // Build query parameters for the new search API - always use semantic search
        const queryParams = new URLSearchParams();
        queryParams.append('query', searchQuery);
        queryParams.append('useSemantic', 'true'); // Always use semantic search
        queryParams.append('generate', needsGeneration.toString()); // Always generate AI response
        queryParams.append('generationType', 'text-only'); // Default to text-only generation for documents
        
        // Search for documents using the new enhanced search API
        const response = await fetch(`/api/search?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          // Handle different status codes appropriately
          if (response.status === 500) {
            console.error('Search API internal server error:', response.status, response.statusText);
            // Set empty results and show user-friendly message
            setSearchResults({ documents: [] });
            return;
          } else if (response.status === 401) {
            console.error('Authentication error during search:', response.status);
            await AuthService.logout();
            return;
          } else if (response.status === 403) {
            console.error('Forbidden access during search:', response.status);
            setSearchResults({ documents: [] });
            return;
          } else {
            throw new Error(`Failed to fetch documents: ${response.status} ${response.statusText}`);
          }
        }

        const data = await response.json();
        
        // Extract documents from the enhanced search results
        // Handle both direct document results and enhanced search results with additional metadata
        const documents = data.results.map((result: any) => {
          // If result has a document property, use it; otherwise use the result itself
          return result.document || result;
        });
        
        // Handle generated response if present
        if (data.generatedResponse) {
          setGeneratedResponse(data.generatedResponse);
          setGenerationType(data.generationType || 'semantic'); // Default to semantic
          setSources(data.sources || []); // Set the sources used in the AI response
          setRelevantDocumentUrl(data.relevantDocumentUrl || undefined); // Set the relevant document URL
          setNoRelevantDocuments(data.noRelevantDocuments || false); // Set the no relevant documents flag
        } else {
          setGeneratedResponse(null);
          setSources([]); // Clear sources when there's no generated response
          setRelevantDocumentUrl(undefined); // Clear the document URL as well
          setNoRelevantDocuments(false); // Clear the flag
        }
        
        setSearchResults({
          documents: documents || [],
        });
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults({ documents: [] });
        setGeneratedResponse(null);
        setSources([]); // Clear sources on error as well
        setRelevantDocumentUrl(undefined); // Clear document URL on error as well
        setNoRelevantDocuments(false); // Clear the flag on error
      } finally {
        setLoading(false);
        setIsGenerating(false);
      }
    } else {
      setSearchResults({ documents: [] });
      setGeneratedResponse(null);
      setHasPerformedSearch(false);
      setSources([]); // Clear sources when there's no search query
      setRelevantDocumentUrl(undefined); // Clear document URL when there's no search query
      setNoRelevantDocuments(false); // Clear the flag when there's no search query
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <Image
              src="/LSPULogo.png"
              alt="LSPU Logo"
              width={64}
              height={64}
              className="object-contain animate-spin"
            />
          </div>
          <p className="text-lg text-muted-foreground">Loading search...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalResults = searchResults.documents.length

  const popularSearches = ["Research", "Curriculum", "Policy", "Extension", "Teaching"]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
       <div className="mb-8 animate-fade-in text-center">
         <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">AI-Powered Search</h1>
         <p className="text-muted-foreground">Find documents and resources across the system</p>
       </div>

        {/* Search Bar */}
        <Card className="mb-8 animate-fade-in">
          <CardContent className="pt-6">
            <div className="relative mb-4">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'gray' }} />
              <Input
                placeholder="Ask or search about institutional documents and files (English/Filipino)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    performSearch();
                  }
                }}
                className="pl-12 h-14 text-lg"
              />
              <Button
                onClick={performSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 opacity-0"
                aria-label="Search"
              >
                S
              </Button>
            </div>
            {/* Advanced search indicator - shows that we're using the most advanced search by default */}
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchQuery && hasPerformedSearch && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {loading ? 'Searching...' : `${searchResults.documents.length} ${searchResults.documents.length === 1 ? "result" : "results"} found for "${searchQuery}"`}
              </h2>
              {generatedResponse && searchResults.documents.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing the most relevant document for your query
                </p>
              )}
            </div>

            {/* Display generated response if available */}
            <QwenResponseDisplay
              generatedResponse={generatedResponse || ''}
              generationType={generationType}
              sources={sources} // Pass the sources used in the AI response
              relevantDocumentUrl={relevantDocumentUrl} // Pass the relevant document URL
              isLoading={isGenerating} // Always show loading when generating since we're always using semantic search
              noRelevantDocuments={noRelevantDocuments} // Pass the flag for no relevant documents
            />

            {/* Only show the documents tab if we're not generating and don't have a generated response */}
            {!generatedResponse && !isGenerating ? (
              searchResults.documents.length > 0 && (
                <Tabs defaultValue="documents" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  <TabsContent value="documents" className="space-y-4">
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      searchResults.documents.map((doc, index) => {
                        // Check if this document is from enhanced search (has additional properties)
                        const enhancedResult = Array.isArray(searchResults.documents) && searchResults.documents.length > 0 && 'documentId' in searchResults.documents[0];
                        const enhancedDoc = enhancedResult ? (searchResults as any).documents[index] : null;
                        
                        // Helper function to get the correct navigation URL
                        const getDocumentUrl = () => {
                          const resultWithUrl = doc as any;
                          // Check for QPRO document first - redirect to analysis page
                          if (resultWithUrl.isQproDocument && resultWithUrl.qproAnalysisId) {
                            return `/qpro/analysis/${resultWithUrl.qproAnalysisId}`;
                          }
                          if (enhancedDoc?.isQproDocument && enhancedDoc?.qproAnalysisId) {
                            return `/qpro/analysis/${enhancedDoc.qproAnalysisId}`;
                          }
                          // Check for direct documentUrl
                          if (resultWithUrl.documentUrl && resultWithUrl.documentUrl !== `/repository/preview/undefined` && !resultWithUrl.documentUrl.includes('/repository/preview/undefined')) {
                            return resultWithUrl.documentUrl;
                          }
                          if (enhancedDoc?.documentUrl && enhancedDoc.documentUrl !== `/repository/preview/undefined` && !enhancedDoc.documentUrl.includes('/repository/preview/undefined')) {
                            return enhancedDoc.documentUrl;
                          }
                          // Check for originalDocumentId
                          if (enhancedDoc?.originalDocumentId) {
                            return `/repository/preview/${enhancedDoc.originalDocumentId}`;
                          }
                          // Check for colivaraDocumentId
                          if (doc.colivaraDocumentId) {
                            return `/repository/preview/${doc.colivaraDocumentId}`;
                          }
                          // Fallback to document ID
                          return `/repository/preview/${doc.id}`;
                        };
                        
                        return (
                          <Card key={`${doc.id}-${index}`} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                            const url = getDocumentUrl();
                            console.log('[Search] Navigating to:', url, {
                              docId: doc.id,
                              isQpro: (doc as any).isQproDocument || enhancedDoc?.isQproDocument,
                              qproAnalysisId: (doc as any).qproAnalysisId || enhancedDoc?.qproAnalysisId,
                              documentUrl: (doc as any).documentUrl || enhancedDoc?.documentUrl,
                            });
                            router.push(url);
                          }}>
                            <CardHeader>
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5 text-primary" />
                                  </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <CardTitle className="text-lg">{cleanDocumentTitle(SuperMapper.getFieldValue(doc, 'title') || (doc as any).title || ((doc as any).document && SuperMapper.getFieldValue((doc as any).document, 'title')) || (doc as any).originalName || "Untitled Document")}</CardTitle>
                                      {/* Show QPRO badge if it's a QPRO document */}
                                      {((doc as any).isQproDocument || enhancedDoc?.isQproDocument) && (
                                        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">QPRO</Badge>
                                      )}
                                    </div>
                                    <Badge variant="secondary">{SuperMapper.getFieldValue(doc, 'category') || (doc as any).category || (doc as any).type || "Uncategorized"}</Badge>
                                  </div>
                                  
                                  {/* Evidence Section - Show extracted text/snippet from the document */}
                                  <div className="mt-3 p-3 bg-muted/50 rounded-lg border-l-4 border-primary/30">
                                    <div className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                      <TrendingUp className="w-3 h-3" />
                                      💬 Evidence from document:
                                    </div>
                                    {(() => {
                                      // Try to get meaningful snippet in order of preference
                                      const snippet = enhancedDoc?.snippet || (doc as any).snippet;
                                      const extractedText = enhancedDoc?.extractedText || (doc as any).extractedText;
                                      const content = (doc as any).content;
                                      const description = doc.description || (doc as any).document?.description;
                                      
                                      // Prefer snippet, then extractedText, then content, then description
                                      const evidence = snippet || extractedText || content || description;
                                      
                                      // Check if the evidence is meaningful or just a placeholder
                                      const isMeaningfulText = evidence && 
                                                               evidence.trim().length > 20 && 
                                                               !evidence.toLowerCase().includes('visual content') && 
                                                               !evidence.toLowerCase().includes('visual document') && 
                                                               !evidence.toLowerCase().includes('ai will extract') &&
                                                               !evidence.toLowerCase().includes('click to preview');
                                      
                                      if (isMeaningfulText) {
                                        // Show actual content with quotes
                                        const displayText = evidence.length > 300 ? evidence.substring(0, 300) + '...' : evidence;
                                        return (
                                          <CardDescription className="mt-1 text-sm italic leading-relaxed">
                                            &quot;{displayText}&quot;
                                          </CardDescription>
                                        );
                                      } else {
                                        // Show document description or prompt to view
                                        const docDescription = doc.description || (doc as any).document?.description;
                                        if (docDescription && docDescription.trim().length > 10) {
                                          return (
                                            <CardDescription className="mt-1 text-sm italic leading-relaxed">
                                              &quot;{docDescription.substring(0, 200)}{docDescription.length > 200 ? '...' : ''}&quot;
                                            </CardDescription>
                                          );
                                        }
                                        return (
                                          <CardDescription className="mt-1 text-sm text-muted-foreground">
                                            📄 Document matched your search query. Click to view full content.
                                          </CardDescription>
                                        );
                                      }
                                    })()}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {(doc.tags || (doc as any).keywords || []).map((tag: string, tagIndex: number) => (
                                      <Badge key={tagIndex} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  {/* Show relevance score and page info */}
                                  <div className="mt-2 flex items-center gap-3">
                                    {(enhancedDoc?.confidenceScore || (doc as any).confidenceScore || (doc as any).score) ? (
                                      <div className="inline-flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md">
                                        <span className="text-xs font-medium text-primary">
                                          Relevance: {(((enhancedDoc?.confidenceScore || (doc as any).confidenceScore || (doc as any).score) || 0.85) * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                    ) : null}
                                    {(enhancedDoc?.pageNumbers?.length > 0 || (doc as any).pageNumbers?.length > 0) && (
                                      <span className="text-xs text-muted-foreground">Pages: {(enhancedDoc?.pageNumbers || (doc as any).pageNumbers).join(', ')}</span>
                                    )}
                                  </div>
                                  {/* Preview link */}
                                  <div className="mt-3 flex justify-end">
                                    <Button variant="outline" size="sm" onClick={(e) => {
                                      e.stopPropagation(); // Prevent card click from triggering
                                      router.push(getDocumentUrl());
                                    }}>
                                      <Eye className="w-4 h-4 mr-1" />
                                      {((doc as any).isQproDocument || enhancedDoc?.isQproDocument) ? 'View Analysis' : 'Preview'}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        );
                      })
                    )}
                  </TabsContent>
                </Tabs>
              )
            ) : null}

            {!loading && searchResults.documents.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <SearchIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'gray' }} />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try different keywords or browse the repository</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && !hasPerformedSearch && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          </div>
        )}
      </main>
    </div>
  )
}
