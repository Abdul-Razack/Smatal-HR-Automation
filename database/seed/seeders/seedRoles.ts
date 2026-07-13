import { PrismaClient } from '@prisma/client';

/**
 * Seeds system roles (Super Admin, HR Admin, Recruiter, etc.).
 * Idempotent: Uses upsert to avoid duplicates on re-run.
 */
export async function seedSystemRoles(prisma: PrismaClient): Promise<void> {
  console.log('[Seed] Seeding system roles...');
  // TODO: Insert roles → SUPER_ADMIN, HR_ADMIN, RECRUITER, INTERVIEWER, EMPLOYEE, AUDITOR
  console.log('[Seed] System roles seeded.');
}
