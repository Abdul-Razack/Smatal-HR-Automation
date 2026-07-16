import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const PERMISSIONS = [
  // Organization
  { name: 'organization:view', description: 'View organization data' },
  { name: 'organization:create', description: 'Create organizations' },
  { name: 'organization:update', description: 'Update organizations' },
  { name: 'organization:delete', description: 'Delete organizations' },
  // Employee
  { name: 'employee:view', description: 'View employees' },
  { name: 'employee:create', description: 'Create employees' },
  { name: 'employee:update', description: 'Update employees' },
  { name: 'employee:delete', description: 'Delete employees' },
  // Candidate
  { name: 'candidate:view', description: 'View candidates' },
  { name: 'candidate:create', description: 'Create candidates' },
  { name: 'candidate:update', description: 'Update candidates' },
  { name: 'candidate:delete', description: 'Delete candidates' },
  // Workflow
  { name: 'workflow:view', description: 'View workflows' },
  { name: 'workflow:create', description: 'Create workflows' },
  { name: 'workflow:update', description: 'Update workflows' },
  { name: 'workflow:delete', description: 'Delete workflows' },
  { name: 'workflow:approve', description: 'Approve workflow steps' },
  // Document
  { name: 'document:view', description: 'View documents' },
  { name: 'document:create', description: 'Create documents' },
  { name: 'document:update', description: 'Update documents' },
  { name: 'document:delete', description: 'Delete documents' },
  // Analytics
  { name: 'analytics:view', description: 'View analytics & reports' },
  // Notifications
  { name: 'notification:view', description: 'View notifications' },
  // Audit
  { name: 'audit:view', description: 'View audit logs' },
  // Master Data
  { name: 'master:view', description: 'View master data' },
  { name: 'master:manage', description: 'Manage master data' },
  // Settings
  { name: 'settings:view', description: 'View settings' },
  { name: 'settings:manage', description: 'Manage settings' },
];

async function main() {
  // Get company id
  const company = await prisma.company.findFirst();
  if (!company) return console.log('No company found');
  
  // Upsert all permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: { ...perm, companyId: company.id },
    });
  }
  console.log(`✅ Seeded ${PERMISSIONS.length} permissions`);
  
  // Assign all permissions to Super Admin role
  const superAdminRole = await prisma.role.findFirst({ where: { name: 'Super Admin' } });
  if (!superAdminRole) return console.log('No Super Admin role found');
  
  const allPerms = await prisma.permission.findMany();
  for (const perm of allPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }
  console.log(`✅ Assigned all ${allPerms.length} permissions to Super Admin`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
