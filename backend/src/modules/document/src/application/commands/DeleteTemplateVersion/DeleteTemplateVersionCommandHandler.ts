import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTemplateVersionCommand } from './DeleteTemplateVersionCommand';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';
import { Result } from '../../../../../../kernel/result/Result';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@CommandHandler(DeleteTemplateVersionCommand)
export class DeleteTemplateVersionCommandHandler
  implements ICommandHandler<DeleteTemplateVersionCommand, Result<void>>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteTemplateVersionCommand): Promise<Result<void>> {
    const version = await this.prisma.templateVersion.findUnique({
      where: { id: command.versionId },
      include: { template: true },
    });

    if (!version) {
      return Result.fail<void>('Template version not found');
    }

    if (version.templateId !== command.templateId) {
      return Result.fail<void>('Version does not belong to this template');
    }

    if (version.template.companyId !== command.companyId) {
      return Result.fail<void>('Template does not belong to this company');
    }

    if (version.status === 'PUBLISHED') {
      return Result.fail<void>('Cannot delete a published version. Roll it back or deprecate it instead.');
    }

    // Delete placeholders first due to foreign key constraints
    await this.prisma.templatePlaceholder.deleteMany({
      where: { templateVersionId: command.versionId },
    });

    // Delete the version
    await this.prisma.templateVersion.delete({
      where: { id: command.versionId },
    });

    return Result.ok<void>();
  }
}
