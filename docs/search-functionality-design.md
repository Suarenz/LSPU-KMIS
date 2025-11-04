# Search Functionality Design for Unit-Based Repository System

## Overview

This document outlines the enhanced search functionality for the unit-based repository system at LSPU-SCC. The system will provide comprehensive search capabilities with unit-specific filters, advanced categorization, and performance optimization for the ten academic units.

## Current Search Analysis

### Existing Search Capabilities
- Basic search across document titles, descriptions, and tags
- Category filtering
- Pagination support
- Simple text matching

### Limitations
- No unit-specific search
- No advanced filtering options
- No search across version history
- No cross-unit search with permissions
- No search result ranking or relevance scoring

## Enhanced Search Architecture

### 1. Search Scope Options

#### 1.1 Search Scopes
- **All Units**: Search across all accessible units (for admins and authorized users)
- **Current Unit**: Search only within the selected unit
- **My Documents**: Search only documents uploaded by the user
- **My Unit**: Search within user's assigned unit
- **Cross-Unit**: Search across multiple selected units (with proper permissions)

#### 1.2 Permission-Aware Search
- Search results filtered by user's unit permissions
- Only documents user has access to are returned
- Respect document-level permissions in addition to unit permissions

### 2. Search Parameters and Filters

#### 2.1 Basic Search Parameters
- **Query**: Search term for full-text search
- **Unit**: Filter by specific unit
- **Category**: Filter by document category
- **Tags**: Filter by specific tags
- **Date Range**: Filter by upload date
- **Document Type**: Filter by file type (PDF, DOC, etc.)
- **Author**: Filter by document author
- **Academic Year**: Filter by academic year
- **Semester**: Filter by semester

#### 2.2 Advanced Search Parameters
- **Version Status**: Filter by current or archived versions
- **Approval Status**: Filter by document approval status
- **Public/Private**: Filter by document visibility
- **Author Type**: Filter by author type (faculty, student, admin)
- **Course Code**: Filter by associated course code

### 3. Search API Design

