import { Injectable } from '@nestjs/common';
import { EmployeeAggregate } from '../aggregates/EmployeeAggregate';
import { EmployeeNotFoundException } from '../exceptions/EmployeeExceptions';

@Injectable()
export class EmployeeDomainService {
  assertBelongsToCompany(employee: EmployeeAggregate, companyId: string): void {
    if (employee.companyId.toString() !== companyId) {
      throw new EmployeeNotFoundException(employee.id.toString());
    }
  }
}
