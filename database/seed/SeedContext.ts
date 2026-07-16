import { PrismaClient } from '@prisma/client';

export interface EnvironmentConfig {
  nodeEnv: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTesting: boolean;
  isDemo: boolean;
  defaultAdminEmail: string;
  defaultAdminPassword: string;
  defaultAdminName: string;
  systemUuid: string;
}

export class SeedContext {
  public readonly prisma: PrismaClient;
  public readonly env: EnvironmentConfig;

  constructor(prisma: PrismaClient, env: EnvironmentConfig) {
    this.prisma = prisma;
    this.env = env;
  }
}
