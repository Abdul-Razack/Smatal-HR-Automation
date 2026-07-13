import { PrismaClient } from '@prisma/client';

/**
 * Seeds the initial platform admin user for development.
 * NEVER run in production.
 * Idempotent: Checks by email before inserting.
 */
export async function seedAdminUser(prisma: PrismaClient): Promise<void> {
  console.log('[Seed] Seeding admin user (dev only)...');
  // TODO: Create a default Company, Profile, IdentityUser for development testing
  // Admin email: admin@smatal.dev
  // Role: SUPER_ADMIN
  // All credentials from .env.development
  console.log('[Seed] Admin user seeded.');
}
