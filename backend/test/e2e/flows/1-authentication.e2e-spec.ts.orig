import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { TestHelpers } from '../../utils/TestHelpers';
import { TestDatabase } from '../../utils/TestDatabase';
import { TestConstants } from '../../constants/TestConstants';
import { PrismaService } from '../../../src/infrastructure/database/prisma.service';

describe('Flow 1: Authentication (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let companyId: string;

  beforeAll(async () => {
    app = await TestHelpers.bootstrapNestApplication();
    const testDb = new TestDatabase(app.get(PrismaService));
    const company = await testDb.getSeedCompany();
    companyId = company.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. User Login - Returns JWT Token', async () => {
    const res = await request(app.getHttpServer())
      .post(TestConstants.AUTH.LOGIN_ROUTE)
      .send({
        email: TestConstants.SEED_DATA.SUPER_ADMIN_EMAIL,
        password: TestConstants.SEED_DATA.DEFAULT_PASSWORD,
        companyId,
      });

    if (res.status !== 200) {
      console.log('Login failed body:', res.body);
    }

    expect(res.status).toBe(HttpStatus.OK);

    expect(res.body.data).toHaveProperty('accessToken');
    jwtToken = res.body.data.accessToken;
  });

  it('2. Fetch Current User Profile - Validates Identity', async () => {
    const res = await request(app.getHttpServer())
      .get(TestConstants.AUTH.ME_ROUTE)
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .expect(HttpStatus.OK);

    expect(res.body.data.email).toEqual('admin@smatal.com');
    expect(res.body.data.firstName).toEqual('Super');
  });

  it('3. Check Role & Permissions - Validates Access Rights', async () => {
    const res = await request(app.getHttpServer())
      .get(TestConstants.AUTH.ROLES_ROUTE)
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .expect(HttpStatus.OK);

    expect(res.body.data).toBeInstanceOf(Array);
  });
});
