import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Headers,
  Param,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';

import { CreateTemplateCommand } from '../../application/commands/CreateTemplate/CreateTemplateCommand';

import { PublishTemplateVersionCommand } from '../../application/commands/PublishTemplateVersion/PublishTemplateVersionCommand';
import { GetTemplateQuery } from '../../application/queries/GetTemplate/GetTemplateQuery';
import { GetAllTemplatesQuery } from '../../application/queries/GetAllTemplates/GetAllTemplatesQuery';

import { DeleteTemplateVersionCommand } from '../../application/commands/DeleteTemplateVersion/DeleteTemplateVersionCommand';
import { ImportTemplateVersionCommand } from '../../application/commands/ImportTemplateVersion/ImportTemplateVersionCommand';
import { MapTemplatePlaceholdersCommand } from '../../application/commands/MapTemplatePlaceholders/MapTemplatePlaceholdersCommand';
import { GetTemplatePlaceholdersQuery } from '../../application/queries/GetTemplatePlaceholders/GetTemplatePlaceholdersQuery';
import { GetGlobalPlaceholdersQuery } from '../../application/queries/GetGlobalPlaceholders/GetGlobalPlaceholdersQuery';
import { PreviewTemplateQuery } from '../../application/queries/PreviewTemplate/PreviewTemplateQuery';
import { PreviewUploadedTemplateQuery } from '../../application/queries/PreviewUploadedTemplate/PreviewUploadedTemplateQuery';

