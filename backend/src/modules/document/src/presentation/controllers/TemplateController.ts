import { Controller, Post, Body, Headers, Param, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTemplateCommand } from '../../application/commands/CreateTemplate/CreateTemplateCommand';
import { CreateTemplateVersionCommand } from '../../application/commands/CreateTemplateVersion/CreateTemplateVersionCommand';
import { PublishTemplateVersionCommand } from '../../application/commands/PublishTemplateVersion/PublishTemplateVersionCommand';
import { GetTemplateQuery } from '../../application/queries/GetTemplate/GetTemplateQuery';

@Controller('templates')
export class TemplateController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createTemplate(
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: any,
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
    if (result.isFailure) throw new Error(result.error);
    return { id: result.getValue() };
  }

  @Post(':id/versions')
  async createVersion(
    @Param('id') templateId: string,
    @Headers('x-company-id') companyId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: any,
  ) {
    const result = await this.commandBus.execute(
      new CreateTemplateVersionCommand(
        templateId,
        companyId,
        body.content,
        body.contentType || 'html',
        body.placeholders || [],
        body.notes,
        userId,
      ),
    );
    if (result.isFailure) throw new Error(result.error);
    return { id: result.getValue() };
  }

  @Post(':id/versions/:versionId/publish')
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
    if (result.isFailure) throw new Error(result.error);
    return { success: true };
  }

  @Get(':id')
  async getTemplate(
    @Param('id') templateId: string,
    @Headers('x-company-id') companyId: string,
  ) {
    const result = await this.queryBus.execute(
      new GetTemplateQuery(companyId, templateId),
    );
    if (result.isFailure) throw new Error(result.error);
    return result.getValue();
  }
}
