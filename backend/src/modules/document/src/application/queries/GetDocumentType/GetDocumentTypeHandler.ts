import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetDocumentTypeQuery } from './GetDocumentTypeQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@QueryHandler(GetDocumentTypeQuery)
@Injectable()
export class GetDocumentTypeHandler
  implements IQueryHandler<GetDocumentTypeQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetDocumentTypeQuery): Promise<Result<any>> {
    try {
      const record = await this.prisma.documentType.findUnique({
        where: { id: query.id },
        include: {
          _count: {
            select: {
              generatedDocs: true,
              templates: true,
            },
          },
        },
      });

      if (!record || record.isDeleted || record.companyId !== query.companyId) {
        return Result.fail('Document type not found');
      }

      const dto = {
        id: record.id,
        businessId: record.businessId,
        companyId: record.companyId,
        name: record.name,
        code: record.code,
        description: record.description,
        isActive: record.isActive,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        generatedDocumentsCount: record._count?.generatedDocs || 0,
        templatesCount: record._count?.templates || 0,
      };

      return Result.ok(dto);
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
