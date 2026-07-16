import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../../src/infrastructure/database/prisma.service';
import { TestHelpers } from '../../utils/TestHelpers';
import { TestDatabase } from '../../utils/TestDatabase';
import { TestConstants } from '../../constants/TestConstants';
import { TestDataFactory } from '../../utils/TestDataFactory';

describe('Flow 3: Employee Setup (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let employeeId: string;
  let companyId: string;
  let candidateId: string;
  const uniqueEmail = TestDataFactory.createEmail('john.employee');
  const uniqueWorkEmail = TestDataFactory.createEmail('john.doe.work');
  let departmentId: string;
  let designationId: string;
  let branchId: string;

  beforeAll(async () => {
    app = await TestHelpers.bootstrapNestApplication();
    const testDb = new TestDatabase(app.get(PrismaService));

    const company = await testDb.getSeedCompany();
    companyId = company.id;

    const prisma = app.get(PrismaService);

    const department = await prisma.department.findFirst({
      where: { companyId },
    });
    departmentId = department
      ? department.id
      : TestConstants.SEED_DATA.SYSTEM_UUID;

    const designation = await testDb.getSeedDesignation(companyId);
    designationId = designation
      ? designation.id
      : TestConstants.SEED_DATA.SYSTEM_UUID;

    const branch = await testDb.getSeedBranch(companyId);
    branchId = branch ? branch.id : TestConstants.SEED_DATA.SYSTEM_UUID;

    const mockProfile = await prisma.profile.upsert({
      where: { personalEmail: uniqueEmail },
      update: {},
      create: {
        firstName: 'John',
        lastName: 'Employee',
        personalEmail: uniqueEmail,
        phone: '+1987654321',
        createdBy: TestConstants.SEED_DATA.SYSTEM_UUID,
        updatedBy: TestConstants.SEED_DATA.SYSTEM_UUID,
      },
    });
    const testProfileId = mockProfile.id;

    const candidate = await prisma.candidate.upsert({
      where: {
        profileId_companyId: {
          companyId: companyId,
          profileId: testProfileId,
        },
      },
      update: {
        status: 'SELECTED',
      },
      create: {
        businessId: TestDataFactory.createCandidateNumber(),
        companyId: companyId,
        profileId: testProfileId,
        status: 'SELECTED',
        source: 'LinkedIn',
        createdBy: TestConstants.SEED_DATA.SYSTEM_UUID,
        updatedBy: TestConstants.SEED_DATA.SYSTEM_UUID,
      },
    });
    candidateId = candidate.id;

    jwtToken = await TestHelpers.loginAsSuperAdmin(app, companyId);
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Convert Candidate to Employee', async () => {
    // This assumes the candidate was marked HIRED in the previous step
    const res = await request(app.getHttpServer())
      .post(`${TestConstants.CANDIDATE.BASE_ROUTE}/${candidateId}/convert`)
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .send({
        joinedDate: new Date().toISOString(),
        departmentId,
        designationId,
        branchId,
        employeeNumber: TestDataFactory.createEmployeeNumber(),
      })
      .expect(HttpStatus.CREATED);

    expect(res.body.data).toHaveProperty('employeeId');
    employeeId = res.body.data.employeeId;
  });

  it('2. Activate Employee', async () => {
    const res = await request(app.getHttpServer())
      .post(`${TestConstants.EMPLOYEE.BASE_ROUTE}/${employeeId}/activate`)
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .expect(HttpStatus.CREATED);

    expect(res.body.data.success).toBe(true);
  });

  it('3. Fetch Employee details to verify setup', async () => {
    const res = await request(app.getHttpServer())
      .get(`${TestConstants.EMPLOYEE.BASE_ROUTE}/${employeeId}`)
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .expect(HttpStatus.OK);

    expect(res.body.data.id).toEqual(employeeId);
    expect(res.body.data.status).toEqual('ACTIVE');
  });
});
