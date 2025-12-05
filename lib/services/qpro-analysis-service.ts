import { PrismaClient } from '@prisma/client';
import { analysisEngineService } from './analysis-engine-service';
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
}

export class QPROAnalysisService {
  async createQPROAnalysis(input: QPROAnalysisInput): Promise<any> {
    try {
      // Process the document with the analysis engine
      const fileBuffer = await this.getFileBuffer(input.documentPath);
      const analysisResult = await analysisEngineService.processQPRO(fileBuffer, input.documentType);
      
      // Parse the analysis result to extract specific sections
      const {
        alignment,
        opportunities,
        gaps,
        recommendations,
        kras
      } = this.parseAnalysisResult(analysisResult);
      
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
          kras: kras as any, // Type assertion for Prisma
          uploadedById: input.uploadedById,
        },
        include: {
          document: true,
          user: true
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

  private parseAnalysisResult(analysis: string) {
    // Simple parsing of the analysis result to extract sections
    // This is a basic implementation - in reality, you'd want more sophisticated parsing
    
    const alignmentMatch = analysis.match(/1\.?\s*Identifies alignment.*?(?=\n\d\.?|$)/s);
    const opportunitiesMatch = analysis.match(/2\.?\s*Highlights potential.*?(?=\n\d\.?|$)/s);
    const gapsMatch = analysis.match(/3\.?\s*Points out.*?(?=\n\d\.?|$)/s);
    const recommendationsMatch = analysis.match(/4\.?\s*Provides actionable.*?(?=\n\d\.?|$)/s);
    
    return {
      alignment: alignmentMatch ? alignmentMatch[0].replace(/\d\.?\s*/, '').trim() : null,
      opportunities: opportunitiesMatch ? opportunitiesMatch[0].replace(/\d\.?\s*/, '').trim() : null,
      gaps: gapsMatch ? gapsMatch[0].replace(/\d\.?\s*/, '').trim() : null,
      recommendations: recommendationsMatch ? recommendationsMatch[0].replace(/\d\.?\s*/, '').trim() : null,
      kras: [] // Extract KRA information if available in the analysis
    };
  }
}

export const qproAnalysisService = new QPROAnalysisService();