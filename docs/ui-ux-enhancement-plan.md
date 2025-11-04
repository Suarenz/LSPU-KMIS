# UI/UX Enhancement Plan for Unit-Based Repository System

## Overview

This document outlines the UI/UX changes required to implement unit-specific repositories in the LSPU-SCC Knowledge Management Information System. The enhancements will provide intuitive navigation, filtering, and access controls for each of the ten academic units.

## Current UI Analysis

### Repository Page Structure
- Main repository page at `/repository`
- Grid layout for document cards
- Search and filter functionality
- Upload document modal
- Category filtering

### Navigation Components
- Main navbar with links to Dashboard, Repository, Search, Forums, Analytics
- No department-specific navigation currently

## UI/UX Enhancement Plan

### 1. Unit Navigation Sidebar

#### 1.1 Sidebar Component
```tsx
// components/unit-sidebar.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Building2,
  Users,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Unit } from '@/lib/api/types';

interface UnitSidebarProps {
  units: Unit[];
  currentUnit: string | null;
  onUnitSelect: (unitId: string) => void;
  userRole: string;
  userUnit: string | null;
}

export function UnitSidebar({
  units,
  currentUnit,
  onUnitSelect,
  userRole,
  userUnit
}: UnitSidebarProps) {
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  
  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
 };

  return (
    <div className="w-64 bg-muted/40 border-r p-4 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Units
        </h2>
      </div>
      
      <div className="space-y-1 flex-1 overflow-y-auto">
        {units.map((unit) => (
          <div key={unit.id} className="mb-1">
            <Button
              variant={currentUnit === unit.id ? "secondary" : "ghost"}
              className="w-full justify-start px-3 py-2 h-auto"
              onClick={() => onUnitSelect(unit.id)}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              <span className="truncate">{unit.name}</span>
              {expandedUnits.has(unit.id) ?
                <ChevronDown className="w-4 h-4 ml-auto" /> :
                <ChevronRight className="w-4 h-4 ml-auto" />
              }
            </Button>
            
            {expandedUnits.has(unit.id) && (
              <div className="ml-6 mt-1 space-y-1 pl-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => onUnitSelect(`${unit.id}/documents`)}
                >
                  <FileText className="w-3 h-3 mr-2" />
                  Documents
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => onUnitSelect(`${unit.id}/members`)}
                >
                  <Users className="w-3 h-3 mr-2" />
                  Members
                </Button>
                {userRole === 'ADMIN' || userRole === 'UNIT_ADMIN' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => onUnitSelect(`${unit.id}/settings`)}
                  >
                    <Settings className="w-3 h-3 mr-2" />
                    Settings
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-auto pt-4 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onUnitSelect('all')}
        >
          <FileText className="w-4 h-4 mr-2" />
          All Documents
        </Button>
      </div>
    </div>
  );
}
```

### 2. Enhanced Repository Page Layout

