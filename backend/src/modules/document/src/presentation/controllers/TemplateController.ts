import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Get,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Res,
  StreamableFile,
  UseGuards,
  Request,
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
import { SaveHtmlTemplateVersionCommand } from '../../application/commands/SaveHtmlTemplateVersion/SaveHtmlTemplateVersionCommand';
import { MapTemplatePlaceholdersCommand } from '../../application/commands/MapTemplatePlaceholders/MapTemplatePlaceholdersCommand';
import { GetTemplatePlaceholdersQuery } from '../../application/queries/GetTemplatePlaceholders/GetTemplatePlaceholdersQuery';
import { GetGlobalPlaceholdersQuery } from '../../application/queries/GetGlobalPlaceholders/GetGlobalPlaceholdersQuery';
import { PreviewTemplateQuery } from '../../application/queries/PreviewTemplate/PreviewTemplateQuery';
import { PreviewUploadedTemplateQuery } from '../../application/queries/PreviewUploadedTemplate/PreviewUploadedTemplateQuery';
import { GetTemplateContentQuery } from '../../application/queries/GetTemplateContent/GetTemplateContentQuery';

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
    @Request() req: any,
    @Query('search') search?: string,
    @Query('entity') entity?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetGlobalPlaceholdersQuery(req.user.companyId, search, entity),
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
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: PreviewRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.queryBus.execute(
      new PreviewTemplateQuery(
        id,
        req.user.companyId,
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
    @Request() req: any,
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
        req.user.companyId,
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
    @Request() req: any,
    @Query() query: TemplateListQueryDto,
  ) {
    const result = await this.queryBus.execute(
      new GetAllTemplatesQuery(
        req.user.companyId,
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
    @Request() req: any,
    @Body() body: CreateTemplateRequestDto,
  ) {
    const result = await this.commandBus.execute(
      new CreateTemplateCommand(
        req.user.companyId,
        body.documentTypeId,
        body.name,
        body.description,
        req.user.userId,
      ),
    );
    if (result.isFailure) throw new BadRequestException(result.error);
    return ApiResponse.success<{ id: string }>({ id: result.getValue() });
  }

  @Post(':id/versions/html')
  @ApiOperation({ summary: 'Save HTML content from the browser editor as a new template version' })
  @SwaggerResponse({ status: 201, description: 'HTML version saved successfully' })
  async saveHtmlVersion(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { content: string; notes?: string },
  ) {
    if (!body.content || body.content.trim().length === 0) {
      throw new BadRequestException('content is required.');
    }
    const result = await this.commandBus.execute(
      new SaveHtmlTemplateVersionCommand(
        id,
        req.user.companyId,
        body.content,
        body.notes,
        req.user.userId,
      ),
    );
    if (result.isFailure) throw new BadRequestException(result.error);
    return ApiResponse.success(result.getValue(), { message: 'HTML version saved successfully.' });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a template (metadata only)' })
  @SwaggerResponse({ status: 200, description: 'Template updated successfully' })
  async updateTemplate(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    // Metadata updates will be implemented in a future step (Company Settings)
    return ApiResponse.success<{ id: string }>({ id });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive/Delete a template' })
  @SwaggerResponse({
    status: 200,
    description: 'Template archived successfully',
  })
  async archiveTemplate(
    @Request() req: any,
    @Param('id') id: string,
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
    @Request() req: any,
    @Param('id') templateId: string,
    @Param('versionId') versionId: string,
  ) {
    const result = await this.commandBus.execute(
      new PublishTemplateVersionCommand(
        templateId,
        versionId,
        req.user.companyId,
        req.user.userId,
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
    @Request() req: any,
    @Param('id') templateId: string,
    @Param('versionId') versionId: string,
  ) {
    const result = await this.commandBus.execute(
      new DeleteTemplateVersionCommand(
        templateId,
        versionId,
        req.user.companyId,
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
    @Request() req: any,
    @Param('id') templateId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetTemplateQuery(req.user.companyId, templateId),
    );
    if (result.isFailure) throw new NotFoundException(result.error);
    return ApiResponse.success<TemplateDto>(result.getValue());
  }

  @Get(':id/content')
  @ApiOperation({ summary: 'Get editable HTML content of a template version' })
  @SwaggerResponse({ status: 200, description: 'Template content retrieved' })
  async getTemplateContent(
    @Request() req: any,
    @Param('id') templateId: string,
    @Query('versionId') versionId?: string,
  ) {
    const result = await this.queryBus.execute(
      new GetTemplateContentQuery(templateId, req.user.companyId, versionId),
    );
    if (result.isFailure) throw new NotFoundException(result.error);
    return ApiResponse.success(result.getValue());
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
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('templateId') templateId: string,
    @Body('notes') notes?: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded.');
    if (!templateId) throw new BadRequestException('templateId is required.');

    const result = await this.commandBus.execute(
      new ImportTemplateVersionCommand(
        templateId,
        req.user.companyId,
        file.buffer,
        file.originalname,
        file.mimetype,
        file.size,
        notes,
        req.user.userId,
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
    @Request() req: any,
    @Param('id') templateId: string,
    @Param('versionId') versionId: string,
    @Body() body: MapPlaceholdersRequestDto,
  ) {
    const result = await this.commandBus.execute(
      new MapTemplatePlaceholdersCommand(
        templateId,
        versionId,
        req.user.companyId,
        body.mappings.map((m) => ({ ...m, displayOrder: m.displayOrder || 0 })),
        req.user.userId,
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
    @Request() req: any,
    @Param('id') templateId: string,
    @Param('versionId') versionId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetTemplatePlaceholdersQuery(templateId, versionId, req.user.companyId),
    );
    if (result.isFailure) throw new NotFoundException(result.error);
    return ApiResponse.success<PlaceholderDto[]>(result.getValue());
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get all versions of a template' })
  @SwaggerResponse({ status: 200, description: 'Template versions retrieved' })
  async getVersions(
    @Request() req: any,
    @Param('id') templateId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetTemplateQuery(req.user.companyId, templateId),
    );
    if (result.isFailure) throw new NotFoundException(result.error);
    const template = result.getValue();
    return ApiResponse.success<{ versions: TemplateVersionDto[] }>({
      versions: template.versions ?? [],
    });
  }
}
