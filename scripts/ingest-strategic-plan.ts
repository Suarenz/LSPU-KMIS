import fs from 'fs/promises';
import path from 'path';
import { embeddingService } from '../lib/services/embedding-service.js';
import { vectorService } from '../lib/services/vector-service.js';

interface StrategicPlan {
  strategic_plan_meta: {
    university: string;
    period: string;
    vision: string;
    total_kras: number;
  };
  kras: KRA[];
}

interface KRA {
  kra_id: string;
  kra_title: string;
  guiding_principle: string;
  initiatives: Initiative[];
}

interface Initiative {
  id: string;
  key_performance_indicator: {
    outputs: string;
    outcomes: string | string[];
  };
  strategies: string[];
  programs_activities: string[];
  responsible_offices: string[];
  targets: {
    type: string;
    unit_basis?: string;
    currency?: string;
    note?: string;
    timeline_data: TimelineData[];
  };
}

interface TimelineData {
  year: number;
  target_value: string | number;
}

class StrategicPlanIngestor {
  async ingest() {
    try {
      console.log('Starting strategic plan ingestion process...');
      
      // Read the strategic plan JSON file
      const filePath = path.join(process.cwd(), 'strategic_plan.json');
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const strategicPlan: StrategicPlan = JSON.parse(fileContent);
      
      console.log(`Loaded strategic plan for ${strategicPlan.strategic_plan_meta.university}`);
      console.log(`Processing ${strategicPlan.kras.length} KRA(s)...`);
      
      // Prepare vectors for ingestion
      const vectorsToIngest = [];
      
      // Process each KRA and its initiatives
      for (const kra of strategicPlan.kras) {
        // Create a vector for the KRA itself
        const kraText = `KRA: ${kra.kra_id} - ${kra.kra_title}. Guiding Principle: ${kra.guiding_principle}`;
        const kraEmbedding = await embeddingService.generateEmbedding(kraText);
        
        vectorsToIngest.push({
          id: `kra-${kra.kra_id}`,
          vector: kraEmbedding,
          data: {
            type: 'kra',
            kra_id: kra.kra_id,
            kra_title: kra.kra_title,
            guiding_principle: kra.guiding_principle,
            text: kraText,
            university: strategicPlan.strategic_plan_meta.university,
            period: strategicPlan.strategic_plan_meta.period,
          },
        });
        
        // Process each initiative within the KRA
        for (const initiative of kra.initiatives) {
          // Create a comprehensive text for the initiative
          const strategiesText = Array.isArray(initiative.strategies)
            ? initiative.strategies.join('; ')
            : initiative.strategies;
            
          const programsActivitiesText = Array.isArray(initiative.programs_activities)
            ? initiative.programs_activities.join('; ')
            : initiative.programs_activities;
            
          const responsibleOfficesText = Array.isArray(initiative.responsible_offices)
            ? initiative.responsible_offices.join(', ')
            : initiative.responsible_offices;
            
          const outcomesText = Array.isArray(initiative.key_performance_indicator.outcomes)
            ? initiative.key_performance_indicator.outcomes.join('; ')
            : initiative.key_performance_indicator.outcomes;
            
          const initiativeText = `
            Initiative ID: ${initiative.id}
            KRA: ${kra.kra_id} - ${kra.kra_title}
            Key Performance Indicator Outputs: ${initiative.key_performance_indicator.outputs}
            Key Performance Indicator Outcomes: ${outcomesText}
            Strategies: ${strategiesText}
            Programs/Activities: ${programsActivitiesText}
            Responsible Offices: ${responsibleOfficesText}
            Target Type: ${initiative.targets.type}
          `.trim().replace(/\s+/g, ' ');
          
          const initiativeEmbedding = await embeddingService.generateEmbedding(initiativeText);
          
          vectorsToIngest.push({
            id: `initiative-${initiative.id}`,
            vector: initiativeEmbedding,
            data: {
              type: 'initiative',
              initiative_id: initiative.id,
              kra_id: kra.kra_id,
              kra_title: kra.kra_title,
              key_performance_indicator: initiative.key_performance_indicator,
              strategies: initiative.strategies,
              programs_activities: initiative.programs_activities,
              responsible_offices: initiative.responsible_offices,
              targets: initiative.targets,
              text: initiativeText,
              university: strategicPlan.strategic_plan_meta.university,
              period: strategicPlan.strategic_plan_meta.period,
            },
          });
        }
      }
      
      console.log(`Generated ${vectorsToIngest.length} vectors for ingestion...`);
      
      // Ingest vectors into the vector database
      const batchSize = 10; // Process in batches to avoid rate limits
      for (let i = 0; i < vectorsToIngest.length; i += batchSize) {
        const batch = vectorsToIngest.slice(i, i + batchSize);
        console.log(`Ingesting batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(vectorsToIngest.length / batchSize)}...`);
        
        await vectorService.addVectors(batch);
      }
      
      console.log(`Successfully ingested ${vectorsToIngest.length} vectors into the vector database!`);
      
      // Log summary
      console.log('\n--- Ingestion Summary ---');
      console.log(`University: ${strategicPlan.strategic_plan_meta.university}`);
      console.log(`Period: ${strategicPlan.strategic_plan_meta.period}`);
      console.log(`KRA Count: ${strategicPlan.kras.length}`);
      console.log(`Initiative Count: ${strategicPlan.kras.reduce((sum, kra) => sum + kra.initiatives.length, 0)}`);
      console.log(`Vector Count: ${vectorsToIngest.length}`);
      
    } catch (error) {
      console.error('Error during strategic plan ingestion:', error);
      throw error;
    }
  }
  
  /**
   * Test the ingestion by performing a sample search
   */
 async testIngestion() {
    try {
      console.log('\n--- Testing Ingestion ---');
      
      // Generate an embedding for a test query
      const testQuery = "How does the university plan to improve curriculum with emerging technologies?";
      const queryEmbedding = await embeddingService.generateEmbedding(testQuery);
      
      // Search for similar vectors
      const results = await vectorService.searchVectors(queryEmbedding, 5);
      
      console.log(`Found ${results.length} similar vectors:`);
      for (const result of results) {
        const metadata = result.metadata as Record<string, any>;
        console.log(`- ID: ${result.id}, Score: ${result.score}, Text: ${metadata?.text ? (metadata.text as string).substring(0, 100) : 'N/A'}...`);
      }
      
      return results;
    } catch (error) {
      console.error('Error during test ingestion:', error);
      throw error;
    }
  }
}

// Run the ingestion if this script is executed directly
import { pathToFileURL } from 'url';

if (pathToFileURL(process.argv[1]).href === import.meta.url) {
  const ingestor = new StrategicPlanIngestor();
  
  ingestor.ingest()
    .then(async () => {
      // After successful ingestion, run a test
      await ingestor.testIngestion();
      console.log('Strategic plan ingestion completed successfully!');
    })
    .catch(error => {
      console.error('Strategic plan ingestion failed:', error);
      process.exit(1);
    });
}

export default StrategicPlanIngestor;