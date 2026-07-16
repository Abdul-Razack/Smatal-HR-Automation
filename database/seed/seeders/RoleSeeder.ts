import { BaseSeeder } from '../BaseSeeder';
import { SeedContext } from '../SeedContext';
import { DEMO_COMPANY_BUSINESS_ID } from './CompanySeeder';

export const SUPER_ADMIN_ROLE_BUSINESS_ID = 'ROL-001';

export class RoleSeeder extends BaseSeeder {
  readonly name = 'RoleSeeder';

  async run(context: SeedContext): Promise<void> {
    const { prisma, env } = context;

    if (env.isProduction) {
      console.log(`  -> Skipping Default Roles creation in Production (No Demo Company).`);
      return;
    }

    const company = await prisma.company.findUnique({
      where: { businessId: DEMO_COMPANY_BUSINESS_ID }
    });

    if (!company) {
      throw new Error('Demo Company not found. Run CompanySeeder first.');
    }

    // Get all permissions to assign to Super Admin
    const allPermissions = await prisma.permission.findMany();

    const rolesToSeed = [
      { businessId: SUPER_ADMIN_ROLE_BUSINESS_ID, code: 'SUPER_ADMIN', name: 'Super Admin', description: 'Full system access', isSystem: true },
      { businessId: 'ROL-002', code: 'COMPANY_ADMIN', name: 'Company Admin', description: 'Company level administration', isSystem: true },
      { businessId: 'ROL-003', code: 'HR_MANAGER', name: 'HR Manager', description: 'HR operations', isSystem: true },
      { businessId: 'ROL-004', code: 'RECRUITER', name: 'Recruiter', description: 'Recruitment operations', isSystem: true },
      { businessId: 'ROL-005', code: 'EMPLOYEE', name: 'Employee', description: 'Standard employee access', isSystem: true },
    ];

    await prisma.$transaction(async (tx) => {
      for (const r of rolesToSeed) {
        const role = await tx.role.upsert({
          where: { businessId: r.businessId },
          update: {
            description: r.description,
          },
          create: {
            businessId: r.businessId,
            code: r.code,
            name: r.name,
            description: r.description,
            isSystem: r.isSystem,
            companyId: company.id,
            createdBy: env.systemUuid,
            updatedBy: env.systemUuid,
          },
        });

        // If it's SUPER_ADMIN, assign all permissions
        if (r.code === 'SUPER_ADMIN') {
          for (const perm of allPermissions) {
            await tx.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: role.id,
                  permissionId: perm.id,
                }
              },
              update: {},
              create: {
                roleId: role.id,
                permissionId: perm.id,
                createdBy: env.systemUuid,
              }
            });
          }
        }
      }
    });

    console.log(`  -> Upserted ${rolesToSeed.length} default roles for Demo Company.`);
  }
}
