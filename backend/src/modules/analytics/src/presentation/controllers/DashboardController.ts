import {
  Controller,
  Get,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { GetDashboardQuery } from '../../application/queries/GetDashboard/GetDashboardQuery';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get current company HR dashboard summary' })
  async getSummary(@Request() req: any) {
    const result = await this.queryBus.execute(
      new GetDashboardQuery(req.user.companyId, 'HR'),
    );
    if (result.isFailure) throw new BadRequestException(result.errorValue);
    return result.getValue();
  }

  @Get()
  @ApiOperation({ summary: 'Get current company HR dashboard' })
  async getDashboard(@Request() req: any) {
    const result = await this.queryBus.execute(
      new GetDashboardQuery(req.user.companyId, 'HR'),
    );
    if (result.isFailure) throw new BadRequestException(result.errorValue);
    return result.getValue();
  }
}
