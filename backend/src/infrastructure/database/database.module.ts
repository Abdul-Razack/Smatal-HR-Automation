import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { databaseConfig } from './config/database.config';
import { PrismaUnitOfWork } from './transaction/PrismaUnitOfWork';
import { RepositoryFactory } from './repositories/RepositoryFactory';

@Global()
@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
  providers: [PrismaService, PrismaUnitOfWork, RepositoryFactory],
  exports: [PrismaService, PrismaUnitOfWork, RepositoryFactory],
})
export class DatabaseModule {}
