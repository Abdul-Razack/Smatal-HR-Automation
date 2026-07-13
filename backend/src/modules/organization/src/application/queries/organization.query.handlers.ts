import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  GetCompanyByIdQuery,
  ListBranchesQuery,
  ListDepartmentsQuery,
  ListDesignationsQuery,
} from './organization.queries';
import {
  COMPANY_REPOSITORY,
  ICompanyRepository,
} from '../../domain/repositories/ICompanyRepository';
import {
  BRANCH_REPOSITORY,
  IBranchRepository,
} from '../../domain/repositories/IBranchRepository';
import {
  DEPARTMENT_REPOSITORY,
  IDepartmentRepository,
} from '../../domain/repositories/IDepartmentRepository';
import {
  DESIGNATION_REPOSITORY,
  IDesignationRepository,
} from '../../domain/repositories/IDesignationRepository';
import {
  OrganizationResponseDto,
  DepartmentResponseDto,
} from '../dtos/organization.dto';

@Injectable()
@QueryHandler(GetCompanyByIdQuery)
export class GetCompanyByIdHandler implements IQueryHandler<GetCompanyByIdQuery> {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepo: ICompanyRepository,
  ) {}

  async execute(query: GetCompanyByIdQuery): Promise<OrganizationResponseDto> {
    const company = await this.companyRepo.findById(query.companyId);
    if (!company) throw new NotFoundException('Company not found.');
    return {
      id: company.id.toString(),
      businessId: company.businessId,
      name: company.name,
      code: company.code,
      isActive: company.isActive,
    };
  }
}

@Injectable()
@QueryHandler(ListBranchesQuery)
export class ListBranchesHandler implements IQueryHandler<ListBranchesQuery> {
  constructor(
    @Inject(BRANCH_REPOSITORY) private readonly branchRepo: IBranchRepository,
  ) {}

  async execute(query: ListBranchesQuery): Promise<OrganizationResponseDto[]> {
    const branches = await this.branchRepo.findAll({
      companyId: query.companyId,
    });
    return branches.map((b) => ({
      id: b.id.toString(),
      businessId: b.businessId,
      name: b.name,
      code: b.code,
      isActive: b.isActive,
    }));
  }
}

@Injectable()
@QueryHandler(ListDepartmentsQuery)
export class ListDepartmentsHandler implements IQueryHandler<ListDepartmentsQuery> {
  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly deptRepo: IDepartmentRepository,
  ) {}

  async execute(query: ListDepartmentsQuery): Promise<DepartmentResponseDto[]> {
    const depts = await this.deptRepo.findAll({ companyId: query.companyId });
    return depts.map((d) => ({
      id: d.id.toString(),
      businessId: d.businessId,
      name: d.name,
      code: d.code,
      isActive: d.isActive,
      parentId: d.parentId ?? undefined,
    }));
  }
}

@Injectable()
@QueryHandler(ListDesignationsQuery)
export class ListDesignationsHandler implements IQueryHandler<ListDesignationsQuery> {
  constructor(
    @Inject(DESIGNATION_REPOSITORY)
    private readonly desigRepo: IDesignationRepository,
  ) {}

  async execute(
    query: ListDesignationsQuery,
  ): Promise<OrganizationResponseDto[]> {
    const desigs = await this.desigRepo.findAll({ companyId: query.companyId });
    return desigs.map((d) => ({
      id: d.id.toString(),
      businessId: d.businessId,
      name: d.name,
      code: d.code,
      isActive: d.isActive,
    }));
  }
}
