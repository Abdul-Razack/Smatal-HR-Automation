import { Controller, Post, Body, Headers, Param, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GenerateDocumentCommand } from '../../application/commands/GenerateDocument/GenerateDocumentCommand';
import { GetGeneratedDocumentQuery } from '../../application/queries/GetGeneratedDocument/GetGeneratedDocumentQuery';

@Controller('generated-documents')
export class GeneratedDocumentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async generateDocument(
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: any,
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
    if (result.isFailure) throw new Error(result.error);
    return { id: result.getValue() };
  }

  @Get(':id')
  async getDocument(
    @Param('id') documentId: string,
    @Headers('x-company-id') companyId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetGeneratedDocumentQuery(companyId, documentId),
    );
    if (result.isFailure) throw new Error(result.error);
    return result.getValue();
  }
}
