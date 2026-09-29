import { Injectable, Logger } from '@nestjs/common';
import { PdfGenerationService } from './PdfGenerationService';

@Injectable()
export class PdfConverterService {
  private readonly logger = new Logger(PdfConverterService.name);

  constructor(private readonly pdfGenerationService: PdfGenerationService) {}

  /**
   * Converts HTML content or DOCX buffers to a genuine PDF buffer.
   */
  public async convertToPdf(
    buffer: Buffer,
    sourceContentType: string,
  ): Promise<Buffer> {
    if (sourceContentType === 'html' || sourceContentType === 'text/html') {
      return this.pdfGenerationService.generateFromHtml(
        buffer.toString('utf-8'),
      );
    }

    if (
      sourceContentType === 'docx' ||
      sourceContentType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return this.pdfGenerationService.generateFromDocx(buffer);
    }

    throw new Error(`Unsupported conversion to PDF from ${sourceContentType}`);
  }
}
