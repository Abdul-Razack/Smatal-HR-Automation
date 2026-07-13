import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/bootstrap/app.module';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to generate OpenAPI JSON definition without starting the full HTTP server.
 * Requires the Database to be accessible so the ApplicationModule can initialize.
 */
async function generateOpenApi() {
  console.log('Generating OpenAPI Spec...');
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('Smatal HR System API')
    .setDescription('The complete API contract for Smatal HR System Backend')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .addGlobalParameters({
      in: 'header',
      required: true,
      name: 'x-tenant-id',
      schema: { type: 'string' },
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const outputPath = path.join(__dirname, '../../docs/openapi.json');

  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log(`OpenAPI Spec generated successfully at: ${outputPath}`);

  await app.close();
  process.exit(0);
}

generateOpenApi().catch((error) => {
  console.error('Failed to generate OpenAPI Spec:', error);
  process.exit(1);
});
