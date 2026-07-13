import { PrismaClient, WorkflowStatus, TemplateStatus, TemplateVersionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const SYSTEM_UUID = '00000000-0000-0000-0000-000000000000';

async function main() {
  console.log('Starting Smatal HR Database Seed...');

  // 1. Create Default Company
  const company = await prisma.company.upsert({
    where: { businessId: 'CMP-001' },
    update: {},
    create: {
      businessId: 'CMP-001',
      name: 'Smatal Demo Corp',
      legalName: 'Smatal Demo Corporation LLC',
      code: 'SMATAL-DEMO',
      industry: 'Software',
      isActive: true,
      createdBy: SYSTEM_UUID,
      updatedBy: SYSTEM_UUID,
    },
  });

  // 2. Create Roles & Permissions
  const adminRole = await prisma.role.upsert({
    where: { businessId: 'ROL-001' },
    update: {},
    create: {
      businessId: 'ROL-001',
      code: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Full system access',
      companyId: company.id,
      createdBy: SYSTEM_UUID,
      updatedBy: SYSTEM_UUID,
    },
  });

  // 3. Create Admin Profile
  const profile = await prisma.profile.upsert({
    where: { personalEmail: 'admin@smatal.com' },
    update: {},
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      personalEmail: 'admin@smatal.com',
      phone: '+1234567890',
      createdBy: SYSTEM_UUID,
      updatedBy: SYSTEM_UUID,
    },
  });

  // 4. Create Admin User
  const hashedPassword = await bcrypt.hash('Admin@123!', 10);
  await prisma.identityUser.upsert({
    where: { businessId: 'USR-001' },
    update: {},
    create: {
      businessId: 'USR-001',
      email: 'admin@smatal.com',
      passwordHash: hashedPassword,
      isActive: true,
      isEmailVerified: true,
      lastLoginAt: new Date(),
      companyId: company.id,
      profileId: profile.id,
      createdBy: SYSTEM_UUID,
      updatedBy: SYSTEM_UUID,
      userRoles: {
        create: {
          roleId: adminRole.id,
          assignedBy: SYSTEM_UUID,
        },
      },
    },
  });

  // 5. Create Master Setup (Branch, Dept, Designation)
  await prisma.branch.upsert({
    where: { businessId: 'BRN-001' },
    update: {},
    create: {
      businessId: 'BRN-001',
      companyId: company.id,
      name: 'Headquarters',
      code: 'HQ',
      isActive: true,
      createdBy: SYSTEM_UUID,
      updatedBy: SYSTEM_UUID,
    },
  });

  await prisma.department.upsert({
    where: { businessId: 'DPT-001' },
    update: {},
    create: {
      businessId: 'DPT-001',
      companyId: company.id,
      name: 'Engineering',
      code: 'ENG',
      isActive: true,
      createdBy: SYSTEM_UUID,
      updatedBy: SYSTEM_UUID,
    },
  });

  await prisma.designation.upsert({
    where: { businessId: 'DSG-001' },
    update: {},
    create: {
      businessId: 'DSG-001',
      companyId: company.id,
      name: 'Software Engineer',
      code: 'SWE',
      level: 3,
      isActive: true,
      createdBy: SYSTEM_UUID,
      updatedBy: SYSTEM_UUID,
    },
  });

  // 6. Create Dynamic Fields
  await prisma.fieldDefinition.upsert({
    where: { businessId: 'FLD-001' },
    update: {},
    create: {
      businessId: 'FLD-001',
      companyId: company.id,
      machineKey: 'LINKEDIN_URL',
      displayName: 'LinkedIn Profile URL',
      entityType: 'CANDIDATE',
      dataType: 'TEXT',
      isRequired: false,
      isSystem: false,
      createdBy: SYSTEM_UUID,
      updatedBy: SYSTEM_UUID,
    },
  });

  // 7. Workflow Definitions
  await prisma.workflowDefinition.upsert({
    where: { businessId: 'WFD-001' },
    update: {},
    create: {
      businessId: 'WFD-001',
      companyId: company.id,
      name: 'Standard Onboarding',
      entityType: 'EMPLOYEE',
      status: WorkflowStatus.ACTIVE,
      createdBy: SYSTEM_UUID,
      updatedBy: SYSTEM_UUID,
      stages: {
        create: [
          { name: 'Document Collection', code: 'DOCS', displayOrder: 1, createdBy: SYSTEM_UUID, updatedBy: SYSTEM_UUID },
          { name: 'IT Setup', code: 'IT', displayOrder: 2, createdBy: SYSTEM_UUID, updatedBy: SYSTEM_UUID },
          { name: 'Orientation', code: 'ORIENT', displayOrder: 3, isFinal: true, isTerminal: true, createdBy: SYSTEM_UUID, updatedBy: SYSTEM_UUID },
        ],
      },
    },
  });

  // 8. Document Templates
  const docType = await prisma.documentType.upsert({
    where: { businessId: 'DCT-001' },
    update: {},
    create: {
      businessId: 'DCT-001',
      companyId: company.id,
      code: 'OFFER_LETTER',
      name: 'Standard Offer Letter',
      isActive: true,
      createdBy: SYSTEM_UUID,
      updatedBy: SYSTEM_UUID,
    },
  });

  await prisma.template.upsert({
    where: { businessId: 'TMP-001' },
    update: {},
    create: {
      businessId: 'TMP-001',
      companyId: company.id,
      documentTypeId: docType.id,
      name: 'Base Engineer Offer',
      description: 'Standard software engineer offer template',
      status: TemplateStatus.PUBLISHED,
      createdBy: SYSTEM_UUID,
      updatedBy: SYSTEM_UUID,
      versions: {
        create: {
          businessId: 'TMV-001',
          versionNumber: 1,
          content: '<h1>Offer Letter</h1><p>Dear {firstName}, we are pleased to offer you the position of {designation}.</p>',
          status: TemplateVersionStatus.PUBLISHED,
          createdBy: SYSTEM_UUID,
          updatedBy: SYSTEM_UUID,
        }
      }
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
