import { Controller, Get, Headers, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetDashboardQuery } from '../../application/queries/GetDashboard/GetDashboardQuery';
import { GlobalSearchQuery } from '../../application/queries/GlobalSearch/GlobalSearchQuery';
import { GetReportQuery } from '../../application/queries/GetReport/GetReportQuery';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('dashboard')
  async getDashboard(
    @Headers('x-company-id') companyId: string,
    @Query('type') type: 'HR' | 'ORG' | 'DOC' | 'ATS',
  ) {
    const result = await this.queryBus.execute(
      new GetDashboardQuery(companyId, type || 'HR'),
    );
    if (result.isFailure) throw new Error(result.errorValue);
    return result.getValue();
  }

  @Get('search')
  async globalSearch(
    @Headers('x-company-id') companyId: string,
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    if (!query) return [];

    const result = await this.queryBus.execute(
      new GlobalSearchQuery(
        companyId,
        query,
        limit ? Number(limit) : undefined,
      ),
    );

    if (result.isFailure) throw new Error(result.errorValue);
    return result.getValue();
  }

  @Get('report')
  async getReport(
    @Headers('x-company-id') companyId: string,
    @Query('type') reportType: string,
    @Query() filters: any,
  ) {
    // Remove predefined query params from filters
    const { type, ...actualFilters } = filters;
    const result = await this.queryBus.execute(
      new GetReportQuery(companyId, reportType, actualFilters),
    );

    if (result.isFailure) {
      console.error('AnalyticsController getReport Error:', result.errorValue);
      const { BadRequestException } = require('@nestjs/common');
      throw new BadRequestException(
        typeof result.errorValue === 'string'
          ? result.errorValue
          : JSON.stringify(result.errorValue),
      );
    }
    return result.getValue();
  }
}
