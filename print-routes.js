const { NestFactory } = require('@nestjs/core');
const { VersioningType } = require('@nestjs/common');
const { AppModule } = require('./backend/dist/bootstrap/app.module');
const { TransformInterceptor } = require('./backend/dist/bootstrap/interceptors/TransformInterceptor');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalInterceptors(new TransformInterceptor());
  await app.init();
  
  const server = app.getHttpServer();
  const router = server._events.request._router;
  const availableRoutes = router.stack
    .map(layer => {
      if (layer.route) {
        return {
          route: {
            path: layer.route?.path,
            method: layer.route?.stack[0].method,
          },
        };
      }
    })
    .filter(item => item !== undefined);
  console.log(availableRoutes);
  await app.close();
}
bootstrap();
