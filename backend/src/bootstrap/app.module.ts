import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { envValidationSchema } from '../kernel/config/env.validation';
import { GlobalExceptionFilter } from '../common/exceptions/global-exception.filter';
import { RequestIdMiddleware } from '../common/middlewares/request-id.middleware';
import { RequestLoggerMiddleware } from '../common/middlewares/request-logger.middleware';
import { AppLogger } from '../observability/logging/logger.service';
import { HealthModule } from '../observability/health/health.module';
import { DatabaseModule } from '../infrastructure/database/database.module';
import { ApplicationLayerModule } from '../kernel/application/application.module';
import { CorrelationIdMiddleware } from '../observability/correlation/CorrelationIdMiddleware';
import { DiagnosticsService } from './diagnostics/DiagnosticsService';
import { IdentityModule } from '../modules/identity/src/identity.module';
import { MasterModule } from '../modules/master/master.module';
import { CandidateModule } from '../modules/candidate/candidate.module';
import { EmployeeModule } from '../modules/employee/employee.module';
import { WorkflowModule } from '../modules/workflow/workflow.module';
import { DocumentModule } from '../modules/document/document.module';
import { AuditModule } from '../modules/audit/audit.module';
import { NotificationModule } from '../modules/notification/notification.module';
import { AnalyticsModule } from '../modules/analytics/analytics.module';

import {
  CacheModule,
  QueueModule,
  MailModule,
  StorageModule,
  SchedulerModule,
} from '@smatal/infrastructure';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      envFilePath: `../.env.${process.env.NODE_ENV || 'development'}`,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    HealthModule,
    DatabaseModule,
    ApplicationLayerModule,
    IdentityModule,

    MasterModule,
    CandidateModule,
    EmployeeModule,
    WorkflowModule,
    DocumentModule,
    AuditModule,
    NotificationModule,
    AnalyticsModule,
    /*
    CacheModule,
    QueueModule,
    MailModule,
    StorageModule,
    SchedulerModule,
    */
  ],
  controllers: [],
  providers: [
    AppLogger,
    DiagnosticsService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
  exports: [AppLogger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        RequestIdMiddleware,
        RequestLoggerMiddleware,
        CorrelationIdMiddleware,
      )
      .forRoutes('*');
  }
}
