import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LightbulbIcon, FileTextIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import { cleanDocumentTitle } from '@/lib/utils/document-utils';

interface GeminiResponseDisplayProps {
  generatedResponse: string;
  generationType: string;
  sources?: Array<{ title: string; documentId: string; confidence: number }>;
  isLoading?: boolean;
  error?: string;
  relevantDocumentUrl?: string; // Added for the clickable document link
}

const GeminiResponseDisplay: React.FC<GeminiResponseDisplayProps> = ({
  generatedResponse,
  generationType,
  sources,
  isLoading,
  error,
  relevantDocumentUrl // Added to props
}) => {
  if (isLoading) {
    return (
      <Card className="mb-6 animate-pulse">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LightbulbIcon className="w-5 h-5" />
            Generating Insights (Gemini)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <LightbulbIcon className="w-5 h-5" />
            Generated Insights Error (Gemini)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!generatedResponse) {
    return null;
  }

  return (
    <Card className="mb-6 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="w-5 h-5 text-blue-600" />
          Generated Insights (Gemini)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-blue max-w-none">
          <div className="whitespace-pre-wrap text-gray-700">
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
                <FileTextIcon className="w-4 h-4" />
                Source Documents
              </h4>
              <ul className="space-y-2">
                {sources.map((source, index) => ( // Show all sources for comprehensive queries
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-xs bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">{cleanDocumentTitle(source.title)}</div>
                        {source.confidence && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 inline-block">
                            {(source.confidence * 100).toFixed(1)}% relevance
                          </span>
                        )}
                      </div>
                      {relevantDocumentUrl && index === 0 && ( // Only link to the most relevant document
                        <Link href={relevantDocumentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
                          <ExternalLinkIcon className="w-4 h-4" />
                          <span className="sr-only">View Document</span>
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GeminiResponseDisplay;