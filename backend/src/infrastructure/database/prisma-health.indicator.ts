import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Health indicator for Prisma Database.
 * Placed here to prepare for Phase 5.5 (or whenever HealthController is fully wired).
 */
@Injectable()
export class PrismaHealthIndicator {
  constructor(private readonly prisma: PrismaService) {}

  async pingCheck(key: string): Promise<any> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        [key]: { status: 'up' },
      };
    } catch (error) {
      return {
        [key]: { status: 'down', message: error.message },
      };
    }
  }
}