#### 2.1 Unit-Specific Repository Page
```tsx
// app/repository/page.tsx (enhanced version)
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
import type { Document } from "@/lib/api/types"
import { 
  Download, 
  Eye, 
  FileText, 
  Filter, 
  Upload, 
 SearchIcon, 
 EyeIcon, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Building2
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { ClientOnly } from "@/components/client-only-wrapper"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DepartmentSidebar } from "@/components/department-sidebar"
import { Department } from "@/lib/api/types"

export default function EnhancedRepositoryPage() {
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
 const [deletionSuccessMessage, setDeletionSuccessMessage] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Determine if user can upload (roles are uppercase as per database enum)
  const canUpload = user?.role === "ADMIN" || user?.role === "FACULTY"

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router])

  // Fetch units on initial load
  useEffect(() => {
    const fetchDepartments = async () => {
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
          throw new Error('Failed to fetch units');
        }
        
        const data = await response.json();
        setUnits(data.units || []);
        
        // Set default department filter to user's department
        if (user?.departmentId) {
          setDepartmentFilter(user.departmentId);
        }
      } catch (err) {
        console.error('Error fetching units:', err);
      }
    };
    
    if (isAuthenticated && user) {
      fetchDepartments();
    }
 }, [isAuthenticated, user]);

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
  }, [isAuthenticated, isLoading, user, searchQuery, categoryFilter, departmentFilter]);

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
      if (departmentFilter) queryParams.append('department', departmentFilter);
      
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
  }, [searchQuery, categoryFilter, departmentFilter, isAuthenticated, isLoading, user]);

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

  const handleDepartmentSelect = (deptId: string) => {
    // Handle special cases like "all" or department sections
    if (deptId === 'all') {
      setDepartmentFilter(null);
    } else if (!deptId.includes('/')) {
      setDepartmentFilter(deptId);
    } else {
      // Handle department sub-sections (documents, members, settings)
      const [deptIdOnly] = deptId.split('/');
      setDepartmentFilter(deptIdOnly);
    }
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-background flex">
        {/* Department Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <UnitSidebar
            units={units}
            currentUnit={unitFilter}
            onDepartmentSelect={handleDepartmentSelect}
            userRole={user.role}
            userDepartment={user.departmentId}
          />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex-col">
          <Navbar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {/* Header */}
            <div className="mb-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="p-2"
                    >
                      {sidebarOpen ? (
                        <ChevronLeft className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                      {unitFilter
                        ? units.find(u => u.id === unitFilter)?.name || 'Knowledge Repository'
                        : 'Knowledge Repository'}
                    </h1>
                  </div>
                  <p className="text-muted-foreground">
                    {unitFilter
                      ? `Browse and access ${units.find(u => u.id === unitFilter)?.name} resources`
                      : 'Browse and access institutional knowledge resources'}
                  </p>
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

            {/* Deletion Success Message */}
            {deletionSuccessMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-5 h-5" />
                {deletionSuccessMessage}
              </div>
            )}
            
            {/* Search and Filters */}
            <Card className="mb-6 animate-fade-in">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4">
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
                  <Select 
                    value={departmentFilter || "all"} 
                    onValueChange={(value) => setDepartmentFilter(value === "all" ? null : value)}
                  >
                    <SelectTrigger className="w-full md:w-48">
                      <Building2 className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {dept.code} - {dept.name}
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
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {doc.category}
                        </Badge>
                        {doc.department && (
                          <Badge variant="outline" className="text-xs">
                            {units.find(u => u.id === doc.unitId)?.code || 'General'}
                          </Badge>
                        )}
                      </div>
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
                          onClick={async () => {
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
                              
                              // No need to fetch JSON response for direct download
                              const downloadData = {
                                fileName: doc.fileName,
                                title: doc.title
                              };
                              
                              // Create a temporary link and trigger download using the direct download endpoint
                              const directDownloadUrl = `/api/documents/${doc.id}/download-direct`;
                              const link = document.createElement('a');
                              link.href = directDownloadUrl;
                              link.download = downloadData.fileName || `document-${doc.id}`;
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
                            <EyeIcon className="w-4 h-4" />
                            Preview
                          </Button>
                        ) : null}
                      </div>
                      {/* Delete button - only show if user can actually delete the document */}
                      {user && (user.role === 'ADMIN' || doc.uploadedById === user.id) && (
                        <Button
                          className="w-full gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
                                  }, 3000);
                                  // Refresh the document list
                                  fetchDocuments();
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
        </div>
      
      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
            
            {uploadError && (
             <div className="mb-4 p-3 bg-destructive/20 text-destructive rounded-md flex items-center gap-2">
               <XCircle className="w-5 h-5" />
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
            
            {uploadSuccessMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-5 h-5" />
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
                apiFormData.append('category', formData.get('category') as string);
                apiFormData.append('tags', formData.get('tags') as string);
                apiFormData.append('departmentId', formData.get('departmentId') as string);
                apiFormData.append('file', file);
                
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
                      // Refresh the document list
                      // Use the same token for the refresh call to avoid auth issues
                      // Build query parameters properly
                      const queryParams = new URLSearchParams();
                      if (searchQuery) queryParams.append('search', searchQuery);
                      if (categoryFilter && categoryFilter !== 'all') queryParams.append('category', categoryFilter);
                      if (departmentFilter) queryParams.append('department', departmentFilter);
                      
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
                        setUploadProgress(0);
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
                      setUploadProgress(0);
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
                    setUploadProgress(0);
                    setUploading(false);
                    setUploadSuccessMessage(null); // Clear any success message on error
                    reject(new Error('Network error occurred during upload'));
                  });
                  
                  xhr.addEventListener('abort', () => {
                    setUploadError('Upload was cancelled');
                    setUploadProgress(0);
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
                setUploadProgress(0);
                setUploading(false);
                setUploadSuccessMessage(null); // Clear any success message on error
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
                  <label className="block text-sm font-medium mb-1">Department *</label>
                  <select
                    name="departmentId"
                    required
                    className="w-full p-2 border-input rounded-md bg-background"
                    defaultValue={user?.departmentId || ""}
                  >
                    <option value="">Select a unit</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {dept.code} - {dept.name}
                      </option>
                    ))}
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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" viewBox="0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccessModal(false)}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </ClientOnly>
 )
}
```

