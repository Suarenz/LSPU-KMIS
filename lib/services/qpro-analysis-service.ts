import { PrismaClient } from '@prisma/client';
import { analysisEngineService, QPROAnalysisOutput } from './analysis-engine-service';
import { BlobServiceClient } from '@azure/storage-blob';
import { targetAggregationService } from './target-aggregation-service';
import { strategicPlanService } from './strategic-plan-service';

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
  /**
   * Validate and fix KRA assignments based on activity type matching rules
   * Post-processes LLM output to enforce strict type-to-KRA mapping
   */
  private validateAndFixActivityKRAMatches(activities: any[], strategicPlan: any): any[] {
    const correctedActivities = activities.map(activity => {
      const activityName = activity.name.toLowerCase();
      const currentKraId = activity.kraId;
      
      // Activity type detection based on keywords
      const isTraining = /train|seminar|workshop|course|capacity|upskill|certification|program/i.test(activityName);
      const isCurriculum = /curriculum|course content|syllabus|learning material|instructional/i.test(activityName);
      const isDigitalImplementation = /system|platform|portal|infrastructure|implement|deploy|application|software/i.test(activityName) && !/training|workshop|seminar/i.test(activityName);
      const isResearch = /research|study|publication|paper|journal/i.test(activityName);
      
      let expectedKraTypes: string[] = [];
      
      // Determine expected KRA type based on activity type
      if (isTraining) {
        expectedKraTypes = ['KRA 13', 'KRA 11']; // HR Development
      } else if (isCurriculum) {
        expectedKraTypes = ['KRA 1']; // Curriculum Development
      } else if (isDigitalImplementation) {
        expectedKraTypes = ['KRA 17']; // Digital Transformation
      } else if (isResearch) {
        expectedKraTypes = ['KRA 3', 'KRA 4', 'KRA 5']; // Research KRAs
      }
      
      // Check if current KRA matches expected type
      const isCorrectType = expectedKraTypes.length === 0 || expectedKraTypes.includes(currentKraId);
      
      if (!isCorrectType && expectedKraTypes.length > 0) {
        console.log(`[QPRO VALIDATION] Activity "${activity.name}" was matched to ${currentKraId} but expected type is ${expectedKraTypes.join(' or ')}`);
        console.log(`  Activity type detected: training=${isTraining}, curriculum=${isCurriculum}, digital=${isDigitalImplementation}, research=${isResearch}`);
        
        // Reassign to correct KRA using keyword matching
        const strategicPlanKras = (strategicPlan && strategicPlan.kras) || [];
        const targetKra = strategicPlanKras.find((kra: any) => expectedKraTypes.includes(kra.kra_id));
        
        if (targetKra && targetKra.initiatives && targetKra.initiatives.length > 0) {
          // Find best-fit initiative/KPI within the target KRA
          let bestInitiative = targetKra.initiatives[0];
          let bestScore = 0;
          
          targetKra.initiatives.forEach((initiative: any) => {
            const kraText = [
              targetKra.kra_title,
              initiative.key_performance_indicator?.outputs || '',
              Array.isArray(initiative.strategies) ? initiative.strategies.join(' ') : '',
              Array.isArray(initiative.programs_activities) ? initiative.programs_activities.join(' ') : ''
            ].join(' ').toLowerCase();
            
            // Calculate keyword match score
            const keywords = activityName.split(/\s+/);
            const score = keywords.filter(kw => kw.length > 3 && kraText.includes(kw)).length;
            
            if (score > bestScore) {
              bestScore = score;
              bestInitiative = initiative;
            }
          });
          
          // Extract target from timeline_data
          let targetValue = 1;
          if (bestInitiative.targets && bestInitiative.targets.timeline_data) {
            const timelineData = bestInitiative.targets.timeline_data.find((t: any) => t.year === 2025);
            if (timelineData) {
              targetValue = typeof timelineData.target_value === 'number' ? timelineData.target_value : 1;
            }
          }
          
          // Recalculate confidence based on keyword matching
          const newConfidence = Math.min(0.95, Math.max(0.5, bestScore / 5));
          
          console.log(`  ✓ Reassigned to ${targetKra.kra_id} (${bestInitiative.id}) with target=${targetValue}, confidence=${newConfidence.toFixed(2)}`);
          
          return {
            ...activity,
            kraId: targetKra.kra_id,
            initiativeId: bestInitiative.id,
            target: targetValue,
            confidence: newConfidence,
            achievement: (activity.reported / targetValue) * 100,
            status: ((activity.reported / targetValue) * 100) >= 100 ? 'MET' : 'MISSED'
          };
        }
      }
      
      return activity;
    });
    
    return correctedActivities;
  }

  async createQPROAnalysis(input: QPROAnalysisInput): Promise<any> {
    try {
      // Process the document with the analysis engine
      const fileBuffer = await this.getFileBuffer(input.documentPath);
      const analysisOutput: QPROAnalysisOutput = await analysisEngineService.processQPRO(
        fileBuffer, 
        input.documentType,
        input.unitId || undefined
      );
      
      // Load strategic plan for validation
      const strategicPlan = await this.loadStrategicPlan();
      
      // Post-LLM validation: fix any KRA assignments that violate type rules
      let validatedActivities = analysisOutput.activities || [];
      if (strategicPlan && strategicPlan.kras) {
        validatedActivities = this.validateAndFixActivityKRAMatches(validatedActivities, strategicPlan);
      }
      
      // Rebuild KRA summaries with corrected activities
      const correctedKras = (analysisOutput.kras || []).map((kra: any) => ({
        ...kra,
        activities: validatedActivities.filter((act: any) => act.kraId === kra.kraId)
      }));
      
      // Extract structured data from validated output
      const {
        alignment,
        opportunities,
        gaps,
        recommendations,
        overallAchievement
      } = analysisOutput;
      
      // Create full analysis result text for reference
      const analysisResult = this.formatAnalysisForStorage({
        ...analysisOutput,
        activities: validatedActivities,
        kras: correctedKras
      });
      
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
          kras: correctedKras as any,
          activities: validatedActivities as any,
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

      // Calculate and store aggregation metrics for each KRA/initiative
      try {
        for (const kra of correctedKras) {
          if (kra.kraId && kra.initiativeId) {
            const kraActivities = validatedActivities.filter((act: any) => act.kraId === kra.kraId);
            
            // Get target value from strategic plan
            const target = await strategicPlanService.getInitiative(kra.kraId, kra.initiativeId);
            const targetType = target?.targets?.type || 'count';
            
            // Calculate total reported value
            const totalReported = kraActivities.reduce((sum: number, act: any) => {
              const reported = typeof act.reported === 'number' ? act.reported : 0;
              return sum + reported;
            }, 0);
            
            const targetValue = target?.targets?.timeline_data?.find((t: any) => t.year === (input.year || 2025))?.target_value || 1;
            
            // Calculate aggregation metrics
            const metrics = await targetAggregationService.calculateAggregation(
              kra.kraId,
              kra.initiativeId,
              input.year || 2025,
              totalReported,
              targetType
            );
            
            // Store aggregation record
            if (metrics && metrics.achieved !== undefined) {
              const participatingUnits = input.unitId ? [input.unitId] : [];
              
              await prisma.kRAggregation.upsert({
                where: {
                  unique_aggregation: {
                    year: input.year || 2025,
                    quarter: input.quarter || 1,
                    kra_id: kra.kraId,
                    initiative_id: kra.initiativeId
                  }
                },
                create: {
                  year: input.year || 2025,
                  quarter: input.quarter || 1,
                  kra_id: kra.kraId,
                  kra_title: kra.kraTitle || 'Unknown',
                  initiative_id: kra.initiativeId,
                  total_reported: totalReported,
                  target_value: targetValue,
                  achievement_percent: metrics.achievementPercent,
                  submission_count: 1,
                  participating_units: participatingUnits,
                  status: metrics.status as any,
                  updated_by: input.uploadedById
                },
                update: {
                  total_reported: {
                    increment: totalReported
                  },
                  submission_count: {
                    increment: 1
                  },
                  achievement_percent: metrics.achievementPercent,
                  status: metrics.status as any,
                  last_updated: new Date(),
                  updated_by: input.uploadedById,
                  participating_units: participatingUnits
                }
              });
              
              // Create aggregation activity record linking QPRO to aggregation
              const aggregation = await prisma.kRAggregation.findUnique({
                where: {
                  unique_aggregation: {
                    year: input.year || 2025,
                    quarter: input.quarter || 1,
                    kra_id: kra.kraId,
                    initiative_id: kra.initiativeId
                  }
                }
              });
              
              if (aggregation) {
                for (const activity of kraActivities) {
                  await prisma.aggregationActivity.create({
                    data: {
                      aggregation_id: aggregation.id,
                      qpro_analysis_id: qproAnalysis.id,
                      unit_id: input.unitId,
                      activity_name: activity.name || 'Unknown Activity',
                      reported: activity.reported || 0,
                      target: activity.target || 0,
                      achievement: activity.achievement || 0,
                      activity_type: activity.type || 'UNKNOWN',
                      initiative_id: kra.initiativeId
                    }
                  });
                }
              }
            }
          }
        }
      } catch (aggregationError) {
        console.error('Error calculating aggregation metrics:', aggregationError);
        // Log but don't throw - aggregation errors shouldn't prevent QPRO analysis from being saved
      }

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

  /**
   * Load strategic plan JSON for validation
   */
  private async loadStrategicPlan(): Promise<any> {
    try {
      // Import strategic plan JSON (works in Node.js context)
      const strategicPlan = await import('@/strategic_plan.json').then(m => m.default).catch(() => null);
      return strategicPlan;
    } catch (error) {
      console.error('Error loading strategic plan:', error);
      return null;
    }
  }
}

export const qproAnalysisService = new QPROAnalysisService();