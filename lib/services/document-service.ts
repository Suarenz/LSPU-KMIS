import prisma from '@/lib/prisma';
import { Document, DocumentPermission, DocumentComment, User } from '@/lib/api/types';
import fileStorageService from './file-storage-service';

class DocumentService {
  /**
   * Helper method to find a user by either database ID or Supabase auth ID
   */
  private async findUserById(userId: string): Promise<User | null> {
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

    if (!user) {
      return null;
    }

    // Transform the Prisma user to match the API type
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      unitId: user.unitId || undefined, // Convert null to undefined
      avatar: user.avatar || undefined, // Convert null to undefined
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Get all documents with optional filtering and pagination
   */
  async getDocuments(
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string,
    userId?: string,
    sort?: string,
    order: 'asc' | 'desc' = 'desc',
    unitId?: string  // NEW: Unit filter
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
      whereClause.unitId = unitId;
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
      const user = await this.findUserById(userId);

      if (user && user.role !== 'ADMIN' && user.role !== 'FACULTY') {
        // For non-admin and non-faculty users, we need to check document permissions
        const permissionCondition = {
          OR: [
            { uploadedById: user.id }, // Allow access to user's own documents (using db ID)
            { permissions: { some: { userId: user.id, permission: { in: ['READ', 'WRITE', 'ADMIN'] } } } } // Documents with explicit permissions
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
          include: {
            uploadedByUser: true,
            documentUnit: true,
          }
        }),
        prisma.document.count({ where: whereClause }),
      ]);

      return {
        documents: documents.map((doc: any) => ({
          ...doc,
          tags: Array.isArray(doc.tags) ? doc.tags as string[] : (typeof doc.tags === 'object' && doc.tags !== null ? Object.values(doc.tags) : []),
          unitId: doc.unitId ?? undefined,
          versionNotes: doc.versionNotes ?? undefined,
          downloadsCount: doc.downloadsCount ?? 0,
          viewsCount: doc.viewsCount ?? 0,
          uploadedBy: doc.uploadedByUser?.name || doc.uploadedBy,
          unit: doc.documentUnit || undefined,
          uploadedAt: new Date(doc.uploadedAt),
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        })),
        total,
      };
    } catch (error) {
      console.error('Database connection error in getDocuments:', error);
      // Check if this is an authentication error
      if (error instanceof Error &&
          (error.message.includes('Authentication failed') ||
           error.message.includes('password') ||
           error.message.includes('credentials'))) {
        throw new Error('Database authentication failed. Please check your database credentials.');
      }
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Get a specific document by ID
   */
  async getDocumentById(id: string, userId?: string): Promise<Document | null> {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          uploadedByUser: true,
          documentUnit: true,
        }
      });

      if (!document) {
        return null;
      }

      // Check if user has access to the document
      if (userId) {
        const user = await this.findUserById(userId);

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
        tags: Array.isArray(document.tags) ?
          (document.tags as any[]).map(tag => String(tag)) :
          (typeof document.tags === 'object' && document.tags !== null ?
            Object.values(document.tags).map(tag => String(tag)) : []),
        unitId: document.unitId || undefined, // Convert null to undefined
        versionNotes: document.versionNotes || undefined, // Convert null to undefined
        downloadsCount: document.downloadsCount || 0, // Convert null to 0
        viewsCount: document.viewsCount || 0, // Convert null to 0
        uploadedBy: document.uploadedByUser?.name || document.uploadedBy,
        unit: document.documentUnit ? {
          id: document.documentUnit.id,
          name: document.documentUnit.name,
          code: document.documentUnit.code,
          description: document.documentUnit.description || undefined, // Convert null to undefined
          createdAt: document.documentUnit.createdAt,
          updatedAt: document.documentUnit.updatedAt,
        } : undefined,
        uploadedAt: new Date(document.uploadedAt),
        createdAt: new Date(document.createdAt),
        updatedAt: new Date(document.updatedAt),
      };
    } catch (error) {
      console.error('Database connection error in getDocumentById:', error);
      // Check if this is an authentication error
      if (error instanceof Error &&
          (error.message.includes('Authentication failed') ||
           error.message.includes('password') ||
           error.message.includes('credentials'))) {
        throw new Error('Database authentication failed. Please check your database credentials.');
      }
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Create a new document
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
    unitId?: string  // NEW: Unit assignment
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
      
      const user = await this.findUserById(userId);
      
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
          unitId: unitId || undefined, // Use provided unitId or undefined
          status: 'ACTIVE',
        },
        include: {
          uploadedByUser: true,
          documentUnit: true,
        }
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
      
      return {
        ...document,
        tags: Array.isArray(document.tags) ?
          (document.tags as any[]).map(tag => String(tag)) :
          (typeof document.tags === 'object' && document.tags !== null ?
            Object.values(document.tags).map(tag => String(tag)) : []),
        unitId: document.unitId || undefined, // Convert null to undefined
        versionNotes: document.versionNotes || undefined, // Convert null to undefined
        downloadsCount: document.downloadsCount || 0, // Convert null to 0
        viewsCount: document.viewsCount || 0, // Convert null to 0
        uploadedBy: document.uploadedByUser?.name || document.uploadedBy,
        unit: document.documentUnit ? {
          id: document.documentUnit.id,
          name: document.documentUnit.name,
          code: document.documentUnit.code,
          description: document.documentUnit.description || undefined, // Convert null to undefined
          createdAt: document.documentUnit.createdAt,
          updatedAt: document.documentUnit.updatedAt,
        } : undefined,
        uploadedAt: new Date(document.uploadedAt),
        createdAt: new Date(document.createdAt),
        updatedAt: new Date(document.updatedAt),
      };
    } catch (error) {
      console.error('Database connection error in createDocument:', error);
      // Check if this is an authentication error
      if (error instanceof Error &&
          (error.message.includes('Authentication failed') ||
           error.message.includes('password') ||
           error.message.includes('credentials'))) {
        throw new Error('Database authentication failed. Please check your database credentials.');
      }
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Update a document
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
        user = await this.findUserById(userId);

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
          ...(unitId !== undefined && { unitId }),
          updatedAt: new Date(),
        },
        include: {
          uploadedByUser: true,
          documentUnit: true,
        }
      });

      return {
        ...updatedDocument,
        tags: Array.isArray(updatedDocument.tags) ?
          (updatedDocument.tags as any[]).map(tag => String(tag)) :
          (typeof updatedDocument.tags === 'object' && updatedDocument.tags !== null ?
            Object.values(updatedDocument.tags).map(tag => String(tag)) : []),
        unitId: updatedDocument.unitId || undefined, // Convert null to undefined
        versionNotes: updatedDocument.versionNotes || undefined, // Convert null to undefined
        downloadsCount: updatedDocument.downloadsCount || 0, // Convert null to 0
        viewsCount: updatedDocument.viewsCount || 0, // Convert null to 0
        uploadedBy: updatedDocument.uploadedByUser?.name || updatedDocument.uploadedBy,
        unit: updatedDocument.documentUnit ? {
          id: updatedDocument.documentUnit.id,
          name: updatedDocument.documentUnit.name,
          code: updatedDocument.documentUnit.code,
          description: updatedDocument.documentUnit.description || undefined, // Convert null to undefined
          createdAt: updatedDocument.documentUnit.createdAt,
          updatedAt: updatedDocument.documentUnit.updatedAt,
        } : undefined,
        uploadedAt: new Date(updatedDocument.uploadedAt),
        createdAt: new Date(updatedDocument.createdAt),
        updatedAt: new Date(updatedDocument.updatedAt),
      };
    } catch (error) {
      console.error('Database connection error in updateDocument:', error);
      // Check if this is an authentication error
      if (error instanceof Error &&
          (error.message.includes('Authentication failed') ||
           error.message.includes('password') ||
           error.message.includes('credentials'))) {
        throw new Error('Database authentication failed. Please check your database credentials.');
      }
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string, userId: string): Promise<boolean> {
    try {
      const document = await prisma.document.findUnique({
        where: { id },
      });
  
      if (!document) {
        return false;
      }
  
      const user = await this.findUserById(userId);
  
      if (!user) {
        throw new Error('User not found');
      }
  
      // Check if user has permission to delete the document
      const permission = await prisma.documentPermission.findFirst({
        where: {
          documentId: id,
          userId: user.id, // Use the database user ID
          permission: 'ADMIN',
        },
      });
  
      if (!permission && user.role !== 'ADMIN' && document.uploadedById !== user.id) {
        throw new Error('User does not have permission to delete this document');
      }
  
      // Delete the file from storage before removing the database record
      try {
        const fileName = document.fileUrl.split('/').pop(); // Extract filename from URL
        if (fileName) {
          const fileDeleted = await fileStorageService.deleteFile(fileName);
          if (!fileDeleted) {
            console.warn(`Failed to delete file ${fileName} from storage, but continuing with database deletion`);
          }
        } else {
          console.warn(`Could not extract filename from URL: ${document.fileUrl}`);
        }
      } catch (fileError) {
        console.error('Error deleting file from storage:', fileError);
        // Continue with database deletion even if file deletion fails to avoid orphaned records
      }
  
      // Delete the document from the database
      await prisma.document.delete({
        where: { id },
      });
  
      return true;
    } catch (error) {
      console.error('Database connection error in deleteDocument:', error);
      // Check if this is an authentication error
      if (error instanceof Error &&
          (error.message.includes('Authentication failed') ||
           error.message.includes('password') ||
           error.message.includes('credentials'))) {
        throw new Error('Database authentication failed. Please check your database credentials.');
      }
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Get document permissions
   */
  async getDocumentPermissions(documentId: string, userId: string): Promise<DocumentPermission[]> {
    try {
      const user = await this.findUserById(userId);
  
      if (!user) {
        throw new Error('User not found');
      }
  
      // Check if user has admin permission for the document
      const adminPermission = await prisma.documentPermission.findFirst({
        where: {
          documentId,
          userId: user.id, // Use the database user ID
          permission: 'ADMIN',
        },
      });
  
      if (!adminPermission && user.role !== 'ADMIN') {
        throw new Error('User does not have permission to view document permissions');
      }
  
      const permissions = await prisma.documentPermission.findMany({
        where: { documentId },
      });
  
      return permissions.map((perm: any) => ({
        ...perm,
        createdAt: new Date(perm.createdAt),
      }));
    } catch (error) {
      console.error('Database connection error in getDocumentPermissions:', error);
      // Check if this is an authentication error
      if (error instanceof Error &&
          (error.message.includes('Authentication failed') ||
           error.message.includes('password') ||
           error.message.includes('credentials'))) {
        throw new Error('Database authentication failed. Please check your database credentials.');
      }
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Add or update document permission
   */
  async setDocumentPermission(
    documentId: string,
    userId: string,
    targetUserId: string,
    permission: 'READ' | 'WRITE' | 'ADMIN'
  ): Promise<DocumentPermission> {
    try {
      // Find the requesting user
      const user = await this.findUserById(userId);
  
      if (!user) {
        throw new Error('Requesting user not found');
      }
  
      // Check if the requesting user has admin permission for the document
      const adminPermission = await prisma.documentPermission.findFirst({
        where: {
          documentId,
          userId: user.id, // Use the database user ID
          permission: 'ADMIN',
        },
      });
  
      if (!adminPermission && user.role !== 'ADMIN') {
        throw new Error('User does not have permission to manage document permissions');
      }
  
      // Find the target user
      const targetUser = await this.findUserById(targetUserId);
  
      if (!targetUser) {
        throw new Error('Target user does not exist');
      }
  
      // Create or update the permission
      const permissionRecord = await prisma.documentPermission.upsert({
        where: {
          documentId_userId: {
            documentId,
            userId: targetUser.id, // Use the target user's database ID
          },
        },
        update: {
          permission,
        },
        create: {
          documentId,
          userId: targetUser.id, // Use the target user's database ID
          permission,
        },
      });
  
      return {
        ...permissionRecord,
        createdAt: new Date(permissionRecord.createdAt),
      };
    } catch (error) {
      console.error('Database connection error in setDocumentPermission:', error);
      // Check if this is an authentication error
      if (error instanceof Error &&
          (error.message.includes('Authentication failed') ||
           error.message.includes('password') ||
           error.message.includes('credentials'))) {
        throw new Error('Database authentication failed. Please check your database credentials.');
      }
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Remove document permission
   */
  async removeDocumentPermission(
    documentId: string,
    userId: string,
    targetUserId: string
  ): Promise<boolean> {
    try {
      // Find the requesting user
      const requestingUser = await this.findUserById(userId);

      if (!requestingUser) {
        throw new Error('Requesting user not found');
      }

      // Check if the requesting user has admin permission for the document
      const adminPermission = await prisma.documentPermission.findFirst({
        where: {
          documentId,
          userId: requestingUser.id, // Use the database user ID
          permission: 'ADMIN',
        },
      });

      if (!adminPermission && requestingUser.role !== 'ADMIN') {
        throw new Error('User does not have permission to manage document permissions');
      }

      // Find the target user
      const targetUser = await this.findUserById(targetUserId);

      if (!targetUser) {
        throw new Error('Target user does not exist');
      }

      await prisma.documentPermission.delete({
        where: {
          documentId_userId: {
            documentId,
            userId: targetUser.id, // Use the target user's database ID
          },
        },
      });

      return true;
    } catch (error) {
      console.error('Database connection error in removeDocumentPermission:', error);
      // Check if this is an authentication error
      if (error instanceof Error &&
          (error.message.includes('Authentication failed') ||
           error.message.includes('password') ||
           error.message.includes('credentials'))) {
        throw new Error('Database authentication failed. Please check your database credentials.');
      }
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Record document download
   */
  async recordDownload(documentId: string, userId: string): Promise<void> {
    try {
      const user = await this.findUserById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      await prisma.documentDownload.create({
        data: {
          documentId,
          userId: user.id, // Use the database user ID
        },
      });

      // Increment download count
      await prisma.document.update({
        where: { id: documentId },
        data: {
          downloadsCount: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.error('Database connection error in recordDownload:', error);
      // Check if this is an authentication error
      if (error instanceof Error &&
          (error.message.includes('Authentication failed') ||
           error.message.includes('password') ||
           error.message.includes('credentials'))) {
        throw new Error('Database authentication failed. Please check your database credentials.');
      }
      throw error; // Re-throw to be handled by the calling function
    }
 }

  /**
   * Record document view
   */
  async recordView(documentId: string, userId: string): Promise<void> {
    try {
      const user = await this.findUserById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has already viewed the document recently to avoid inflating stats
      const recentView = await prisma.documentView.findFirst({
        where: {
          documentId,
          userId: user.id, // Use the database user ID
          viewedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
          },
        },
      });

      if (!recentView) {
        await prisma.documentView.create({
          data: {
            documentId,
            userId: user.id, // Use the database user ID
          },
        });

        // Increment view count
        await prisma.document.update({
          where: { id: documentId },
          data: {
            viewsCount: {
              increment: 1,
            },
          },
        });
      }
    } catch (error) {
      console.error('Database connection error in recordView:', error);
      // Check if this is an authentication error
      if (error instanceof Error &&
          (error.message.includes('Authentication failed') ||
           error.message.includes('password') ||
           error.message.includes('credentials'))) {
        throw new Error('Database authentication failed. Please check your database credentials.');
      }
      throw error; // Re-throw to be handled by the calling function
    }
 }

  /**
   * Get document comments
   */
  async getDocumentComments(
    documentId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ comments: DocumentComment[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [comments, total] = await Promise.all([
        prisma.documentComment.findMany({
          where: { documentId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: true,
          }
        }),
        prisma.documentComment.count({ where: { documentId } }),
      ]);

      return {
        comments: comments.map((comment: any) => ({
          ...comment,
          parentCommentId: comment.parentCommentId ?? undefined, // Convert null to undefined
          createdAt: new Date(comment.createdAt),
          updatedAt: new Date(comment.updatedAt),
        })),
        total,
      };
    } catch (error) {
      console.error('Database connection error in getDocumentComments:', error);
      // Check if this is an authentication error
      if (error instanceof Error &&
          (error.message.includes('Authentication failed') ||
           error.message.includes('password') ||
           error.message.includes('credentials'))) {
        throw new Error('Database authentication failed. Please check your database credentials.');
      }
      throw error; // Re-throw to be handled by the calling function
    }
  }

  /**
   * Add comment to document
   */
  async addDocumentComment(
    documentId: string,
    userId: string,
    content: string,
    parentCommentId?: string
  ): Promise<DocumentComment> {
    try {
      // Check if document exists
      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (!document) {
        throw new Error('Document not found');
      }

      // Find the user
      const user = await this.findUserById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Check if user has permission to comment (must have read access)
      // Allow admins and faculty to comment on any document
      if (user.role !== 'ADMIN' && user.role !== 'FACULTY') {
        const permission = await prisma.documentPermission.findFirst({
          where: {
            documentId,
            userId: user.id, // Use the database user ID
          },
        });

        if (!permission && document.uploadedById !== user.id) {
          throw new Error('User does not have permission to comment on this document');
        }
      }

      if (parentCommentId) {
        // Verify the parent comment exists and belongs to the same document
        const parentComment = await prisma.documentComment.findUnique({
          where: { id: parentCommentId },
        });

        if (!parentComment || parentComment.documentId !== documentId) {
          throw new Error('Invalid parent comment');
        }
      }

      const comment = await prisma.documentComment.create({
        data: {
          documentId,
          userId: user.id, // Use the database user ID
          content,
          parentCommentId,
        },
      });

      return {
        ...comment,
        parentCommentId: comment.parentCommentId ?? undefined, // Convert null to undefined
        createdAt: new Date(comment.createdAt),
        updatedAt: new Date(comment.updatedAt),
      };
    } catch (error) {
      console.error('Database connection error in addDocumentComment:', error);
      // Check if this is an authentication error
      if (error instanceof Error &&
          (error.message.includes('Authentication failed') ||
           error.message.includes('password') ||
           error.message.includes('credentials'))) {
        throw new Error('Database authentication failed. Please check your database credentials.');
      }
      throw error; // Re-throw to be handled by the calling function
    }
  }
}

export default new DocumentService();