### 3. Department-Specific Document Upload Form

#### 3.1 Enhanced Upload Modal
The upload modal now includes a department selection dropdown that is pre-populated with the user's department if they belong to one.

### 4. Department Dashboard Page

#### 4.1 Department Dashboard Component
```tsx
// app/repository/department/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AuthService from '@/lib/services/auth-service';
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Document } from "@/lib/api/types"
import { 
  Download, 
  Eye, 
  FileText, 
  Users, 
  Settings,
  BarChart3,
  FileBarChart,
  Building2
} from "lucide-react"
import Image from "next/image"
import { ClientOnly } from "@/components/client-only-wrapper"
import { useToast } from "@/components/ui/use-toast"
import { Department } from "@/lib/api/types"

interface DepartmentPageProps {
  params: {
    id: string
  }
}

export default function DepartmentPage({ params }: DepartmentPageProps) {
  const { toast } = useToast()
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [department, setDepartment] = useState<Department | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalMembers: 0,
    downloadsThisMonth: 0,
    recentUploads: 0
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        setLoading(true);
        
        const token = await AuthService.getAccessToken();
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Fetch unit details
        const unitResponse = await fetch(`/api/units/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!deptResponse.ok) {
          throw new Error('Failed to fetch department details');
        }
        
        const deptData = await deptResponse.json();
        setDepartment(deptData.department);
        
        // Fetch unit documents
        const docsResponse = await fetch(`/api/units/${params.id}/documents`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!docsResponse.ok) {
          throw new Error('Failed to fetch department documents');
        }
        
        const docsData = await docsResponse.json();
        setDocuments(docsData.documents || []);
        
        // Fetch unit stats
        const statsResponse = await fetch(`/api/units/${params.id}/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching department data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load department data. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user) {
      fetchDepartmentData();
    }
 }, [params.id, isAuthenticated, user]);

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
          <p className="text-lg text-muted-foreground">Loading department...</p>
        </div>
      </div>
    );
  }

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
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
 }

  // Check if user has admin permissions for this department
  const canManageDepartment = user.role === 'ADMIN' || 
    (user.role === 'FACULTY' && user.departmentId === params.id) ||
    // Check department permissions if implemented
    false;

  return (
    <ClientOnly>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Department Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    {department?.name}
                  </h1>
                  <p className="text-muted-foreground">{department?.code}</p>
                </div>
              </div>
              {canManageDepartment && (
                <div className="flex gap-2">
                  <Button className="gap-2">
                    <Settings className="w-4 h-4" />
                    Manage
                  </Button>
                  <Button className="gap-2">
                    <Users className="w-4 h-4" />
                    Members
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Department Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <p className="text-2xl font-bold">{stats.totalDocuments}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="text-2xl font-bold">{stats.totalMembers}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                  <p className="text-2xl font-bold">{stats.downloadsThisMonth}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recent Uploads</p>
                  <p className="text-2xl font-bold">{stats.recentUploads}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Department Documents */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Documents</h2>
              <Button 
                variant="outline" 
                onClick={() => router.push(`/repository?department=${params.id}`)}
              >
                View All
              </Button>
            </div>
            
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.slice(0, 6).map((doc, index) => (
                  <Card
                    key={doc.id}
                    className="animate-fade-in hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => router.push(`/repository/preview/${doc.id}`)}
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                  <p className="text-muted-foreground">This department doesn't have any documents yet.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Department Quick Actions */}
          {canManageDepartment && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors" 
                  onClick={() => router.push(`/repository/upload?department=${params.id}`)}>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Upload Document</h3>
                    <p className="text-sm text-muted-foreground">Add a new document to this department</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Manage Members</h3>
                    <p className="text-sm text-muted-foreground">Add or remove department members</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                      <Settings className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">Department Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure department preferences</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </ClientOnly>
  )
}
```

### 5. Department Filtering Components

#### 5.1 Department Filter Component
```tsx
// components/department-filter.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2 } from "lucide-react"
import { Department } from "@/lib/api/types"

interface UnitFilterProps {
  units: Unit[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export function UnitFilter({ units, value, onChange }: UnitFilterProps) {
  return (
    <Select 
      value={value || "all"} 
      onValueChange={(val) => onChange(val === "all" ? null : val)}
    >
      <SelectTrigger className="w-full md:w-48">
        <Building2 className="w-4 h-4 mr-2" />
        <SelectValue placeholder="All Departments" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Units</SelectItem>
        {units.map((unit) => (
          <SelectItem key={unit.id} value={unit.id}>
            {dept.code} - {dept.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

### 6. Department Navigation in Navbar

#### 6.1 Enhanced Navbar with Department Switcher
```tsx
// components/navbar.tsx (enhanced version)
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, Menu, Search, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"
import { useState } from "react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Department } from "@/lib/api/types"

interface NavbarProps {
  units?: Unit[];
  currentUnit?: string | null;
  onDepartmentChange?: (deptId: string) => void;
}

export function Navbar({ units, currentUnit, onUnitChange }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Site Name */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <Image
                src="/LSPULogo.png"
                alt="LSPU Logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">LSPU KMIS</div>
              <div className="text-xs text-muted-foreground">Knowledge Management Information System</div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link 
            href="/dashboard" 
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Dashboard
          </Link>
          <Link 
            href="/repository" 
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Repository
          </Link>
          <Link 
            href="/search" 
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Search
          </Link>
          <Link 
            href="/forums" 
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Forums
          </Link>
          {user?.role === 'ADMIN' && (
            <Link 
              href="/analytics" 
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Analytics
            </Link>
          )}
        </nav>

        {/* Unit Selector - Only show if user is authenticated and units exist */}
        {isAuthenticated && units && units.length > 0 && (
          <div className="hidden md:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  {currentUnit
                    ? units.find(u => u.id === currentUnit)?.code || 'Unit'
                    : 'All Units'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDepartmentChange?.(null)}>
                  All Departments
                </DropdownMenuItem>
                {units.map((unit) => (
                  <DropdownMenuItem
                    key={unit.id}
                    onClick={() => onUnitChange?.(unit.id)}
                  >
                    {unit.code} - {unit.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* User Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="w-5 h-5" />
          </Button>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="p-2 border-b">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuItem>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logout()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/">
              <Button variant="outline">Login</Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={toggleMobileMenu}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t p-4">
          <nav className="flex flex-col gap-3">
            <Link 
              href="/dashboard" 
              className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/repository" 
              className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Repository
            </Link>
            <Link 
              href="/search" 
              className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Search
            </Link>
            <Link 
              href="/forums" 
              className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Forums
            </Link>
            {user?.role === 'ADMIN' && (
              <Link 
                href="/analytics" 
                className="transition-colors hover:text-foreground/80 text-foreground/60 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Analytics
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
```

## UX Enhancements

### 1. Intuitive Unit Navigation
- Clear visual indicators for current unit
- Breadcrumb navigation showing unit path
- Consistent unit indicators across all views

### 2. Responsive Design
- Collapsible sidebar for smaller screens
- Mobile-friendly unit filtering
- Adaptive grid layouts for document display

### 3. Visual Unit Indicators
- Unit badges on document cards
- Color-coded unit sections
- Unit-specific icons and styling

### 4. Accessible Filtering
- Keyboard navigation for unit selection
- Screen reader support for unit options
- Clear visual feedback for selected unit

### 5. Performance Considerations
- Lazy loading for unit content
- Efficient data fetching with proper caching
- Optimized rendering for large document lists

## Implementation Priorities

### Phase 1: Core Navigation
1. Implement unit sidebar component
2. Update repository page with unit filtering
3. Add unit selection to upload form

### Phase 2: Enhanced UI
1. Create unit dashboard pages
2. Implement unit statistics cards
3. Add unit-specific quick actions

### Phase 3: Advanced Features
1. Unit member management
2. Advanced permission controls
3. Unit-specific notifications

This UI/UX enhancement plan provides a comprehensive approach to implementing unit-specific repositories with intuitive navigation and filtering capabilities for the LSPU-SCC Knowledge Management Information System.