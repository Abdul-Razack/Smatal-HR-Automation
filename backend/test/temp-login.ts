import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/bootstrap/app.module';
import { TransformInterceptor } from '../src/bootstrap/interceptors/TransformInterceptor';
import * as request from 'supertest';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  // app.setGlobalPrefix('api');
  // app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.init();

  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: 'admin@smatal.com', password: 'Admin@123!' });

  console.log('Status:', res.status);
  console.log('Body:', res.body);
  await app.close();
}
bootstrap();
