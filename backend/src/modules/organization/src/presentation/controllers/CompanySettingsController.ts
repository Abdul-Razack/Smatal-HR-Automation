import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Res,
  Inject,
  Optional,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../../../modules/identity/src/presentation/guards/JwtAuthGuard';
import { RolesGuard } from '../../../../../modules/identity/src/presentation/guards/RolesGuard';
import { Roles } from '../../../../../modules/identity/src/presentation/guards/roles.decorator';
import {
  UpdateCompanySettingsDto,
  CompanySettingsResponseDto,
} from '../../application/dtos/CompanySettingsDtos';
import { UpdateCompanySettingsCommand } from '../../application/commands/UpdateCompanySettingsCommand';
import { UploadCompanyBrandingCommand } from '../../application/commands/UploadCompanyBrandingCommand';
import { RemoveCompanyBrandingCommand } from '../../application/commands/RemoveCompanyBrandingCommand';
import { GetCompanySettingsQuery } from '../../application/queries/GetCompanySettingsQuery';
import {
  COMPANY_REPOSITORY,
  ICompanyRepository,
} from '../../domain/repositories/ICompanyRepository';
import { IStorageService } from '../../../../../infrastructure/storage/IStorageService';

@ApiTags('Company Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('company')
export class CompanySettingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepo: ICompanyRepository,
    @Optional()
    @Inject('IStorageService')
    private readonly storageService?: IStorageService,
  ) {}

  @Get('settings')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Get authoritative company settings' })
  @ApiResponse({ status: 200, type: CompanySettingsResponseDto })
  async getSettings(@Request() req: any): Promise<CompanySettingsResponseDto> {
    // Identity-derived company ID ensures strict tenant isolation
    const companyId = req.user.companyId;
    return this.queryBus.execute(new GetCompanySettingsQuery(companyId));
  }

  @Patch('settings')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Update company settings and authoritative info' })
  @ApiResponse({ status: 200, type: CompanySettingsResponseDto })
  async updateSettings(
    @Request() req: any,
    @Body() dto: UpdateCompanySettingsDto,
  ): Promise<{ isSuccess: boolean; data: CompanySettingsResponseDto; message: string }> {
    const userRole = req.user.roles?.[0] || req.user.role || 'HR_ADMIN';
    const result = await this.commandBus.execute(
      new UpdateCompanySettingsCommand(
        req.user.companyId,
        req.user.userId,
        userRole,
        dto,
      ),
    );
    return {
      isSuccess: true,
      data: result,
      message: 'Company settings updated successfully',
    };
  }

  @Post('settings/logo')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload or replace company logo' })
  async uploadLogo(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Image file is required');
    const userRole = req.user.roles?.[0] || req.user.role || 'HR_ADMIN';
    const result = await this.commandBus.execute(
      new UploadCompanyBrandingCommand(
        req.user.companyId,
        req.user.userId,
        userRole,
        'logo',
        file.buffer,
        file.mimetype,
        file.originalname,
        file.size,
      ),
    );
    return {
      isSuccess: true,
      data: result,
      message: 'Company logo uploaded successfully',
    };
  }

  @Delete('settings/logo')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Remove company logo' })
  async removeLogo(@Request() req: any) {
    const userRole = req.user.roles?.[0] || req.user.role || 'HR_ADMIN';
    await this.commandBus.execute(
      new RemoveCompanyBrandingCommand(
        req.user.companyId,
        req.user.userId,
        userRole,
        'logo',
      ),
    );
    return {
      isSuccess: true,
      message: 'Company logo removed successfully',
    };
  }

  @Post('settings/signature')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload or replace authorized signatory signature' })
  async uploadSignature(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Signature image file is required');
    const userRole = req.user.roles?.[0] || req.user.role || 'HR_ADMIN';
    const result = await this.commandBus.execute(
      new UploadCompanyBrandingCommand(
        req.user.companyId,
        req.user.userId,
        userRole,
        'signature',
        file.buffer,
        file.mimetype,
        file.originalname,
        file.size,
      ),
    );
    return {
      isSuccess: true,
      data: result,
      message: 'Authorized signature uploaded successfully',
    };
  }

  @Delete('settings/signature')
  @Roles('SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER')
  @ApiOperation({ summary: 'Remove authorized signatory signature' })
  async removeSignature(@Request() req: any) {
    const userRole = req.user.roles?.[0] || req.user.role || 'HR_ADMIN';
    await this.commandBus.execute(
      new RemoveCompanyBrandingCommand(
        req.user.companyId,
        req.user.userId,
        userRole,
        'signature',
      ),
    );
    return {
      isSuccess: true,
      message: 'Authorized signature removed successfully',
    };
  }

  @Get('settings/logo/file')
  @ApiOperation({ summary: 'Download or stream company logo image' })
  async getLogoFile(@Request() req: any, @Res() res: Response) {
    const company = await this.companyRepo.findById(req.user.companyId);
    if (!company || !company.logoUrl) {
      throw new NotFoundException('Logo not found.');
    }

    if (this.storageService) {
      try {
        const buffer = await this.storageService.download(company.logoUrl);
        let contentType = 'image/png';
        if (company.logoUrl.endsWith('.svg')) contentType = 'image/svg+xml';
        else if (company.logoUrl.endsWith('.jpg') || company.logoUrl.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (company.logoUrl.endsWith('.webp')) contentType = 'image/webp';
        res.setHeader('Content-Type', contentType);
        return res.send(buffer);
      } catch (err) {
        // Fallback
      }
    }

    return res.redirect(company.logoUrl);
  }

  @Get('settings/signature/file')
  @ApiOperation({ summary: 'Download or stream authorized signatory signature image' })
  async getSignatureFile(@Request() req: any, @Res() res: Response) {
    const company = await this.companyRepo.findById(req.user.companyId);
    if (!company || !company.signatureUrl) {
      throw new NotFoundException('Signature not found.');
    }

    if (this.storageService) {
      try {
        const buffer = await this.storageService.download(company.signatureUrl);
        let contentType = 'image/png';
        if (company.signatureUrl.endsWith('.jpg') || company.signatureUrl.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (company.signatureUrl.endsWith('.webp')) contentType = 'image/webp';
        res.setHeader('Content-Type', contentType);
        return res.send(buffer);
      } catch (err) {
        // Fallback
      }
    }

    return res.redirect(company.signatureUrl);
  }
}
