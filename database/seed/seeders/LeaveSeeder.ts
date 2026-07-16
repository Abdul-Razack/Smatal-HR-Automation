import { BaseSeeder } from '../BaseSeeder';
import { SeedContext } from '../SeedContext';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

export class LeaveSeeder extends BaseSeeder {
  readonly name = 'LeaveSeeder';

  async run(context: SeedContext): Promise<void> {
    const { prisma } = context;

    // Get the first active company to associate leave types with (Demo purposes)
    const company = await prisma.company.findFirst({
      where: { isDeleted: false, isActive: true },
    });

    if (!company) {
      console.warn('  -> No active company found. Skipping LeaveSeeder.');
      return;
    }

    const leaveTypes = [
      {
        name: 'Annual Leave',
        code: 'ANNUAL',
        description: 'Standard paid annual leave',
        colorCode: '#4CAF50',
        isPaid: true,
      },
      {
        name: 'Sick Leave',
        code: 'SICK',
        description: 'Leave for medical reasons',
        colorCode: '#F44336',
        isPaid: true,
      },
      {
        name: 'Casual Leave',
        code: 'CASUAL',
        description: 'Leave for urgent or unforeseen personal matters',
        colorCode: '#FF9800',
        isPaid: true,
      },
      {
        name: 'Maternity Leave',
        code: 'MATERNITY',
        description: 'Paid leave for maternity',
        colorCode: '#E91E63',
        isPaid: true,
      },
      {
        name: 'Paternity Leave',
        code: 'PATERNITY',
        description: 'Paid leave for paternity',
        colorCode: '#9C27B0',
        isPaid: true,
      },
      {
        name: 'Unpaid Leave',
        code: 'UNPAID',
        description: 'Leave without pay',
        colorCode: '#9E9E9E',
        isPaid: false,
      },
    ];

    let count = 0;

    await prisma.$transaction(async (tx) => {
      for (const lt of leaveTypes) {
        await tx.leaveType.upsert({
          where: {
            companyId_code: {
              companyId: company.id,
              code: lt.code,
            },
          },
          update: {
            name: lt.name,
            description: lt.description,
            colorCode: lt.colorCode,
            isPaid: lt.isPaid,
            isDeleted: false,
          },
          create: {
            id: uuidv4(),
            businessId: `LT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            companyId: company.id,
            name: lt.name,
            code: lt.code,
            description: lt.description,
            colorCode: lt.colorCode,
            isPaid: lt.isPaid,
            createdBy: company.createdBy, // Using company creator as default
            updatedBy: company.createdBy,
          },
        });
        count++;
      }
    });

    console.log(`  -> Upserted ${count} leave types for company ${company.name}.`);
  }
}
