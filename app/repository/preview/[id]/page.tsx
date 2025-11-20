'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, FileText, RotateCcw, X } from 'lucide-react';
import { ClientOnly } from '@/components/client-only-wrapper';
import { useToast } from '@/components/ui/use-toast';
import { Document } from '@/lib/api/types';
import AuthService from '@/lib/services/auth-service';
import { ExternalLink } from 'lucide-react';

export default function DocumentPreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

 useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchDocumentPreview = async () => {
      if (!id || Array.isArray(id) || !isAuthenticated || isLoading || !user) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get the JWT token from auth context
        const token = await AuthService.getAccessToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`/api/documents/${id}/preview`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch document: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setDocument(data);
        setPdfUrl(data.previewUrl);
      } catch (err) {
        console.error('Error fetching document preview:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load document preview. Please try again later.';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentPreview();
  }, [id, isAuthenticated, isLoading, user]);

  const handleDownload = async () => {
    if (!document) return;

    setIsDownloading(true);
    try {
      // Create a temporary link and trigger download using the direct download endpoint
      // The API endpoint will handle the redirect to the actual file
      const directDownloadUrl = `/api/documents/${document.id}/download-direct?token=${await AuthService.getAccessToken()}`;
      const link = globalThis.document.createElement('a');
      link.href = directDownloadUrl;
      link.download = document.fileName || `document-${document.id}`;
      globalThis.document.body.appendChild(link);
      link.click();
      globalThis.document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download Error',
        description: error instanceof Error ? error.message : 'Failed to download document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    router.push('/repository');
  };

  // Show loading state while authentication is being resolved
  if (isLoading || (!isAuthenticated && !user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <p className="text-lg text-muted-foreground">Loading document preview...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <p className="text-lg text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <p className="text-lg text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ClientOnly>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardHeader>
                <CardTitle>Document Preview Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-destructive">{error}</p>
                <Button onClick={handleBack} className="mt-4">
                  <X className="w-4 h-4 mr-2" />
                  Back to Repository
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </ClientOnly>
    );
  }

 if (loading) {
    return (
      <ClientOnly>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center h-[70vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </main>
        </div>
      </ClientOnly>
    );
  }

  if (!document || !pdfUrl) {
    return (
      <ClientOnly>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardHeader>
                <CardTitle>Document Not Found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">The requested document could not be found or is not accessible.</p>
                <Button onClick={handleBack} className="mt-4">
                  <X className="w-4 h-4 mr-2" />
                  Back to Repository
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </ClientOnly>
    );
  }

  // Helper function to determine the appropriate preview component based on file type
  const getFilePreviewComponent = () => {
    const fileType = document.fileType.toLowerCase();
    
    if (fileType.includes('pdf')) {
      return (
        <div className="flex-1 bg-background">
          <iframe
            src={pdfUrl}
            className="w-full h-full min-h-[70vh]"
            style={{ height: 'calc(100vh - 200px)' }}
            title={`Preview of ${document.title}`}
          />
        </div>
      );
    } else if (fileType.includes('jpg') || fileType.includes('jpeg') || fileType.includes('png') || fileType.includes('gif')) {
      return (
        <div className="flex-1 bg-background flex items-center justify-center p-4">
          <img
            src={pdfUrl}
            alt={document.title}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    } else if (fileType.includes('txt')) {
      return (
        <div className="flex-1 bg-background p-4 overflow-auto">
          <iframe
            src={pdfUrl}
            className="w-full h-full min-h-[70vh]"
            style={{ height: 'calc(100vh - 200px)' }}
            title={`Preview of ${document.title}`}
          />
        </div>
      );
    } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].some(type => fileType.includes(type))) {
      // For Office documents, use Google Docs Viewer
      const encodedUrl = encodeURIComponent(pdfUrl);
      const externalViewerUrl = `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
      
      return (
        <div className="flex-1 bg-background">
          <iframe
            src={externalViewerUrl}
            className="w-full h-full min-h-[70vh]"
            style={{ height: 'calc(100vh - 200px)' }}
            title={`Preview of ${document.title}`}
          />
        </div>
      );
    } else {
      // For other unsupported file types, provide a message
      return (
        <div className="flex-1 bg-background flex flex-col items-center justify-center p-8 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Document Preview</h3>
          <p className="text-muted-foreground mb-4">
            This {document.fileType} file can be downloaded and viewed with appropriate software.
          </p>
          <p className="text-sm text-muted-foreground">
            For online preview, consider converting to PDF format.
          </p>
        </div>
      );
    }
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex flex-col flex-1">
          {/* Document Info Header */}
          <div className="bg-muted/20 border-b p-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold truncate">{document.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>By {document.uploadedBy}</span>
                  <span>•</span>
                  <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                  {document.category && document.category !== "Uncategorized" && (
                    <>
                      <span>•</span>
                      <span>{document.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-3 flex flex-wrap gap-2">
              {document.tags?.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Preview Controls */}
          <div className="border-b p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </Button>
              {isDownloading ? (
                <Button variant="outline" size="sm" disabled>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Downloading...
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {document.fileName}
            </div>
          </div>
          
          {/* File Preview */}
          {getFilePreviewComponent()}
        </div>
      </div>
    </ClientOnly>
  );
}
