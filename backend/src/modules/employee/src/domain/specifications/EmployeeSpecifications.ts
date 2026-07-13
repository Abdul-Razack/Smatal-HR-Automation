import { CompositeSpecification } from '../../../../../kernel/specifications/specification';
import { EmployeeAggregate } from '../aggregates/EmployeeAggregate';
import { EmployeeStatus } from '../enums/EmployeeStatus';

export class EmployeeIsActiveSpecification extends CompositeSpecification<EmployeeAggregate> {
  isSatisfiedBy(employee: EmployeeAggregate): boolean {
    return employee.status === EmployeeStatus.ACTIVE && !employee.isDeleted;
  }
}

export class EmployeeIsTerminable extends CompositeSpecification<EmployeeAggregate> {
  isSatisfiedBy(employee: EmployeeAggregate): boolean {
    const terminableStatuses = [EmployeeStatus.ACTIVE, EmployeeStatus.NOTICE];
    return terminableStatuses.includes(employee.status) && !employee.isDeleted;
  }
}

export class EmployeeBelongsToCompanySpecification extends CompositeSpecification<EmployeeAggregate> {
  constructor(private readonly companyId: string) {
    super();
  }
  isSatisfiedBy(employee: EmployeeAggregate): boolean {
    return employee.companyId.toString() === this.companyId;
  }
}
