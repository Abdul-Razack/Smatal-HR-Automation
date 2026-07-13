import { DomainException } from '../../../../../kernel/domain/DomainException';

export class EmployeeNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Employee not found: ${id}`, 'NOT_FOUND');
  }
}

export class InvalidEmployeeStatusTransitionException extends DomainException {
  constructor(from: string, to: string) {
    super(
      `Cannot transition employee status from ${from} to ${to}`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}

export class EmployeeAlreadyActiveException extends DomainException {
  constructor(employeeId: string) {
    super(`Employee ${employeeId} is already active`, 'DOMAIN_RULE_VIOLATION');
  }
}

export class EmployeeAlreadyTerminatedException extends DomainException {
  constructor(employeeId: string) {
    super(
      `Employee ${employeeId} has already been terminated`,
      'DOMAIN_RULE_VIOLATION',
    );
  }
}
