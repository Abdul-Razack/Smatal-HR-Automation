import { BaseSeeder } from '../BaseSeeder';
import { SeedContext } from '../SeedContext';
import { DEMO_COMPANY_BUSINESS_ID } from './CompanySeeder';
import { FieldDataType, FieldEntityType } from '@prisma/client';
import { STANDARD_DOCUMENT_TYPES } from './seedDocumentTypes';

export class MasterDataSeeder extends BaseSeeder {
  readonly name = 'MasterDataSeeder';

  async run(context: SeedContext): Promise<void> {
    const { prisma, env } = context;

    if (env.isProduction) {
      console.log(`  -> Skipping Demo Master Data in Production.`);
      return;
    }

    const company = await prisma.company.findUnique({
      where: { businessId: DEMO_COMPANY_BUSINESS_ID }
    });

    if (!company) {
      throw new Error('Demo Company not found.');
    }

    await prisma.$transaction(async (tx) => {
      // 1. Branch
      await tx.branch.upsert({
        where: { businessId: 'BRN-001' },
        update: {},
        create: {
          businessId: 'BRN-001',
          companyId: company.id,
          name: 'Headquarters',
          code: 'HQ',
          isActive: true,
          createdBy: env.systemUuid,
          updatedBy: env.systemUuid,
        },
      });

      // 2. Departments
      const standardDepartments = [
        { code: 'MGT', name: 'Executive Management', description: 'Top-tier executive steering, strategic leadership, and official signatory authority.' },
        { code: 'ENG', name: 'Software Engineering', description: 'Core engineering, custom web, mobile, and enterprise product development.' },
        { code: 'QA', name: 'Quality Assurance & Testing', description: 'Manual testing, automation pipelines, performance testing, and quality verification.' },
        { code: 'DES', name: 'UI/UX & Creative Design', description: 'Product prototyping, design systems, mobile/web UX, and digital branding assets.' },
        { code: 'INF', name: 'Cloud & Infrastructure', description: 'Cloud architecture, deployment, server monitoring, security, and internal IT support.' },
        { code: 'MKT', name: 'Digital Marketing & Growth', description: 'Client search optimization, digital brand awareness, paid ads, and social media.' },
        { code: 'BD', name: 'Business Development & Client Solutions', description: 'Client acquisition, client relationship management, proposals, and project discovery.' },
        { code: 'TRG', name: 'Academic & Technical Training', description: 'Delivery of industry-oriented courses, curriculum updates, and practical student projects.' },
        { code: 'ADM', name: 'Student Admissions & Career Counseling', description: 'Student inquiries, career roadmapping, admission enrollments, and course guidance.' },
        { code: 'PLC', name: 'Placements & Corporate Relations', description: 'Company tie-ups, interview drives, student resume workshops, and hiring partnerships.' },
        { code: 'OPS', name: 'Center Operations & Student Support', description: 'Daily campus operations, computer lab maintenance, student batches, and front office.' },
        { code: 'HR', name: 'Human Resources', description: 'Talent recruitment, onboarding, employee engagement, payroll, leaves, and compliance.' },
        { code: 'FIN', name: 'Finance & Accounts', description: 'Invoicing, student fee receipts, client billing, vendor payments, and taxation.' },
      ];

      for (let i = 0; i < standardDepartments.length; i++) {
        const d = standardDepartments[i];
        const businessId = `DPT-${String(i + 1).padStart(3, '0')}`;
        await tx.department.upsert({
          where: {
            companyId_code: {
              companyId: company.id,
              code: d.code,
            },
          },
          update: {
            name: d.name,
            description: d.description,
            isActive: true,
          },
          create: {
            businessId,
            companyId: company.id,
            name: d.name,
            code: d.code,
            description: d.description,
            isActive: true,
            createdBy: env.systemUuid,
            updatedBy: env.systemUuid,
          },
        });
      }

      // 3. Designations
      const standardDesignations = [
        { code: 'CEO', name: 'Chief Executive Officer (CEO)', level: 5, description: 'Highest Executive Authority & Primary Signatory' },
        { code: 'MD', name: 'Managing Director (MD)', level: 5, description: 'Managing Director' },
        { code: 'CTO', name: 'Chief Technology Officer (CTO)', level: 5, description: 'Chief Technology Officer' },
        { code: 'COO', name: 'Chief Operating Officer (COO)', level: 5, description: 'Chief Operating Officer' },
        { code: 'DIR-OPS', name: 'Director of Operations', level: 5, description: 'Director of Operations' },
        { code: 'TECH-LEAD', name: 'Technical Lead', level: 4, description: 'Technical & Architecture Lead' },
        { code: 'SR-FSD', name: 'Senior Full Stack Developer', level: 3, description: 'Senior Full Stack Developer' },
        { code: 'FSD', name: 'Full Stack Developer', level: 2, description: 'Full Stack Developer' },
        { code: 'FED', name: 'Frontend Developer (React / Next.js)', level: 2, description: 'Frontend Developer' },
        { code: 'BED', name: 'Backend Developer (Node.js / Python / Java)', level: 2, description: 'Backend Developer' },
        { code: 'MAD', name: 'Mobile App Developer (Flutter / React Native)', level: 2, description: 'Mobile App Developer' },
        { code: 'JR-DEV', name: 'Junior Software Developer', level: 1, description: 'Junior Software Developer' },
        { code: 'SWE-INT', name: 'Software Engineering Intern', level: 1, description: 'Software Engineering Intern' },
        { code: 'QA-LEAD', name: 'QA Lead', level: 4, description: 'Quality Assurance Lead' },
        { code: 'SR-QA-AUTO', name: 'Senior QA Automation Engineer', level: 3, description: 'Senior Automation Test Engineer' },
        { code: 'QA-AUTO', name: 'QA Automation Engineer', level: 2, description: 'QA Automation Engineer' },
        { code: 'QA-MANUAL', name: 'Manual Test Engineer', level: 2, description: 'Manual Test Engineer' },
        { code: 'QA-INT', name: 'QA Intern', level: 1, description: 'QA Intern' },
        { code: 'LEAD-UIUX', name: 'Lead UI/UX Designer', level: 4, description: 'Lead UI/UX Designer' },
        { code: 'SR-UIUX', name: 'Senior UI/UX Designer', level: 3, description: 'Senior UI/UX Designer' },
        { code: 'UIUX-DES', name: 'UI/UX Designer', level: 2, description: 'UI/UX Designer' },
        { code: 'GRAPHIC-DES', name: 'Graphic & Brand Designer', level: 2, description: 'Graphic & Brand Designer' },
        { code: 'DEVOPS-LEAD', name: 'DevOps & Cloud Lead', level: 4, description: 'DevOps & Cloud Lead' },
        { code: 'DEVOPS-ENG', name: 'Cloud & DevOps Engineer', level: 2, description: 'Cloud & DevOps Engineer' },
        { code: 'SYS-ADMIN', name: 'Systems & Server Administrator', level: 2, description: 'Systems Administrator' },
        { code: 'IT-SUPPORT', name: 'IT Support & Network Engineer', level: 1, description: 'IT Support & Network Engineer' },
        { code: 'MKT-LEAD', name: 'Digital Marketing Lead', level: 4, description: 'Digital Marketing Lead' },
        { code: 'SEO-SPEC', name: 'SEO Analyst & Specialist', level: 2, description: 'SEO Specialist' },
        { code: 'SOC-MEDIA', name: 'Social Media & Content Strategist', level: 2, description: 'Social Media Strategist' },
        { code: 'MKT-EXEC', name: 'Digital Marketing Executive', level: 1, description: 'Digital Marketing Executive' },
        { code: 'HEAD-BD', name: 'Head of Business Development', level: 4, description: 'Head of Business Development' },
        { code: 'SOL-MGR', name: 'Client Solutions Manager', level: 3, description: 'Client Solutions Manager' },
        { code: 'BDE', name: 'Business Development Executive (BDE)', level: 2, description: 'Business Development Executive' },
        { code: 'PRE-SALES', name: 'Technical Pre-Sales Executive', level: 2, description: 'Pre-Sales Executive' },
        { code: 'ACAD-DIR', name: 'Head of Academics / Academic Director', level: 5, description: 'Head of Academics' },
        { code: 'SR-PY-AI-TRN', name: 'Senior Python & AI Trainer', level: 3, description: 'Senior Python & AI Trainer' },
        { code: 'FSD-TRN', name: 'Full Stack Web Development Trainer', level: 3, description: 'Full Stack Web Development Trainer' },
        { code: 'DS-TRN', name: 'Data Science & Analytics Instructor', level: 3, description: 'Data Science Instructor' },
        { code: 'CLOUD-TRN', name: 'Cloud & Cyber Security Trainer', level: 3, description: 'Cloud & Security Trainer' },
        { code: 'QA-TRN', name: 'Software Testing & QA Trainer', level: 3, description: 'Software Testing Trainer' },
        { code: 'TALLY-TRN', name: 'Tally & Financial Accounting Instructor', level: 2, description: 'Tally Instructor' },
        { code: 'JR-FACULTY', name: 'Junior Technical Faculty / Lab Instructor', level: 1, description: 'Junior Faculty' },
        { code: 'ADM-MGR', name: 'Admissions Manager', level: 4, description: 'Admissions Manager' },
        { code: 'SR-COUNSELOR', name: 'Senior Academic Counselor', level: 3, description: 'Senior Academic Counselor' },
        { code: 'CAREER-ADV', name: 'Student Career Counselor', level: 2, description: 'Student Career Counselor' },
        { code: 'ADM-EXEC', name: 'Admissions Executive', level: 1, description: 'Admissions Executive' },
        { code: 'HEAD-PLC', name: 'Head of Placements', level: 4, description: 'Head of Placements' },
        { code: 'CORP-REL-MGR', name: 'Corporate Relations Manager', level: 3, description: 'Corporate Relations Manager' },
        { code: 'PLC-OFFICER', name: 'Placement Officer', level: 2, description: 'Placement Officer' },
        { code: 'PLC-COORD', name: 'Placement Coordinator', level: 1, description: 'Placement Coordinator' },
        { code: 'CENTER-HEAD', name: 'Center Head / Branch Manager (Chennai)', level: 4, description: 'Center Head' },
        { code: 'OPS-COORD', name: 'Center Operations Coordinator', level: 2, description: 'Operations Coordinator' },
        { code: 'LAB-ADMIN', name: 'Computer Lab Administrator', level: 2, description: 'Lab Administrator' },
        { code: 'FRONT-DESK', name: 'Front Desk & Student Support Executive', level: 1, description: 'Front Desk Executive' },
        { code: 'HR-MGR', name: 'HR Manager', level: 4, description: 'Human Resources Manager' },
        { code: 'SR-HR-EXEC', name: 'Senior HR Executive / Talent Acquisition', level: 3, description: 'Senior HR Executive' },
        { code: 'HR-EXEC', name: 'HR Executive (Generalist & Onboarding)', level: 2, description: 'HR Executive' },
        { code: 'HR-OPS', name: 'HR Operations Coordinator', level: 1, description: 'HR Operations Coordinator' },
        { code: 'FIN-MGR', name: 'Finance & Accounts Manager', level: 4, description: 'Finance Manager' },
        { code: 'SR-ACCT', name: 'Senior Accountant', level: 3, description: 'Senior Accountant' },
        { code: 'BILL-ACCT-EXEC', name: 'Billing & Accounts Executive', level: 2, description: 'Billing & Accounts Executive' },
        { code: 'ACCT-ASST', name: 'Accounts Assistant', level: 1, description: 'Accounts Assistant' },
      ];

      for (let i = 0; i < standardDesignations.length; i++) {
        const d = standardDesignations[i];
        const businessId = `DSG-${String(i + 1).padStart(3, '0')}`;
        await tx.designation.upsert({
          where: {
            companyId_code: {
              companyId: company.id,
              code: d.code,
            },
          },
          update: {
            name: d.name,
            description: d.description,
            level: d.level,
            isActive: true,
          },
          create: {
            businessId,
            companyId: company.id,
            name: d.name,
            code: d.code,
            description: d.description,
            level: d.level,
            isActive: true,
            createdBy: env.systemUuid,
            updatedBy: env.systemUuid,
          },
        });
      }

      // 4. Document Types
      for (let i = 0; i < STANDARD_DOCUMENT_TYPES.length; i++) {
        const dt = STANDARD_DOCUMENT_TYPES[i];
        const businessId = `DCT-${String(i + 1).padStart(3, '0')}`;
        await tx.documentType.upsert({
          where: {
            companyId_code: {
              companyId: company.id,
              code: dt.code,
            },
          },
          update: {
            name: dt.name,
            description: dt.description,
            isActive: true,
          },
          create: {
            businessId,
            companyId: company.id,
            code: dt.code,
            name: dt.name,
            description: dt.description,
            isActive: true,
            createdBy: env.systemUuid,
            updatedBy: env.systemUuid,
          },
        });
      }

      // 5. Dynamic Field
      const fieldsToSeed = [
        { key: 'LINKEDIN_URL', name: 'LinkedIn Profile URL', type: FieldDataType.TEXT, entity: FieldEntityType.CANDIDATE },
        { key: 'JOB_TITLE', name: 'Job Title', type: FieldDataType.TEXT, entity: FieldEntityType.EMPLOYEE },
        { key: 'EMPLOYMENT_TYPE', name: 'Employment Type', type: FieldDataType.TEXT, entity: FieldEntityType.EMPLOYEE },
        { key: 'JOINING_DATE', name: 'Joining Date', type: FieldDataType.DATE, entity: FieldEntityType.EMPLOYEE },
        { key: 'REPORTING_TIME', name: 'Reporting Time', type: FieldDataType.TEXT, entity: FieldEntityType.EMPLOYEE },
        { key: 'ANNUAL_CTC', name: 'Annual CTC', type: FieldDataType.TEXT, entity: FieldEntityType.EMPLOYEE },
        { key: 'OFFER_EXPIRATION', name: 'Offer Expiration Date', type: FieldDataType.DATE, entity: FieldEntityType.CANDIDATE },
        { key: 'AUTH_SIGNATORY_NAME', name: 'Authorized Signatory Name', type: FieldDataType.TEXT, entity: FieldEntityType.PROFILE },
        { key: 'AUTH_SIGNATORY_TITLE', name: 'Authorized Signatory Title', type: FieldDataType.TEXT, entity: FieldEntityType.PROFILE },
        { key: 'OFFER_REF_NUM', name: 'Offer Reference Number', type: FieldDataType.TEXT, entity: FieldEntityType.CANDIDATE },
        { key: 'CANDIDATE_ADDRESS_1', name: 'Candidate Address Line 1', type: FieldDataType.TEXT, entity: FieldEntityType.CANDIDATE },
        { key: 'CANDIDATE_ADDRESS_2', name: 'Candidate Address Line 2', type: FieldDataType.TEXT, entity: FieldEntityType.CANDIDATE },
      ];

      for (let i = 0; i < fieldsToSeed.length; i++) {
        const field = fieldsToSeed[i];
        const businessId = `FLD-${String(i + 1).padStart(3, '0')}`;
        await tx.fieldDefinition.upsert({
          where: { businessId },
          update: {
            machineKey: field.key,
            displayName: field.name,
            entityType: field.entity,
            dataType: field.type,
          },
          create: {
            businessId,
            companyId: company.id,
            machineKey: field.key,
            displayName: field.name,
            entityType: field.entity,
            dataType: field.type,
            isRequired: false,
            isSystem: false,
            createdBy: env.systemUuid,
            updatedBy: env.systemUuid,
          },
        });
      }
    });

    console.log(`  -> Seeded Master Data (Branch, Dept, Designation, DocType, Field).`);
  }
}
