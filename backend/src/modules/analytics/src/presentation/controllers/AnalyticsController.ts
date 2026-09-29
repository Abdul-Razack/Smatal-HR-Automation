import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { GetDashboardQuery } from '../../application/queries/GetDashboard/GetDashboardQuery';
import { GlobalSearchQuery } from '../../application/queries/GlobalSearch/GlobalSearchQuery';
import { GetReportQuery } from '../../application/queries/GetReport/GetReportQuery';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get analytics dashboard for authenticated tenant' })
  async getDashboard(
    @Request() req: any,
    @Query('type') type: 'HR' | 'ORG' | 'DOC' | 'ATS',
  ) {
    const result = await this.queryBus.execute(
      new GetDashboardQuery(req.user.companyId, type || 'HR'),
    );
    if (result.isFailure) throw new BadRequestException(result.errorValue);
    return result.getValue();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get HR dashboard summary for authenticated tenant' })
  async getSummary(@Request() req: any) {
    const result = await this.queryBus.execute(
      new GetDashboardQuery(req.user.companyId, 'HR'),
    );
    if (result.isFailure) throw new BadRequestException(result.errorValue);
    return result.getValue();
  }

  @Get('search')
  @ApiOperation({ summary: 'Global tenant-isolated search' })
  async globalSearch(
    @Request() req: any,
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    if (!query) return [];

    const result = await this.queryBus.execute(
      new GlobalSearchQuery(
        req.user.companyId,
        query,
        limit ? Number(limit) : undefined,
      ),
    );

    if (result.isFailure) throw new BadRequestException(result.errorValue);
    return result.getValue();
  }

  @Get('report')
  @ApiOperation({ summary: 'Get tenant reports' })
  async getReport(
    @Request() req: any,
    @Query('type') reportType: string,
    @Query() filters: any,
  ) {
    // Remove predefined query params from filters
    const { type, ...actualFilters } = filters;
    const result = await this.queryBus.execute(
      new GetReportQuery(req.user.companyId, reportType, actualFilters),
    );

    if (result.isFailure) {
      console.error('AnalyticsController getReport Error:', result.errorValue);
      throw new BadRequestException(
        typeof result.errorValue === 'string'
          ? result.errorValue
          : JSON.stringify(result.errorValue),
      );
    }
    return result.getValue();
  }
}
