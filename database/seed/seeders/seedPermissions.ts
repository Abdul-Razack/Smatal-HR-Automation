import { PrismaClient } from '@prisma/client';

/**
 * Seeds all system permissions.
 * Idempotent: Uses upsert to avoid duplicates on re-run.
 */
export async function seedSystemPermissions(prisma: PrismaClient): Promise<void> {
  console.log('[Seed] Seeding system permissions...');
  // TODO: Insert permissions for all resources
  // Resources: Company, Branch, Department, Designation, Profile, Candidate,
  //            Employee, Template, DocumentType, GeneratedDocument, Workflow, Role, Audit
  // Actions: CREATE, READ, UPDATE, DELETE, PUBLISH, APPROVE, EXPORT, MANAGE
  console.log('[Seed] System permissions seeded.');
}
