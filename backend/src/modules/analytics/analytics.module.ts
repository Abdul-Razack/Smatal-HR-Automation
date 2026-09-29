import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DatabaseModule } from '../../infrastructure/database/database.module';

// Query Handlers
import { GetDashboardHandler } from './src/application/queries/GetDashboard/GetDashboardHandler';
import { GlobalSearchHandler } from './src/application/queries/GlobalSearch/GlobalSearchHandler';
import { GetReportHandler } from './src/application/queries/GetReport/GetReportHandler';

// Controllers
import { AnalyticsController } from './src/presentation/controllers/AnalyticsController';
import { DashboardController } from './src/presentation/controllers/DashboardController';

const QueryHandlers = [
  GetDashboardHandler,
  GlobalSearchHandler,
  GetReportHandler,
];

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [AnalyticsController, DashboardController],
  providers: [...QueryHandlers],
})
export class AnalyticsModule {}
