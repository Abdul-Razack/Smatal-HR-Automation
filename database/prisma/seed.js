"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
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
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM',
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
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM',
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
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM',
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
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM',
            userRoles: {
                create: {
                    roleId: adminRole.id,
                    assignedBy: 'SYSTEM',
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
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM',
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
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM',
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
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM',
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
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM',
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
            status: client_1.WorkflowStatus.ACTIVE,
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM',
            stages: {
                create: [
                    { name: 'Document Collection', code: 'DOCS', displayOrder: 1, createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
                    { name: 'IT Setup', code: 'IT', displayOrder: 2, createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
                    { name: 'Orientation', code: 'ORIENT', displayOrder: 3, isFinal: true, isTerminal: true, createdBy: 'SYSTEM', updatedBy: 'SYSTEM' },
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
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM',
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
            status: client_1.TemplateStatus.PUBLISHED,
            createdBy: 'SYSTEM',
            updatedBy: 'SYSTEM',
            versions: {
                create: {
                    businessId: 'TMV-001',
                    versionNumber: 1,
                    content: '<h1>Offer Letter</h1><p>Dear {firstName}, we are pleased to offer you the position of {designation}.</p>',
                    status: client_1.TemplateVersionStatus.PUBLISHED,
                    createdBy: 'SYSTEM',
                    updatedBy: 'SYSTEM',
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
