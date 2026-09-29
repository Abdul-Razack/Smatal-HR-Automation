import { PrismaClient } from '@prisma/client';

export const STANDARD_DOCUMENT_TYPES = [
  {
    code: 'OFFER_LETTER',
    name: 'Offer Letter',
    description: 'Employment offer issued before joining',
  },
  {
    code: 'APPOINTMENT_LETTER',
    name: 'Appointment Letter',
    description: 'Formal employment appointment letter specifying terms and conditions',
  },
  {
    code: 'JOINING_LETTER',
    name: 'Joining Letter',
    description: 'Joining confirmation and official reporting documentation',
  },
  {
    code: 'CONFIRMATION_LETTER',
    name: 'Confirmation Letter',
    description: 'Employment confirmation issued following probation completion',
  },
  {
    code: 'PROMOTION_LETTER',
    name: 'Promotion Letter',
    description: 'Official promotion letter recognizing role advancement and title upgrade',
  },
  {
    code: 'SALARY_REVISION_LETTER',
    name: 'Salary Revision Letter',
    description: 'Formal compensation adjustment and increment letter',
  },
  {
    code: 'NOC',
    name: 'No Objection Certificate (NOC)',
    description: 'Official No Objection Certificate for travel, banking, or education',
  },
  {
    code: 'RESIGNATION_ACCEPTANCE',
    name: 'Resignation Acceptance Letter',
    description: 'Formal acknowledgement and acceptance of employee resignation',
  },
  {
    code: 'RELIEVING_LETTER',
    name: 'Relieving Letter',
    description: 'Official relieving letter issued upon exit handover completion',
  },
  {
    code: 'EXPERIENCE_CERTIFICATE',
    name: 'Experience Certificate',
    description: 'Employment experience and service period confirmation',
  },
  {
    code: 'SERVICE_CERTIFICATE',
    name: 'Service Certificate',
    description: 'Comprehensive service and conduct certificate for separated employees',
  },
];

export async function seedDocumentTypes(
  prisma: PrismaClient,
  systemUuid?: string,
): Promise<void> {
  console.log('[Seed] Seeding standard document types...');
  const companies = await prisma.company.findMany();
  const actor = systemUuid || '00000000-0000-0000-0000-000000000001';

  for (const company of companies) {
    for (let i = 0; i < STANDARD_DOCUMENT_TYPES.length; i++) {
      const dt = STANDARD_DOCUMENT_TYPES[i];
      const businessId = `DCT-${String(i + 1).padStart(3, '0')}`;

      await prisma.documentType.upsert({
        where: {
          companyId_code: {
            companyId: company.id,
            code: dt.code,
          },
        },
        update: {
          name: dt.name,
          description: dt.description,
          isActive: true,
        },
        create: {
          businessId: `${company.code || 'CMP'}-${businessId}`,
          companyId: company.id,
          code: dt.code,
          name: dt.name,
          description: dt.description,
          isActive: true,
          createdBy: actor,
          updatedBy: actor,
        },
      });
    }
  }
  console.log(`[Seed] Successfully seeded ${STANDARD_DOCUMENT_TYPES.length} standard document types.`);
}
