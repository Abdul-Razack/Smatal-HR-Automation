import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class DiagnosticsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DiagnosticsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Running platform startup diagnostics...');

    // 1. Verify Environment Variables
    const port = this.configService.get('PORT');
    if (!port) {
      this.logger.warn('PORT environment variable not set, defaulting to 3000');
    }

    // 2. Verify Database Connection
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.log('Database connection verified.');
    } catch (error: any) {
      this.logger.error(
        'Database connection failed on startup!',
        error.message,
      );
      // Depending on policy, we might forcefully exit here: process.exit(1);
    }

    this.logger.log('Platform startup diagnostics passed successfully.');
  }
}
