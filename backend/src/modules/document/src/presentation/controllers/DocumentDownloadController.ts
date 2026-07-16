import {
  Controller,
  Get,
  Param,
  Headers,
  Query,
  Res,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { GetGeneratedDocumentQuery } from '../../application/queries/GetGeneratedDocument/GetGeneratedDocumentQuery';
// Assume we have an IStorageService injection or a query to get download streams.
// For the scope of finalizing the API contract, we will stub the actual streaming implementation,
// but provide the correct Express @Res() handling structure.

@ApiTags('Document Downloads')
@ApiBearerAuth()
@Controller('documents')
export class DocumentDownloadController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a generated document' })
  @SwaggerResponse({ status: 200, description: 'File stream' })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Format to download (e.g. pdf, docx)',
    enum: ['pdf', 'docx'],
  })
  async downloadDocument(
    @Param('id') documentId: string,
    @Headers('x-company-id') companyId: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const result = await this.queryBus.execute(
      new GetGeneratedDocumentQuery(companyId, documentId),
    );
    if (result.isFailure) {
      throw new NotFoundException(result.error);
    }

    const document = result.getValue();
    const requestedFormat = format || 'pdf';

    // Find the correct snapshot based on format requested
    const snapshot = document.snapshots?.find((s: any) =>
      requestedFormat === 'pdf'
        ? s.mimeType === 'application/pdf'
        : s.mimeType !== 'application/pdf',
    );

    if (!snapshot) {
      throw new NotFoundException(
        `Document in format ${requestedFormat} not found.`,
      );
    }

    const filename = `${document.businessId}.${requestedFormat}`;

    res.setHeader('Content-Type', snapshot.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Here we would pipe the actual stream from StorageService
    // e.g. const stream = await this.storageService.downloadStream(snapshot.fileUrl);
    // stream.pipe(res);

    res.send(`Mock File Content for ${filename}`); // Stub
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Preview a generated document inline (Browser)' })
  @SwaggerResponse({ status: 200, description: 'Inline file stream' })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Format to preview (e.g. pdf, html)',
    enum: ['pdf', 'html'],
  })
  async previewDocument(
    @Param('id') documentId: string,
    @Headers('x-company-id') companyId: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const result = await this.queryBus.execute(
      new GetGeneratedDocumentQuery(companyId, documentId),
    );
    if (result.isFailure) {
      throw new NotFoundException(result.error);
    }

    const document = result.getValue();
    const requestedFormat = format || 'pdf';

    const snapshot = document.snapshots?.find((s: any) =>
      requestedFormat === 'pdf'
        ? s.mimeType === 'application/pdf'
        : s.mimeType === 'text/html',
    );

    if (!snapshot) {
      throw new NotFoundException(
        `Preview for format ${requestedFormat} not available.`,
      );
    }

    res.setHeader('Content-Type', snapshot.mimeType);
    res.setHeader('Content-Disposition', 'inline'); // Inline for preview

    // Here we would pipe the actual stream from StorageService
    res.send(`Mock Preview Content for ${document.businessId}`); // Stub
  }
}
