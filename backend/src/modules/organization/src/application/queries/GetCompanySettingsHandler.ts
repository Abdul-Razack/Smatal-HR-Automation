import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetCompanySettingsQuery } from './GetCompanySettingsQuery';
import {
  COMPANY_REPOSITORY,
  ICompanyRepository,
} from '../../domain/repositories/ICompanyRepository';
import { CompanySettingsResponseDto } from '../dtos/CompanySettingsDtos';

@Injectable()
@QueryHandler(GetCompanySettingsQuery)
export class GetCompanySettingsHandler
  implements IQueryHandler<GetCompanySettingsQuery>
{
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(
    query: GetCompanySettingsQuery,
  ): Promise<CompanySettingsResponseDto> {
    const company = await this.companyRepo.findById(query.companyId);
    if (!company || company.isDeleted) {
      throw new NotFoundException(`Company not found: ${query.companyId}`);
    }

    return {
      id: company.id.toString(),
      businessId: company.businessId,
      name: company.name,
      legalName: company.legalName || null,
      code: company.code,
      website: company.website || null,
      address: company.address || null,
      phone: company.phone || null,
      email: company.email || null,
      industry: company.industry || null,
      logoUrl: company.logoUrl || null,
      authorizedPerson: company.authorizedPerson || null,
      authorizedPersonDesignation: company.authorizedPersonDesignation || null,
      signatureUrl: company.signatureUrl || null,
      isActive: company.isActive,
      updatedAt: company.updatedAt,
    };
  }
}
