"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AuthService from '@/lib/services/auth-service';

import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Document, Unit } from "@/lib/api/types";
import { Download, Eye, FileText, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { ClientOnly } from "@/components/client-only-wrapper";
import { useToast } from "@/components/ui/use-toast";
import { UnitSidebar } from "@/components/unit-sidebar";

export default function UnitPage() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const unitId = params.id as string;
  
  const [unit, setUnit] = useState<Unit | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
 const [units, setUnits] = useState<Unit[]>([]);

  // Determine if user can upload (roles are uppercase as per database enum)
  const canUpload = user?.role === "ADMIN" || user?.role === "FACULTY";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch units for sidebar
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const token = await AuthService.getAccessToken();
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch(`/api/units`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch units: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setUnits(data.units || []);
      } catch (err) {
        console.error('Error fetching units:', err);
        setUnits([]);
        setError(err instanceof Error ? err.message : 'Failed to load units. Some functionality may be limited.');
      }
    };
    
    if (isAuthenticated && user) {
      fetchUnits();
    }
  }, [isAuthenticated, user]);

  // Fetch unit details and documents
  useEffect(() => {
    const fetchUnitData = async () => {
      if (!isAuthenticated || isLoading || !user || !unitId) {
        return;
      }

      try {
        setLoading(true);
        
        // Fetch unit details
        const token = await AuthService.getAccessToken();
        if (!token) {
          throw new Error('No authentication token found');
        }

        const unitResponse = await fetch(`/api/units/${unitId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!unitResponse.ok) {
          const errorData = await unitResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch unit: ${unitResponse.status} ${unitResponse.statusText}`);
        }

        const unitData = await unitResponse.json();
        setUnit(unitData.unit);

        // Fetch all documents for this unit (not just admin documents)
        const docsResponse = await fetch(`/api/documents?unit=${unitId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (!docsResponse.ok) {
          const errorData = await docsResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch documents: ${docsResponse.status} ${docsResponse.statusText}`);
        }

        const docsData = await docsResponse.json();
        setDocuments(docsData.documents || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching unit data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load unit data. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUnitData();
  }, [unitId, isAuthenticated, isLoading, user]);

  // Show loading state while authentication is being resolved
 if (isLoading || (!isAuthenticated && !user)) {
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
          <p className="text-lg text-muted-foreground">Loading unit...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
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
          <p className="text-lg text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Don't render if user is null but authentication is loaded
  if (!user) {
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
          <p className="text-lg text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          {/* Unit Sidebar */}
          {sidebarOpen && (
            <div className="w-64 border-r bg-muted/10 hidden lg:block">
              <UnitSidebar
                units={units}
                currentUnit={unitId}
                onUnitSelect={(selectedUnitId) => {
                  if (selectedUnitId) {
                    router.push(`/units/${selectedUnitId}`);
                  } else {
                    router.push('/repository');
                  }
                }}
                userRole={user?.role || ''}
                userUnit={user?.unitId || null}
              />
            </div>
          )}
          
          {/* Main Content */}
          <main className="flex-1 lg:ml-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Header */}
              <div className="mb-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                      {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </Button>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                        {unit?.name || 'Unit'} Documents
                      </h1>
                      <p className="text-muted-foreground">
                        All documents for {unit?.name || 'this unit'}
                      </p>
                    </div>
                  </div>
                  {isAuthenticated && user && canUpload && (
                    <Button
                      className="gap-2"
                      onClick={() => router.push('/repository')}
                    >
                      <FileText className="w-4 h-4" />
                      View All Documents
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Unit Info Card */}
              <Card className="mb-6 animate-fade-in">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{unit?.name}</h2>
                      <p className="text-muted-foreground">{unit?.code} • {unit?.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Documents Grid */}
              {loading ? (
                <div className="animate-fade-in">
                  <div className="flex justify-center py-12">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <Image
                        src="/LSPULogo.png"
                        alt="LSPULogo"
                        width={64}
                        height={64}
                        className="object-contain animate-spin"
                      />
                    </div>
                  </div>
                </div>
              ) : error ? (
                <Card className="animate-fade-in">
                  <CardContent className="py-12 text-center">
                    <div className="text-destructive mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold mb-2">Error Loading Documents</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((doc, index) => (
                    <Card
                      key={doc.id}
                      className="animate-fade-in hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {doc.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{doc.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{doc.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Download className="w-4 h-4" />
                                {doc.downloadsCount}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {doc.viewsCount}
                              </div>
                            </div>
                            <span className="text-xs">{formatFileSize(doc.fileSize)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            By {doc.uploadedBy} • v{doc.version}
                          </div>
                          {downloadingDocId === doc.id ? (
                            <Button className="w-full gap-2" size="sm" disabled>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Downloading...
                            </Button>
                          ) : (
                            <Button
                              className="w-full gap-2"
                              size="sm"
                              onClick={async (e) => {
                                e.stopPropagation(); // Prevent card click from triggering
                                setDownloadingDocId(doc.id);
                                try {
                                  // Check if running on client side
                                  if (typeof window === 'undefined') {
                                    throw new Error('Download can only be initiated from the browser');
                                  }
                                  
                                  // Get the JWT token from auth context
                                  const downloadToken = await AuthService.getAccessToken();
                                  if (!downloadToken) {
                                    throw new Error('No authentication token found');
                                  }
                                  
                                  // Fetch download using the direct download endpoint
                                  const response = await fetch(`/api/documents/${doc.id}/download-direct`, {
                                    headers: {
                                      'Authorization': `Bearer ${downloadToken}`,
                                    }
                                  });
                                  
                                  if (!response.ok) {
                                    const errorData = await response.json().catch(() => ({}));
                                    throw new Error(errorData.error || 'Failed to download document');
                                  }
                                  
                                  // Create a temporary link and trigger download using the direct download endpoint
                                  const directDownloadUrl = `/api/documents/${doc.id}/download-direct`;
                                  const link = document.createElement('a');
                                  link.href = directDownloadUrl;
                                  link.download = doc.fileName || `document-${doc.id}`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                } catch (error) {
                                  console.error('Download error:', error);
                                  alert(error instanceof Error ? error.message : 'Failed to download document. Please try again.');
                                } finally {
                                  setDownloadingDocId(null);
                                }
                              }}
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          )}
                          <div className="flex gap-2">
                            {doc.fileType.toLowerCase().includes('pdf') ? (
                              <Button
                                className="w-full gap-2"
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click from triggering
                                  router.push(`/repository/preview/${doc.id}`);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                                Preview
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {documents.length === 0 && !loading && !error && (
                <Card className="animate-fade-in">
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                    <p className="text-muted-foreground">This unit currently has no documents</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </ClientOnly>
 );
}