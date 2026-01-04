/**
 * Migrate data from Azure PostgreSQL to Docker PostgreSQL
 * Run with: node scripts/migrate-azure-to-docker.js
 */

import { PrismaClient } from '@prisma/client';

// Source: Azure Database
const sourceDb = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://lspuadmin:laguna%40123@lspu-kmis-db.postgres.database.azure.com:5432/postgres?sslmode=require'
    }
  }
});

// Target: Docker Database  
// Use environment variable for target
const targetDb = new PrismaClient();

async function migrateData() {
  console.log('🚀 Starting data migration from Azure to Docker...\n');

  try {
    // Clear existing default data (keep if you want to preserve, delete if replacing)
    console.log('🗑️  Clearing existing data...');
    await targetDb.documentDownload.deleteMany();
    await targetDb.documentView.deleteMany();
    await targetDb.activity.deleteMany();
    await targetDb.documentPermission.deleteMany();
    await targetDb.unitPermission.deleteMany();
    await targetDb.document.deleteMany();
    await targetDb.user.deleteMany();
    await targetDb.unit.deleteMany();
    console.log('✅ Cleared existing data\n');

    // 1. Migrate Units
    console.log('📦 Migrating Units...');
    const units = await sourceDb.unit.findMany();
    for (const unit of units) {
      await targetDb.unit.upsert({
        where: { id: unit.id },
        create: unit,
        update: unit
      });
    }
    console.log(`✅ Migrated ${units.length} units\n`);

    // 2. Migrate Users (with passwords)
    console.log('👥 Migrating Users...');
    const users = await sourceDb.user.findMany();
    for (const user of users) {
      await targetDb.user.upsert({
        where: { id: user.id },
        create: user,
        update: user
      });
    }
    console.log(`✅ Migrated ${users.length} users\n`);

    // 3. Migrate Documents
    console.log('📄 Migrating Documents...');
    const documents = await sourceDb.document.findMany();
    for (const doc of documents) {
      await targetDb.document.upsert({
        where: { id: doc.id },
        create: doc,
        update: doc
      });
    }
    console.log(`✅ Migrated ${documents.length} documents\n`);

    // 4. Migrate Document Permissions
    console.log('🔐 Migrating Document Permissions...');
    const permissions = await sourceDb.documentPermission.findMany();
    for (const perm of permissions) {
      await targetDb.documentPermission.upsert({
        where: { id: perm.id },
        create: perm,
        update: perm
      });
    }
    console.log(`✅ Migrated ${permissions.length} permissions\n`);

    // 5. Migrate Unit Permissions
    console.log('🔐 Migrating Unit Permissions...');
    const unitPermissions = await sourceDb.unitPermission.findMany();
    for (const perm of unitPermissions) {
      await targetDb.unitPermission.upsert({
        where: { id: perm.id },
        create: perm,
        update: perm
      });
    }
    console.log(`✅ Migrated ${unitPermissions.length} unit permissions\n`);

    // 6. Migrate Document Views
    console.log('👁️  Migrating Document Views...');
    const views = await sourceDb.documentView.findMany();
    for (const view of views) {
      await targetDb.documentView.create({ data: view });
    }
    console.log(`✅ Migrated ${views.length} document views\n`);

    // 7. Migrate Document Downloads
    console.log('⬇️  Migrating Document Downloads...');
    const downloads = await sourceDb.documentDownload.findMany();
    for (const download of downloads) {
      await targetDb.documentDownload.create({ data: download });
    }
    console.log(`✅ Migrated ${downloads.length} downloads\n`);

    // 8. Migrate Activities
    console.log('📊 Migrating Activities...');
    const activities = await sourceDb.activity.findMany();
    for (const activity of activities) {
      await targetDb.activity.create({ data: activity });
    }
    console.log(`✅ Migrated ${activities.length} activities\n`);

    console.log('========================================');
    console.log('🎉 Migration Complete!');
    console.log('========================================');
    console.log(`Units: ${units.length}`);
    console.log(`Users: ${users.length}`);
    console.log(`Documents: ${documents.length}`);
    console.log(`Permissions: ${permissions.length}`);
    console.log('========================================\n');
    console.log('Next step: Restart Docker app');
    console.log('  docker-compose restart app');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sourceDb.$disconnect();
    await targetDb.$disconnect();
  }
}

migrateData()
  .catch(console.error)
  .finally(() => process.exit());
