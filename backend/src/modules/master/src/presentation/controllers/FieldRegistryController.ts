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
import { CreateFieldDefinitionRequest } from '../../application/dtos/requests/CreateFieldDefinitionRequest';
import { CreateFieldGroupRequest } from '../../application/dtos/requests/CreateFieldGroupRequest';
import { CreateFieldDefinitionCommand } from '../../application/commands/CreateFieldDefinition/CreateFieldDefinitionCommand';
import { CreateFieldGroupCommand } from '../../application/commands/CreateFieldGroup/CreateFieldGroupCommand';

@ApiTags('Master / Field Registry')
@Controller('master/fields')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FieldRegistryController {
  constructor(private readonly commandDispatcher: CommandDispatcher) {}

  @Post('definitions')
  @ApiOperation({ summary: 'Create a new dynamic field definition' })
  @ApiResponse({
    status: 201,
    description: 'Field definition created successfully',
  })
  async createFieldDefinition(
    @Request() req: any,
    @Body() dto: CreateFieldDefinitionRequest,
  ) {
    const user = req.user;

    const command = new CreateFieldDefinitionCommand(
      user.companyId,
      dto.machineKey,
      dto.displayName,
      dto.dataType as any,
      dto.entityType as any,
      user.id,
      dto.isRequired,
      dto.description,
      dto.defaultValue,
      dto.displayOrder,
      dto.groupId,
      dto.options,
      dto.validations,
    );

    const result = await this.commandDispatcher.dispatch<
      CreateFieldDefinitionCommand,
      Result<string>
    >(command);
    if (result.isFailure) {
      throw new HttpException(result.errorValue, HttpStatus.BAD_REQUEST);
    }

    return { id: result.getValue() };
  }

  @Post('groups')
  @ApiOperation({ summary: 'Create a new field group' })
  @ApiResponse({ status: 201, description: 'Field group created successfully' })
  async createFieldGroup(
    @Request() req: any,
    @Body() dto: CreateFieldGroupRequest,
  ) {
    const user = req.user;

    const command = new CreateFieldGroupCommand(
      user.companyId,
      dto.name,
      user.id,
      dto.description,
      dto.displayOrder,
    );

    const result = await this.commandDispatcher.dispatch<
      CreateFieldGroupCommand,
      Result<string>
    >(command);
    if (result.isFailure) {
      throw new HttpException(result.errorValue, HttpStatus.BAD_REQUEST);
    }

    return { id: result.getValue() };
  }
}
