import {
  Controller,
  Post,
  Body,
  Headers,
  Param,
  Get,
  Query,
  Delete,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { GenerateDocumentCommand } from '../../application/commands/GenerateDocument/GenerateDocumentCommand';
import { GetGeneratedDocumentQuery } from '../../application/queries/GetGeneratedDocument/GetGeneratedDocumentQuery';
import { GetAllGeneratedDocumentsQuery } from '../../application/queries/GetAllGeneratedDocuments/GetAllGeneratedDocumentsQuery';

import { ApiResponse } from '../../../../../common/dto/ApiResponse';
import { GenerateDocumentRequestDto } from '../dtos/DocumentRequestDtos';
import { DocumentListQueryDto } from '../dtos/QueryDtos';
import { GeneratedDocumentDto } from '../dtos/DocumentResponseDtos';
import { PaginatedResult } from '../../../../../common/dto/PaginatedResult';

@ApiTags('Generated Documents')
@ApiBearerAuth()
@Controller('generated-documents')
export class GeneratedDocumentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
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
    @Headers('x-company-id') companyId: string,
    @Query() query: DocumentListQueryDto,
  ) {
    // Note: GetAllGeneratedDocumentsQuery needs to be updated to support full pagination
    const result = await this.queryBus.execute(
      new GetAllGeneratedDocumentsQuery(companyId, {
        profileId: query.search, // Temporary mapping until full search is implemented
        candidateId: query.candidateId,
        employeeId: query.employeeId,
      }),
    );
    if (result.isFailure) throw new BadRequestException(result.error);

    // Stub pagination response based on existing items
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

  @Get(':id')
  @ApiOperation({ summary: 'Get generated document metadata and status' })
  @SwaggerResponse({
    status: 200,
    description: 'Generated document details retrieved',
  })
  async getDocument(
    @Param('id') documentId: string,
    @Headers('x-company-id') companyId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetGeneratedDocumentQuery(companyId, documentId),
    );
    if (result.isFailure) throw new NotFoundException(result.error);
    return ApiResponse.success<GeneratedDocumentDto>(result.getValue());
  }

  @Post('generate')
  @ApiOperation({ summary: 'Trigger generation of a new document' })
  @SwaggerResponse({
    status: 201,
    description: 'Document generation triggered successfully',
  })
  async generateDocument(
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: GenerateDocumentRequestDto,
  ) {
    const result = await this.commandBus.execute(
      new GenerateDocumentCommand(
        companyId,
        body.profileId,
        body.templateId,
        userId,
        body.candidateId,
        body.employeeId,
        body.workflowInstanceId,
        body.workflowStageId,
      ),
    );
    if (result.isFailure) throw new BadRequestException(result.error);
    return ApiResponse.success<{ id: string }>({ id: result.getValue() });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Void or delete a generated document' })
  @SwaggerResponse({
    status: 200,
    description: 'Document deleted successfully',
  })
  async deleteDocument(
    @Param('id') id: string,
    @Headers('x-company-id') companyId: string,
  ) {
    // Stub for now
    return ApiResponse.success<{ id: string }>({ id });
  }
}
