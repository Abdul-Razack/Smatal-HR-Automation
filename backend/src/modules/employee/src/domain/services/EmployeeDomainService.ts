import { Injectable } from '@nestjs/common';
import { EmployeeAggregate } from '../aggregates/EmployeeAggregate';
import { EmployeeNotFoundException, InvalidEmployeeStatusTransitionException } from '../exceptions/EmployeeExceptions';
import { EmployeeStatus } from '../enums/EmployeeStatus';

@Injectable()
export class EmployeeDomainService {
  assertBelongsToCompany(employee: EmployeeAggregate, companyId: string): void {
    if (employee.companyId.toString() !== companyId) {
      throw new EmployeeNotFoundException(employee.id.toString());
    }
  }

  assertNotDeleted(employee: EmployeeAggregate): void {
    if (employee.isDeleted) {
      throw new EmployeeNotFoundException(employee.id.toString());
    }
  }

  assertCanBeActivated(employee: EmployeeAggregate): void {
    if (employee.status !== EmployeeStatus.ONBOARDING) {
      throw new InvalidEmployeeStatusTransitionException(employee.status, EmployeeStatus.ACTIVE);
    }
    if (!employee.joinedDate) {
      throw new Error('Employee must have a joined date to be activated');
    }
  }

  assertCanBeTerminated(employee: EmployeeAggregate): void {
    const nonTerminableStatuses = [EmployeeStatus.TERMINATED, EmployeeStatus.RESIGNED, EmployeeStatus.RETIRED, EmployeeStatus.RELIEVED];
    if (nonTerminableStatuses.includes(employee.status)) {
      throw new InvalidEmployeeStatusTransitionException(employee.status, EmployeeStatus.TERMINATED);
    }
  }

  assertCanTransitionLifecycle(employee: EmployeeAggregate, targetStatus: EmployeeStatus): void {
    this.assertNotDeleted(employee);
  }
}
