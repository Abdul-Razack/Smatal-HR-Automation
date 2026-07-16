import { BaseSeeder } from '../BaseSeeder';
import { SeedContext } from '../SeedContext';
import { DEMO_COMPANY_BUSINESS_ID } from './CompanySeeder';
import { WorkflowStatus } from '@prisma/client';

export class WorkflowSeeder extends BaseSeeder {
  readonly name = 'WorkflowSeeder';

  async run(context: SeedContext): Promise<void> {
    const { prisma, env } = context;

    if (env.isProduction) {
      console.log(`  -> Skipping Demo Workflows in Production.`);
      return;
    }

    const company = await prisma.company.findUnique({
      where: { businessId: DEMO_COMPANY_BUSINESS_ID }
    });

    if (!company) {
      throw new Error('Demo Company not found.');
    }

    await prisma.workflowDefinition.upsert({
      where: { businessId: 'WFD-001' },
      update: {},
      create: {
        businessId: 'WFD-001',
        companyId: company.id,
        name: 'Standard Onboarding',
        entityType: 'EMPLOYEE',
        status: WorkflowStatus.ACTIVE,
        createdBy: env.systemUuid,
        updatedBy: env.systemUuid,
        stages: {
          create: [
            { name: 'Document Collection', code: 'DOCS', displayOrder: 1, createdBy: env.systemUuid, updatedBy: env.systemUuid },
            { name: 'IT Setup', code: 'IT', displayOrder: 2, createdBy: env.systemUuid, updatedBy: env.systemUuid },
            { name: 'Orientation', code: 'ORIENT', displayOrder: 3, isFinal: true, isTerminal: true, createdBy: env.systemUuid, updatedBy: env.systemUuid },
          ],
        },
      },
    });

    console.log(`  -> Seeded Default Workflow Definitions.`);
  }
}
