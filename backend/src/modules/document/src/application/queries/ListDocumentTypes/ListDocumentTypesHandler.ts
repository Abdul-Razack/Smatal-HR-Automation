import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListDocumentTypesQuery } from './ListDocumentTypesQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import { STANDARD_HR_DOCUMENT_TYPES } from '../../../domain/constants/StandardDocumentTypes';

@QueryHandler(ListDocumentTypesQuery)
@Injectable()
export class ListDocumentTypesHandler
  implements IQueryHandler<ListDocumentTypesQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListDocumentTypesQuery): Promise<Result<any[]>> {
    try {
      // 1. Check if this company has any document types
      const count = await this.prisma.documentType.count({
        where: {
          companyId: query.companyId,
          isDeleted: false,
        },
      });

      // 2. If no document types exist, auto-seed the 11 standard types for this company
      if (count === 0) {
        const company = await this.prisma.company.findUnique({
          where: { id: query.companyId },
        });

        if (company) {
          const actor = '00000000-0000-0000-0000-000000000001';
          for (let i = 0; i < STANDARD_HR_DOCUMENT_TYPES.length; i++) {
            const std = STANDARD_HR_DOCUMENT_TYPES[i];
            const bIdSuffix = `DCT-${String(i + 1).padStart(3, '0')}`;
            const businessId = `${company.code || 'CMP'}-${bIdSuffix}`;

            await this.prisma.documentType.upsert({
              where: {
                companyId_code: {
                  companyId: query.companyId,
                  code: std.code,
                },
              },
              update: {
                name: std.name,
                description: std.description,
                isDeleted: false,
              },
              create: {
                businessId,
                companyId: query.companyId,
                code: std.code,
                name: std.name,
                description: std.description,
                isActive: true,
                isDeleted: false,
                createdBy: actor,
                updatedBy: actor,
              },
            });
          }
        }
      }

      // 3. Build query filters
      const where: any = {
        companyId: query.companyId,
        isDeleted: false,
      };

      if (query.filters?.isActive !== undefined) {
        where.isActive = query.filters.isActive;
      }

      if (query.filters?.search) {
        const search = query.filters.search.trim();
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      // 4. Fetch list
      const records = await this.prisma.documentType.findMany({
        where,
        orderBy: [{ createdAt: 'asc' }],
        include: {
          _count: {
            select: {
              generatedDocs: true,
              templates: true,
            },
          },
        },
      });

      const dtos = records.map((docType: any) => ({
        id: docType.id,
        businessId: docType.businessId,
        companyId: docType.companyId,
        name: docType.name,
        code: docType.code,
        description: docType.description,
        isActive: docType.isActive,
        createdAt: docType.createdAt,
        updatedAt: docType.updatedAt,
        generatedDocumentsCount: docType._count?.generatedDocs || 0,
        templatesCount: docType._count?.templates || 0,
      }));

      return Result.ok(dtos);
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
