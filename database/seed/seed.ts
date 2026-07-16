import { PrismaClient } from '@prisma/client';
import { SeedContext, EnvironmentConfig } from './SeedContext';
import { SeedRunner } from './SeedRunner';

import { SystemSeeder } from './seeders/SystemSeeder';
import { PermissionSeeder } from './seeders/PermissionSeeder';
import { RoleSeeder } from './seeders/RoleSeeder';
import { CompanySeeder } from './seeders/CompanySeeder';
import { AdminUserSeeder, ADMIN_USER_BUSINESS_ID } from './seeders/AdminUserSeeder';
import { MasterDataSeeder } from './seeders/MasterDataSeeder';
import { WorkflowSeeder } from './seeders/WorkflowSeeder';
import { DocumentSeeder } from './seeders/DocumentSeeder';
import { DemoDataSeeder } from './seeders/DemoDataSeeder';
import { LeaveSeeder } from './seeders/LeaveSeeder';

import * as dotenv from 'dotenv';
dotenv.config();

const SYSTEM_UUID = '00000000-0000-0000-0000-000000000000';

async function main() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  console.log(`\n==============================================`);
  console.log(` Smatal HR System - Database Seed Runner`);
  console.log(`==============================================`);
  console.log(` Environment: ${nodeEnv}`);
  
  const env: EnvironmentConfig = {
    nodeEnv,
    isProduction: nodeEnv === 'production',
    isDevelopment: nodeEnv === 'development',
    isTesting: nodeEnv === 'test',
    isDemo: nodeEnv === 'demo',
    defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@smatal.com',
    defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'password',
    defaultAdminName: process.env.DEFAULT_ADMIN_NAME || 'Super Admin',
    systemUuid: SYSTEM_UUID,
  };

  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  const context = new SeedContext(prisma, env);
  const runner = new SeedRunner(context);

  runner.addSeeders([
    new SystemSeeder(),
    new PermissionSeeder(),
    new CompanySeeder(),
    new RoleSeeder(),
    new AdminUserSeeder(),
    new MasterDataSeeder(),
    new WorkflowSeeder(),
    new DocumentSeeder(),
    new DemoDataSeeder(),
    new LeaveSeeder(),
  ]);

  try {
    await runner.run();
    await verifySeed(prisma, env);
    console.log(`\n✅ Seeding and Verification completed successfully!`);
  } catch (err) {
    console.error(`\n❌ Seeding failed:`, err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function verifySeed(prisma: PrismaClient, env: EnvironmentConfig) {
  if (env.isProduction) {
    console.log(`[Verification] Skipped detailed verification in production.`);
    return;
  }

  console.log(`\n[Verification] Validating seed output...`);
  
  const company = await prisma.company.findFirst({ where: { businessId: 'CMP-001' } });
  if (!company) throw new Error('Verification Failed: Demo Company not found.');

  const role = await prisma.role.findFirst({ where: { businessId: 'ROL-001' } });
  if (!role) throw new Error('Verification Failed: Super Admin Role not found.');

  const admin = await prisma.identityUser.findFirst({ 
    where: { businessId: ADMIN_USER_BUSINESS_ID },
    include: { userRoles: true }
  });
  if (!admin) throw new Error('Verification Failed: Admin User not found.');
  if (!admin.userRoles.some(ur => ur.roleId === role.id)) {
    throw new Error('Verification Failed: Admin User does not have Super Admin Role.');
  }

  const permissions = await prisma.permission.count();
  if (permissions === 0) throw new Error('Verification Failed: No permissions found.');

  console.log(`[Verification] Validation Passed.`);
}

main();
