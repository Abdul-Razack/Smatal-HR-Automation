import { INestApplication } from '@nestjs/common';

export function setupCors(app: INestApplication): void {
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://app.smatal.com'] // Example production origin
        : true, // Allow all in dev/test
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id', 'x-company-id', 'x-user-id'],
    exposedHeaders: ['x-correlation-id'],
  });
}
