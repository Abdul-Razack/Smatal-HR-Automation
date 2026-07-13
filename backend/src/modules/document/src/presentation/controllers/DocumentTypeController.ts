import { Controller, Post, Body, Headers } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateDocumentTypeCommand } from '../../application/commands/CreateDocumentType/CreateDocumentTypeCommand';

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
