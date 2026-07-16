import { Injectable, Logger } from '@nestjs/common';
import {
  IDocumentGeneratorStrategy,
  GenerationResult,
} from './IDocumentGeneratorStrategy';
import { DocumentRenderContext } from '../../domain/models/DocumentRenderContext';
import { Readable } from 'stream';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

@Injectable()
export class DocxGeneratorStrategy implements IDocumentGeneratorStrategy {
  private readonly logger = new Logger(DocxGeneratorStrategy.name);

  supports(contentType: string): boolean {
    return (
      contentType === 'docx' ||
      contentType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  }

  async generate(
    templateStream: Readable,
    context: DocumentRenderContext,
  ): Promise<GenerationResult> {
    const startTime = Date.now();

    // 1. Read stream into buffer for PizZip
    const chunks: Buffer[] = [];
    for await (const chunk of templateStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const fileBuffer = Buffer.concat(chunks);

    // 2. Initialize PizZip and docxtemplater
    let zip;
    try {
      zip = new PizZip(fileBuffer);
    } catch (e: any) {
      this.logger.error(`Failed to parse DOCX zip: ${e.message}`);
      throw new Error('Invalid DOCX format');
    }

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' },
    });

    // 3. Render the document
    doc.render(context.placeholders);

    // 4. Get the generated document as a buffer and convert to Stream
    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    const outStream = Readable.from([buf]);

    return {
      stream: outStream,
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extension: '.docx',
      warnings: [],
      metadata: {
        placeholderCount: Object.keys(context.placeholders).length,
      },
    };
  }
}
