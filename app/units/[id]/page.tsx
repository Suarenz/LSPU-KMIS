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
import { Download, Eye, FileText, Building2, ChevronLeft, ChevronRight, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import { ClientOnly } from "@/components/client-only-wrapper";
import { useToast } from "@/components/ui/use-toast";
import { UnitSidebar } from "@/components/unit-sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
 const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
 const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deletionSuccessMessage, setDeletionSuccessMessage] = useState<string | null>(null);

 // Determine if user can upload (roles are uppercase as per database enum)
 const canUpload = user?.role === "ADMIN" || user?.role === "FACULTY";

  // Reset upload progress when modal is closed
  useEffect(() => {
    if (!showUploadModal) {
      setUploadProgress(0);
      setUploading(false);
      setUploadError(null);
      setUploadSuccessMessage(null);
    }
 }, [showUploadModal]);

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
 // Effect to reset state when unitId changes
  useEffect(() => {
    // Reset unit data when navigating to a new unit to ensure fresh fetch
    if (unitId) {
      setUnit(null);
      setDocuments([]);
      setError(null);
    }
  }, [unitId]);

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
        // Set loading to false after successful fetch
        setLoading(false);
      }
    };

    fetchUnitData();
  }, [unitId, isAuthenticated, isLoading, user]);

  // Effect to handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && unitId) {
        // When user returns to the page, check if it's been more than 5 minutes since last check
        // If it has been more than 5 minutes, revalidate the auth state and refresh documents
        const lastChecked = AuthService.getLastAuthCheck();
        const now = Date.now();
        
        // Only re-validate if more than 5 minutes have passed
        if (!lastChecked || (now - lastChecked) > 5 * 60 * 1000) {
          // When user returns to the page, refresh documents for the current unit
          console.log('Page became visible, refreshing unit documents');
         
          try {
            // First, try to get a fresh access token to ensure authentication is still valid
            const token = await AuthService.getAccessToken();
            if (token) {
              // Fetch all documents for this unit (not just admin documents)
              const docsResponse = await fetch(`/api/documents?unit=${unitId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                }
              });
             
              if (!docsResponse.ok) {
                const errorData = await docsResponse.json().catch(() => ({}));
                // If we get a 401 (unauthorized) error, the token might have expired
                if (docsResponse.status === 401) {
                  console.error('Authentication token expired, redirecting to login');
                  // Redirect to login page since token is no longer valid
                  router.push('/');
                  return;
                }
                throw new Error(errorData.error || `Failed to fetch documents: ${docsResponse.status} ${docsResponse.statusText}`);
              }
             
              const docsData = await docsResponse.json();
              setDocuments(docsData.documents || []);
              setError(null);
              
              // Update last check timestamp
              AuthService.setLastAuthCheck(now);
            } else {
              // If no token is available, the user might need to re-authenticate
              console.log('No valid token found on visibility change, triggering auth revalidation');
              // Force a check of the auth state by calling getCurrentUser
              const currentUser = await AuthService.getCurrentUser();
              if (!currentUser) {
                console.log('No current user found, redirecting to login');
                // User is no longer authenticated, redirect to login
                router.push('/');
              }
            }
          } catch (error) {
            console.error('Error during visibility change document refresh:', error);
            // Don't show error to user when returning from minimized state, just log it
          }
        }
      }
    };
 
    document.addEventListener('visibilitychange', handleVisibilityChange);
 
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [unitId, router]);

  // Show loading state only during initial authentication check or when fetching unit data, not when returning from minimized state
  if (isLoading && (!unit || !isAuthenticated)) {
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

  // Redirect if not authenticated after initial check
  if (!isAuthenticated && !isLoading) {
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
 if (!user && !isLoading) {
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
        <div className="flex flex-col lg:flex-row">
          {/* Unit Sidebar */}
          {sidebarOpen && (
            <div className="w-full lg:w-64 border-r bg-muted/10 lg:block hidden">
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
          <main className="flex-1">
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
                      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                        {unit?.name || 'Unit'} Documents
                      </h1>
                      <p className="text-muted-foreground">
                        All documents for {unit?.name || 'this unit'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isAuthenticated && user && canUpload && (
                      <Button
                        className="gap-2"
                        onClick={() => setShowUploadModal(true)}
                      >
                        <Upload className="w-4 h-4" />
                        Upload Document
                      </Button>
                    )}
                    {isAuthenticated && user && (
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
              </div>

              {/* Deletion Success Message */}
              {deletionSuccessMessage && (
                <div className="mb-4 p-3 bg-green-10 text-green-80 rounded-md flex items-center gap-2 animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 10-16 8 8 0 00 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 0 01.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {deletionSuccessMessage}
                </div>
              )}

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
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((doc, index) => (
                    <Card
                      key={doc.id}
                      className="animate-fade-in hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer overflow-hidden border-0 shadow-md flex flex-col h-full"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-5 border-b">
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground line-clamp-2 mb-1">{doc.title}</h3>
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              {doc.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-5 flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {doc.description}
                        </p>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {doc.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{doc.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Download className="w-3.5 h-3.5" />
                                <span>{doc.downloadsCount}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{doc.viewsCount}</span>
                              </div>
                            </div>
                            <span>{formatFileSize(doc.fileSize)}</span>
                          </div>
                          
                          <div className="text-xs text-muted-foreground flex items-center justify-between">
                            <span>By {doc.uploadedBy}</span>
                            <span>v{doc.version}</span>
                          </div>
                          
                          {downloadingDocId === doc.id ? (
                            <Button className="w-full gap-2 mt-2" size="sm" disabled>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Downloading...
                            </Button>
                          ) : (
                            <Button
                              className="w-full gap-2 mt-2"
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
                          
                          <div className="flex gap-2 mt-2">
                            {(doc.fileType.toLowerCase().includes('pdf') ||
                              doc.fileType.toLowerCase().includes('doc') ||
                              doc.fileType.toLowerCase().includes('docx') ||
                              doc.fileType.toLowerCase().includes('ppt') ||
                              doc.fileType.toLowerCase().includes('pptx') ||
                              doc.fileType.toLowerCase().includes('xls') ||
                              doc.fileType.toLowerCase().includes('xlsx') ||
                              doc.fileType.toLowerCase().includes('txt') ||
                              doc.fileType.toLowerCase().includes('jpg') ||
                              doc.fileType.toLowerCase().includes('jpeg') ||
                              doc.fileType.toLowerCase().includes('png')) ? (
                              <Button
                                className="flex-1 gap-2"
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
                          
                          {/* Delete button - only show if user can actually delete the document */}
                          {user && (user.role === 'ADMIN' || doc.uploadedById === user.id) && (
                            <Button
                              className="w-full gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground mt-2"
                              size="sm"
                              variant="default"
                              onClick={async (e) => {
                                e.stopPropagation(); // Prevent card click from triggering
                                if (confirm(`Are you sure you want to delete "${doc.title}"? This action cannot be undone.`)) {
                                  try {
                                    const token = await AuthService.getAccessToken();
                                    if (!token) {
                                      throw new Error('No authentication token found');
                                    }

                                    const response = await fetch(`/api/documents/${doc.id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json',
                                      }
                                    });

                                    if (response.ok) {
                                      // Set deletion success message
                                      setDeletionSuccessMessage(`Document "${doc.title}" deleted successfully!`);
                                      // Clear the success message after 3 seconds
                                      setTimeout(() => {
                                        setDeletionSuccessMessage(null);
                                      }, 300);
                                      // Refresh the document list
                                      const refreshResponse = await fetch(`/api/documents?unit=${unitId}`, {
                                        headers: {
                                          'Authorization': `Bearer ${token}`,
                                          'Content-Type': 'application/json',
                                        }
                                      });

                                      if (refreshResponse.ok) {
                                        const data = await refreshResponse.json();
                                        setDocuments(data.documents || []);
                                      }
                                    } else {
                                      const errorData = await response.json();
                                      if (response.status === 403) {
                                        toast({
                                          title: "Access Denied",
                                          description: "You don't have permission to delete this document.",
                                          variant: "destructive",
                                        });
                                      } else {
                                        throw new Error(errorData.error || 'Failed to delete document');
                                      }
                                    }
                                  } catch (error) {
                                    console.error('Delete error:', error);
                                    toast({
                                      title: "Error",
                                      description: error instanceof Error ? error.message : 'Failed to delete document. Please try again.',
                                      variant: "destructive",
                                    });
                                  }
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          )}
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

        {/* Upload Document Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Upload Document</h3>

              {uploadError && (
                <div className="mb-4 p-3 bg-destructive/20 text-destructive rounded-md flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 0 016 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 0 00-1 1v4a1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {uploadError}
                </div>
              )}

              {uploading && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {uploadSuccessMessage && (
                <div className="mb-4 p-3 bg-green-10 text-green-80 rounded-md flex items-center gap-2 animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 00 16zm3.707-9.293a1 1 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0-1.414 1.414l2 2a1 1 0 01.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {uploadSuccessMessage}
                </div>
              )}

              <form onSubmit={async (e) => {
                e.preventDefault();

                // Check if running on client side
                if (typeof window === 'undefined') {
                  setUploadError('Upload can only be initiated from the browser');
                  return;
                }

                setUploading(true);
                setUploadProgress(0);
                setUploadError(null);
                setUploadSuccessMessage(null); // Clear any previous success message

                try {
                  const formData = new FormData(e.currentTarget);
                  const file = formData.get('file') as File;

                  if (!file || file.size === 0) {
                    throw new Error('Please select a file to upload');
                  }

                  // Get authentication token for the upload
                  const token = await AuthService.getAccessToken();
                  if (!token) {
                    throw new Error('No authentication token found');
                  }

                  // Create a new FormData object for the API request
                  const apiFormData = new FormData();
                  apiFormData.append('title', formData.get('title') as string);
                  apiFormData.append('description', formData.get('description') as string);
                  apiFormData.append('file', file);
                  apiFormData.append('unitId', unitId); // Automatically assign to current unit

                  // Create the request with progress tracking
                  const xhr = new XMLHttpRequest();

                  return new Promise<void>((resolve, reject) => {
                    // Set up all event listeners BEFORE opening the request
                    xhr.upload.addEventListener('progress', (event) => {
                      if (event.lengthComputable) {
                        const progress = Math.floor((event.loaded / event.total) * 100); // Use floor to ensure we get an integer value
                        setUploadProgress(progress);
                        console.log(`Upload progress: ${progress}% (${event.loaded} / ${event.total} bytes)`); // Debug log
                      } else {
                        console.log('Upload progress: Length not computable'); // Debug log for when length is not computable
                      }
                    });

                    // Add debug logging for other events
                    xhr.addEventListener('loadstart', () => {
                      console.log('Upload loadstart event fired');
                    });

                    xhr.addEventListener('loadend', () => {
                      console.log('Upload loadend event fired');
                    });

                    xhr.upload.addEventListener('loadstart', () => {
                      console.log('Upload upload loadstart event fired');
                    });

                    xhr.upload.addEventListener('loadend', () => {
                      console.log('Upload upload loadend event fired');
                    });

                    // Add error handling for progress events
                    xhr.upload.addEventListener('error', (event) => {
                      console.error('Upload error event fired:', event);
                    });

                    xhr.upload.addEventListener('abort', (event) => {
                      console.log('Upload abort event fired:', event);
                    });

                    // Add additional event listeners for debugging
                    xhr.addEventListener('readystatechange', () => {
                      console.log(`Ready state changed: ${xhr.readyState}`);
                    });

                    xhr.addEventListener('load', () => {
                      if (xhr.status >= 200 && xhr.status < 300) {
                        // Refresh the document list for the current unit
                        // Use the same token for the refresh call to avoid auth issues
                        fetch(`/api/documents?unit=${unitId}`, {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          }
                        })
                        .then(refreshResponse => refreshResponse.json())
                        .then(data => {
                          setDocuments(data.documents || []);
                          setShowUploadModal(false);
                          // Show success message to the user
                          setUploadSuccessMessage("Document uploaded successfully!");
                          // Clear the success message after 3 seconds
                          setTimeout(() => {
                            setUploadSuccessMessage(null);
                          }, 3000);
                          // Show success modal with OK button
                          setShowSuccessModal(true);
                          // Add a small delay to ensure UI updates properly
                          setTimeout(() => {
                            // Optionally trigger a full page refresh or a more comprehensive data reload
                          }, 100);
                          resolve();
                        })
                        .catch(error => {
                          console.error('Failed to refresh documents:', error);
                          setShowUploadModal(false);
                          // Still resolve so the user knows the upload was successful
                          // Even if the document list refresh failed, the upload itself was successful
                          setUploadSuccessMessage("Document uploaded successfully, but there was an issue refreshing the document list.");
                          // Clear the success message after 5 seconds
                          setTimeout(() => {
                            setUploadSuccessMessage(null);
                          }, 500);
                          // Show success modal with OK button even when refresh fails
                          setShowSuccessModal(true);
                          resolve();
                        });
                      } else {
                        // Try to parse error response
                        let errorData: { error?: string } = {};
                        try {
                          errorData = JSON.parse(xhr.responseText);
                        } catch {
                          // If response is not JSON, use status text
                          errorData = { error: `Upload failed: ${xhr.status} - ${xhr.statusText || 'Unknown error'}` };
                        }
                        const errorMessage = errorData.error || `Upload failed: ${xhr.status} ${xhr.statusText}`;
                        setUploadError(errorMessage);
                        setUploading(false);
                        setUploadSuccessMessage(null); // Clear any success message on error
                        console.error('Upload error details:', {
                          status: xhr.status,
                          statusText: xhr.statusText,
                          responseText: xhr.responseText,
                          error: errorMessage
                        });
                        reject(new Error(errorMessage));
                      }
                    });

                    xhr.addEventListener('error', () => {
                      setUploadError('Network error occurred during upload');
                      setUploading(false);
                      setUploadSuccessMessage(null); // Clear any success message on error
                      reject(new Error('Network error occurred during upload'));
                    });

                    xhr.addEventListener('abort', () => {
                      setUploadError('Upload was cancelled');
                      setUploading(false);
                      setUploadSuccessMessage(null); // Clear any success message on error
                      reject(new Error('Upload was cancelled'));
                    });

                    // Open the request after setting up all event listeners
                    xhr.open('POST', '/api/documents');
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    // Don't set Content-Type header when sending FormData - let browser set it with proper boundary

                    xhr.send(apiFormData);
                  });
                } catch (error) {
                  console.error('Upload error:', error);
                  setUploadError(error instanceof Error ? error.message : 'Failed to upload document');
                  setUploading(false);
                  setUploadSuccessMessage(null); // Clear any success message on error
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      name="title"
                      required
                      placeholder="Document title"
                      className="w-full p-2 border-input rounded-md bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      name="description"
                      className="w-full min-h-[80px] p-2 border border-input rounded-md bg-background"
                      placeholder="Document description (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">File *</label>
                    <input
                      type="file"
                      name="file"
                      required
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                      className="w-full p-2 border-input rounded-md bg-background"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Unit</label>
                    <input
                      type="text"
                      value={unit?.name || ''}
                      readOnly
                      className="w-full p-2 border-input rounded-md bg-background bg-gray-10 cursor-not-allowed"
                    />
                    <input
                      type="hidden"
                      name="unitId"
                      value={unitId}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Document will be uploaded to this unit: {unit?.code} - {unit?.name}</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploading(false);
                      setUploadProgress(0);
                      setUploadError(null);
                      setUploadSuccessMessage(null);
                      setShowSuccessModal(false);
                    }}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Successful!</DialogTitle>
              <DialogDescription>
                Your document has been uploaded successfully to the repository.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-60" viewBox="0 0 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 00 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 01.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => {
                setShowSuccessModal(false);
                setUploadProgress(0);
                setUploading(false);
                setUploadSuccessMessage(null);
              }}>OK</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ClientOnly>
 );
}