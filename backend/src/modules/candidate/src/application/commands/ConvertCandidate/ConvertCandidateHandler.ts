import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConvertCandidateCommand } from './ConvertCandidateCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { ICandidateRepository } from '../../../domain/repositories/ICandidateRepository';
import { CandidateDomainService } from '../../../domain/services/CandidateDomainService';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { Identifier } from '../../../../../../kernel/domain/Identifier';
import { CandidateNotFoundException } from '../../../domain/exceptions/CandidateExceptions';
import { EmployeeAggregate } from '../../../../../employee/src/domain/aggregates/EmployeeAggregate';
import { EmployeeStatus } from '../../../../../employee/src/domain/enums/EmployeeStatus';
import { IEmployeeRepository } from '../../../../../employee/src/domain/repositories/IEmployeeRepository';

@CommandHandler(ConvertCandidateCommand)
@Injectable()
export class ConvertCandidateHandler implements ICommandHandler<ConvertCandidateCommand> {
  constructor(
    @Inject('ICandidateRepository')
    private readonly candidateRepository: ICandidateRepository,
    @Inject('IEmployeeRepository')
    private readonly employeeRepository: IEmployeeRepository,
    @Inject('IUnitOfWork')
    private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly businessIdGenerator: IBusinessIdGenerator,
    private readonly candidateDomainService: CandidateDomainService,
  ) {}

  async execute(
    command: ConvertCandidateCommand,
  ): Promise<Result<{ employeeId: string; employeeBusinessId: string }>> {
    try {
      // 1. Load and validate candidate
      const candidate = await this.candidateRepository.findById(
        command.candidateId,
      );
      if (!candidate) throw new CandidateNotFoundException(command.candidateId);
      this.candidateDomainService.assertBelongsToCompany(
        candidate,
        command.companyId,
      );
      this.candidateDomainService.validateConvertibility(candidate);

      // 2. Generate Employee business ID: EMP_000001
      const employeeBusinessId = await this.businessIdGenerator.generate('EMP');
      const employeeId = new Identifier<string>(crypto.randomUUID());

      // 3. Create Employee aggregate — REUSES the same profileId (no duplication)
      const employee = EmployeeAggregate.create(
        {
          businessId: employeeBusinessId,
          companyId: new Identifier<string>(command.companyId),
          profileId: candidate.profileId,
          status: EmployeeStatus.ONBOARDING,
          joinedDate: command.joinedDate,
          departmentId: command.departmentId ?? null,
          designationId: command.designationId ?? null,
          branchId: command.branchId ?? null,
          reportsToId: command.reportsToId ?? null,
          employeeNumber: command.employeeNumber ?? null,
          probationEndDate: command.probationEndDate ?? null,
          confirmationDate: null,
          terminationDate: null,
          version: 1,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: command.performedBy,
          updatedBy: command.performedBy,
        },
        employeeId,
        command.performedBy,
      );

      // 4. Mark candidate as converted
      candidate.markConverted(employeeId.toString(), command.performedBy);

      // 5. Persist both in a single atomic transaction
      await this.unitOfWork.withTransaction(async () => {
        await this.employeeRepository.save(employee);
        await this.candidateRepository.save(candidate);
      });

      return Result.ok({
        employeeId: employeeId.toString(),
        employeeBusinessId,
      });
    } catch (error: any) {
      return Result.fail(error.message);
    }
  }
}
