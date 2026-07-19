import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { TemplateAggregate } from '../../domain/aggregates/TemplateAggregate';
import { TemplateMapper } from '../mappers/TemplateMapper';

@Injectable()
export class PrismaTemplateRepository implements ITemplateRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: TemplateMapper,
  ) {}

  async findById(id: string): Promise<TemplateAggregate | null> {
    const record = await this.prisma.template.findUnique({
      where: { id },
      include: {
        versions: {
          include: { placeholders: true },
        },
      },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findByBusinessId(
    businessId: string,
  ): Promise<TemplateAggregate | null> {
    const record = await this.prisma.template.findUnique({
      where: { businessId },
      include: {
        versions: {
          include: { placeholders: true },
        },
      },
    });
    if (!record) return null;
    return this.mapper.toDomain(record);
  }

  async findManyPaginated(
    params: any,
  ): Promise<{ items: TemplateAggregate[]; total: number }> {
    const where: any = { companyId: params.companyId, isDeleted: false };

    if (params.documentTypeId) {
      where.documentTypeId = params.documentTypeId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }

    const [total, records] = await this.prisma.$transaction([
      this.prisma.template.count({ where }),
      this.prisma.template.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: params.sort
          ? { [params.sort]: params.order || 'asc' }
          : { createdAt: 'desc' },
        include: {
          versions: {
            include: { placeholders: true },
          },
        },
      }),
    ]);

    return {
      total,
      items: records.map((record) => this.mapper.toDomain(record)),
    };
  }

  async save(template: TemplateAggregate): Promise<void> {
    const data = this.mapper.toPersistence(template);
    const exists = await this.prisma.template.findUnique({
      where: { id: data.id },
    });

    if (exists) {
      const { id, companyId, documentTypeId, versions, ...updateData } = data;
      await this.prisma.template.update({ where: { id }, data: updateData });

      for (const v of versions) {
        const vExists = await this.prisma.templateVersion.findUnique({
          where: { id: v.id },
        });
        if (vExists) {
          const { id: vId, templateId, placeholders, ...vUpdateData } = v;
          await this.prisma.templateVersion.update({
            where: { id: vId },
            data: vUpdateData,
          });
          await this.prisma.templatePlaceholder.deleteMany({
            where: { templateVersionId: vId },
          });
          if (placeholders?.length) {
            await this.prisma.templatePlaceholder.createMany({
              data: placeholders.map((p: any) => ({
                id: p.id,
                templateVersionId: vId,
                fieldDefinitionId: p.fieldDefinitionId || null,
                placeholderKey: p.placeholderKey,
                isRequired: p.isRequired,
                displayOrder: p.displayOrder,
                createdBy: v.createdBy,
                updatedBy: v.updatedBy,
              })),
            });
          }
        } else {
          const { placeholders, ...vCreateData } = v;
          await this.prisma.templateVersion.create({
            data: {
              ...vCreateData,
              placeholders: {
                create: (placeholders || []).map((p: any) => ({
                  id: p.id,
                  fieldDefinitionId: p.fieldDefinitionId || null,
                  placeholderKey: p.placeholderKey,
                  isRequired: p.isRequired,
                  displayOrder: p.displayOrder,
                  createdBy: v.createdBy,
                  updatedBy: v.updatedBy,
                })),
              },
            },
          });
        }
      }
    } else {
      const { versions, ...createData } = data;
      await this.prisma.template.create({
        data: {
          ...createData,
          versions: {
            create: versions.map((v: any) => {
              const { placeholders, ...vCreateData } = v;
              return {
                ...vCreateData,
                placeholders: {
                  create: (placeholders || []).map((p: any) => ({
                    id: p.id,
                    fieldDefinitionId: p.fieldDefinitionId || null,
                    placeholderKey: p.placeholderKey,
                    isRequired: p.isRequired,
                    displayOrder: p.displayOrder,
                    createdBy: v.createdBy,
                    updatedBy: v.updatedBy,
                  })),
                },
              };
            }),
          },
        },
      });
    }
  }
}
