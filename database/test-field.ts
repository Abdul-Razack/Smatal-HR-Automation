import { PrismaClient, FieldDataType, FieldEntityType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const companyId = 'c928c0c9-6cd1-4191-9c88-e9f0d3a5160c';
  
  // Insert a custom field
  const field = await prisma.fieldDefinition.create({
    data: {
      businessId: 'FD-TEST-1234',
      companyId: companyId,
      machineKey: 'passportNumber',
      displayName: 'Passport Number',
      description: 'Employee Passport Number',
      dataType: FieldDataType.TEXT,
      entityType: FieldEntityType.EMPLOYEE,
      isSystem: false,
      isRequired: true,
      createdBy: companyId,
      updatedBy: companyId
    }
  });
  console.log("Created field:", field.machineKey);
}

main().catch(console.error).finally(() => prisma.$disconnect());
