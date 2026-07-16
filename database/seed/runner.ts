/**
 * Database Seed Runner
 * 
 * Executes structural seed runners (framework only).
 * NO business data is inserted.
 * Each seeder is idempotent — safe to run multiple times.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

// -------------------------------------------------------
// Seed Runner Imports (to be created per module)
// -------------------------------------------------------
// import { seedSystemPermissions } from './seeders/seedPermissions';
// import { seedSystemRoles } from './seeders/seedRoles';
// import { seedDocumentTypes } from './seeders/seedDocumentTypes';
// import { seedDepartments } from './seeders/seedDepartments';
// import { seedDesignations } from './seeders/seedDesignations';
// import { seedWorkflowDefinitions } from './seeders/seedWorkflowDefinitions';
// import { seedMasterFields } from './seeders/seedMasterFields';
// import { seedAdminUser } from './seeders/seedAdminUser';
// import { seedSystemTemplates } from './seeders/seedSystemTemplates';
import { LeaveSeeder } from './seeders/LeaveSeeder';
import { SeedContext } from './SeedContext';

// -------------------------------------------------------
// Main Seed Orchestrator
// -------------------------------------------------------

declare var process: any;

async function main() {
  const environment = process.env.NODE_ENV || 'development';
  console.log(`\n[Smatal Seed] Starting seed process...`);
  console.log(`[Smatal Seed] Environment: ${environment}\n`);

  try {
    const envConfig = {
      nodeEnv: environment,
      isProduction: environment === 'production',
      isDevelopment: environment === 'development',
      isTesting: environment === 'test',
      isDemo: environment === 'demo',
      defaultAdminEmail: process.env.ADMIN_EMAIL || 'admin@smatal.com',
      defaultAdminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
      defaultAdminName: process.env.ADMIN_NAME || 'System Admin',
      systemUuid: '00000000-0000-0000-0000-000000000000'
    };

    const seedContext = new SeedContext(prisma as any, envConfig);
    // Step 1: System Permissions
    console.log('[Seed] 1/9 — Running: System Permissions');
    const { PermissionSeeder } = await import('./seeders/PermissionSeeder');
    await new PermissionSeeder().run(seedContext);

    // Step 2: System Roles (Super Admin, HR Admin, Recruiter, etc.)
    console.log('[Seed] 2/9 — Skipping: System Roles (not yet implemented)');
    // await seedSystemRoles(prisma);

    // Step 3: Document Types
    console.log('[Seed] 3/9 — Skipping: Document Types (not yet implemented)');
    // await seedDocumentTypes(prisma);

    // Step 4: Departments (System level)
    console.log('[Seed] 4/9 — Skipping: Departments (not yet implemented)');
    // await seedDepartments(prisma);

    // Step 5: Designations
    console.log('[Seed] 5/9 — Skipping: Designations (not yet implemented)');
    // await seedDesignations(prisma);

    // Step 6: Workflow Definitions
    console.log('[Seed] 6/9 — Skipping: Workflow Definitions (not yet implemented)');
    // await seedWorkflowDefinitions(prisma);

    // Step 7: Master Field Definitions
    console.log('[Seed] 7/9 — Skipping: Master Fields (not yet implemented)');
    // await seedMasterFields(prisma);

    // Step 8: System Templates
    console.log('[Seed] 8/9 — Skipping: Templates (not yet implemented)');
    // await seedSystemTemplates(prisma);

    // Step 9: Initial Admin User (Dev only)
    if (environment === 'development') {
      console.log('[Seed] 9/9 — Skipping: Admin User (not yet implemented)');
      // await seedAdminUser(prisma);
    }

    console.log('[Seed] 10 — Running: Leave Seeder');
    const leaveSeeder = new LeaveSeeder();
    await leaveSeeder.run(seedContext);

    console.log('\n[Smatal Seed] Seed framework run complete.\n');
  } catch (error) {
    console.error('[Smatal Seed] Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
