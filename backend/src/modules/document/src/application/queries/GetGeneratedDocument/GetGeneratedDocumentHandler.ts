import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetGeneratedDocumentQuery } from './GetGeneratedDocumentQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { IGeneratedDocumentRepository } from '../../../domain/repositories/IGeneratedDocumentRepository';
import { GeneratedDocumentMapper } from '../../../infrastructure/mappers/GeneratedDocumentMapper';

@QueryHandler(GetGeneratedDocumentQuery)
@Injectable()
export class GetGeneratedDocumentHandler implements IQueryHandler<GetGeneratedDocumentQuery> {
  constructor(
    @Inject('IGeneratedDocumentRepository')
    private readonly repository: IGeneratedDocumentRepository,
    private readonly mapper: GeneratedDocumentMapper,
  ) {}

  async execute(query: GetGeneratedDocumentQuery): Promise<Result<any>> {
    try {
      const document = await this.repository.findById(query.documentId);
      if (!document || document.companyId !== query.companyId) {
        return Result.fail(`Document not found: ${query.documentId}`);
      }

      return Result.ok(this.mapper.toDTO(document));
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
