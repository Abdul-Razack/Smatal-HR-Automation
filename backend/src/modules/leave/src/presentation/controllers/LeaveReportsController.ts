import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Res,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';

import { GetLeaveDashboardMetricsQuery } from '../../application/queries/GetLeaveDashboardMetrics/GetLeaveDashboardMetricsQuery';
import { GetLeaveChartsQuery } from '../../application/queries/GetLeaveCharts/GetLeaveChartsQuery';
import { GetLeaveReportsQuery } from '../../application/queries/GetLeaveReports/GetLeaveReportsQuery';
import { ExportLeaveReportQuery } from '../../application/queries/ExportLeaveReport/ExportLeaveReportQuery';

@ApiTags('Leave Reports & Analytics')
@Controller('leave/reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeaveReportsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get high-level leave metrics for dashboard' })
  // Using generic JWT auth for dashboard, typically all employees might see some dashboard or we restrict it:
  // For Phase 6, we'll keep it accessible but restricted by frontend logic if needed, or add Leave.View
  // @RequirePermission('Leave.View') // Assuming we might want to restrict it
  async getDashboardMetrics(@Request() req: any) {
    return this.queryBus.execute(
      new GetLeaveDashboardMetricsQuery(req.user.companyId),
    );
  }

  @Get('charts')
  @ApiOperation({ summary: 'Get chart datasets for leave analytics' })
  async getCharts(@Request() req: any) {
    return this.queryBus.execute(new GetLeaveChartsQuery(req.user.companyId));
  }

  @Get('data')
  @ApiOperation({ summary: 'Get paginated tabular report data' })
  @ApiQuery({
    name: 'type',
    required: true,
    description: 'ALL, MONTHLY, DEPARTMENT, EMPLOYEE, BALANCE',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'leaveTypeId', required: false })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'year', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getReportData(
    @Request() req: any,
    @Query('type') type: string,
    @Query() filters: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.queryBus.execute(
      new GetLeaveReportsQuery(
        req.user.companyId,
        type,
        filters,
        +page,
        +limit,
      ),
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export leave report to CSV or PDF' })
  @ApiQuery({ name: 'type', required: true })
  @ApiQuery({ name: 'format', required: true, enum: ['csv', 'pdf'] })
  async exportReport(
    @Request() req: any,
    @Res() res: Response,
    @Query('type') type: string,
    @Query('format') format: 'csv' | 'pdf',
    @Query() filters: any,
  ) {
    const result = await this.queryBus.execute(
      new ExportLeaveReportQuery(req.user.companyId, type, filters, format),
    );

    if (result.isFailure) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ error: result.errorValue });
    }

    const { buffer, contentType, filename } = result.getValue();

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(buffer);
  }
}
