import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  Optional,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveCompanyBrandingCommand } from './RemoveCompanyBrandingCommand';
import {
  COMPANY_REPOSITORY,
  ICompanyRepository,
} from '../../domain/repositories/ICompanyRepository';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';

@Injectable()
@CommandHandler(RemoveCompanyBrandingCommand)
export class RemoveCompanyBrandingHandler
  implements ICommandHandler<RemoveCompanyBrandingCommand>
{
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepo: ICompanyRepository,
    @Optional()
    private readonly prisma?: PrismaService,
  ) {}

  async execute(command: RemoveCompanyBrandingCommand): Promise<void> {
    const role = (command.userRole || '').toUpperCase();
    const allowedRoles = ['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER'];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException(
        'You do not have permission to remove company branding.',
      );
    }

    const company = await this.companyRepo.findById(command.companyId);
    if (!company || company.isDeleted) {
      throw new NotFoundException(`Company not found: ${command.companyId}`);
    }

    const previousValue =
      command.type === 'logo' ? company.logoUrl : company.signatureUrl;

    if (command.type === 'logo') {
      company.setLogo(null, command.performedBy);
    } else {
      company.setSignature(null, command.performedBy);
    }

    await this.companyRepo.save(company);

    if (this.prisma?.auditLog) {
      try {
        await this.prisma.auditLog.create({
          data: {
            businessId: `AUD_${Date.now()}`,
            companyId: company.id.toString(),
            entityType: 'COMPANY',
            entityBusinessId: company.businessId,
            action:
              command.type === 'logo'
                ? 'COMPANY_LOGO_REMOVED'
                : 'COMPANY_SIGNATURE_REMOVED',
            performedBy: command.performedBy,
            performedAt: new Date(),
            beforeState: { [command.type === 'logo' ? 'logoUrl' : 'signatureUrl']: previousValue },
            afterState: { [command.type === 'logo' ? 'logoUrl' : 'signatureUrl']: null },
            remarks: `Removed ${command.type} branding asset`,
          },
        });
      } catch (err) {
        // Fallback for mock environments
      }
    }
  }
}
