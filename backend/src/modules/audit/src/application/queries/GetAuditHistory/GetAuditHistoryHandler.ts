import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAuditHistoryQuery } from './GetAuditHistoryQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { IAuditRepository } from '../../../domain/repositories/IAuditRepository';
import { AuditMapper } from '../../../infrastructure/mappers/AuditMapper';

@QueryHandler(GetAuditHistoryQuery)
@Injectable()
export class GetAuditHistoryHandler implements IQueryHandler<GetAuditHistoryQuery> {
  constructor(
    @Inject('IAuditRepository') private readonly repository: IAuditRepository,
    private readonly mapper: AuditMapper,
  ) {}

  async execute(query: GetAuditHistoryQuery): Promise<Result<any[]>> {
    try {
      let logs;
      if (query.entityBusinessId) {
        logs = await this.repository.findByEntityBusinessId(
          query.companyId,
          query.entityBusinessId,
        );
      } else {
        logs = await this.repository.findByCompanyId(
          query.companyId,
          query.limit,
          query.offset,
        );
      }

      const dtos = logs.map((log) => this.mapper.toDTO(log));
      return Result.ok(dtos);
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
