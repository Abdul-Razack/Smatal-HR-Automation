import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { IGeneratedDocumentRepository } from '../../domain/repositories/IGeneratedDocumentRepository';
import { GeneratedDocumentAggregate } from '../../domain/aggregates/GeneratedDocumentAggregate';
import { GeneratedDocumentMapper } from '../mappers/GeneratedDocumentMapper';

@Injectable()
export class PrismaGeneratedDocumentRepository implements IGeneratedDocumentRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: GeneratedDocumentMapper,
  ) {}

  async findById(id: string): Promise<GeneratedDocumentAggregate | null> {
    const record = await this.prisma.generatedDocument.findUnique({
      where: { id },
      include: { snapshots: true },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findByBusinessId(
    businessId: string,
  ): Promise<GeneratedDocumentAggregate | null> {
    const record = await this.prisma.generatedDocument.findUnique({
      where: { businessId },
      include: { snapshots: true },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
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
        if (!s.id) continue;
        const sExists = await this.prisma.documentSnapshot.findUnique({
          where: { id: s.id },
        });
        if (!sExists) {
          await this.prisma.documentSnapshot.create({ data: s });
        }
      }
    } else {
      const { snapshots, ...createData } = data;
      await this.prisma.generatedDocument.create({
        data: {
          ...createData,
          snapshots: { create: snapshots },
        },
      });
    }
  }
}
