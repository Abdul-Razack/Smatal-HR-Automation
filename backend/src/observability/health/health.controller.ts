import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('liveness')
  @ApiOperation({ summary: 'Check if the application is alive' })
  checkLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'smatal-api',
    };
  }

  @Get('readiness')
  @ApiOperation({
    summary: 'Check if the application is ready to accept traffic',
  })
  checkReadiness() {
    // In Phase 5.3, no DB/Redis checks are implemented.
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'smatal-api',
      checks: [],
    };
  }
}
