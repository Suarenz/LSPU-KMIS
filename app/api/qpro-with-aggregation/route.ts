import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth-middleware';
import { qproAnalysisService } from '@/lib/services/qpro-analysis-service';
import { targetAggregationService } from '@/lib/services/target-aggregation-service';
import { strategicPlanService } from '@/lib/services/strategic-plan-service';
import { BlobServiceClient } from '@azure/storage-blob';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Initialize Azure Blob Storage client
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING!
);

/**
 * POST /api/qpro-with-aggregation
 * 
 * Complete QPRO analysis + aggregation workflow
 * Analyzes document AND calculates achievement metrics
 * Returns both insights AND aggregation results for dashboard display
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await requireAuth(request);
    if ('status' in authResult) {
      return authResult;
    }

    const { user } = authResult;
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const documentTitle = formData.get('documentTitle') as string;
    const unitId = formData.get('unitId') as string | null;
    const year = parseInt(formData.get('year') as string) || 2025;
    const quarter = parseInt(formData.get('quarter') as string) || 1;

    // Debug logging
    console.log('[QPRO-WITH-AGGREGATION] Request received:', {
      file: file ? `File: ${file.name}` : 'NO FILE',
      documentTitle: documentTitle ? `Title: ${documentTitle}` : 'NO TITLE',
      unitId,
      year,
      quarter,
    });

    // Validate required fields
    if (!file || !(file instanceof File) || !documentTitle) {
      console.error('[QPRO-WITH-AGGREGATION] Validation failed:', {
        hasFile: !!file,
        isFile: file instanceof File,
        hasDocumentTitle: !!documentTitle,
      });
      return NextResponse.json(
        { error: 'Missing required fields: file, documentTitle' },
        { status: 400 }
      );
    }

    // Validate file type (support both PDF and DOCX)
    if (!file.type || (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      return NextResponse.json({ error: 'Only PDF and DOCX files are allowed' }, { status: 400 });
    }

    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Step 1: Upload file to Azure Blob Storage using user-based organization
    const containerName = 'qpro-files';
    const fileName = `${uuidv4()}_${file.name}`;
    const blobName = `${user.id}/${fileName}`; // User-based path without container prefix
    
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload the file to Azure Blob Storage
    console.log('[QPRO-WITH-AGGREGATION] Uploading file to blob storage:', { containerName, blobName });
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: file.type
      }
    });
    console.log('[QPRO-WITH-AGGREGATION] File uploaded successfully to:', blobName);

    // Step 2: Create Document record in database (required for foreign key)
    const documentId = uuidv4();
    const document = await prisma.document.create({
      data: {
        id: documentId,
        title: documentTitle,
        description: `QPRO document uploaded by ${user.name || user.email}`,
        category: 'QPRO',
        tags: [],
        uploadedBy: user.name || user.email,
        uploadedById: user.id,
        fileUrl: blockBlobClient.url, // Use the Azure Blob URL
        fileName: fileName,
        fileType: file.type,
        fileSize: file.size,
        unitId: unitId || user.unitId || null,
      }
    });
    console.log('[QPRO-WITH-AGGREGATION] Document record created:', documentId);

    // Step 3: Create QPRO analysis with aggregation calculation
    const qproAnalysis = await qproAnalysisService.createQPROAnalysis({
      documentId: document.id,
      documentTitle: document.title,
      documentPath: blobName, // Use the correct blob path without container prefix
      documentType: file.type,
      uploadedById: user.id,
      unitId: unitId || undefined,
      year,
      quarter,
    });

    // Step 4: Get calculated aggregation metrics for dashboard display
    const aggregationMetrics = await getAggregationMetricsForDisplay(
      qproAnalysis.kras as any,
      year,
      quarter
    );

    // Step 5: Build comprehensive response with both insights + metrics
    const response = {
      success: true,
      analysis: {
        id: qproAnalysis.id,
        title: qproAnalysis.documentTitle,
        alignment: qproAnalysis.alignment,
        opportunities: qproAnalysis.opportunities,
        gaps: qproAnalysis.gaps,
        recommendations: qproAnalysis.recommendations,
        achievementScore: qproAnalysis.achievementScore,
        createdAt: qproAnalysis.createdAt,
      },
      kras: qproAnalysis.kras,
      aggregation: {
        metrics: aggregationMetrics.summary,
        byKra: aggregationMetrics.byKra,
        dashboard: {
          totalKRAs: aggregationMetrics.summary.totalKRAs,
          metKRAs: aggregationMetrics.summary.metKRAs,
          missedKRAs: aggregationMetrics.summary.missedKRAs,
          onTrackKRAs: aggregationMetrics.summary.onTrackKRAs,
          overallAchievementPercent: aggregationMetrics.summary.overallAchievementPercent,
        },
      },
      message:
        'QPRO analysis completed with aggregation metrics calculated and dashboard ready for display',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in QPRO with aggregation:', error);
    return NextResponse.json(
      {
        error: 'Failed to process QPRO analysis',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to calculate aggregation metrics for dashboard display
 */
