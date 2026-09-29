import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import {
  IGeneratedDocumentRepository,
  GeneratedDocumentFilters,
} from '../../domain/repositories/IGeneratedDocumentRepository';
import { GeneratedDocumentAggregate } from '../../domain/aggregates/GeneratedDocumentAggregate';
import { GeneratedDocumentMapper } from '../mappers/GeneratedDocumentMapper';

const includeRelations = {
  snapshots: true,
  documentType: true,
  templateVersion: {
    include: {
      template: true,
    },
  },
  profile: true,
  Employee: {
    include: {
      profile: true,
    },
  },
  company: true,
};

@Injectable()
export class PrismaGeneratedDocumentRepository implements IGeneratedDocumentRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: GeneratedDocumentMapper,
  ) {}

  async findById(id: string): Promise<GeneratedDocumentAggregate | null> {
    const record = await this.prisma.generatedDocument.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findByBusinessId(
    businessId: string,
  ): Promise<GeneratedDocumentAggregate | null> {
    const record = await this.prisma.generatedDocument.findUnique({
      where: { businessId },
      include: includeRelations,
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findAll(
    companyId: string,
    filters?: GeneratedDocumentFilters,
  ): Promise<GeneratedDocumentAggregate[]> {
    const where: any = { companyId, isDeleted: false };

    if (filters?.employeeId) {
      where.OR = [
        { entityId: filters.employeeId },
        { employeeId: filters.employeeId },
      ];
    } else if (filters?.candidateId) {
      where.OR = [
        { entityId: filters.candidateId },
        { candidateId: filters.candidateId },
      ];
    } else if (filters?.profileId) {
      where.profileId = filters.profileId;
    }

    if (filters?.documentTypeId) {
      where.documentTypeId = filters.documentTypeId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters?.search && filters.search.trim()) {
      const searchTerm = filters.search.trim();
      const searchConditions = [
        { businessId: { contains: searchTerm, mode: 'insensitive' } },
        { documentType: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { Employee: { employeeNumber: { contains: searchTerm, mode: 'insensitive' } } },
        { Employee: { profile: { firstName: { contains: searchTerm, mode: 'insensitive' } } } },
        { Employee: { profile: { lastName: { contains: searchTerm, mode: 'insensitive' } } } },
        { profile: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
        { profile: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
      ];

      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          { OR: searchConditions },
        ];
        delete where.OR;
      } else {
        where.OR = searchConditions;
      }
    }

    const records = await this.prisma.generatedDocument.findMany({
      where,
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit ? Math.min(filters.limit, 200) : 100,
      skip: filters?.offset || 0,
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  async save(document: GeneratedDocumentAggregate): Promise<void> {
    const data = this.mapper.toPersistence(document);
    const exists = await this.prisma.generatedDocument.findUnique({
      where: { id: data.id },
    });

    if (exists) {
      const { id, companyId, snapshots, ...updateData } = data;
      await this.prisma.generatedDocument.update({
        where: { id },
        data: updateData,
      });

      for (const s of snapshots) {
        const snapshotId = s.id || randomUUID();
        const sExists = await this.prisma.documentSnapshot.findUnique({
          where: { id: snapshotId },
        });
        if (!sExists) {
          await this.prisma.documentSnapshot.create({
            data: {
              ...s,
              id: snapshotId,
            },
          });
        }
      }
    } else {
      const { snapshots, ...createData } = data;
      await this.prisma.generatedDocument.create({
        data: {
          ...createData,
          snapshots: {
            create: snapshots.map((s: any) => ({
              ...s,
              id: s.id || randomUUID(),
            })),
          },
        },
      });
    }
  }
}
