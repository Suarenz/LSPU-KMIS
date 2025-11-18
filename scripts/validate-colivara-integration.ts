/**
 * Validation script for Colivara integration
 * This script validates that all components of the Colivara integration are properly set up
 */

import ColivaraService from '@/lib/services/colivara-service';
import { colivaraMonitoringService } from '@/lib/services/colivara-monitoring-service';
import { colivaraErrorHandler } from '@/lib/services/colivara-error-handler';
import { Document } from '@/lib/api/types';

interface ValidationResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

class ColivaraIntegrationValidator {
  private results: ValidationResult[] = [];

  async validate(): Promise<ValidationResult[]> {
    console.log('Starting Colivara integration validation...\n');
    
    // Validate service initialization
    this.validateServiceInitialization();
    
    // Validate monitoring service
    this.validateMonitoringService();
    
    // Validate error handling
    this.validateErrorHandling();
    
    // Validate type definitions
    this.validateTypeDefinitions();
    
    // Validate environment configuration
    this.validateEnvironmentConfiguration();
    
    // Print results
    this.printResults();
    
    return this.results;
  }

  private validateServiceInitialization(): void {
    try {
      const service = new ColivaraService();
      
      // Check if service has required methods
      const requiredMethods = [
        'initialize',
        'uploadDocument', 
        'checkProcessingStatus',
        'waitForProcessing',
        'performSemanticSearch',
        'performHybridSearch',
        'indexDocument',
        'updateIndex',
        'deleteFromIndex',
        'extractDocumentMetadata',
        'processNewDocument',
        'handleDocumentUpdate',
        'validateApiKey'
      ];
      
      let missingMethods = 0;
      for (const method of requiredMethods) {
        if (typeof (service as any)[method] !== 'function') {
          this.results.push({
            component: 'ColivaraService',
            status: 'FAIL',
            message: `Missing required method: ${method}`
          });
          missingMethods++;
        }
      }
      
      if (missingMethods === 0) {
        this.results.push({
          component: 'ColivaraService',
          status: 'PASS',
          message: `All ${requiredMethods.length} required methods are present`
        });
      }
    } catch (error) {
      this.results.push({
        component: 'ColivaraService',
        status: 'FAIL',
        message: `Failed to instantiate service: ${(error as Error).message}`
      });
    }
  }

  private validateMonitoringService(): void {
    try {
      // Check if monitoring service has required methods
      const requiredMethods = [
        'logEvent',
        'logDocumentProcessed',
        'logDocumentProcessingFailed',
        'logSearchPerformed',
        'logApiCall',
        'logError',
        'logRateLimitHit',
        'getProcessingMetrics',
        'getSearchMetrics',
        'getApiMetrics',
        'getHealthStatus',
        'performHealthCheck',
        'getRecentEvents',
        'getErrorEvents',
        'getErrorSummary'
      ];
      
      let missingMethods = 0;
      for (const method of requiredMethods) {
        if (typeof colivaraMonitoringService[method as keyof typeof colivaraMonitoringService] !== 'function') {
          this.results.push({
            component: 'MonitoringService',
            status: 'FAIL',
            message: `Missing required method: ${method}`
          });
          missingMethods++;
        }
      }
      
      if (missingMethods === 0) {
        this.results.push({
          component: 'MonitoringService',
          status: 'PASS',
          message: `All ${requiredMethods.length} required methods are present`
        });
      }
    } catch (error) {
      this.results.push({
        component: 'MonitoringService',
        status: 'FAIL',
        message: `Failed to validate monitoring service: ${(error as Error).message}`
      });
    }
  }

  private validateErrorHandling(): void {
    try {
      // Check if error handler has required methods
      const requiredMethods = [
        'handleColivaraOperation',
        'convertErrorToColivaraError',
        'checkServiceHealth',
        'handleGracefulDegradation'
      ];
      
      let missingMethods = 0;
      for (const method of requiredMethods) {
        if (typeof colivaraErrorHandler[method as keyof typeof colivaraErrorHandler] !== 'function') {
          this.results.push({
            component: 'ErrorHandler',
            status: 'FAIL',
            message: `Missing required method: ${method}`
          });
          missingMethods++;
        }
      }
      
      if (missingMethods === 0) {
        this.results.push({
          component: 'ErrorHandler',
          status: 'PASS',
          message: `All ${requiredMethods.length} required methods are present`
        });
      }
    } catch (error) {
      this.results.push({
        component: 'ErrorHandler',
        status: 'FAIL',
        message: `Failed to validate error handler: ${(error as Error).message}`
      });
    }
  }

