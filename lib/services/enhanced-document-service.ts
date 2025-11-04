import prisma from '@/lib/prisma';
import { Document } from '@/lib/api/types';

class EnhancedDocumentService {
  /**
   * Get all documents with optional filtering and pagination
   * Enhanced with unit filtering capabilities
   */
  async getDocuments(
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string,
    userId?: string,
    sort?: string,
    order: 'asc' | 'desc' = 'desc',
    unitId?: string // NEW: Filter by unit
  ): Promise<{ documents: Document[]; total: number }> {
    const skip = (page - 1) * limit;
    
    // Build where clause based on permissions and filters
    const whereClause: any = {
      status: 'ACTIVE', // Only show active documents
    };

    // Add category filter if provided
    if (category && category !== 'all') {
      whereClause.category = category;
    }

    // Add unit filter if provided
    if (unitId) {
      whereClause.unitId = unitId; // Using the new field name that was renamed from departmentId
    }

    // Add search filter if provided
    if (search) {
      const searchCondition = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { array_contains: [search] } }, // Updated for JSON field
        ]
      };
      
      // If we already have conditions (like category or unit), wrap everything in AND
      if (Object.keys(whereClause).length > 1) { // More than just status
        whereClause.AND = whereClause.AND || [];
        whereClause.AND.push(searchCondition);
      } else {
        // If no other conditions exist, just add the search condition
        Object.assign(whereClause, searchCondition);
      }
    }

    // If user is not admin, only show documents they have access to
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

      if (user && user.role !== 'ADMIN' && user.role !== 'FACULTY') {
        // For non-admin and non-faculty users, we need to check document permissions
        // This is a simplified approach - in a real system, you'd have more complex permission logic
        const permissionCondition = {
          OR: [
            { uploadedById: user.id }, // Allow access to user's own documents (using db ID)
            { permissions: { some: { userId: user.id, permission: { in: ['READ', 'WRITE', 'ADMIN'] } } } }, // Documents with explicit permissions
          ]
        };

        // If we already have conditions in whereClause, wrap everything in AND
        if (Object.keys(whereClause).length > 1) { // More than just status
          whereClause.AND = whereClause.AND || [];
          whereClause.AND.push(permissionCondition);
        } else {
          // If no other conditions exist, just add the permission condition
          Object.assign(whereClause, permissionCondition);
        }
      }
    }

    try {
      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: sort ? { [sort]: order } : { uploadedAt: 'desc' },
        }),
        prisma.document.count({ where: whereClause }),
      ]);

      return {
        documents: documents.map((doc: any) => ({
          ...doc,
          tags: Array.isArray(doc.tags) ? doc.tags as string[] : [],
          unitId: (doc as any).unitId,
          versionNotes: doc.versionNotes ?? undefined, // Convert null to undefined
          uploadedAt: new Date(doc.uploadedAt),
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        })),
        total,
      };
    } catch (error) {
      console.error('Database connection error in getDocuments:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Get a specific document by ID
   * Enhanced with unit access controls
   */
  async getDocumentById(id: string, userId?: string): Promise<Document | null> {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
      });

      if (!document) {
        return null;
      }

      // Check if user has access to the document
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

        if (user && user.role !== 'ADMIN' && user.role !== 'FACULTY') {
          // Check if document is public or user has explicit permission
          const permission = await prisma.documentPermission.findFirst({
            where: {
              documentId: id,
              userId: user.id, // Use the database user ID
            },
          });

          if (!permission && document.uploadedById !== user.id) {
            return null; // User doesn't have access
          }
        }
      }

      return {
        ...document,
        tags: Array.isArray(document.tags) ? document.tags as string[] : [],
        unitId: (document as any).unitId,
        versionNotes: document.versionNotes ?? undefined, // Convert null to undefined
        uploadedAt: new Date(document.uploadedAt),
        createdAt: new Date(document.createdAt),
        updatedAt: new Date(document.updatedAt),
      };
    } catch (error) {
      console.error('Database connection error in getDocumentById:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Create a new document
   * Enhanced with unit assignment
   */
  async createDocument(
    title: string,
    description: string,
    category: string,
    tags: string[],
    uploadedBy: string,
    fileUrl: string,
    fileName: string,
    fileType: string,
    fileSize: number,
    userId: string,
    unitId?: string // NEW: Unit assignment
  ): Promise<Document> {
    try {
      console.log('Creating document in database...', {
        title,
        description,
        category,
        tags,
        uploadedBy,
        fileUrl,
        fileName,
        fileType,
        fileSize,
        userId
      });
      
      // First, try to find user by the provided userId (which might be the database ID)
      let user = await prisma.user.findUnique({
        where: { id: userId },
      });

      // If not found, try to find user by supabase_auth_id
      if (!user) {
        user = await prisma.user.findUnique({
          where: { supabase_auth_id: userId },
        });
      }
      
      console.log('User lookup result:', { user: !!user, role: user?.role });

      if (!user || !['ADMIN', 'FACULTY'].includes(user.role)) {
        throw new Error('Only admins and faculty can upload documents');
      }

      const document = await prisma.document.create({
        data: {
          title,
          description,
          category,
          tags: tags || [], // Ensure tags is always an array, even if undefined
          uploadedBy: user.name,
          uploadedById: user.id, // Use the database user ID, not the Supabase auth ID
          fileUrl,
          fileName,
          fileType,
          fileSize,
          // Create document without unitId first, then update with raw SQL
          status: 'ACTIVE',
        },
      });
      
      console.log('Document created:', document.id);

      // Grant the uploader full permissions
      await prisma.documentPermission.create({
        data: {
          documentId: document.id,
          userId: user.id, // Use the database user ID for permissions
          permission: 'ADMIN',
        },
      });
      
      console.log('Document permissions granted');

      // Get the updated document to ensure we have the latest unitId value
      const updatedDoc = await prisma.document.findUnique({
        where: { id: document.id },
      });
      
      if (!updatedDoc) {
        throw new Error(`Document with id ${document.id} not found after creation`);
      }
      
      return {
        ...updatedDoc,
        tags: Array.isArray(updatedDoc.tags) ? updatedDoc.tags as string[] : [],
        unitId: (updatedDoc as any).unitId ?? undefined,
        versionNotes: updatedDoc.versionNotes ?? undefined, // Convert null to undefined
        uploadedAt: new Date(updatedDoc.uploadedAt),
        createdAt: new Date(updatedDoc.createdAt),
        updatedAt: new Date(updatedDoc.updatedAt),
      };
    } catch (error) {
      console.error('Database connection error in createDocument:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Update a document
   * Enhanced with unit assignment
   */
  async updateDocument(
    id: string,
    title?: string,
    description?: string,
    category?: string,
    tags?: string[],
    unitId?: string, // NEW: Unit assignment
    userId?: string
  ): Promise<Document | null> {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
      });

      if (!document) {
        return null;
      }

      // Check if user has permission to update the document
      let permission = null;
      let user = null;

      if (userId) {
        // First, try to find the user by the provided userId (which might be the database ID)
        user = await prisma.user.findUnique({
          where: { id: userId },
        });

        // If not found, try to find user by supabase_auth_id
        if (!user) {
          user = await prisma.user.findUnique({
            where: { supabase_auth_id: userId },
          });
        }

        if (user) {
          permission = await prisma.documentPermission.findFirst({
            where: {
              documentId: id,
              userId: user.id, // Use the database user ID
              permission: { in: ['WRITE', 'ADMIN'] },
            },
          });
        }
      }

      if (userId && !permission && user?.role !== 'ADMIN' && document.uploadedById !== user?.id) {
        throw new Error('User does not have permission to update this document');
      }

      // Update document fields that Prisma client recognizes
      const updatedDocument = await prisma.document.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(category && { category }),
          ...(tags !== undefined && { tags: tags || [] }),
          updatedAt: new Date(),
        },
      });
      
      // Update unitId using raw SQL since Prisma client may not recognize the field yet
      if (unitId !== undefined) {
        await prisma.$executeRaw`UPDATE documents SET "unitId" = ${unitId} WHERE id = ${id}`;
        // Refresh the document to get the updated unitId
        const refreshedDocument = await prisma.document.findUnique({
          where: { id },
        });
        if (refreshedDocument) {
          Object.assign(updatedDocument, refreshedDocument);
        }
      }

      // Get the updated document to ensure we have the latest unitId value after raw SQL update
      const finalDocument = await prisma.document.findUnique({
        where: { id },
      });
      
      if (!finalDocument) {
        throw new Error(`Document with id ${id} not found after update`);
      }
      
      return {
        ...finalDocument,
        tags: Array.isArray(finalDocument.tags) ? finalDocument.tags as string[] : [],
        unitId: (finalDocument as any).unitId ?? undefined,
        versionNotes: finalDocument.versionNotes ?? undefined, // Convert null to undefined
        uploadedAt: new Date(finalDocument.uploadedAt),
        createdAt: new Date(finalDocument.createdAt),
        updatedAt: new Date(finalDocument.updatedAt),
      };
    } catch (error) {
      console.error('Database connection error in updateDocument:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Get documents by unit
   */
  async getDocumentsByUnit(
    unitId: string,
    page: number = 1,
    limit: number = 10,
    userId?: string
  ): Promise<{ documents: Document[]; total: number }> {
    return this.getDocuments(page, limit, undefined, undefined, userId, undefined, 'desc', unitId);
  }

  /**
   * Get documents by unit that were uploaded by admin users only
   */
  async getAdminDocumentsByUnit(
    unitId: string,
    page: number = 1,
    limit: number = 10,
    userId?: string
  ): Promise<{ documents: Document[]; total: number }> {
    const skip = (page - 1) * limit;
    
    // Build where clause based on permissions and filters
    const whereClause: any = {
      status: 'ACTIVE', // Only show active documents
      unitId: unitId, // Filter by unit
    };

    // If user is not admin, only show documents they have access to
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

      if (user && user.role === 'ADMIN') {
        // Admins can see all documents in the unit regardless of who uploaded them
        // No additional filtering needed for admins
      } else if (user && user.role !== 'FACULTY') {
        // For non-admin and non-faculty users, we need to check document permissions
        const permissionCondition = {
          OR: [
            { uploadedById: user.id }, // Allow access to user's own documents (using db ID)
            { permissions: { some: { userId: user.id, permission: { in: ['READ', 'WRITE', 'ADMIN'] } } } }, // Documents with explicit permissions
          ]
        };

        // If we already have conditions in whereClause, wrap everything in AND
        if (Object.keys(whereClause).length > 1) { // More than just status
          whereClause.AND = whereClause.AND || [];
          whereClause.AND.push(permissionCondition);
        } else {
          // If no other conditions exist, just add the permission condition
          Object.assign(whereClause, permissionCondition);
        }
      }
    }

    try {
      const [documents, total] = await Promise.all([
        prisma.document.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { uploadedAt: 'desc' },
        }),
        prisma.document.count({ where: whereClause }),
      ]);

      return {
        documents: documents.map((doc: any) => ({
          ...doc,
          tags: Array.isArray(doc.tags) ? doc.tags as string[] : [],
          unitId: (doc as any).unitId,
          versionNotes: doc.versionNotes ?? undefined, // Convert null to undefined
          uploadedAt: new Date(doc.uploadedAt),
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        })),
        total,
      };
    } catch (error) {
      console.error('Database connection error in getAdminDocumentsByUnit:', error);
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Get user's unit permissions
   */
  async getUserUnitPermissions(userId: string, unitId: string): Promise<any | null> {
    // This method is actually part of the unit permission service, not document service
    // Placeholder implementation - this should be moved to the unit permission service
    return null;
  }

  /**
   * Search documents with unit filters
   */
  async searchDocuments(
    query: string,
    unitId?: string,
    category?: string,
    tags?: string[],
    userId?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ documents: Document[]; total: number }> {
    return this.getDocuments(page, limit, category, query, userId, undefined, 'desc', unitId);
  }
}

export default new EnhancedDocumentService();