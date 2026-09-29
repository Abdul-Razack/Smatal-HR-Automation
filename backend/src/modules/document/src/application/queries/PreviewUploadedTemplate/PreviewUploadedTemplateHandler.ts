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

/** Extract {{key}} tokens from an HTML string without any DOCX/zip processing */
function scanHtmlPlaceholders(html: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const keys = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = regex.exec(html)) !== null) {
    keys.add(m[1].trim());
  }
  return Array.from(keys);
}

/** HTML-escape a value so it cannot inject tags into the template */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
      // ── BRANCH: HTML content path (browser editor) ─────────────────────
      if (query.contentType === 'html') {
        return await this.handleHtmlPreview(query);
      }

      // ── BRANCH: DOCX content path (file upload) ─────────────────────────
      return await this.handleDocxPreview(query);
    } catch (err: any) {
      this.logger.error(`Uploaded preview failed: ${err.message}`);
      return Result.fail(err.message);
    }
  }

  /** HTML-native preview: no PizZip, no DOCX pipeline */
  private async handleHtmlPreview(
    query: PreviewUploadedTemplateQuery,
  ): Promise<Result<PreviewResponseDto>> {
    const htmlString = query.fileBuffer.toString('utf-8');
    const keys = scanHtmlPlaceholders(htmlString);

    const dataProvider = new PreviewDataProvider(query.mode, this.liveDataProvider);
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

    // Replace {{key}} with resolved (HTML-escaped) values
    let resolved = htmlString;
    for (const [k, v] of Object.entries(resolution.resolvedValues)) {
      resolved = resolved.replaceAll(`{{${k}}}`, escapeHtml(v));
    }

    let pdfBuffer: Buffer | undefined;
    if (query.format === 'PDF') {
      try {
        pdfBuffer = await this.pdfConverter.convertToPdf(Buffer.from(resolved, 'utf-8'), 'html');
      } catch (err: any) {
        this.logger.error(`HTML to PDF conversion failed: ${err.message}`);
      }
    }

    const response: PreviewResponseDto = {
      html: resolved,
      pdfBuffer,
      resolvedKeys: resolution.resolvedKeys,
      unresolvedKeys: resolution.unresolvedKeys,
      errors: resolution.errors,
      warnings: resolution.warnings,
    };
    return Result.ok(response);
  }

  /** Existing DOCX pipeline — unchanged */
  private async handleDocxPreview(
    query: PreviewUploadedTemplateQuery,
  ): Promise<Result<PreviewResponseDto>> {
    const scanResult = await this.docxParser.parse(query.fileBuffer);
    const keys = scanResult.placeholders.detected;

    const dataProvider = new PreviewDataProvider(query.mode, this.liveDataProvider);
    const resolution = await this.automaticResolver.resolvePlaceholders(
      keys,
      {
        companyId: query.companyId,
        profileId: '',
        candidateId: query.candidateId,
        employeeId: query.employeeId,
      },
      dataProvider,
    );

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

    const chunks: Buffer[] = [];
    for await (const chunk of genResult.stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const generatedBuffer = Buffer.concat(chunks);

    let html = '';
    let pdfBuffer: Buffer | undefined;
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
  }
}
