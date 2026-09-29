import { IEntityDataProvider, EntityDataQuery } from '../../domain/ports/IEntityDataProvider';

export class PreviewDataProvider implements IEntityDataProvider {
  constructor(
    private readonly mode: 'SAMPLE' | 'LIVE',
    private readonly liveProvider: IEntityDataProvider,
  ) {}

  // ── Company ───────────────────────────────────────────────────────────────

  async getCompanyName(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'Smatal Technologies';
    return this.liveProvider.getCompanyName(query);
  }

  async getCompanyWebsite(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'https://smatal.com';
    return this.liveProvider.getCompanyWebsite(query);
  }

  async getCompanyAddress(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return '1st Floor, Tech Park, Chennai - 600001';
    return this.liveProvider.getCompanyAddress(query);
  }

  async getCompanyPhone(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return '+91 44 1234 5678';
    return this.liveProvider.getCompanyPhone(query);
  }

  async getCompanyEmail(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'hr@smatal.com';
    return this.liveProvider.getCompanyEmail(query);
  }

  async getCompanyAuthorizedPerson(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'Ravi Kumar';
    return this.liveProvider.getCompanyAuthorizedPerson(query);
  }

  async getCompanyAuthorizedPersonDesignation(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'HR Manager';
    return this.liveProvider.getCompanyAuthorizedPersonDesignation(query);
  }

  // ── Employee Identity ─────────────────────────────────────────────────────

  async getEmployeeFirstName(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'John';
    return this.liveProvider.getEmployeeFirstName(query);
  }

  async getEmployeeLastName(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'Doe';
    return this.liveProvider.getEmployeeLastName(query);
  }

  async getEmployeeFullName(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'John Doe';
    return this.liveProvider.getEmployeeFullName(query);
  }

  async getEmployeeId(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'EMP-001';
    return this.liveProvider.getEmployeeId(query);
  }

  async getEmployeeNumber(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'EMP0042';
    return this.liveProvider.getEmployeeNumber(query);
  }

  // ── Employment ─────────────────────────────────────────────────────────────

  async getEmployeeDesignation(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'Software Engineer';
    return this.liveProvider.getEmployeeDesignation(query);
  }

  async getEmployeeDepartment(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'Engineering Department';
    return this.liveProvider.getEmployeeDepartment(query);
  }

  async getEmployeeEmploymentType(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'Full-time';
    return this.liveProvider.getEmployeeEmploymentType(query);
  }

  async getEmployeeJoiningDate(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return '01 January 2024';
    return this.liveProvider.getEmployeeJoiningDate(query);
  }

  async getEmployeeProbationEndDate(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return '01 April 2024';
    return this.liveProvider.getEmployeeProbationEndDate(query);
  }

  async getEmployeeConfirmationDate(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return '01 April 2024';
    return this.liveProvider.getEmployeeConfirmationDate(query);
  }

  async getEmployeeResignationDate(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return '01 October 2024';
    return this.liveProvider.getEmployeeResignationDate(query);
  }

  async getEmployeeLastWorkingDate(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return '31 October 2024';
    return this.liveProvider.getEmployeeLastWorkingDate(query);
  }

  async getEmployeeSalary(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return '₹12,00,000 per annum';
    return this.liveProvider.getEmployeeSalary(query);
  }

  async getEmployeeOfferSalary(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return '₹12,00,000 per annum';
    return this.liveProvider.getEmployeeOfferSalary(query);
  }

  // ── Personal ──────────────────────────────────────────────────────────────

  async getEmployeePersonalEmail(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'john.doe@gmail.com';
    return this.liveProvider.getEmployeePersonalEmail(query);
  }

  async getEmployeePhone(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return '+91 9876543210';
    return this.liveProvider.getEmployeePhone(query);
  }

  async getEmployeeDateOfBirth(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return '01 January 1990';
    return this.liveProvider.getEmployeeDateOfBirth(query);
  }

  async getEmployeeGender(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'Male';
    return this.liveProvider.getEmployeeGender(query);
  }

  async getEmployeeAddress(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return '123 Main Street, Chennai - 600001';
    return this.liveProvider.getEmployeeAddress(query);
  }

  // ── Candidate ─────────────────────────────────────────────────────────────

  async getCandidateFirstName(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'Jane';
    return this.liveProvider.getCandidateFirstName(query);
  }

  async getCandidateLastName(query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return 'Smith';
    return this.liveProvider.getCandidateLastName(query);
  }

  // ── Custom Fields ─────────────────────────────────────────────────────────

  async getCustomFieldValue(machineKey: string, query: EntityDataQuery): Promise<string> {
    if (this.mode === 'SAMPLE') return `[Sample ${machineKey}]`;
    return this.liveProvider.getCustomFieldValue(machineKey, query);
  }
}
