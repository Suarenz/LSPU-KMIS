# Colivara Integration Deployment Guide

This document provides step-by-step instructions for completing the Colivara integration in the LSPU KMIS system.

## Prerequisites

- Ensure all environment variables are set in your `.env` file:
  ```
  COLIVARA_API_KEY="your-colivara-api-key-here"
  COLIVARA_API_ENDPOINT="https://api.colivara.com"
  COLIVARA_PROCESSING_TIMEOUT=300000 # 5 minutes in milliseconds
 ```

## Step-by-Step Deployment Instructions

### Step 1: Apply Database Migration

The database migration to add Colivara fields has been created as `prisma/migrations/20251117132900_add_colivara_fields/migration.sql`.

To apply this migration to your database, you have two options:

#### Option A: Using Prisma CLI (Recommended)
```bash
# Push the schema changes to the database
npx prisma db push --accept-data-loss

# Regenerate the Prisma client
npx prisma generate
```

#### Option B: Manual Migration Script
If the Prisma CLI is not working in your environment, you can use the provided script:
```bash
npx ts-node scripts/apply-colivara-migration.ts
```

### Step 2: Update Document Service

After the database migration is applied and the Prisma client is regenerated, update the document service to properly use Colivara fields instead of type assertions:
**Important**: The document service has already been updated in the code to use direct property access for Colivara fields. However, these changes will only work after the database migration has been applied and the Prisma client has been regenerated. If you encounter TypeScript errors after regenerating the Prisma client, you may need to temporarily use type assertions until the migration is applied, then switch back to direct property access.

1. In `lib/services/document-service.ts`, remove the type assertions and use direct property access:
   ```typescript
   // Instead of:
   colivaraDocumentId: (document as any).colivaraDocumentId || undefined,
   
   // Use:
   colivaraDocumentId: document.colivaraDocumentId || undefined,
   ```
### Step 3: Test Colivara Service Initialization

After applying the database migration and updating the document service, test the Colivara service initialization:

```bash
# Run the test script to verify Colivara service initialization
npx ts-node scripts/test-colivara-service.ts

# Or run the validation script to check all integration components
npx ts-node scripts/validate-colivara-integration.ts
```

The test script will verify:
- Colivara service can be instantiated
- Service can be initialized with API credentials
- All required methods are available
- API key validation works correctly

### Step 3: Test Colivara Service Initialization

Run the validation script to ensure all components are working correctly:
```bash
npx ts-node scripts/validate-colivara-integration.ts
```

### Step 4: Test Search Functionality

Test both semantic and hybrid search functionality to ensure Colivara integration is working:
```bash
# You can run integration tests if available
npm run test:integration
```

### Step 5: Run Full Validation

Execute the validation script to confirm all components work:
```bash
npx ts-node scripts/validate-colivara-integration.ts
```

## Troubleshooting

### Common Issues

1. **Database Migration Errors**: If you encounter errors during migration, ensure your database connection string is correct in the `.env` file.

2. **TypeScript Errors**: If you see TypeScript errors after regeneration, ensure you've updated the document service to use direct property access instead of type assertions.

3. **API Connection Issues**: Verify that the `COLIVARA_API_KEY` and `COLIVARA_API_ENDPOINT` are correctly set in your environment.

### Migration Rollback

If you need to rollback the migration:
```bash
# This will reverse the last migration
npx prisma migrate reset
```

## Verification Checklist

After completing the deployment, verify the following:

- [ ] Database migration applied successfully
- [ ] Prisma client regenerated without errors
- [ ] Document service updated to use proper field access
- [ ] Colivara service can be initialized
- [ ] Semantic search returns results
- [ ] Hybrid search combines traditional and semantic results
- [ ] Document processing status updates correctly
- [ ] All validation checks pass

## Next Steps

Once the integration is successfully deployed:

1. Process existing documents with the migration script: `npx ts-node scripts/migrate-existing-documents-to-colivara.ts`
2. Monitor system performance and search results quality
3. Update documentation as needed based on real-world usage
4. Consider implementing additional Colivara features as needed

## Support

For issues with the Colivara integration, contact the development team or refer to the Colivara API documentation.