import { ApiResponse } from '../../../../../common/dto/ApiResponse';
import { TemplateListQueryDto } from '../dtos/QueryDtos';
import { CreateTemplateRequestDto } from '../dtos/TemplateRequestDtos';
import { MapPlaceholdersRequestDto } from '../dtos/MappingRequestDtos';
import {
  TemplateDto,
  TemplateVersionDto,
  PlaceholderDto,
} from '../dtos/TemplateResponseDtos';
import { GlobalPlaceholderResponseDto } from '../dtos/PlaceholderRegistryDtos';
import { PreviewRequestDto, PreviewResponseDto } from '../dtos/PreviewResponseDto';
import { PaginatedResult } from '../../../../../common/dto/PaginatedResult';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('templates')
export class TemplateController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('placeholders')
  @ApiOperation({ summary: 'Get all global placeholders across entities' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'entity', required: false, type: String })
  @SwaggerResponse({
    status: 200,
    description: 'List of all system and dynamic placeholders',
    type: [GlobalPlaceholderResponseDto],
  })
  async getGlobalPlaceholders(
    @Headers('x-company-id') companyId: string,
    @Query('search') search?: string,
    @Query('entity') entity?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetGlobalPlaceholdersQuery(companyId, search, entity),
    );
    if (result.isFailure) throw new BadRequestException(result.error);
    return ApiResponse.success<GlobalPlaceholderResponseDto[]>(
      result.getValue(),
    );
  }

  @Post(':id/preview')
  @ApiOperation({ summary: 'Preview a saved template' })
  @SwaggerResponse({
    status: 200,
    description: 'Preview response with Base64 content and metadata',
    type: PreviewResponseDto,
  })
  async previewTemplate(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() body: PreviewRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.queryBus.execute(
      new PreviewTemplateQuery(
        id,
        companyId,
        body.mode,
        body.format,
        body.candidateId,
        body.employeeId,
      ),
    );
    if (result.isFailure) throw new BadRequestException(result.error);
    const dto = result.getValue() as PreviewResponseDto;

    if (body.format === 'PDF' && dto.pdfBuffer) {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview.pdf"',
        'X-Validation-Errors': JSON.stringify(dto.errors),
        'X-Validation-Warnings': JSON.stringify(dto.warnings),
        'X-Resolved-Keys': JSON.stringify(dto.resolvedKeys),
        'X-Unresolved-Keys': JSON.stringify(dto.unresolvedKeys),
      });
      return new StreamableFile(dto.pdfBuffer);
    }
    
    // For HTML, return JSON as usual but strip the buffer to save memory
    delete dto.pdfBuffer;
    return ApiResponse.success<PreviewResponseDto>(dto);
  }

  @Post('preview')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Preview an uploaded template without saving' })
  @SwaggerResponse({
    status: 200,
    description: 'Preview response with Base64 content and metadata',
    type: PreviewResponseDto,
  })
  async previewUploadedTemplate(
    @Headers('x-company-id') companyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('mode') mode: 'SAMPLE' | 'LIVE',
    @Body('format') format: 'HTML' | 'PDF',
    @Res({ passthrough: true }) res: Response,
    @Body('candidateId') candidateId?: string,
    @Body('employeeId') employeeId?: string,
    @Body('contentType') contentType?: 'html' | 'docx',
  ) {
    if (!file) throw new BadRequestException('File is required');
    
    const result = await this.queryBus.execute(
      new PreviewUploadedTemplateQuery(
        file.buffer,
        companyId,
        mode,
        format,
        candidateId,
        employeeId,
        contentType,
      ),
    );
    if (result.isFailure) throw new BadRequestException(result.error);
    const dto = result.getValue() as PreviewResponseDto;

    if (format === 'PDF' && dto.pdfBuffer) {
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview.pdf"',
        'X-Validation-Errors': JSON.stringify(dto.errors),
        'X-Validation-Warnings': JSON.stringify(dto.warnings),
        'X-Resolved-Keys': JSON.stringify(dto.resolvedKeys),
        'X-Unresolved-Keys': JSON.stringify(dto.unresolvedKeys),
      });
      return new StreamableFile(dto.pdfBuffer);
    }
    
    delete dto.pdfBuffer;
    return ApiResponse.success<PreviewResponseDto>(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates with pagination and filtering' })
  @SwaggerResponse({ status: 200, description: 'Paginated list of templates' })
  async getTemplates(
    @Headers('x-company-id') companyId: string,
    @Query() query: TemplateListQueryDto,
  ) {
    const result = await this.queryBus.execute(
      new GetAllTemplatesQuery(
        companyId,
        query.page || 1,
        query.pageSize || 10,
        query.sort,
        query.order,
        query.search,
        query.documentTypeId,
        query.status,
      ),
    );

    if (result.isFailure) throw new BadRequestException(result.error);
    return ApiResponse.success<PaginatedResult<TemplateDto>>(result.getValue());
  }

  @Post()
  @ApiOperation({ summary: 'Create a new document template' })
  @SwaggerResponse({
    status: 201,
    description: 'Template created successfully',
  })
  async createTemplate(
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: CreateTemplateRequestDto,
  ) {
    const result = await this.commandBus.execute(
      new CreateTemplateCommand(
        companyId,
        body.documentTypeId,
        body.name,
        body.description,
        userId,
      ),
    );
    if (result.isFailure) throw new BadRequestException(result.error);
    return ApiResponse.success<{ id: string }>({ id: result.getValue() });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a template (metadata only)' })
  @SwaggerResponse({
    status: 200,
    description: 'Template updated successfully',
  })
  async updateTemplate(
    @Param('id') id: string,
    @Headers('x-company-id') companyId: string,
    @Body() body: any,
  ) {
    // Stub for now
    return ApiResponse.success<{ id: string }>({ id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive/Delete a template' })
  @SwaggerResponse({
    status: 200,
    description: 'Template archived successfully',
  })
  async archiveTemplate(
    @Param('id') id: string,
    @Headers('x-company-id') companyId: string,
  ) {
    // Stub for now
    return ApiResponse.success<{ id: string }>({ id });
  }



  @Post(':id/versions/:versionId/publish')
  @ApiOperation({ summary: 'Publish a specific template version' })
  @SwaggerResponse({
    status: 200,
    description: 'Version published successfully',
  })
  async publishVersion(
    @Param('id') templateId: string,
    @Param('versionId') versionId: string,
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
  ) {
    const result = await this.commandBus.execute(
      new PublishTemplateVersionCommand(
        templateId,
        versionId,
        companyId,
        userId,
      ),
    );
    if (result.isFailure) throw new BadRequestException(result.error);
    return ApiResponse.success(null, {
      message: 'Version published successfully',
    });
  }

  @Delete(':id/versions/:versionId')
  @ApiOperation({ summary: 'Delete a template version' })
  @SwaggerResponse({
    status: 200,
    description: 'Version deleted successfully',
  })
  async deleteVersion(
    @Param('id') templateId: string,
    @Param('versionId') versionId: string,
    @Headers('x-company-id') companyId: string,
  ) {
    const result = await this.commandBus.execute(
      new DeleteTemplateVersionCommand(
        templateId,
        versionId,
        companyId,
      ),
    );
    if (result.isFailure) throw new BadRequestException(result.error);
    return ApiResponse.success(null, {
      message: 'Version deleted successfully',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific template' })
  @SwaggerResponse({ status: 200, description: 'Template details retrieved' })
  async getTemplate(
    @Param('id') templateId: string,
    @Headers('x-company-id') companyId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetTemplateQuery(companyId, templateId),
    );
    if (result.isFailure) throw new NotFoundException(result.error);
    return ApiResponse.success<TemplateDto>(result.getValue());
  }

  @Post('import')
  @ApiOperation({ summary: 'Import a DOCX template to create a new version' })
  @ApiConsumes('multipart/form-data')
  @SwaggerResponse({
    status: 201,
    description: 'DOCX Template imported successfully',
  })
  @UseInterceptors(FileInterceptor('file'))
  async importTemplate(
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Body('templateId') templateId: string,
    @Body('notes') notes?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded.');
    if (!templateId) throw new BadRequestException('templateId is required.');

    const result = await this.commandBus.execute(
      new ImportTemplateVersionCommand(
        templateId,
        companyId,
        file.buffer,
        file.originalname,
        file.mimetype,
        file.size,
        notes,
        userId,
      ),
    );

    if (result.isFailure) throw new BadRequestException(result.error);

    return ApiResponse.success(result.getValue(), {
      message: 'DOCX imported successfully. Please complete the mapping step.',
    });
  }

  @Post(':id/versions/:versionId/map-placeholders')
  @ApiOperation({ summary: 'Save Field Definition mappings for placeholders' })
  @SwaggerResponse({ status: 200, description: 'Mappings saved successfully' })
  async mapPlaceholders(
    @Param('id') templateId: string,
    @Param('versionId') versionId: string,
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: MapPlaceholdersRequestDto,
  ) {
    const result = await this.commandBus.execute(
      new MapTemplatePlaceholdersCommand(
        templateId,
        versionId,
        companyId,
        body.mappings.map((m) => ({ ...m, displayOrder: m.displayOrder || 0 })),
        userId,
      ),
    );
    if (result.isFailure) throw new BadRequestException(result.error);
    return ApiResponse.success(null, {
      message: 'Placeholder mappings saved successfully.',
    });
  }

  @Get(':id/versions/:versionId/placeholders')
  @ApiOperation({ summary: 'Get placeholders for a specific version' })
  @SwaggerResponse({ status: 200, description: 'Placeholders retrieved' })
  async getPlaceholders(
    @Param('id') templateId: string,
    @Param('versionId') versionId: string,
    @Headers('x-company-id') companyId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetTemplatePlaceholdersQuery(templateId, versionId, companyId),
    );
    if (result.isFailure) throw new NotFoundException(result.error);
    return ApiResponse.success<PlaceholderDto[]>(result.getValue());
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get all versions of a template' })
  @SwaggerResponse({ status: 200, description: 'Template versions retrieved' })
  async getVersions(
    @Param('id') templateId: string,
    @Headers('x-company-id') companyId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetTemplateQuery(companyId, templateId),
    );
    if (result.isFailure) throw new NotFoundException(result.error);
    const template = result.getValue();
    return ApiResponse.success<{ versions: TemplateVersionDto[] }>({
      versions: template.versions ?? [],
    });
  }
}
