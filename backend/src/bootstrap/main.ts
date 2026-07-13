import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

import { setupCors } from './cors';
import { setupHelmet } from './helmet';
import { setupSwagger } from './swagger';
import { setupValidation } from './validation';
import * as compression from 'compression';
import { TransformInterceptor } from './interceptors/TransformInterceptor';
import { GlobalExceptionFilter } from './filters/GlobalExceptionFilter';
import { AppLogger } from '../observability/logging/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const logger = app.get(AppLogger);
  app.useLogger(logger);

  // Global Prefix & Versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Trust Proxy for Load Balancers
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Security & Middlewares
  setupHelmet(app);
  app.use(compression());
  setupCors(app);
  setupValidation(app);
  setupSwagger(app);

  // Global Interceptors & Filters
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // Dump OpenAPI to file
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Smatal ERP API')
      .setDescription('Enterprise ERP Platform API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build(),
  );
  require('fs').writeFileSync(
    require('path').resolve(__dirname, '../../../../docs/openapi.json'),
    JSON.stringify(document, null, 2),
  );

  // Graceful Shutdown
  app.enableShutdownHooks();

  const port = configService.get<number>('PORT') || 3000;
  const env = configService.get<string>('NODE_ENV') || 'development';

  await app.listen(port);
  console.log(
    `[Smatal ERP] Application running on port ${port} in ${env} mode`,
  );
}

bootstrap();
