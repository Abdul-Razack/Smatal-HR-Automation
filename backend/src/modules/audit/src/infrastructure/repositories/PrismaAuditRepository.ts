import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { IAuditRepository } from '../../domain/repositories/IAuditRepository';
import { AuditLogAggregate } from '../../domain/aggregates/AuditLogAggregate';
import { AuditMapper } from '../mappers/AuditMapper';

@Injectable()
export class PrismaAuditRepository implements IAuditRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: AuditMapper,
  ) {}

  async save(auditLog: AuditLogAggregate): Promise<void> {
    const data: any = this.mapper.toPersistence(auditLog);
    await this.prisma.auditLog.create({
      data,
    });
  }

  async findByCompanyId(
    companyId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<AuditLogAggregate[]> {
    const records = await this.prisma.auditLog.findMany({
      where: { companyId },
      orderBy: { performedAt: 'desc' },
      take: limit,
      skip: offset,
    });
    return records.map((record: any) => this.mapper.toDomain(record));
  }

  async findByEntityBusinessId(
    companyId: string,
    entityBusinessId: string,
  ): Promise<AuditLogAggregate[]> {
    const records = await this.prisma.auditLog.findMany({
      where: { companyId, entityBusinessId },
      orderBy: { performedAt: 'desc' },
    });
    return records.map((record: any) => this.mapper.toDomain(record));
  }
}
