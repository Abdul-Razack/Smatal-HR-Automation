import { BaseSeeder } from '../BaseSeeder';
import { SeedContext } from '../SeedContext';
import { DEMO_COMPANY_BUSINESS_ID } from './CompanySeeder';
import { SUPER_ADMIN_ROLE_BUSINESS_ID } from './RoleSeeder';
import * as bcrypt from 'bcryptjs';

export const ADMIN_USER_BUSINESS_ID = 'USR-001';

export class AdminUserSeeder extends BaseSeeder {
  readonly name = 'AdminUserSeeder';

  async run(context: SeedContext): Promise<void> {
    const { prisma, env } = context;

    if (env.isProduction) {
      console.log(`  -> Skipping Admin User creation in Production (No Demo Company).`);
      return;
    }

    const company = await prisma.company.findUnique({
      where: { businessId: DEMO_COMPANY_BUSINESS_ID }
    });

    const adminRole = await prisma.role.findUnique({
      where: { businessId: SUPER_ADMIN_ROLE_BUSINESS_ID }
    });

    if (!company || !adminRole) {
      throw new Error('Demo Company or Super Admin Role not found. Run previous seeders first.');
    }

    const email = env.defaultAdminEmail;
    const password = env.defaultAdminPassword;
    const nameParts = env.defaultAdminName.split(' ');
    const firstName = nameParts[0] || 'Super';
    const lastName = nameParts.slice(1).join(' ') || 'Admin';

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.upsert({
        where: { personalEmail: email },
        update: {
          firstName,
          lastName,
        },
        create: {
          firstName,
          lastName,
          personalEmail: email,
          phone: '+1234567890',
          createdBy: env.systemUuid,
          updatedBy: env.systemUuid,
        },
      });

      const user = await tx.identityUser.upsert({
        where: { businessId: ADMIN_USER_BUSINESS_ID },
        update: {
          passwordHash: hashedPassword,
        },
        create: {
          businessId: ADMIN_USER_BUSINESS_ID,
          email: email,
          passwordHash: hashedPassword,
          isActive: true,
          isEmailVerified: true,
          lastLoginAt: new Date(),
          companyId: company.id,
          profileId: profile.id,
          createdBy: env.systemUuid,
          updatedBy: env.systemUuid,
        },
      });

      // Assign role
      await tx.userRole.upsert({
        where: {
          identityUserId_roleId: {
            identityUserId: user.id,
            roleId: adminRole.id,
          }
        },
        update: {},
        create: {
          identityUserId: user.id,
          roleId: adminRole.id,
          assignedBy: env.systemUuid,
        }
      });
    });

    console.log(`  -> Ensured Admin User exists with email: ${email}`);
  }
}
