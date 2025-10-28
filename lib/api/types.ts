// lib/api/types.ts

export interface Document {
  id: string;
  title: string;
 description: string;
 category: string;
 tags: string[];
  uploadedBy: string;
  uploadedById: string;
  uploadedAt: Date;
 fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadsCount: number;
  viewsCount: number;
  version: number;
  versionNotes?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'PENDING_REVIEW';
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentPermission {
  id: string;
  documentId: string;
  userId: string;
  permission: 'READ' | 'WRITE' | 'ADMIN';
  createdAt: Date;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT' | 'EXTERNAL';
  department?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}