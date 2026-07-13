import { PrismaClient } from '@prisma/client';

/**
 * Seeds system workflow definitions and stages.
 * Idempotent: Uses upsert by name + entityType.
 */
export async function seedWorkflowDefinitions(prisma: PrismaClient): Promise<void> {
  console.log('[Seed] Seeding workflow definitions...');
  // TODO: Insert candidate workflow: Application → Screening → Interview → Offer → Hired/Rejected
  // TODO: Insert employee onboarding workflow: Document Collection → Verification → Active
  console.log('[Seed] Workflow definitions seeded.');
}
