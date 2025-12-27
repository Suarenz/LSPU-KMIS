import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Health Check Endpoint
 * Returns system health status without requiring authentication
 */
export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get basic statistics
    const [userCount, docCount, unitCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.document.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
      prisma.unit.count().catch(() => 0),
    ]);

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected',
        storage: process.env.AZURE_STORAGE_CONNECTION_STRING ? 'configured' : 'not configured',
        colivara: process.env.COLIVARA_API_KEY ? 'configured' : 'not configured',
        redis: process.env.UPSTASH_REDIS_REST_URL ? 'configured' : 'not configured',
      },
      statistics: {
        users: userCount,
        documents: docCount,
        units: unitCount,
      },
      uptime: process.uptime(),
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          database: 'disconnected',
        },
      },
      { status: 503 }
    );
  }
}
