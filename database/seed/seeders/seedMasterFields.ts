import { PrismaClient } from '@prisma/client';

/**
 * Seeds system master field definitions.
 * Idempotent: Uses upsert by machineKey.
 */
export async function seedMasterFields(prisma: PrismaClient): Promise<void> {
  console.log('[Seed] Seeding master field definitions...');
  // TODO: Insert system fields:
  // Profile Fields: first_name, last_name, personal_email, dob, blood_group, aadhaar, pan
  // Candidate Fields: applied_position, expected_salary, interview_rating, source, recruiter_notes
  // Employee Fields: employee_code, joining_date, probation_period, confirmation_date, salary
  console.log('[Seed] Master field definitions seeded.');
}
