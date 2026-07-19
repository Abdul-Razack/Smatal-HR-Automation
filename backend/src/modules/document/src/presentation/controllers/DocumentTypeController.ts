import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../identity/src/presentation/guards/JwtAuthGuard';
import { CreateDocumentTypeCommand } from '../../application/commands/CreateDocumentType/CreateDocumentTypeCommand';

@ApiTags('Document Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('document-types')
export class DocumentTypeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createDocumentType(
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: any,
  ) {
    const result = await this.commandBus.execute(
      new CreateDocumentTypeCommand(
        companyId,
        body.name,
        body.code,
        body.description,
        userId,
      ),
    );

    if (result.isFailure) {
      throw new Error(result.error);
    }
    return { id: result.getValue() };
  }
}
