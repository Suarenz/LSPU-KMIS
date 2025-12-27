import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Require authentication
  const authResult = await requireAuth(request);
  if ('status' in authResult) {
    return authResult;
  }
  
  const { user } = authResult;

  try {
    // Get basic stats based on user role
    let totalDocuments = 0;
    let totalUsers = 0;
    let totalDownloads = 0;
    let totalViews = 0;
    let recentActivity: any[] = [];
    let categoryDistribution: any[] = [];
    let popularDocuments: any[] = [];

    if (user.role === 'ADMIN') {
      // Admin can see all stats
      totalDocuments = await prisma.document.count();
      totalUsers = await prisma.user.count();
      
      // Get total downloads and views from all documents
      const documents = await prisma.document.findMany({
        select: {
          downloadsCount: true,
          viewsCount: true,
        },
      });
      
      totalDownloads = documents.reduce((sum, doc) => sum + (doc.downloadsCount || 0), 0);
      totalViews = documents.reduce((sum, doc) => sum + (doc.viewsCount || 0), 0);

      // Get category distribution
      const categories = await prisma.document.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
        orderBy: {
          _count: {
            category: 'desc',
          },
        },
        take: 10,
      });

      categoryDistribution = categories.map((cat) => ({
        category: cat.category || 'Uncategorized',
        count: cat._count.category,
      }));

      // Get popular documents
      const topDocs = await prisma.document.findMany({
        orderBy: {
          downloadsCount: 'desc',
        },
        take: 5,
        select: {
          id: true,
          title: true,
          downloadsCount: true,
          viewsCount: true,
        },
      });

      popularDocuments = topDocs.map(doc => ({
        id: doc.id,
        title: doc.title,
        downloads: doc.downloadsCount,
        views: doc.viewsCount,
      }));

      // Get recent activity (simple version using document createdAt)
      const recentDocs = await prisma.document.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        select: {
          id: true,
          title: true,
          createdAt: true,
          uploadedByUser: {
            select: {
              name: true,
            },
          },
        },
      });

      recentActivity = recentDocs.map((doc) => ({
        id: doc.id,
        description: `New document uploaded: ${doc.title}`,
        user: doc.uploadedByUser?.name || 'Unknown',
        timestamp: doc.createdAt,
        type: 'upload',
      }));

    } else if (user.role === 'FACULTY') {
      // Faculty can see their unit's stats
      const userWithUnit = await prisma.user.findUnique({
        where: { id: user.id },
        select: { unitId: true },
      });

      if (userWithUnit?.unitId) {
        totalDocuments = await prisma.document.count({
          where: { unitId: userWithUnit.unitId },
        });

        const documents = await prisma.document.findMany({
          where: { unitId: userWithUnit.unitId },
          select: {
            downloadsCount: true,
            viewsCount: true,
          },
        });

        totalDownloads = documents.reduce((sum, doc) => sum + (doc.downloadsCount || 0), 0);
        totalViews = documents.reduce((sum, doc) => sum + (doc.viewsCount || 0), 0);

        // Get recent documents from their unit
        const recentDocs = await prisma.document.findMany({
          where: { unitId: userWithUnit.unitId },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          select: {
            id: true,
            title: true,
            createdAt: true,
            uploadedByUser: {
              select: {
                name: true,
              },
            },
          },
        });

        recentActivity = recentDocs.map((doc) => ({
          id: doc.id,
          description: `New document uploaded: ${doc.title}`,
          user: doc.uploadedByUser?.name || 'Unknown',
          timestamp: doc.createdAt,
          type: 'upload',
        }));
      }

      // Faculty can see total users in system
      totalUsers = await prisma.user.count();
    } else {
      // Students and external users see limited stats
      totalDocuments = await prisma.document.count({
        where: {
          status: 'ACTIVE',
        },
      });

      // Get recent active documents
      const recentDocs = await prisma.document.findMany({
        where: {
          status: 'ACTIVE',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
          uploadedByUser: {
            select: {
              name: true,
            },
          },
        },
      });

      recentActivity = recentDocs.map((doc) => ({
        id: doc.id,
        description: `New document available: ${doc.title}`,
        user: doc.uploadedByUser?.name || 'Unknown',
        timestamp: doc.createdAt,
        type: 'upload',
      }));
    }

    return NextResponse.json({
      totalDocuments,
      totalUsers,
      totalDownloads,
      totalViews,
      recentActivity,
      popularDocuments,
      categoryDistribution,
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
