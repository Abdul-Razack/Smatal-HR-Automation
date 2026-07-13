import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
const htmlPdf = require('html-pdf-node');
import { DocumentSnapshotVO } from '../../domain/value-objects/DocumentSnapshotVO';
import { GeneratedDocumentAggregate } from '../../domain/aggregates/GeneratedDocumentAggregate';
import { TemplateVersionEntity } from '../../domain/entities/TemplateVersionEntity';

@Injectable()
export class DocumentGeneratorService {
  private readonly logger = new Logger(DocumentGeneratorService.name);
  private readonly tempDir = path.join(process.cwd(), 'temp', 'documents');

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  public async compileHtml(
    templateVersion: TemplateVersionEntity,
    resolvedFields: Record<string, string>,
  ): Promise<string> {
    let html = templateVersion.content;

    for (const placeholder of templateVersion.placeholders) {
      const value = resolvedFields[placeholder.placeholderKey];
      if (value === undefined && placeholder.isRequired) {
        throw new Error(
          `Missing required field value for placeholder: ${placeholder.placeholderKey}`,
        );
      }
      const escapedKey = placeholder.placeholderKey.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      );
      const regex = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g');
      html = html.replace(regex, value ?? '');
    }

    return html;
  }

  public async generatePdfSnapshot(
    document: GeneratedDocumentAggregate,
    html: string,
    performedBy: string,
  ): Promise<DocumentSnapshotVO> {
    this.logger.log(`Generating PDF for document ${document.id.toValue()}`);

    const fileName = `${document.businessId}_${Date.now()}.pdf`;
    const filePath = path.join(this.tempDir, fileName);

    const options = { format: 'A4', printBackground: true };
    const file = { content: html };

    const pdfBuffer: Buffer = await htmlPdf.generatePdf(file, options);
    fs.writeFileSync(filePath, pdfBuffer);

    // In production this would upload to S3 / GCS and return a signed URL
    const storageUrl = `file://${filePath}`;
    const checksum = crypto
      .createHash('sha256')
      .update(pdfBuffer)
      .digest('hex');

    return DocumentSnapshotVO.create({
      generatedDocumentId: document.id.toValue() as string,
      filePath,
      fileUrl: storageUrl,
      fileSize: pdfBuffer.length,
      mimeType: 'application/pdf',
      checksum,
      storageProvider: 'LOCAL',
      renderedContent: html,
      createdAt: new Date(),
      createdBy: performedBy,
    });
  }
}