async function getAggregationMetricsForDisplay(
  kras: any[],
  year: number,
  quarter: number
) {
  try {
    const byKra: any[] = [];
    let totalKRAs = 0;
    let metKRAs = 0;
    let missedKRAs = 0;
    let onTrackKRAs = 0;
    let totalAchievement = 0;

    // Process each KRA to calculate aggregation
    // The KRAs already have achievement data from the analysis service
    for (const kra of kras || []) {
      const kraId = kra.kraId || kra.kra_id;
      const kraTitle = kra.kraTitle || kra.kra_title || 'Unknown';
      
      if (!kraId) continue;

      try {
        // Get achievement rate from the KRA summary
        // This is already calculated by the analysis engine
        const achievementRate = kra.achievementRate || 0;
        
        // Get activities for this KRA to sum reported values
        const activities = kra.activities || [];
        const totalReported = activities.reduce((sum: number, act: any) => {
          const reported = typeof act.reported === 'number' ? act.reported : 0;
          return sum + reported;
        }, 0);

        // Get target from first activity or from strategic plan
        let targetValue = 1;
        if (activities.length > 0) {
          // Sum all targets from activities
          targetValue = activities.reduce((sum: number, act: any) => {
            const target = typeof act.target === 'number' ? act.target : 0;
            return sum + target;
          }, 0);
          // If no activities have targets, use 1 as default
          if (targetValue === 0) {
            targetValue = 1;
          }
        }

        // Determine status based on achievement rate
        let status: 'MET' | 'MISSED' | 'ON_TRACK' = 'MISSED';
        if (achievementRate >= 100) {
          status = 'MET';
        } else if (achievementRate >= 80) {
          status = 'ON_TRACK';
        }

        // Create message based on status and metrics
        let message = '';
        if (status === 'MET') {
          message = `Target exceeded with ${achievementRate.toFixed(1)}% achievement (Reported: ${totalReported}, Target: ${targetValue})`;
        } else if (status === 'ON_TRACK') {
          message = `On track with ${achievementRate.toFixed(1)}% achievement (Reported: ${totalReported}, Target: ${targetValue})`;
        } else {
          const gap = targetValue - totalReported;
          message = `Gap of ${gap} units to target (${achievementRate.toFixed(1)}% achievement, Reported: ${totalReported}, Target: ${targetValue})`;
        }

        byKra.push({
          kraId,
          kraTitle,
          reported: totalReported,
          target: targetValue,
          achieved: totalReported,
          achievementPercent: achievementRate,
          status,
          message,
        });

        totalKRAs++;
        totalAchievement += achievementRate;

        switch (status) {
          case 'MET':
            metKRAs++;
            break;
          case 'MISSED':
            missedKRAs++;
            break;
          case 'ON_TRACK':
            onTrackKRAs++;
            break;
        }
      } catch (kraError) {
        console.error(`Error processing KRA ${kraId}:`, kraError);
        // Continue processing other KRAs
      }
    }

    const overallAchievementPercent = totalKRAs > 0 ? totalAchievement / totalKRAs : 0;

    console.log('[AGGREGATION METRICS] Calculation complete:', {
      totalKRAs,
      metKRAs,
      onTrackKRAs,
      missedKRAs,
      overallAchievementPercent: Math.round(overallAchievementPercent * 100) / 100,
    });

    return {
      summary: {
        totalKRAs,
        metKRAs,
        missedKRAs,
        onTrackKRAs,
        overallAchievementPercent: Math.round(overallAchievementPercent * 100) / 100,
        year,
        quarter,
      },
      byKra,
    };
  } catch (error) {
    console.error('Error in getAggregationMetricsForDisplay:', error);
    return {
      summary: {
        totalKRAs: 0,
        metKRAs: 0,
        missedKRAs: 0,
        onTrackKRAs: 0,
        overallAchievementPercent: 0,
        year,
        quarter,
      },
      byKra: [],
    };
  }
}
