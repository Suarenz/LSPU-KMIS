import prisma from '@/lib/prisma';
import { Document, DocumentPermission, DocumentComment } from '@/lib/api/types';

class DocumentService {
  /**
   * Get all documents with optional filtering and pagination
   */
 async getDocuments(
   page: number = 1,
   limit: number = 10,
   category?: string,
   search?: string,
   userId?: string
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

   // Add search filter if provided
   if (search) {
     const searchCondition = {
       OR: [
         { title: { contains: search, mode: 'insensitive' } },
         { description: { contains: search, mode: 'insensitive' } },
         { tags: { hasSome: [search] } },
       ]
     };
     
     // If we already have conditions (like category), wrap everything in AND
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
         orderBy: { uploadedAt: 'desc' },
       }),
       prisma.document.count({ where: whereClause }),
     ]);

     return {
       documents: documents.map((doc: any) => ({
         ...doc,
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
    userId: string
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
          tags,
          uploadedBy: user.name,
          uploadedById: user.id, // Use the database user ID, not the Supabase auth ID
          fileUrl,
          fileName,
          fileType,
          fileSize,
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

      return {
        ...document,
        versionNotes: document.versionNotes ?? undefined, // Convert null to undefined
        uploadedAt: new Date(document.uploadedAt),
        createdAt: new Date(document.createdAt),
        updatedAt: new Date(document.updatedAt),
      };
    } catch (error) {
      console.error('Database connection error in createDocument:', error);
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

     const updatedDocument = await prisma.document.update({
       where: { id },
       data: {
         ...(title && { title }),
         ...(description && { description }),
         ...(category && { category }),
         ...(tags && { tags }),
         updatedAt: new Date(),
       },
     });

     return {
       ...updatedDocument,
       versionNotes: updatedDocument.versionNotes ?? undefined, // Convert null to undefined
       uploadedAt: new Date(updatedDocument.uploadedAt),
       createdAt: new Date(updatedDocument.createdAt),
       updatedAt: new Date(updatedDocument.updatedAt),
     };
   } catch (error) {
     console.error('Database connection error in updateDocument:', error);
     throw error; // Re-throw to be handled by the calling function
   }
 }

 /**
   * Delete a document
   */
  async deleteDocument(id: string, userId: string): Promise<boolean> {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return false;
    }

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

    await prisma.document.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Get document permissions
   */
  async getDocumentPermissions(documentId: string, userId: string): Promise<DocumentPermission[]> {
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
    // First, try to find the requesting user by the provided userId (which might be the database ID)
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

    // For target user, also check both ID types
    let targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    // If not found, try to find target user by supabase_auth_id
    if (!targetUser) {
      targetUser = await prisma.user.findUnique({
        where: { supabase_auth_id: targetUserId },
      });
    }

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
  }

 /**
   * Remove document permission
   */
  async removeDocumentPermission(
    documentId: string,
    userId: string,
    targetUserId: string
  ): Promise<boolean> {
    // First, try to find the requesting user by the provided userId (which might be the database ID)
    let requestingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If not found, try to find user by supabase_auth_id
    if (!requestingUser) {
      requestingUser = await prisma.user.findUnique({
        where: { supabase_auth_id: userId },
      });
    }

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

    // For target user, also check both ID types
    let targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    // If not found, try to find target user by supabase_auth_id
    if (!targetUser) {
      targetUser = await prisma.user.findUnique({
        where: { supabase_auth_id: targetUserId },
      });
    }

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
  }

 /**
   * Record document download
   */
  async recordDownload(documentId: string, userId: string): Promise<void> {
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
  }

 /**
   * Record document view
   */
  async recordView(documentId: string, userId: string): Promise<void> {
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

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has already viewed the document recently to avoid inflating stats
    const recentView = await prisma.documentView.findFirst({
      where: {
        documentId,
        userId: user.id, // Use the database user ID
        viewedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours (corrected from 100 to 1000)
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
 }

  /**
   * Get document comments
   */
  async getDocumentComments(
    documentId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ comments: DocumentComment[]; total: number }> {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.documentComment.findMany({
        where: { documentId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
    // Check if user has access to the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

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
  }
}

export default new DocumentService();