import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTemplateQuery } from './GetTemplateQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';
import { TemplateMapper } from '../../../infrastructure/mappers/TemplateMapper';
import { TemplateDtoMapper } from '../../../presentation/mappers/TemplateDtoMapper';

@QueryHandler(GetTemplateQuery)
@Injectable()
export class GetTemplateHandler implements IQueryHandler<GetTemplateQuery> {
  constructor(
    @Inject('ITemplateRepository')
    private readonly repository: ITemplateRepository,
    private readonly mapper: TemplateMapper,
  ) {}

  async execute(query: GetTemplateQuery): Promise<Result<any>> {
    try {
      const template = await this.repository.findById(query.templateId);
      if (!template || template.companyId !== query.companyId) {
        return Result.fail(`Template not found: ${query.templateId}`);
      }

      return Result.ok(TemplateDtoMapper.toDetailDto(template));
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
