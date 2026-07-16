import { Injectable, Logger } from '@nestjs/common';
const htmlPdf = require('html-pdf-node');

@Injectable()
export class PdfConverterService {
  private readonly logger = new Logger(PdfConverterService.name);

  /**
   * Converts HTML content or DOCX buffers to a PDF buffer.
   * This is a stub for DOCX (LibreOffice/Gotenberg integration would go here).
   */
  public async convertToPdf(
    buffer: Buffer,
    sourceContentType: string,
  ): Promise<Buffer> {
    if (sourceContentType === 'html') {
      const options = { format: 'A4', printBackground: true };
      const file = { content: buffer.toString('utf-8') };
      return htmlPdf.generatePdf(file, options);
    }

    if (sourceContentType === 'docx') {
      this.logger.warn(
        'DOCX to PDF conversion is stubbed. Returning original DOCX buffer for now.',
      );
      // In production, send to Gotenberg or use LibreOffice CLI
      return buffer;
    }

    throw new Error(`Unsupported conversion to PDF from ${sourceContentType}`);
  }
}
