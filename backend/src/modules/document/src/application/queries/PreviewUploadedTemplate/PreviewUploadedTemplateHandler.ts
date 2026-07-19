import { Injectable, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PreviewUploadedTemplateQuery } from './PreviewUploadedTemplateQuery';
import { Result } from '../../../../../../kernel/result/Result';
import { DocxParser } from '../../../infrastructure/parsers/DocxParser';
import { AutomaticResolverService } from '../../../domain/services/AutomaticResolverService';
import { DocxGeneratorStrategy } from '../../../infrastructure/generators/DocxGeneratorStrategy';
import { HtmlConverterService } from '../../../infrastructure/services/HtmlConverterService';
import { PdfConverterService } from '../../../infrastructure/services/PdfConverterService';

import { PreviewResponseDto } from '../../../presentation/dtos/PreviewResponseDto';
import { DocumentRenderContext } from '../../../domain/models/DocumentRenderContext';
import { Readable } from 'stream';
import { PrismaEntityDataProvider } from '../../../infrastructure/data/PrismaEntityDataProvider';
import { PreviewDataProvider } from '../../../infrastructure/data/PreviewDataProvider';

@QueryHandler(PreviewUploadedTemplateQuery)
@Injectable()
export class PreviewUploadedTemplateHandler implements IQueryHandler<PreviewUploadedTemplateQuery> {
  private readonly logger = new Logger(PreviewUploadedTemplateHandler.name);

  constructor(
    private readonly docxParser: DocxParser,
    private readonly automaticResolver: AutomaticResolverService,
    private readonly docxGenerator: DocxGeneratorStrategy,
    private readonly htmlConverter: HtmlConverterService,
    private readonly pdfConverter: PdfConverterService,
    private readonly liveDataProvider: PrismaEntityDataProvider,
  ) {}

  async execute(query: PreviewUploadedTemplateQuery): Promise<Result<PreviewResponseDto>> {
    try {
      // 1. Scan the uploaded buffer for placeholders
      let keys: string[] = [];
      const scanResult = await this.docxParser.parse(query.fileBuffer);
      keys = scanResult.placeholders.detected;

      // 2. Setup Data Provider
      const dataProvider = new PreviewDataProvider(query.mode, this.liveDataProvider);

      // 3. Resolve placeholders
      const resolution = await this.automaticResolver.resolvePlaceholders(
        keys, 
        {
          companyId: query.companyId,
          profileId: '',
          candidateId: query.candidateId,
          employeeId: query.employeeId,
        },
        dataProvider
      );

      // 4. Generate Document
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

      const templateStream = Readable.from([query.fileBuffer]);
      const genResult = await this.docxGenerator.generate(templateStream, renderContext);
      
      // 5. Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of genResult.stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const generatedBuffer = Buffer.concat(chunks);

      let html = '';
      let pdfBuffer: Buffer | undefined;

      // 6. Convert to requested format
      const htmlResult = await this.htmlConverter.convertDocxToHtml(generatedBuffer);
      html = htmlResult.html;
      if (query.format === 'PDF') {
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
      this.logger.error(`Uploaded preview failed: ${err.message}`);
      return Result.fail(err.message);
    }
  }
}