#### 3.1 Enhanced Search Endpoint
```typescript
// app/api/search/route.ts (enhanced)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) { // Check if it's a NextResponse (error case)
      return authResult;
    }
    
    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    
    // Extract search parameters
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const department = searchParams.get('department') || undefined;
    const category = searchParams.get('category') || undefined;
    const tags = searchParams.get('tags') || undefined;
    const author = searchParams.get('author') || undefined;
    const docType = searchParams.get('type') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const academicYear = searchParams.get('academicYear') || undefined;
    const semester = searchParams.get('semester') || undefined;
    const authorType = searchParams.get('authorType') || undefined;
    const courseCode = searchParams.get('courseCode') || undefined;
    const approvalStatus = searchParams.get('approvalStatus') || undefined;
    const isPublic = searchParams.get('isPublic');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const sort = searchParams.get('sort') || 'relevance'; // relevance, date, title, downloads
    const order = searchParams.get('order') || 'desc';
    
    // Validate and sanitize inputs
    if (query && query.length > 500) {
      return NextResponse.json(
        { error: 'Search query too long' },
        { status: 400 }
      );
    }
    
    // Perform search using document service
    const searchResults = await documentService.searchDocuments({
      query,
      departmentId: department,
      category,
      tags: tags ? tags.split(',') : undefined,
      author,
      fileType: docType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      academicYear,
      semester,
      authorType,
      courseCode,
      approvalStatus,
      isPublic: isPublic !== null ? isPublic === 'true' : undefined,
      userId: user.userId,
      page,
      limit,
      sort,
      order
    });
    
    return NextResponse.json(searchResults);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 3.2 Search Service Implementation
```typescript
// lib/services/document-service.ts (enhanced search method)
async searchDocuments({
  query,
  departmentId,
  category,
  tags,
  author,
  fileType,
  startDate,
  endDate,
  academicYear,
  semester,
  authorType,
  courseCode,
  approvalStatus,
  isPublic,
  userId,
  page = 1,
  limit = 20,
  sort = 'relevance',
  order = 'desc'
}: {
  query?: string;
  departmentId?: string;
  category?: string;
  tags?: string[];
  author?: string;
  fileType?: string;
 startDate?: Date;
  endDate?: Date;
  academicYear?: string;
  semester?: string;
  authorType?: string;
  courseCode?: string;
  approvalStatus?: string;
  isPublic?: boolean;
  userId: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}): Promise<{ documents: Document[]; total: number; facets: any }> {
  const skip = (page - 1) * limit;
  
  // Build where clause based on search parameters
  const whereClause: any = {
    status: 'ACTIVE', // Only search active documents
 };
  
  // Add search query if provided
  if (query) {
    const searchCondition = {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] },
        // Add full-text search on document content if available
      ]
    };
    
    Object.assign(whereClause, searchCondition);
  }
  
  // Add department filter if specified
 if (departmentId) {
    whereClause.departmentId = departmentId;
  }
  
  // Add category filter if specified
  if (category && category !== 'all') {
    whereClause.category = category;
 }
  
  // Add tags filter if specified
  if (tags && tags.length > 0) {
    whereClause.tags = { hasSome: tags };
  }
  
  // Add author filter if specified
  if (author) {
    whereClause.uploadedBy = { contains: author, mode: 'insensitive' };
  }
  
 // Add file type filter if specified
  if (fileType) {
    whereClause.fileType = { contains: fileType, mode: 'insensitive' };
  }
  
  // Add date range filter if specified
  if (startDate || endDate) {
    whereClause.uploadedAt = {};
    if (startDate) whereClause.uploadedAt.gte = startDate;
    if (endDate) whereClause.uploadedAt.lte = endDate;
  }
  
  // Add academic year filter if specified
  if (academicYear) {
    whereClause.academicYear = academicYear;
  }
  
  // Add semester filter if specified
  if (semester) {
    whereClause.semester = semester;
  }
  
  // Add author type filter if specified
  if (authorType) {
    whereClause.authorType = authorType;
  }
  
  // Add course code filter if specified
  if (courseCode) {
    whereClause.courseCode = courseCode;
  }
  
  // Add approval status filter if specified
  if (approvalStatus) {
    whereClause.approvalStatus = approvalStatus;
  }
  
  // Add public/private filter if specified
  if (isPublic !== undefined) {
    whereClause.isPublic = isPublic;
  }
  
  // Apply permission-based filtering
  if (userId) {
    // First, try to find the user by the provided userId (which might be the database ID)
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If not found, try to find user by supabase_auth_id
    if (!user) {
      user = await prisma.user.findUnique({
        where: { supabase_auth_id: userId },
      });
    }

    if (user && user.role !== 'ADMIN') {
      // For non-admin users, we need to check department permissions and document permissions
      const permissionCondition = {
        OR: [
          { uploadedById: user.id }, // Allow access to user's own documents
          // Documents where user has explicit permissions
          { permissions: { some: { userId: user.id, permission: { in: ['READ', 'WRITE', 'ADMIN'] } } },
          // Documents from departments where user has READ or higher permission
          { 
            department: { 
              permissions: { 
                some: { 
                  userId: user.id, 
                  permission: { in: ['READ', 'WRITE', 'ADMIN'] } 
                } 
              } 
            } 
          }
        ]
      };

      // Combine with existing where clause
      if (Object.keys(whereClause).length > 0) {
        whereClause.AND = whereClause.AND || [];
        whereClause.AND.push(permissionCondition);
      } else {
        Object.assign(whereClause, permissionCondition);
      }
    }
  }
  
 // Determine sort order
  let orderBy: any = {};
  switch (sort) {
    case 'date':
      orderBy = { uploadedAt: order };
      break;
    case 'title':
      orderBy = { title: order };
      break;
    case 'downloads':
      orderBy = { downloadsCount: order };
      break;
    case 'relevance':
    default:
      // For relevance, we'll sort by date by default since we don't have a relevance score yet
      orderBy = { uploadedAt: 'desc' };
      break;
  }
  
  try {
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          department: true,  // Include department information
          uploadedByUser: true, // Include uploader information
        },
        orderBy,
      }),
      prisma.document.count({ where: whereClause }),
    ]);
    
    // Calculate facets for search refinement
    const facets = await this.calculateSearchFacets(whereClause);
    
    return {
      documents: documents.map((doc: any) => ({
        ...doc,
        versionNotes: doc.versionNotes ?? undefined, // Convert null to undefined
        uploadedAt: new Date(doc.uploadedAt),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      })),
      total,
      facets,
    };
  } catch (error) {
    console.error('Database connection error in searchDocuments:', error);
    throw error;
  }
}

