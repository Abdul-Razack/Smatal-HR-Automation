import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateCompanyCommand,
  CreateBranchCommand,
  CreateDepartmentCommand,
  CreateDesignationCommand,
} from './organization.commands';
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
import { CompanyAggregate } from '../../domain/entities/CompanyAggregate';
import { BranchEntity } from '../../domain/entities/BranchEntity';
import { DepartmentEntity } from '../../domain/entities/DepartmentEntity';
import { DesignationEntity } from '../../domain/entities/DesignationEntity';
import {
  BusinessIdGenerator,
  BUSINESS_ID_PREFIXES,
} from '../../../../../infrastructure/database/BusinessIdGenerator';
import { Identifier } from '@smatal/kernel/domain/Identifier';

@Injectable()
@CommandHandler(CreateCompanyCommand)
export class CreateCompanyHandler implements ICommandHandler<CreateCompanyCommand> {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepo: ICompanyRepository,
    private readonly businessIdGen: BusinessIdGenerator,
  ) {}

  async execute(command: CreateCompanyCommand): Promise<void> {
    const existing = await this.companyRepo.findByCode(command.code);
    if (existing)
      throw new ConflictException(
        `Company with code '${command.code}' already exists.`,
      );

    const now = new Date();
    const company = CompanyAggregate.create(
      {
        businessId: await this.businessIdGen.generate(
          BUSINESS_ID_PREFIXES.COMPANY,
        ),
        name: command.name,
        code: command.code,
        website: command.website,
        industry: command.industry,
        registrationNumber: command.registrationNumber,
        taxNumber: command.taxNumber,
        isActive: true,
        isDeleted: false,
        version: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: command.requestedBy,
        updatedBy: command.requestedBy,
      },
      new Identifier(uuidv4()),
    );

    await this.companyRepo.save(company);
  }
}

@Injectable()
@CommandHandler(CreateBranchCommand)
export class CreateBranchHandler implements ICommandHandler<CreateBranchCommand> {
  constructor(
    @Inject(BRANCH_REPOSITORY) private readonly branchRepo: IBranchRepository,
    private readonly businessIdGen: BusinessIdGenerator,
  ) {}

  async execute(command: CreateBranchCommand): Promise<void> {
    const existing = await this.branchRepo.findByCode(
      command.code,
      command.companyId,
    );
    if (existing)
      throw new ConflictException(
        `Branch with code '${command.code}' already exists.`,
      );

    if (command.isHeadquarters) {
      const hq = await this.branchRepo.findHeadquarters(command.companyId);
      if (hq)
        throw new ConflictException(
          `A headquarters branch already exists for this company.`,
        );
    }

    const now = new Date();
    const branch = BranchEntity.create(
      {
        businessId: await this.businessIdGen.generate(
          BUSINESS_ID_PREFIXES.BRANCH,
        ),
        companyId: command.companyId,
        name: command.name,
        code: command.code,
        isHeadquarters: command.isHeadquarters,
        addressLine1: command.addressLine1,
        city: command.city,
        state: command.state,
        country: command.country,
        isActive: true,
        isDeleted: false,
        version: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: command.requestedBy,
        updatedBy: command.requestedBy,
      },
      new Identifier(uuidv4()),
    );

    await this.branchRepo.save(branch);
  }
}

@Injectable()
@CommandHandler(CreateDepartmentCommand)
export class CreateDepartmentHandler implements ICommandHandler<CreateDepartmentCommand> {
  constructor(
    @Inject(DEPARTMENT_REPOSITORY)
    private readonly deptRepo: IDepartmentRepository,
    private readonly businessIdGen: BusinessIdGenerator,
  ) {}

  async execute(command: CreateDepartmentCommand): Promise<void> {
    const existing = await this.deptRepo.findByCode(
      command.code,
      command.companyId,
    );
    if (existing)
      throw new ConflictException(
        `Department with code '${command.code}' already exists.`,
      );

    const now = new Date();
    const dept = DepartmentEntity.create(
      {
        businessId: await this.businessIdGen.generate(
          BUSINESS_ID_PREFIXES.DEPARTMENT,
        ),
        companyId: command.companyId,
        name: command.name,
        code: command.code,
        parentId: command.parentId,
        isActive: true,
        isDeleted: false,
        version: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: command.requestedBy,
        updatedBy: command.requestedBy,
      },
      new Identifier(uuidv4()),
    );

    await this.deptRepo.save(dept);
  }
}

@Injectable()
@CommandHandler(CreateDesignationCommand)
export class CreateDesignationHandler implements ICommandHandler<CreateDesignationCommand> {
  constructor(
    @Inject(DESIGNATION_REPOSITORY)
    private readonly desigRepo: IDesignationRepository,
    private readonly businessIdGen: BusinessIdGenerator,
  ) {}

  async execute(command: CreateDesignationCommand): Promise<void> {
    const existing = await this.desigRepo.findByCode(
      command.code,
      command.companyId,
    );
    if (existing)
      throw new ConflictException(
        `Designation with code '${command.code}' already exists.`,
      );

    const now = new Date();
    const desig = DesignationEntity.create(
      {
        businessId: await this.businessIdGen.generate(
          BUSINESS_ID_PREFIXES.DESIGNATION,
        ),
        companyId: command.companyId,
        name: command.name,
        code: command.code,
        level: command.level,
        isActive: true,
        isDeleted: false,
        version: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: command.requestedBy,
        updatedBy: command.requestedBy,
      },
      new Identifier(uuidv4()),
    );

    await this.desigRepo.save(desig);
  }
}
