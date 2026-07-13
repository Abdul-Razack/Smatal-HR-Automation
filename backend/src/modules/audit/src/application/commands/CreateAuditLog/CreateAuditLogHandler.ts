import { Injectable, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateAuditLogCommand } from './CreateAuditLogCommand';
import { Result } from '../../../../../../kernel/result/Result';
import { IAuditRepository } from '../../../domain/repositories/IAuditRepository';
import { AuditLogAggregate } from '../../../domain/aggregates/AuditLogAggregate';
import { IBusinessIdGenerator } from '../../../../../../kernel/application/services/IBusinessIdGenerator';
import { IUnitOfWork } from '../../../../../../infrastructure/database/transaction/IUnitOfWork';

@CommandHandler(CreateAuditLogCommand)
@Injectable()
export class CreateAuditLogHandler implements ICommandHandler<CreateAuditLogCommand> {
  constructor(
    @Inject('IAuditRepository') private readonly repository: IAuditRepository,
    @Inject('IUnitOfWork') private readonly unitOfWork: IUnitOfWork,
    @Inject('IBusinessIdGenerator')
    private readonly idGenerator: IBusinessIdGenerator,
  ) {}

  async execute(command: CreateAuditLogCommand): Promise<Result<string>> {
    try {
      const businessId = await this.idGenerator.generate('ADT');

      const auditLog = AuditLogAggregate.create({
        businessId,
        companyId: command.companyId,
        entityType: command.entityType,
        entityBusinessId: command.entityBusinessId,
        action: command.action,
        beforeState: command.beforeState,
        afterState: command.afterState,
        performedBy: command.performedBy,
        performedAt: new Date(),
        ipAddress: command.ipAddress,
        correlationId: command.correlationId,
        remarks: command.remarks,
      });

      // We typically do NOT want audit logging to block or fail the main transaction if we do it inline.
      // But for CQRS commands, we just save it. Often, this is fired via an Event Handler.
      await this.unitOfWork.withTransaction(async () => {
        await this.repository.save(auditLog);
      });

      return Result.ok<string>(auditLog.id.toValue() as string);
    } catch (error: any) {
      return Result.fail<string>(error.message);
    }
  }
}