// Helper method to calculate search facets
async calculateSearchFacets(whereClause: any) {
  // Get facet counts for common filters
  const [
    departmentFacets,
    categoryFacets,
    authorFacets,
    typeFacets,
    yearFacets
  ] = await Promise.all([
    // Department facets
    prisma.document.groupBy({
      by: ['departmentId'],
      where: whereClause,
      _count: true,
      orderBy: { _count: 'desc' },
    }),
    
    // Category facets
    prisma.document.groupBy({
      by: ['category'],
      where: whereClause,
      _count: true,
      orderBy: { _count: 'desc' },
    }),
    
    // Author facets
    prisma.document.groupBy({
      by: ['uploadedBy'],
      where: whereClause,
      _count: true,
      orderBy: { _count: 'desc' },
    }),
    
    // Type facets
    prisma.document.groupBy({
      by: ['fileType'],
      where: whereClause,
      _count: true,
      orderBy: { _count: 'desc' },
    }),
    
    // Academic year facets
    prisma.document.groupBy({
      by: ['academicYear'],
      where: whereClause,
      _count: true,
      orderBy: { _count: 'desc' },
    })
  ]);
  
  return {
    departments: departmentFacets,
    categories: categoryFacets,
    authors: authorFacets,
    types: typeFacets,
    academicYears: yearFacets,
  };
}
```

### 4. Advanced Search Features

#### 4.1 Faceted Search
- Department filter with counts
- Category filter with counts
- Author filter with counts
- File type filter with counts
- Academic year filter with counts
- Date range filter

#### 4.2 Search Result Ranking
- Relevance ranking based on query term frequency
- Date-based ranking (newer documents ranked higher)
- Popularity ranking (downloads, views)
- Department-specific ranking (department admins may want to prioritize certain documents)

#### 4.3 Search Suggestions
- Auto-complete suggestions as user types
- Popular search terms
- Related search terms

### 5. Search UI Components

#### 5.1 Advanced Search Form
```tsx
// components/advanced-search.tsx
interface AdvancedSearchProps {
  onSearch: (params: SearchParams) => void;
  departments: Department[];
  currentDepartment?: string;
  defaultParams?: Partial<SearchParams>;
}

interface SearchParams {
  query: string;
  department?: string;
  category?: string;
  tags?: string[];
  author?: string;
  fileType?: string;
  startDate?: Date;
  endDate?: Date;
  academicYear?: string;
  semester?: string;
  authorType?: string;
  courseCode?: string;
  approvalStatus?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
 order?: 'asc' | 'desc';
}

