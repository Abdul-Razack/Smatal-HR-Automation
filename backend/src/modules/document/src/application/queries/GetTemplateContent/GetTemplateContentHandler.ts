import { Injectable, Inject, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTemplateContentQuery } from './GetTemplateContentQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';
import { HtmlConverterService } from '../../../infrastructure/services/HtmlConverterService';
import { StorageFactory } from '../../../../../../infrastructure/storage/StorageFactory';

export interface TemplateContentDto {
  templateId: string;
  versionId: string;
  versionNumber: number;
  contentType: 'html' | 'docx';
  content: string;
}

@QueryHandler(GetTemplateContentQuery)
@Injectable()
export class GetTemplateContentHandler implements IQueryHandler<GetTemplateContentQuery> {
  private readonly logger = new Logger(GetTemplateContentHandler.name);

  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepo: ITemplateRepository,
    private readonly htmlConverter: HtmlConverterService,
    private readonly storageFactory: StorageFactory,
  ) {}

  async execute(query: GetTemplateContentQuery): Promise<Result<TemplateContentDto>> {
    try {
      const template = await this.templateRepo.findById(query.templateId);
      if (!template || template.companyId !== query.companyId) {
        return Result.fail('Template not found or unauthorized.');
      }

      let version = query.versionId
        ? template.versions.find((v) => v.id.toValue() === query.versionId)
        : template.getActiveVersion();

      if (!version) {
        const sorted = [...template.versions].sort((a, b) => b.versionNumber - a.versionNumber);
        version = sorted[0];
      }

      if (!version) {
        return Result.fail('No template version found.');
      }

      if (version.contentType === 'html') {
        return Result.ok<TemplateContentDto>({
          templateId: template.id.toValue() as string,
          versionId: version.id.toValue() as string,
          versionNumber: version.versionNumber,
          contentType: 'html',
          content: version.content || '',
        });
      }

      if (version.contentType === 'docx') {
        if (!version.storageUri) {
          return Result.fail('DOCX template storage location not found.');
        }
        const storage = this.storageFactory.getService();
        const docxBuffer = await storage.download(version.storageUri);
        const htmlResult = await this.htmlConverter.convertDocxToHtml(docxBuffer);

        return Result.ok<TemplateContentDto>({
          templateId: template.id.toValue() as string,
          versionId: version.id.toValue() as string,
          versionNumber: version.versionNumber,
          contentType: 'docx',
          content: htmlResult.html,
        });
      }

      return Result.fail(`Unsupported content type: ${version.contentType}`);
    } catch (err: any) {
      this.logger.error(`Failed to get template content: ${err.message}`);
      return Result.fail(err.message);
    }
  }
}
