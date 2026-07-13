import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { IDocumentTypeRepository } from '../../domain/repositories/IDocumentTypeRepository';
import { DocumentTypeAggregate } from '../../domain/aggregates/DocumentTypeAggregate';
import { DocumentTypeMapper } from '../mappers/DocumentTypeMapper';

@Injectable()
export class PrismaDocumentTypeRepository implements IDocumentTypeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: DocumentTypeMapper,
  ) {}

  async findById(id: string): Promise<DocumentTypeAggregate | null> {
    const record = await this.prisma.documentType.findUnique({ where: { id } });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findByBusinessId(
    businessId: string,
  ): Promise<DocumentTypeAggregate | null> {
    const record = await this.prisma.documentType.findUnique({
      where: { businessId },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async save(documentType: DocumentTypeAggregate): Promise<void> {
    const data = this.mapper.toPersistence(documentType);

    const exists = await this.prisma.documentType.findUnique({
      where: { id: data.id },
    });

    if (exists) {
      const { id, companyId, ...updateData } = data;
      await this.prisma.documentType.update({
        where: { id },
        data: updateData,
      });
    } else {
      await this.prisma.documentType.create({ data: data });
    }
  }
}