export function AdvancedSearch({ 
  onSearch, 
  departments, 
  currentDepartment,
  defaultParams = {}
}: AdvancedSearchProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    department: currentDepartment,
    category: undefined,
    tags: [],
    author: undefined,
    fileType: undefined,
    startDate: undefined,
    endDate: undefined,
    academicYear: undefined,
    semester: undefined,
    authorType: undefined,
    courseCode: undefined,
    approvalStatus: undefined,
    isPublic: undefined,
    page: 1,
    limit: 20,
    sort: 'relevance',
    order: 'desc',
    ...defaultParams
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Basic Search Field */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Search documents, tags, or keywords..."
            value={searchParams.query}
            onChange={(e) => setSearchParams({...searchParams, query: e.target.value})}
            className="w-full"
          />
        </div>
        
        {/* Department Filter */}
        <Select 
          value={searchParams.department || "all"} 
          onValueChange={(value) => setSearchParams({...searchParams, department: value === "all" ? undefined : value})}
        >
          <SelectTrigger>
            <Building2 className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.code} - {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Category Filter */}
        <Select 
          value={searchParams.category || "all"} 
          onValueChange={(value) => setSearchParams({...searchParams, category: value === "all" ? undefined : value})}
        >
          <SelectTrigger>
            <FileText className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Research">Research</SelectItem>
            <SelectItem value="Academic">Academic</SelectItem>
            <SelectItem value="Policy">Policy</SelectItem>
            <SelectItem value="Extension">Extension</SelectItem>
            <SelectItem value="Teaching">Teaching</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Advanced Search Toggle */}
      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "Hide Advanced" : "Show Advanced"} Filters
          {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>
      </div>
      
      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg">
          {/* Author */}
          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <Input
              value={searchParams.author || ""}
              onChange={(e) => setSearchParams({...searchParams, author: e.target.value})}
              placeholder="Author name"
            />
          </div>
          
          {/* File Type */}
          <div>
            <label className="block text-sm font-medium mb-1">File Type</label>
            <Select 
              value={searchParams.fileType}
              onValueChange={(value) => setSearchParams({...searchParams, fileType: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="doc">DOC</SelectItem>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="ppt">PPT</SelectItem>
                <SelectItem value="pptx">PPTX</SelectItem>
                <SelectItem value="xls">XLS</SelectItem>
                <SelectItem value="xlsx">XLSX</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Academic Year */}
          <div>
            <label className="block text-sm font-medium mb-1">Academic Year</label>
            <Input
              value={searchParams.academicYear || ""}
              onChange={(e) => setSearchParams({...searchParams, academicYear: e.target.value})}
              placeholder="e.g., 2024-2025"
            />
          </div>
          
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input
              type="date"
              value={searchParams.startDate ? new Date(searchParams.startDate).toISOString().split('T')[0] : ""}
              onChange={(e) => setSearchParams({...searchParams, startDate: e.target.value ? new Date(e.target.value) : undefined})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input
              type="date"
              value={searchParams.endDate ? new Date(searchParams.endDate).toISOString().split('T')[0] : ""}
              onChange={(e) => setSearchParams({...searchParams, endDate: e.target.value ? new Date(e.target.value) : undefined})}
            />
          </div>
          
          {/* Course Code */}
          <div>
            <label className="block text-sm font-medium mb-1">Course Code</label>
            <Input
              value={searchParams.courseCode || ""}
              onChange={(e) => setSearchParams({...searchParams, courseCode: e.target.value})}
              placeholder="e.g., CAS 101"
            />
          </div>
        </div>
      )}
      
      {/* Search Button */}
      <div className="flex justify-end">
        <Button type="submit">Search</Button>
      </div>
    </form>
  );
}
```

#### 5.2 Search Results Component
```tsx
// components/search-results.tsx
interface SearchResultsProps {
  results: Document[];
  total: number;
  facets: any;
  loading: boolean;
  error?: string;
  onPageChange: (page: number) => void;
  currentPage: number;
  itemsPerPage: number;
  onFacetChange: (facet: string, value: string) => void;
  selectedFacets: Record<string, string[]>;
}

