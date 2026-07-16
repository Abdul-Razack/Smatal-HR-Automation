import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAllGeneratedDocumentsQuery } from './GetAllGeneratedDocumentsQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { IGeneratedDocumentRepository } from '../../../domain/repositories/IGeneratedDocumentRepository';
import { GeneratedDocumentMapper } from '../../../infrastructure/mappers/GeneratedDocumentMapper';

@QueryHandler(GetAllGeneratedDocumentsQuery)
@Injectable()
export class GetAllGeneratedDocumentsHandler implements IQueryHandler<GetAllGeneratedDocumentsQuery> {
  constructor(
    @Inject('IGeneratedDocumentRepository')
    private readonly repository: IGeneratedDocumentRepository,
    private readonly mapper: GeneratedDocumentMapper,
  ) {}

  async execute(query: GetAllGeneratedDocumentsQuery): Promise<Result<any[]>> {
    try {
      const documents = await this.repository.findAll(
        query.companyId,
        query.filters,
      );
      return Result.ok(documents.map((doc) => this.mapper.toDTO(doc)));
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
