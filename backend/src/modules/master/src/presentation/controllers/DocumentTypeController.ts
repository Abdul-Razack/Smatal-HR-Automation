import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { CommandDispatcher } from '../../../../../kernel/application/cqrs/CommandDispatcher';
import { Result } from '../../../../../kernel/result/Result';
import { CreateDocumentTypeRequest } from '../../application/dtos/requests/CreateDocumentTypeRequest';
import { CreateDocumentTypeCommand } from '../../application/commands/CreateDocumentType/CreateDocumentTypeCommand';

@ApiTags('Master / Document Types')
@Controller('master/document-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentTypeController {
  constructor(private readonly commandDispatcher: CommandDispatcher) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document type' })
  @ApiResponse({
    status: 201,
    description: 'Document type created successfully',
  })
  async createDocumentType(
    @Request() req: any,
    @Body() dto: CreateDocumentTypeRequest,
  ) {
    const user = req.user;

    const command = new CreateDocumentTypeCommand(
      user.companyId,
      dto.name,
      dto.code,
      user.id,
      dto.description,
    );

    const result = await this.commandDispatcher.dispatch<
      CreateDocumentTypeCommand,
      Result<string>
    >(command);
    if (result.isFailure) {
      throw new HttpException(result.errorValue, HttpStatus.BAD_REQUEST);
    }

    return { id: result.getValue() };
  }
}
