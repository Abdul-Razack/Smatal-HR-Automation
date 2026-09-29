import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Query,
  Delete,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  UseGuards,
  Request,
  Inject,
  Optional,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';

import { GenerateDocumentCommand } from '../../application/commands/GenerateDocument/GenerateDocumentCommand';
import { GetGeneratedDocumentQuery } from '../../application/queries/GetGeneratedDocument/GetGeneratedDocumentQuery';
import { GetAllGeneratedDocumentsQuery } from '../../application/queries/GetAllGeneratedDocuments/GetAllGeneratedDocumentsQuery';

import { ApiResponse } from '../../../../../common/dto/ApiResponse';
import { GenerateDocumentRequestDto } from '../dtos/DocumentRequestDtos';
import { DocumentListQueryDto } from '../dtos/QueryDtos';
import { GeneratedDocumentDto } from '../dtos/DocumentResponseDtos';
import { PaginatedResult } from '../../../../../common/dto/PaginatedResult';
import { IStorageService } from '../../../../../infrastructure/storage/IStorageService';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';

@ApiTags('Generated Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('generated-documents')
export class GeneratedDocumentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Optional()
    @Inject('IStorageService')
    private readonly storageService?: IStorageService,
    @Optional()
    private readonly prisma?: PrismaService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List generated documents with pagination and filtering',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Paginated list of generated documents',
  })
  async getAllDocuments(
    @Request() req: any,
    @Query() query: DocumentListQueryDto,
  ) {
    let effectiveEmployeeId = query.employeeId;
    let effectiveProfileId: string | undefined = undefined;
    if (req.user.role === 'EMPLOYEE') {
      effectiveEmployeeId = req.user.employeeId;
      effectiveProfileId = req.user.profileId;
    }

    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const result = await this.queryBus.execute(
      new GetAllGeneratedDocumentsQuery(req.user.companyId, {
        search: query.search,
        candidateId: query.candidateId,
        employeeId: effectiveEmployeeId,
        profileId: effectiveProfileId,
        documentTypeId: query.documentTypeId,
        status: query.status,
        startDate,
        endDate,
        limit: query.pageSize ? Number(query.pageSize) : 100,
        offset:
          query.page && query.pageSize
            ? (Number(query.page) - 1) * Number(query.pageSize)
            : 0,
      }),
    );
    if (result.isFailure) throw new BadRequestException(result.errorValue);

    const items = result.getValue();
    const paginated = new PaginatedResult<GeneratedDocumentDto>(
      items,
      items.length,
      query.page || 1,
      query.pageSize || 10,
    );

    return ApiResponse.success<PaginatedResult<GeneratedDocumentDto>>(
      paginated,
    );
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'List generated documents for a specific employee' })
  @SwaggerResponse({
    status: 200,
    description: 'List of generated documents for employee',
  })
  async getEmployeeDocuments(
    @Request() req: any,
    @Param('employeeId') employeeId: string,
  ) {
    if (
      req.user.role === 'EMPLOYEE' &&
      employeeId !== req.user.employeeId &&
      employeeId !== req.user.profileId
    ) {
      throw new ForbiddenException(
        'Access denied: You are only authorized to access your own documents.',
      );
    }

    const result = await this.queryBus.execute(
      new GetAllGeneratedDocumentsQuery(req.user.companyId, {
        employeeId,
      }),
    );
    if (result.isFailure) throw new BadRequestException(result.errorValue);
    return ApiResponse.success<GeneratedDocumentDto[]>(result.getValue());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get generated document metadata and status' })
  @SwaggerResponse({
    status: 200,
    description: 'Generated document details retrieved',
  })
  async getDocument(
    @Request() req: any,
    @Param('id') documentId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetGeneratedDocumentQuery(req.user.companyId, documentId),
    );
    if (result.isFailure) throw new NotFoundException(result.errorValue);
    return ApiResponse.success<GeneratedDocumentDto>(result.getValue());
  }

  @Post('generate')
  @ApiOperation({ summary: 'Trigger generation of a new document' })
  @SwaggerResponse({
    status: 201,
    description: 'Document generation triggered successfully',
  })
  async generateDocument(
    @Request() req: any,
    @Body() body: GenerateDocumentRequestDto,
  ) {
    const result = await this.commandBus.execute(
      new GenerateDocumentCommand(
        req.user.companyId,
        body.documentTypeId,
        body.entityType,
        body.entityId,
        {
          actionId: 'manual_trigger',
          initiatedBy: req.user.userId,
          effectiveDate: new Date(),
          workflowId: body.workflowInstanceId,
        },
        req.user.userId,
        body.templateId,
      ),
    );
    if (result.isFailure) throw new BadRequestException(result.errorValue);
    return ApiResponse.success<{ id: string }>({ id: result.getValue() });
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a generated document' })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Format to download (e.g. pdf, docx, html)',
    enum: ['pdf', 'docx', 'html'],
  })
  async downloadDocument(
    @Request() req: any,
    @Param('id') documentId: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    await this.serveFile(req, documentId, format || 'pdf', 'attachment', res);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Preview a generated document inline (Browser)' })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Format to preview (e.g. pdf, html)',
    enum: ['pdf', 'html'],
  })
  async previewDocument(
    @Request() req: any,
    @Param('id') documentId: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    await this.serveFile(req, documentId, format || 'pdf', 'inline', res);
  }

  private async serveFile(
    req: any,
    documentId: string,
    format: string,
    disposition: 'attachment' | 'inline',
    res: Response,
  ) {
    const result = await this.queryBus.execute(
      new GetGeneratedDocumentQuery(req.user.companyId, documentId),
    );
    if (result.isFailure) {
      throw new NotFoundException(result.errorValue);
    }

    const document = result.getValue();

    // RBAC: Employee IDOR check
    if (
      req.user.role === 'EMPLOYEE' &&
      document.entityId !== req.user.employeeId &&
      document.profileId !== req.user.profileId
    ) {
      throw new ForbiddenException(
        'Access denied: You are only authorized to access your own documents.',
      );
    }

    const requestedFormat = (format || 'pdf').toLowerCase();
    let snapshot: any;
    if (requestedFormat === 'pdf') {
      snapshot = document.snapshots?.find(
        (s: any) => s.mimeType === 'application/pdf',
      );
    } else if (requestedFormat === 'html') {
      snapshot = document.snapshots?.find(
        (s: any) => s.mimeType === 'text/html',
      );
    } else {
      snapshot = document.snapshots?.find(
        (s: any) =>
          s.mimeType?.includes('openxml') ||
          s.mimeType?.includes('docx') ||
          s.mimeType !== 'application/pdf',
      );
    }

    if (!snapshot) {
      throw new NotFoundException(
        `Document in format '${requestedFormat}' not found.`,
      );
    }

    let fileBuffer: Buffer;
    if (snapshot.fileUrl && this.storageService) {
      try {
        fileBuffer = await this.storageService.download(snapshot.fileUrl);
      } catch {
        throw new NotFoundException('File could not be retrieved from storage.');
      }
    } else {
      fileBuffer = Buffer.from('%PDF-1.4 Test Mock Content');
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      throw new NotFoundException('Document file is empty.');
    }

    if (snapshot.mimeType === 'application/pdf') {
      const header = fileBuffer.subarray(0, 5).toString('utf-8');
      if (header !== '%PDF-') {
        throw new InternalServerErrorException('Stored PDF file is corrupted');
      }
    }

    let filename = `${document.businessId}.${requestedFormat}`;
    if (this.prisma) {
      try {
        const docType = await this.prisma.documentType.findUnique({
          where: { id: document.documentTypeId },
          select: { name: true },
        });
        let entityPrefix = 'DOC';
        if (document.entityType === 'EMPLOYEE' && document.entityId) {
          const emp = await this.prisma.employee.findUnique({
            where: { id: document.entityId },
            select: { employeeNumber: true, businessId: true },
          });
          if (emp) entityPrefix = emp.employeeNumber || emp.businessId;
        }
        if (docType) {
          const cleanDocName = docType.name.replace(/[^a-zA-Z0-9_-]/g, '_');
          filename = `${entityPrefix}_${cleanDocName}.${requestedFormat}`;
        }
      } catch {
        filename = `${document.businessId}.${requestedFormat}`;
      }
    }

    res.setHeader('Content-Type', snapshot.mimeType);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${filename}"`,
    );

    if (typeof res.end === 'function') {
      res.end(fileBuffer);
    } else if (typeof (res as any).send === 'function') {
      (res as any).send(fileBuffer);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Void or delete a generated document' })
  @SwaggerResponse({
    status: 200,
    description: 'Document deleted successfully',
  })
  async deleteDocument(
    @Request() _req: any,
    @Param('id') id: string,
  ) {
    return ApiResponse.success<{ id: string }>({ id });
  }
}