export function SearchResults({
  results,
  total,
  facets,
  loading,
  error,
  onPageChange,
  currentPage,
  itemsPerPage,
  onFacetChange,
  selectedFacets
}: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
 if (error) {
    return (
      <div className="text-center py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Search Summary */}
      <div className="text-sm text-muted-foreground">
        Found {total} results
      </div>
      
      {/* Faceted Search Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Department Facets */}
              {facets.departments && facets.departments.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Departments</h3>
                  <div className="space-y-1">
                    {facets.departments.map((dept: any) => (
                      <div key={dept.departmentId} className="flex items-center justify-between">
                        <Label className="flex items-center space-x-2 cursor-pointer">
                          <Checkbox
                            checked={selectedFacets.department?.includes(dept.departmentId)}
                            onCheckedChange={() => onFacetChange('department', dept.departmentId)}
                          />
                          <span>
                            {dept.departmentId 
                              ? departments.find(d => d.id === dept.departmentId)?.code || dept.departmentId 
                              : 'General'}
                          </span>
                        </Label>
                        <span className="text-xs text-muted-foreground">({dept._count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Category Facets */}
              {facets.categories && facets.categories.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Categories</h3>
                  <div className="space-y-1">
                    {facets.categories.map((cat: any) => (
                      <div key={cat.category} className="flex items-center justify-between">
                        <Label className="flex items-center space-x-2 cursor-pointer">
                          <Checkbox
                            checked={selectedFacets.category?.includes(cat.category)}
                            onCheckedChange={() => onFacetChange('category', cat.category)}
                          />
                          <span>{cat.category}</span>
                        </Label>
                        <span className="text-xs text-muted-foreground">({cat._count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Year Facets */}
              {facets.academicYears && facets.academicYears.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Academic Year</h3>
                  <div className="space-y-1">
                    {facets.academicYears.map((year: any) => (
                      year.academicYear && (
                        <div key={year.academicYear} className="flex items-center justify-between">
                          <Label className="flex items-center space-x-2 cursor-pointer">
                            <Checkbox
                              checked={selectedFacets.academicYear?.includes(year.academicYear)}
                              onCheckedChange={() => onFacetChange('academicYear', year.academicYear)}
                            />
                            <span>{year.academicYear}</span>
                          </Label>
                          <span className="text-xs text-muted-foreground">({year._count})</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Search Results */}
        <div className="flex-1">
          {results.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No documents found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((doc, index) => (
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
                              {departments.find(d => d.id === doc.departmentId)?.code || 'General'}
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
                          By {doc.uploadedBy} • {new Date(doc.uploadedAt).toLocaleDateString()} • v{doc.version}
                        </div>
                        <Button
                          className="w-full gap-2"
                          size="sm"
                          onClick={() => router.push(`/repository/preview/${doc.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => onPageChange(currentPage - 1)} 
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, Math.ceil(total / itemsPerPage)) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(
                        currentPage - 2 + i, 
                        Math.ceil(total / itemsPerPage) - 4 + i
                      ));
                      
                      if (pageNum < 1 || pageNum > Math.ceil(total / itemsPerPage)) return null;
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => onPageChange(pageNum)}
                            isActive={pageNum === currentPage}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => onPageChange(currentPage + 1)} 
                        className={currentPage >= Math.ceil(total / itemsPerPage) ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 6. Search Performance Optimization

#### 6.1 Database Indexing
```sql
-- Indexes for search performance
CREATE INDEX idx_documents_title_gin ON documents USING gin(to_tsvector('english', title));
CREATE INDEX idx_documents_description_gin ON documents USING gin(to_tsvector('english', description));
CREATE INDEX idx_documents_tags_gin ON documents USING gin(tags);
CREATE INDEX idx_documents_department_id ON documents(department_id);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX idx_documents_file_type ON documents(file_type);
CREATE INDEX idx_documents_academic_year ON documents(academic_year);
CREATE INDEX idx_documents_course_code ON documents(course_code);
CREATE INDEX idx_documents_approval_status ON documents(approval_status);
```

#### 6.2 Full-Text Search Configuration
```sql
-- Create a full-text search index combining title, description, and tags
CREATE INDEX idx_documents_fulltext ON documents USING gin(
  (setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
   setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
   setweight(to_tsvector('english', array_to_string(tags, ' ')), 'C'))
);
```

### 7. Search Result Relevance

#### 7.1 Relevance Scoring
- Title matches score higher than description matches
- Exact matches score higher than partial matches
- Recent documents score higher (decay function)
- Popular documents (more downloads/views) score higher

#### 7.2 Search Result Enhancement
- Highlight search terms in results
- Show snippet of matching content
- Show breadcrumbs for document location
- Show version information

### 8. Department-Specific Search Features

#### 8.1 Department Search Defaults
- Each department can have customized search defaults
- Department admins can configure which filters are shown by default
- Department-specific popular search terms

#### 8.2 Cross-Department Search
- Users with appropriate permissions can search across departments
- Search results show department indicators
- Department-based access control applied to results

This comprehensive search functionality will provide users with powerful tools to find documents across the LSPU-SCC departmental repository system while maintaining appropriate access controls and performance.