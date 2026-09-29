import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { RolesGuard } from '../../../../identity/src/presentation/guards/RolesGuard';
import { Roles } from '../../../../identity/src/presentation/guards/roles.decorator';
import { CreateDocumentTypeCommand } from '../../application/commands/CreateDocumentType/CreateDocumentTypeCommand';
import { UpdateDocumentTypeCommand } from '../../application/commands/UpdateDocumentType/UpdateDocumentTypeCommand';
import { UpdateDocumentTypeStatusCommand } from '../../application/commands/UpdateDocumentTypeStatus/UpdateDocumentTypeStatusCommand';
import { ListDocumentTypesQuery } from '../../application/queries/ListDocumentTypes/ListDocumentTypesQuery';
import { GetDocumentTypeQuery } from '../../application/queries/GetDocumentType/GetDocumentTypeQuery';

@ApiTags('Document Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('document-types')
export class DocumentTypeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'List all document types for the authenticated company' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async listDocumentTypes(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const filters: { search?: string; isActive?: boolean } = {};
    if (search) filters.search = search;
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const result = await this.queryBus.execute(
      new ListDocumentTypesQuery(req.user.companyId, filters),
    );

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return result.getValue();
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get document type by ID for authenticated company' })
  async getDocumentType(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const result = await this.queryBus.execute(
      new GetDocumentTypeQuery(id, req.user.companyId),
    );

    if (result.isFailure) {
      throw new NotFoundException(result.error);
    }
    return result.getValue();
  }

  @Post()
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Create document type for authenticated company' })
  async createDocumentType(
    @Request() req: any,
    @Body() body: { name: string; code: string; description?: string },
  ) {
    const result = await this.commandBus.execute(
      new CreateDocumentTypeCommand(
        req.user.companyId,
        body.name,
        body.code,
        body.description,
        req.user.userId,
      ),
    );

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return { id: result.getValue() };
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Update document type details' })
  async updateDocumentType(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { name: string; description?: string | null },
  ) {
    const result = await this.commandBus.execute(
      new UpdateDocumentTypeCommand(
        id,
        req.user.companyId,
        body.name,
        body.description,
        req.user.userId,
      ),
    );

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return { success: true };
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Activate or deactivate document type' })
  async updateDocumentTypeStatus(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { isActive: boolean },
  ) {
    if (typeof body.isActive !== 'boolean') {
      throw new BadRequestException('isActive must be a boolean');
    }

    const result = await this.commandBus.execute(
      new UpdateDocumentTypeStatusCommand(
        id,
        req.user.companyId,
        body.isActive,
        req.user.userId,
      ),
    );

    if (result.isFailure) {
      throw new BadRequestException(result.error);
    }
    return { success: true, isActive: body.isActive };
  }
}