  private validateTypeDefinitions(): void {
    try {
      // Check if the Document type has Colivara fields
      const testDoc: Partial<Document> = {};
      
      // Check for Colivara-specific fields
      const colivaraFields = [
        'colivaraDocumentId',
        'colivaraProcessingStatus',
        'colivaraProcessedAt',
        'colivaraChecksum'
      ];
      
      let missingFields = 0;
      for (const field of colivaraFields) {
        if (!(field in testDoc)) {
          this.results.push({
            component: 'TypeDefinitions',
            status: 'WARNING',
            message: `Document type may be missing field: ${field}`
          });
          missingFields++;
        }
      }
      
      if (missingFields === 0) {
        this.results.push({
          component: 'TypeDefinitions',
          status: 'PASS',
          message: `All ${colivaraFields.length} Colivara-specific fields are defined in Document type`
        });
      } else {
        this.results.push({
          component: 'TypeDefinitions',
          status: 'WARNING',
          message: `${missingFields} of ${colivaraFields.length} Colivara-specific fields are missing from Document type`
        });
      }
    } catch (error) {
      this.results.push({
        component: 'TypeDefinitions',
        status: 'FAIL',
        message: `Failed to validate type definitions: ${(error as Error).message}`
      });
    }
  }

  private validateEnvironmentConfiguration(): void {
    try {
      // Check if required environment variables are available
      const requiredEnvVars = [
        'COLIVARA_API_KEY',
        'COLIVARA_API_ENDPOINT'
      ];
      
      let missingEnvVars = 0;
      for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
          this.results.push({
            component: 'Environment',
            status: 'WARNING',
            message: `Environment variable ${envVar} is not set`
          });
          missingEnvVars++;
        }
      }
      
      if (missingEnvVars === 0) {
        this.results.push({
          component: 'Environment',
          status: 'PASS',
          message: `All required environment variables are set`
        });
      } else {
        this.results.push({
          component: 'Environment',
          status: 'WARNING',
          message: `${missingEnvVars} of ${requiredEnvVars.length} required environment variables are not set`
        });
      }
    } catch (error) {
      this.results.push({
        component: 'Environment',
        status: 'FAIL',
        message: `Failed to validate environment configuration: ${(error as Error).message}`
      });
    }
  }

  private printResults(): void {
    console.log('Colivara Integration Validation Results:');
    console.log('=======================================');
    
    const groupedResults = this.groupResultsByComponent();
    
    for (const [component, results] of Object.entries(groupedResults)) {
      console.log(`\n${component}:`);
      
      for (const result of results) {
        const statusSymbol = result.status === 'PASS' ? '✅' : 
                            result.status === 'WARNING' ? '⚠️' : '❌';
        console.log(`  ${statusSymbol} ${result.message}`);
      }
    }
    
    const summary = this.getSummary();
    console.log('\nSummary:');
    console.log(`  Total: ${summary.total}`);
    console.log(`  Passed: ${summary.passed}`);
    console.log(`  Failed: ${summary.failed}`);
    console.log(`  Warnings: ${summary.warnings}`);
    
    if (summary.failed > 0) {
      console.log('\n❌ Integration validation failed. Please fix the above issues.');
    } else if (summary.warnings > 0) {
      console.log('\n⚠️ Integration validation completed with warnings. Consider addressing the above issues.');
    } else {
      console.log('\n✅ Integration validation passed successfully!');
    }
  }

  private groupResultsByComponent(): Record<string, ValidationResult[]> {
    const grouped: Record<string, ValidationResult[]> = {};
    
    for (const result of this.results) {
      if (!grouped[result.component]) {
        grouped[result.component] = [];
      }
      grouped[result.component].push(result);
    }
    
    return grouped;
  }

  private getSummary(): { total: number; passed: number; failed: number; warnings: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;
    
    return { total, passed, failed, warnings };
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new ColivaraIntegrationValidator();
  
  // Catch any unhandled errors
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
  });
  
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
  
  validator.validate()
    .then(() => {
      console.log('\nValidation complete.');
    })
    .catch((error) => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

export default ColivaraIntegrationValidator;