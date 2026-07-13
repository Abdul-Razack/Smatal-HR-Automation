import { PrismaClient } from '@prisma/client';

/**
 * Seeds system document types.
 * Idempotent: Uses upsert by code.
 */
export async function seedDocumentTypes(prisma: PrismaClient): Promise<void> {
  console.log('[Seed] Seeding document types...');
  // TODO: Insert document types:
  // OFFER_LETTER, APPOINTMENT_ORDER, CONFIRMATION, PROMOTION, TRANSFER,
  // RELIEVING, EXPERIENCE_LETTER, RESIGNATION, TERMINATION
  console.log('[Seed] Document types seeded.');
}
