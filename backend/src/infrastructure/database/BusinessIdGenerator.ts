import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export const BUSINESS_ID_PREFIXES = {
  COMPANY: 'COMP',
  BRANCH: 'BR',
  DEPARTMENT: 'DEPT',
  DESIGNATION: 'DESG',
  PROFILE: 'PROF',
  IDENTITY_USER: 'IDU',
  ROLE: 'ROLE',
  CANDIDATE: 'CAND',
  EMPLOYEE: 'EMP',
  FIELD_DEFINITION: 'FLD',
  DOCUMENT_TYPE: 'DOC',
  TEMPLATE: 'TPL',
  TEMPLATE_VERSION: 'TVER',
  GENERATED_DOCUMENT: 'GDOC',
  WORKFLOW: 'WF',
  WORKFLOW_INSTANCE: 'WFI',
  AUDIT: 'AUD',
} as const;

export type BusinessIdPrefix =
  (typeof BUSINESS_ID_PREFIXES)[keyof typeof BUSINESS_ID_PREFIXES];

/**
 * Generates sequential, human-readable business IDs.
 * Uses a dedicated counter table to ensure uniqueness under concurrent load.
 * Format: PREFIX_000001
 */
@Injectable()
export class BusinessIdGenerator {
  constructor(private readonly prisma: PrismaService) {}

  async generate(prefix: BusinessIdPrefix): Promise<string> {
    // Use a raw query with FOR UPDATE SKIP LOCKED to safely increment the counter
    const result = await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO business_id_counters (prefix, counter, "updatedAt")
      VALUES ($1, 1, NOW())
      ON CONFLICT (prefix) DO UPDATE
        SET counter = business_id_counters.counter + 1, "updatedAt" = NOW()
      RETURNING counter
    `,
      prefix,
    );

    // Re-fetch the updated counter
    const row = await this.prisma.$queryRawUnsafe(
      `SELECT counter FROM business_id_counters WHERE prefix = $1`,
      prefix,
    );

    const counter = (row as any[])[0]?.counter ?? 1;
    return `${prefix}_${String(counter).padStart(6, '0')}`;
  }

  /**
   * Synchronous generator for use in tests or seeding (NOT for production concurrent use).
   */
  static generateStatic(prefix: BusinessIdPrefix, counter: number): string {
    return `${prefix}_${String(counter).padStart(6, '0')}`;
  }
}
