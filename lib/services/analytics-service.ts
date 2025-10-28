import prisma from '@/lib/prisma';
import { AnalyticsData, Activity } from '@/lib/types';

class AnalyticsService {
  /**
   * Get analytics data from the database
   */
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      // Get total documents count
      const totalDocuments = await prisma.document.count({
        where: { status: 'ACTIVE' }
      });

      // Get total users count
      const totalUsers = await prisma.user.count();

      // Get total downloads count
      const totalDownloads = await prisma.documentDownload.count();

      // Get total views count
      const totalViews = await prisma.documentView.count();

      // Get recent activity (last 10 activities) - we'll get document uploads for now
      const recentDocuments = await prisma.document.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          uploadedByUser: true
        }
      });

      // Format recent activity
      const recentActivity: Activity[] = recentDocuments.map((doc, index) => ({
        id: `${index + 1}`,
        type: "upload",
        user: doc.uploadedBy,
        description: `Uploaded "${doc.title}"`,
        timestamp: new Date(doc.createdAt)
      }));

      // Get popular documents (top 5 by download count)
      const popularDocuments = await prisma.document.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { downloadsCount: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          tags: true,
          uploadedBy: true,
          uploadedAt: true,
          fileUrl: true,
          fileType: true,
          fileSize: true,
          downloadsCount: true,
          viewsCount: true,
          version: true,
        }
      });

      // Convert to the expected format for the frontend
      const formattedPopularDocuments = popularDocuments.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        category: doc.category,
        tags: doc.tags,
        uploadedBy: doc.uploadedBy,
        uploadedAt: new Date(doc.uploadedAt),
        fileUrl: doc.fileUrl,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        downloads: doc.downloadsCount || 0,
        views: doc.viewsCount || 0,
        version: doc.version,
      }));

      // Get category distribution using a safer approach
      let categoryDistribution: { category: string; count: number }[] = [];
      try {
        const rawResult = await prisma.$queryRaw<Array<{
          category: string;
          count: bigint;
        }>>`
          SELECT
            category,
            COUNT(*) as count
          FROM Document
          WHERE status = 'ACTIVE'
          GROUP BY category
          ORDER BY count DESC
        `;
        
        categoryDistribution = rawResult.map(cat => ({
          category: cat.category,
          count: Number(cat.count)
        }));
      } catch (error) {
        console.error('Error fetching category distribution:', error);
        // Return empty array if query fails
        categoryDistribution = [];
      }

      return {
        totalDocuments,
        totalUsers,
        totalDownloads,
        totalViews,
        recentActivity,
        popularDocuments: formattedPopularDocuments,
        categoryDistribution
      };
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      
      // Return default values in case of error
      return {
        totalDocuments: 0,
        totalUsers: 0,
        totalDownloads: 0,
        totalViews: 0,
        recentActivity: [],
        popularDocuments: [],
        categoryDistribution: []
      };
    }
 }
}

export default new AnalyticsService();