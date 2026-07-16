import { BaseSeeder } from '../BaseSeeder';
import { SeedContext } from '../SeedContext';
import { DEMO_COMPANY_BUSINESS_ID } from './CompanySeeder';
import { CandidateStatus, EmployeeStatus } from '@prisma/client';

export class DemoDataSeeder extends BaseSeeder {
  readonly name = 'DemoDataSeeder';

  async run(context: SeedContext): Promise<void> {
    const { prisma, env } = context;

    if (!env.isDevelopment) {
      console.log(`  -> Skipping Demo Dummy Data in non-development environment.`);
      return;
    }

    const company = await prisma.company.findUnique({
      where: { businessId: DEMO_COMPANY_BUSINESS_ID }
    });

    if (!company) {
      throw new Error('Demo Company not found.');
    }

    await prisma.$transaction(async (tx) => {
      // Create a candidate
      const candidateProfile = await tx.profile.upsert({
        where: { personalEmail: 'candidate@demo.smatal.com' },
        update: {},
        create: {
          firstName: 'John',
          lastName: 'Doe',
          personalEmail: 'candidate@demo.smatal.com',
          phone: '+1234500000',
          createdBy: env.systemUuid,
          updatedBy: env.systemUuid,
        },
      });

      await tx.candidate.upsert({
        where: {
          profileId_companyId: {
            profileId: candidateProfile.id,
            companyId: company.id,
          }
        },
        update: {},
        create: {
          businessId: 'CND-001',
          profileId: candidateProfile.id,
          companyId: company.id,
          status: CandidateStatus.APPLIED,
          source: 'LinkedIn',
          createdBy: env.systemUuid,
          updatedBy: env.systemUuid,
        },
      });

      // Create an employee
      const empProfile = await tx.profile.upsert({
        where: { personalEmail: 'employee@demo.smatal.com' },
        update: {},
        create: {
          firstName: 'Jane',
          lastName: 'Smith',
          personalEmail: 'employee@demo.smatal.com',
          phone: '+1987654321',
          createdBy: env.systemUuid,
          updatedBy: env.systemUuid,
        },
      });

      await tx.employee.upsert({
        where: {
          companyId_employeeNumber: {
            companyId: company.id,
            employeeNumber: 'EMP-001',
          }
        },
        update: {},
        create: {
          businessId: 'EMP-DATA-001',
          profileId: empProfile.id,
          companyId: company.id,
          employeeNumber: 'EMP-001',
          status: EmployeeStatus.ACTIVE,
          joinedDate: new Date(),
          createdBy: env.systemUuid,
          updatedBy: env.systemUuid,
        },
      });
    });

    console.log(`  -> Seeded Demo Employees and Candidates.`);
  }
}
