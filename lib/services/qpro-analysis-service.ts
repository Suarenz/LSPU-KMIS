import { PrismaClient } from '@prisma/client';
import { analysisEngineService, QPROAnalysisOutput } from './analysis-engine-service';
import { BlobServiceClient } from '@azure/storage-blob';

const prisma = new PrismaClient();

// Initialize Azure Blob Storage client
const blobServiceClient = BlobServiceClient.fromConnectionString(
 process.env.AZURE_STORAGE_CONNECTION_STRING!
);

interface QPROAnalysisInput {
  documentId: string;
  documentTitle: string;
  documentPath: string;
  documentType: string;
  uploadedById: string;
  unitId?: string | null;
  year?: number;
  quarter?: number;
}

interface QPROAnalysesFilter {
  unitId?: string;
  year?: number;
  quarter?: number;
  userId?: string;
  limit?: number;
}

export class QPROAnalysisService {
  async createQPROAnalysis(input: QPROAnalysisInput): Promise<any> {
    try {
      // Process the document with the analysis engine
      const fileBuffer = await this.getFileBuffer(input.documentPath);
      const analysisOutput: QPROAnalysisOutput = await analysisEngineService.processQPRO(
        fileBuffer, 
        input.documentType,
        input.unitId || undefined
      );
      
      // Extract structured data from validated output
      const {
        alignment,
        opportunities,
        gaps,
        recommendations,
        kras,
        activities,
        overallAchievement
      } = analysisOutput;
      
      // Create full analysis result text for reference
      const analysisResult = this.formatAnalysisForStorage(analysisOutput);
      
      // Create the QPRO analysis record in the database
      const qproAnalysis = await prisma.qPROAnalysis.create({
        data: {
          documentId: input.documentId,
          documentTitle: input.documentTitle,
          documentPath: input.documentPath,
          documentType: input.documentType,
          analysisResult,
          alignment,
          opportunities,
          gaps,
          recommendations,
          kras: kras as any,
          activities: activities as any,
          achievementScore: overallAchievement,
          uploadedById: input.uploadedById,
          unitId: input.unitId,
          year: input.year || 2025,
          quarter: input.quarter || 1,
        },
        include: {
          document: true,
          user: true,
          unit: true
        }
      });
      
      return qproAnalysis;
    } catch (error) {
      console.error('Error creating QPRO analysis:', error);
      throw error;
    }
  }

  async getQPROAnalysisById(id: string) {
    try {
      const analysis = await prisma.qPROAnalysis.findUnique({
        where: { id },
        include: {
          document: {
            select: {
              title: true,
              fileName: true,
              fileType: true,
              fileUrl: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });
      
      return analysis;
    } catch (error) {
      console.error('Error fetching QPRO analysis:', error);
      throw error;
    }
  }

  async getQPROAnalysesByUser(userId: string) {
    try {
      const analyses = await prisma.qPROAnalysis.findMany({
        where: { uploadedById: userId },
        orderBy: { createdAt: 'desc' },
        include: {
          document: {
            select: {
              title: true,
              fileName: true
            }
          }
        }
      });
      
      return analyses;
    } catch (error) {
      console.error('Error fetching QPRO analyses for user:', error);
      throw error;
    }
  }

  async getQPROAnalysesByDocument(documentId: string) {
    try {
      const analyses = await prisma.qPROAnalysis.findMany({
        where: { documentId },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true
            }
          }
        }
      });
      
      return analyses;
    } catch (error) {
      console.error('Error fetching QPRO analyses for document:', error);
      throw error;
    }
  }

  async getQPROAnalyses(filter: QPROAnalysesFilter) {
    try {
      const whereClause: any = {};
      
      if (filter.unitId) {
        whereClause.unitId = filter.unitId;
      }
      
      if (filter.year !== undefined) {
        whereClause.year = filter.year;
      }
      
      if (filter.quarter !== undefined) {
        whereClause.quarter = filter.quarter;
      }
      
      if (filter.userId) {
        whereClause.uploadedById = filter.userId;
      }
      
      const analyses = await prisma.qPROAnalysis.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        take: filter.limit,
        include: {
          document: {
            select: {
              title: true,
              fileName: true,
              fileType: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          },
          unit: {
            select: {
              name: true,
              code: true
            }
          }
        }
      });
      
      return analyses;
    } catch (error) {
      console.error('Error fetching QPRO analyses:', error);
      throw error;
    }
  }

  private async getFileBuffer(blobPath: string): Promise<Buffer> {
    try {
      // Get the blob from the QPRO-specific container
      const containerName = 'qpro-files';
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(blobPath);
      
      // Download the blob content
      const downloadResponse = await blobClient.download();
      
      // Read the stream into a buffer
      const buffer = await this.streamToBuffer(downloadResponse.readableStreamBody!);
      
      return buffer;
    } catch (error) {
      console.error(`Error downloading blob from path ${blobPath}:`, error);
      throw error;
    }
  }

 private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      
      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      stream.on('error', reject);
      
      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }

  /**
   * Format structured analysis output into readable text for storage
   */
  private formatAnalysisForStorage(analysis: QPROAnalysisOutput): string {
    const sections = [
      '# QPRO Analysis Report',
      '',
      `## Overall Achievement Score: ${analysis.overallAchievement.toFixed(2)}%`,
      '',
      '## Strategic Alignment',
      analysis.alignment,
      '',
      '## Opportunities',
      analysis.opportunities,
      '',
      '## Gaps Identified',
      analysis.gaps,
      '',
      '## Recommendations',
      analysis.recommendations,
      '',
      '## KRA Summary',
      ...analysis.kras.map(kra => `
### ${kra.kraId}: ${kra.kraTitle}
**Achievement Rate:** ${kra.achievementRate.toFixed(2)}%
**Activities:** ${kra.activities.length}
**Alignment:** ${kra.strategicAlignment}
`),
      '',
      '## Detailed Activities',
      ...analysis.activities.map(activity => `
- **${activity.name}**
  - KRA: ${activity.kraId}
  - Target: ${activity.target}, Reported: ${activity.reported}
  - Achievement: ${activity.achievement.toFixed(2)}%
  - Confidence: ${(activity.confidence * 100).toFixed(0)}%
  - Unit: ${activity.unit || 'N/A'}
`)
    ];
    
    return sections.join('\n');
  }
}

export const qproAnalysisService = new QPROAnalysisService();