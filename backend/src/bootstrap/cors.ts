import { INestApplication } from '@nestjs/common';

export function setupCors(app: INestApplication): void {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['https://app.smatal.com'];

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id', 'x-company-id', 'x-user-id'],
    exposedHeaders: [
      'x-correlation-id',
      'X-Validation-Errors',
      'X-Validation-Warnings',
      'X-Resolved-Keys',
      'X-Unresolved-Keys',
      'Content-Disposition',
    ],
  });
}
