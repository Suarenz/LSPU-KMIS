import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BotIcon, LightbulbIcon, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cleanDocumentTitle } from '@/lib/utils/document-utils';

interface SourceInfo {
  title: string;
  documentId: string;
  confidence: number;
  isQproDocument?: boolean;
  qproAnalysisId?: string;
}

interface QwenResponseDisplayProps {
  generatedResponse: string;
  generationType: string;
  sources?: SourceInfo[];
  isLoading?: boolean;
  error?: string;
  relevantDocumentUrl?: string; // Added for the clickable document link
  noRelevantDocuments?: boolean; // Flag to indicate no relevant documents were found
}

// Helper function to get the correct document URL based on document type
const getDocumentUrl = (source: SourceInfo): string => {
  if (source.isQproDocument && source.qproAnalysisId) {
    return `/qpro/analysis/${source.qproAnalysisId}`;
  }
  return `/repository/preview/${source.documentId}`;
};

// Helper function to check if document ID is valid
const isValidDocumentId = (documentId: string): boolean => {
  return documentId && 
         documentId !== 'undefined' && 
         !documentId.includes('undefined') && 
         !/\.(pdf|docx?|xlsx?|pptx?|jpg|jpeg|png|gif|bmp|tiff|webp)$/i.test(documentId);
};

const QwenResponseDisplay: React.FC<QwenResponseDisplayProps> = ({
  generatedResponse,
  generationType,
  sources,
  isLoading,
  error,
  relevantDocumentUrl, // Added to props
  noRelevantDocuments // Added to props
}) => {
 if (isLoading) {
    return (
      <Card className="mb-6 animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LightbulbIcon className="w-5 h-5" />
            Generating Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-20 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            {sources && sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="flex items-center gap-2 font-medium mb-2">
                  <FileText className="w-4 h-4" />
                  Source Documents
                </h4>
                <ul className="space-y-2">
                  {sources.map((source, index) => ( // Show all sources for comprehensive queries
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-xs bg-blue-10 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        {isValidDocumentId(source.documentId) ? (
                          <div className="flex items-center gap-2">
                            <Link href={getDocumentUrl(source)} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                              {cleanDocumentTitle(source.title)}
                            </Link>
                            {source.isQproDocument && (
                              <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-xs">QPRO</Badge>
                            )}
                          </div>
                        ) : (
                          <div className="font-medium">{cleanDocumentTitle(source.title)}</div>
                        )}
                        {typeof source.confidence === 'number' && source.confidence > 0 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block">
                            {(source.confidence * 100).toFixed(1)}% relevance
                          </span>
                        )}
                      </div>
                      {/* Make all source documents clickable if they have a documentId */}
                      {isValidDocumentId(source.documentId) ? (
                        <Link href={getDocumentUrl(source)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                          <span className="sr-only">View Document</span>
                        </Link>
                      ) : (
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-60">
            <LightbulbIcon className="w-5 h-5" />
            Generated Insights Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-60">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!generatedResponse) {
    return null;
  }

  // Special handling for when no relevant documents were found
  if (noRelevantDocuments) {
    return (
      <Card className="mb-6 border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <LightbulbIcon className="w-5 h-5" />
            No Relevant Documents Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-amber max-w-none">
            <div className="whitespace-pre-wrap text-amber-800">
              <p className="mb-3">The documents in the system do not contain information that matches your query.</p>
              <p className="font-medium mb-2">Suggestions:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Try using different search terms or keywords</li>
                <li>Make sure the document you&apos;re looking for has been uploaded to the system</li>
                <li>Check if the document is still being processed (this can take a few minutes after upload)</li>
                <li>Contact your administrator if you believe the document should exist</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

 return (
    <Card className="mb-6 border-blue-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="w-5 h-5 text-blue-600" />
          Generated Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-blue max-w-none">
          <div className="whitespace-pre-wrap text-gray-70">
            {generatedResponse.split('\n').map((line, i) => {
              // Check if the line contains a list item (starts with * or - or numbered list)
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('* **') || trimmedLine.startsWith('- **')) {
                // Handle nested bullet list items like "* **Name of Person**"
                const match = trimmedLine.match(/^\s*[*-]\s*\*\*(.+?)\*\*(.*)/);
                if (match) {
                  return (
                    <div key={i} className="ml-4 my-1">
                      <span className="font-semibold">• {match[1]}</span>
                      {match[2] && <span>{match[2]}</span>}
                    </div>
                  );
                }
                return <div key={i} className="ml-4 my-1">• {trimmedLine.substring(2).trim()}</div>;
              } else if (/^\s*\d+\.\s/.test(trimmedLine)) {
                // Handle numbered lists
                return <div key={i} className="ml-4 my-1">{trimmedLine}</div>;
              } else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                // Handle bold headers
                return <div key={i} className="font-bold mt-3 mb-1">{trimmedLine.slice(2, -2)}</div>;
              } else if (trimmedLine === '') {
                // Handle empty lines
                return <div key={i} className="my-2"></div>;
              } else {
                // Handle regular text
                return <div key={i} className="my-1">{line}</div>;
              }
            })}
          </div>
          
          {sources && sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="flex items-center gap-2 font-medium mb-2">
                <FileText className="w-4 h-4" />
                Source Documents
              </h4>
              <ul className="space-y-2">
                {sources.map((source, index) => ( // Show all sources for comprehensive queries
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-xs bg-blue-10 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      {isValidDocumentId(source.documentId) ? (
                        <div className="flex items-center gap-2">
                          <Link href={getDocumentUrl(source)} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                            {cleanDocumentTitle(source.title)}
                          </Link>
                          {source.isQproDocument && (
                            <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-xs">QPRO</Badge>
                          )}
                        </div>
                      ) : (
                        <div className="font-medium">{cleanDocumentTitle(source.title)}</div>
                      )}
                      {typeof source.confidence === 'number' && source.confidence > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block">
                          {(source.confidence * 100).toFixed(1)}% relevance
                        </span>
                      )}
                    </div>
                    {/* Make all source documents clickable if they have a documentId */}
                    {isValidDocumentId(source.documentId) ? (
                      <Link href={getDocumentUrl(source)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        <span className="sr-only">View Document</span>
                      </Link>
                    ) : (
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {relevantDocumentUrl && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="bg-blue-50 p-4 rounded-lg">
                <Link href={relevantDocumentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium">
                  <FileText className="w-5 h-5" />
                  <span>View Source Document</span>
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QwenResponseDisplay;