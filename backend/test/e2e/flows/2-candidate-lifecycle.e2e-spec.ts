import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../../src/infrastructure/database/prisma.service';
import { TestHelpers } from '../../utils/TestHelpers';
import { TestDatabase } from '../../utils/TestDatabase';
import { TestConstants } from '../../constants/TestConstants';
import { TestDataFactory } from '../../utils/TestDataFactory';

describe('Flow 2: Candidate Lifecycle (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let candidateId: string;
  let testProfileId: string;
  let companyId: string;
  const uniqueEmail = TestDataFactory.createEmail('john.doe');

  beforeAll(async () => {
    app = await TestHelpers.bootstrapNestApplication();
    const testDb = new TestDatabase(app.get(PrismaService));
    const company = await testDb.getSeedCompany();
    companyId = company?.id || '';

    // Create a mock profile
    const prisma = app.get(PrismaService);
    const mockProfile = await prisma.profile.upsert({
      where: { personalEmail: uniqueEmail },
      update: {},
      create: {
        firstName: 'John',
        lastName: 'Doe',
        personalEmail: uniqueEmail,
        phone: '+1234567890',
        createdBy: TestConstants.SEED_DATA.SYSTEM_UUID,
        updatedBy: TestConstants.SEED_DATA.SYSTEM_UUID,
      },
    });
    testProfileId = mockProfile.id;

    jwtToken = await TestHelpers.loginAsSuperAdmin(app, companyId);
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Create Candidate Profile', async () => {
    const res = await request(app.getHttpServer())
      .post(TestConstants.CANDIDATE.BASE_ROUTE)
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .send({
        profileId: testProfileId,
        source: 'LinkedIn',
      });

    if (res.status !== 201) {
      console.log('Candidate creation failed:', res.status, res.body);
    }

    expect(res.status).toBe(HttpStatus.CREATED);

    expect(res.body.data).toHaveProperty('id');
    candidateId = res.body.data.id;
  });

  it('2. Submit Application', async () => {
    const res = await request(app.getHttpServer())
      .post(`${TestConstants.CANDIDATE.BASE_ROUTE}/${candidateId}/submit`)
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .send({
        notes: 'Submitted application',
      })
      .expect(HttpStatus.CREATED);

    expect(res.body.data.success).toBe(true);
  });

  it('3. Screen Candidate', async () => {
    const res = await request(app.getHttpServer())
      .post(`${TestConstants.CANDIDATE.BASE_ROUTE}/${candidateId}/screen`)
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .send({
        notes: 'Passed initial screening',
      })
      .expect(HttpStatus.CREATED);

    expect(res.body.data.success).toBe(true);
  });

  it('4. Select Candidate', async () => {
    const prisma = app.get(PrismaService);
    const res = await request(app.getHttpServer())
      .post(`${TestConstants.CANDIDATE.BASE_ROUTE}/${candidateId}/select`)
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .expect(HttpStatus.CREATED);

    // Verify via DB since CQRS command doesn't return the updated entity
    const updated = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });
    expect(updated?.status).toEqual('SELECTED');
  });
});
