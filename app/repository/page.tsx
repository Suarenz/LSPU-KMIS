"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AuthService from '@/lib/services/auth-service';

import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { Document } from "@/lib/types"
import { Download, Eye, FileText, Filter, Upload, SearchIcon, EyeIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { ClientOnly } from "@/components/client-only-wrapper"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function RepositoryPage() {
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
// Determine if user can upload (roles are uppercase as per database enum)
  const canUpload = user?.role === "ADMIN" || user?.role === "FACULTY"

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router])

  // Track page visibility to handle when user returns from minimized state
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When user returns to the page, revalidate the auth state and refresh documents
        if (isAuthenticated && !isLoading && user) {
          fetchDocuments();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, isLoading, user, searchQuery, categoryFilter]);

  const fetchDocuments = async () => {
    // Double-check authentication state before fetching
    if (!isAuthenticated || isLoading) {
      return;
    }
    
    try {
      // Only set loading to true if this is not a visibility change refresh
      setLoading(prev => prev || true);
      
      // Use the access token from the auth context
      const token = await AuthService.getAccessToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Build query parameters properly
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      if (categoryFilter && categoryFilter !== 'all') queryParams.append('category', categoryFilter);
      
      const response = await fetch(`/api/documents?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
    
      if (!response.ok) {
        // Check if the error response is JSON
        let errorData: { error?: string } = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If response is not JSON, create a generic error
          errorData = { error: `HTTP error! status: ${response.status}` };
        }
        
        throw new Error(errorData.error || `Failed to fetch documents: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setDocuments(data.documents || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents. Please try again later.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of documents
  useEffect(() => {
    // Only fetch documents when we're sure the user is authenticated and loaded
    if (isAuthenticated && !isLoading && user) {
      fetchDocuments();
    }
  }, [searchQuery, categoryFilter, isAuthenticated, isLoading, user]);

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
          <p className="text-lg text-muted-foreground">Loading repository...</p>
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

  const categories = ["all", "Research", "Academic", "Policy", "Extension", "Teaching"]; // Using standard categories

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Knowledge Repository</h1>
                <p className="text-muted-foreground">Browse and access institutional knowledge resources</p>
              </div>
              {isAuthenticated && user && canUpload && (
               <Button
                 className="gap-2"
                 onClick={() => setShowUploadModal(true)}
               >
                 <Upload className="w-4 h-4" />
                 Upload Document
               </Button>
             )}
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-6 animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents, tags, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
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
                          {doc.downloads}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {doc.views}
                        </div>
                      </div>
                      <span className="text-xs">{formatFileSize(doc.fileSize)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      By {doc.uploadedBy} • v{doc.version}
                    </div>
                    <Button
                      className="w-full gap-2"
                      size="sm"
                      onClick={async () => {
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
                          
                          // Fetch download URL from API
                          const response = await fetch(`/api/documents/${doc.id}/download`, {
                            headers: {
                              'Authorization': `Bearer ${downloadToken}`,
                              'Content-Type': 'application/json',
                            }
                          });
                          
                          if (!response.ok) {
                            const errorData = await response.json().catch(() => ({}));
                            throw new Error(errorData.error || 'Failed to get download URL');
                          }
                          
                          const downloadData = await response.json();
                          
                          // Create a temporary link and trigger download
                          const link = document.createElement('a');
                          link.href = downloadData.downloadUrl;
                          link.download = downloadData.fileName || `document-${doc.id}`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } catch (error) {
                          console.error('Download error:', error);
                          alert(error instanceof Error ? error.message : 'Failed to download document. Please try again.');
                        }
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
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
                          <EyeIcon className="w-4 h-4" />
                          Preview
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {documents.length === 0 && (
            <Card className="animate-fade-in">
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </CardContent>
            </Card>
          )}
        </main>
        
        {/* Upload Document Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
              
              {uploadError && (
               <div className="mb-4 p-3 bg-destructive/20 text-destructive rounded-md">
                 {uploadError}
               </div>
             )}
             
             {uploading && (
               <div className="mb-4">
                 <div className="flex justify-between text-sm mb-1">
                   <span>Uploading...</span>
                   <span>{uploadProgress}%</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-2.5">
                   <div
                     className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                     style={{ width: `${uploadProgress}%` }}
                   ></div>
                 </div>
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
                  apiFormData.append('category', formData.get('category') as string);
                  apiFormData.append('tags', formData.get('tags') as string);
                  apiFormData.append('file', file);
                  
                  // Create the request with progress tracking
                  const xhr = new XMLHttpRequest();
                  
                  return new Promise<void>((resolve, reject) => {
                    xhr.upload.addEventListener('progress', (event) => {
                      if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100); // Fixed: was * 10, should be * 100
                        setUploadProgress(progress);
                      }
                    });
                    
                    xhr.addEventListener('load', () => {
                      if (xhr.status >= 200 && xhr.status < 300) {
                        // Refresh the document list
                        // Use the same token for the refresh call to avoid auth issues
                        // Build query parameters properly
                        const queryParams = new URLSearchParams();
                        if (searchQuery) queryParams.append('search', searchQuery);
                        if (categoryFilter && categoryFilter !== 'all') queryParams.append('category', categoryFilter);
                        
                        fetch(`/api/documents?${queryParams.toString()}`, {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          }
                        })
                        .then(refreshResponse => refreshResponse.json())
                        .then(data => {
                          setDocuments(data.documents || []);
                          setShowUploadModal(false);
                          setUploadProgress(0);
                          // Show success message to the user
                          toast({
                            title: "Success!",
                            description: "Document uploaded successfully!",
                          });
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
                          setUploadProgress(0);
                          // Still resolve so the user knows the upload was successful
                          // Even if the document list refresh failed, the upload itself was successful
                          toast({
                            title: "Upload successful!",
                            description: "Document uploaded successfully, but there was an issue refreshing the document list. The page may need to be refreshed to see the new document.",
                            variant: "destructive",
                          });
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
                        setUploadProgress(0);
                        setUploading(false);
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
                      setUploadProgress(0);
                      setUploading(false);
                      reject(new Error('Network error occurred during upload'));
                    });
                    
                    xhr.addEventListener('abort', () => {
                      setUploadError('Upload was cancelled');
                      setUploadProgress(0);
                      setUploading(false);
                      reject(new Error('Upload was cancelled'));
                    });
                    
                    xhr.open('POST', '/api/documents');
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    xhr.send(apiFormData);
                  });
                } catch (error) {
                  console.error('Upload error:', error);
                  setUploadError(error instanceof Error ? error.message : 'Failed to upload document');
                  setUploadProgress(0);
                  setUploading(false);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <Input
                      name="title"
                      required
                      placeholder="Document title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea
                      name="description"
                      required
                      className="w-full min-h-[80px] p-2 border border-input rounded-md bg-background"
                      placeholder="Document description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      name="category"
                      required
                      className="w-full p-2 border-input rounded-md bg-background"
                    >
                      <option value="">Select a category</option>
                      <option value="Research">Research</option>
                      <option value="Academic">Academic</option>
                      <option value="Policy">Policy</option>
                      <option value="Extension">Extension</option>
                      <option value="Teaching">Teaching</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                    <Input
                      name="tags"
                      placeholder="research, methodology, guidelines"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">File *</label>
                    <Input
                      type="file"
                      name="file"
                      required
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadError(null);
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
                <svg xmlns="http://www.w3.org/200/svg" className="h-10 w-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowSuccessModal(false)}>OK</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ClientOnly>
  )
}
