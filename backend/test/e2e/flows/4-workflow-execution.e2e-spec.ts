import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../../src/infrastructure/database/prisma.service';
import { TestHelpers } from '../../utils/TestHelpers';
import { TestDatabase } from '../../utils/TestDatabase';
import { TestConstants } from '../../constants/TestConstants';
import { TestDataFactory } from '../../utils/TestDataFactory';

describe('Flow 4: Workflow Execution (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let workflowInstanceId: string;
  let companyId: string;
  let employeeId: string;
  let workflowDefinitionId: string;
  let itStageId: string;
  let orientStageId: string;

  beforeAll(async () => {
    app = await TestHelpers.bootstrapNestApplication();
    const testDb = new TestDatabase(app.get(PrismaService));

    const company = await testDb.getSeedCompany();
    companyId = company?.id || '';

    const wfDef = await testDb.getWorkflowDefinition('WFD-001');
    workflowDefinitionId = wfDef?.id || '';

    const stages = await testDb.getWorkflowStages(workflowDefinitionId);
    itStageId = stages.find((s: any) => s.code === 'IT')?.id || '';
    orientStageId = stages.find((s: any) => s.code === 'ORIENT')?.id || '';

    const prisma = app.get(PrismaService);
    const uniqueEmail = TestDataFactory.createEmail('jane.worker');

    const mockProfile = await prisma.profile.upsert({
      where: { personalEmail: uniqueEmail },
      update: {},
      create: {
        firstName: 'Jane',
        lastName: 'Worker',
        personalEmail: uniqueEmail,
        phone: '+1122334455',
        createdBy: TestConstants.SEED_DATA.SYSTEM_UUID,
        updatedBy: TestConstants.SEED_DATA.SYSTEM_UUID,
      },
    });

    const employeeNumber = TestDataFactory.createEmployeeNumber();
    const mockEmployee = await prisma.employee.upsert({
      where: {
        companyId_employeeNumber: {
          companyId: companyId,
          employeeNumber,
        },
      },
      update: {},
      create: {
        businessId: TestDataFactory.createBusinessId('EMP'),
        companyId: companyId,
        profileId: mockProfile.id,
        employeeNumber,
        status: 'ONBOARDING',
        joinedDate: new Date(),
        createdBy: TestConstants.SEED_DATA.SYSTEM_UUID,
        updatedBy: TestConstants.SEED_DATA.SYSTEM_UUID,
      },
    });
    employeeId = mockEmployee.id;

    jwtToken = await TestHelpers.loginAsSuperAdmin(app, companyId);
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Start Employee Onboarding Workflow', async () => {
    const res = await request(app.getHttpServer())
      .post(TestConstants.WORKFLOW.BASE_ROUTE)
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .send({
        workflowDefinitionId,
        entityId: employeeId,
        entityType: 'EMPLOYEE',
      })
      .expect(HttpStatus.CREATED);

    expect(res.body.data).toHaveProperty('id');
    workflowInstanceId = res.body.data.id;
  });

  it('2. Transition Workflow to Next Stage (Document Collection -> IT Setup)', async () => {
    let res = await request(app.getHttpServer())
      .post(
        `${TestConstants.WORKFLOW.BASE_ROUTE}/${workflowInstanceId}/approve`,
      )
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .send({
        remarks: 'All documents collected.',
      })
      .expect(HttpStatus.CREATED); // NestJS default for POST is 201

    res = await request(app.getHttpServer())
      .get(`${TestConstants.WORKFLOW.BASE_ROUTE}/${workflowInstanceId}`)
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .expect(HttpStatus.OK);

    expect(res.body.data.currentStageId).toEqual(itStageId);
  });

  it('3. Complete IT Setup Stage', async () => {
    let res = await request(app.getHttpServer())
      .post(
        `${TestConstants.WORKFLOW.BASE_ROUTE}/${workflowInstanceId}/approve`,
      )
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .send({
        remarks: 'Laptop issued and accounts created.',
      })
      .expect(HttpStatus.CREATED);

    res = await request(app.getHttpServer())
      .get(`${TestConstants.WORKFLOW.BASE_ROUTE}/${workflowInstanceId}`)
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .expect(HttpStatus.OK);

    expect(res.body.data.currentStageId).toEqual(orientStageId);
  });

  it('4. Finish Final Stage & Mark Workflow as Completed', async () => {
    let res = await request(app.getHttpServer())
      .post(
        `${TestConstants.WORKFLOW.BASE_ROUTE}/${workflowInstanceId}/approve`,
      )
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .send({
        remarks: 'Orientation finished.',
      })
      .expect(HttpStatus.CREATED);

    res = await request(app.getHttpServer())
      .get(`${TestConstants.WORKFLOW.BASE_ROUTE}/${workflowInstanceId}`)
      .set(TestConstants.HEADERS.AUTHORIZATION, `Bearer ${jwtToken}`)
      .set(TestConstants.HEADERS.TENANT_ID, TestConstants.SEED_DATA.TENANT_CODE)
      .expect(HttpStatus.OK);

    // Because 'ORIENT' was isTerminal=true and isFinal=true, it should complete.
    expect(res.body.data.status).toEqual('COMPLETED');
  });
});
