import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  VersioningType,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/bootstrap/app.module';
import { TransformInterceptor } from '../../src/bootstrap/interceptors/TransformInterceptor';
import { TestConstants } from '../constants/TestConstants';

export class TestHelpers {
  static async bootstrapNestApplication(): Promise<INestApplication> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(TestConstants.API_PREFIX);
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: TestConstants.API_VERSION,
    });
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );

    await app.init();
    return app;
  }

  static async loginAsSuperAdmin(
    app: INestApplication,
    companyId: string,
  ): Promise<string> {
    const res = await request(app.getHttpServer())
      .post(TestConstants.AUTH.LOGIN_ROUTE)
      .send({
        email: TestConstants.SEED_DATA.SUPER_ADMIN_EMAIL,
        password: TestConstants.SEED_DATA.DEFAULT_PASSWORD,
        companyId,
      });

    if (res.status !== 200) {
      throw new Error(
        `Login failed in setup. Status: ${res.status}, Body: ${JSON.stringify(res.body)}`,
      );
    }

    return res.body.data.accessToken;
  }
}
