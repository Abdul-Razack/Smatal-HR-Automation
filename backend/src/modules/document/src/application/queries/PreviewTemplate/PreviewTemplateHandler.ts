import { Injectable, Inject, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PreviewTemplateQuery } from './PreviewTemplateQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { ITemplateRepository } from '../../../domain/repositories/ITemplateRepository';
import { AutomaticResolverService } from '../../../domain/services/AutomaticResolverService';
import { DocxGeneratorStrategy } from '../../../infrastructure/generators/DocxGeneratorStrategy';
import { HtmlConverterService } from '../../../infrastructure/services/HtmlConverterService';
import { PdfConverterService } from '../../../infrastructure/services/PdfConverterService';
import { PreviewResponseDto } from '../../../presentation/dtos/PreviewResponseDto';
import { StorageFactory } from '../../../../../../infrastructure/storage/StorageFactory';
import { DocumentRenderContext } from '../../../domain/models/DocumentRenderContext';
import { Readable } from 'stream';
import { PrismaEntityDataProvider } from '../../../infrastructure/data/PrismaEntityDataProvider';
import { PreviewDataProvider } from '../../../infrastructure/data/PreviewDataProvider';

@QueryHandler(PreviewTemplateQuery)
@Injectable()
export class PreviewTemplateHandler implements IQueryHandler<PreviewTemplateQuery> {
  private readonly logger = new Logger(PreviewTemplateHandler.name);

  constructor(
    @Inject('ITemplateRepository')
    private readonly templateRepo: ITemplateRepository,
    private readonly automaticResolver: AutomaticResolverService,
    private readonly docxGenerator: DocxGeneratorStrategy,
    private readonly htmlConverter: HtmlConverterService,
    private readonly pdfConverter: PdfConverterService,
    private readonly storageFactory: StorageFactory,
    private readonly liveDataProvider: PrismaEntityDataProvider,
  ) {}

  async execute(query: PreviewTemplateQuery): Promise<Result<PreviewResponseDto>> {
    try {
      const template = await this.templateRepo.findById(query.templateId);
      if (!template || template.companyId !== query.companyId) {
        return Result.fail('Template not found or unauthorized.');
      }

      const activeVersion = template.getActiveVersion();
      if (!activeVersion) {
        return Result.fail('No active template version found.');
      }

      if (activeVersion.contentType !== 'docx' || !activeVersion.storageUri) {
        return Result.fail('Only DOCX templates support preview via this pipeline.');
      }

      // 1. Fetch template stream from storage
      const storage = this.storageFactory.getService();
      const templateStream = await storage.download(activeVersion.storageUri);

      // 2. Setup Data Provider
      const dataProvider = new PreviewDataProvider(query.mode, this.liveDataProvider);

      // 3. Resolve placeholders
      const keys = activeVersion.placeholders.map((p) => p.placeholderKey);
      const resolution = await this.automaticResolver.resolvePlaceholders(
        keys,
        {
          companyId: query.companyId,
          profileId: query.employeeId || query.candidateId || '',
          candidateId: query.candidateId,
          employeeId: query.employeeId,
        },
        dataProvider,
      );

      // 4. Generate DOCX
      const renderContext: DocumentRenderContext = {
        tenantId: query.companyId,
        companyId: query.companyId,
        profileId: query.employeeId || query.candidateId || '',
        placeholders: resolution.resolvedValues,
        locale: 'en-US',
        timezone: 'UTC',
        currency: 'USD',
        generatedDate: new Date(),
      };

      const docxResult = await this.docxGenerator.generate(Readable.from([templateStream]), renderContext);
      
      // 4. Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of docxResult.stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const docxBuffer = Buffer.concat(chunks);

      let html = '';
      let pdfBuffer: Buffer | undefined;

      // 6. Convert to requested format
      if (query.format === 'HTML') {
        const htmlResult = await this.htmlConverter.convertDocxToHtml(docxBuffer);
        html = htmlResult.html;
      } else {
        const htmlResult = await this.htmlConverter.convertDocxToHtml(docxBuffer);
        pdfBuffer = await this.pdfConverter.convertToPdf(Buffer.from(htmlResult.html), 'html');
      }

      const response: PreviewResponseDto = {
        html,
        pdfBuffer,
        resolvedKeys: resolution.resolvedKeys,
        unresolvedKeys: resolution.unresolvedKeys,
        errors: resolution.errors,
        warnings: resolution.warnings,
      };

      return Result.ok(response);
    } catch (err: any) {
      this.logger.error(`Preview failed: ${err.message}`);
      return Result.fail(err.message);
    }
  }
}
