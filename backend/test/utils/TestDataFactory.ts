import { v4 as uuidv4 } from 'uuid';

export class TestDataFactory {
  static createEmail(prefix: string = 'test.user'): string {
    return `${prefix}.${Date.now()}@example.com`;
  }

  static createBusinessId(prefix: string): string {
    return `${prefix}-${Date.now()}`;
  }

  static createEmployeeNumber(): string {
    return `E-100-${Date.now()}`;
  }

  static createCandidateNumber(): string {
    return `CND-${Date.now()}`;
  }

  static createCompanyCode(): string {
    return `CMP-${Date.now()}`;
  }

  static createDepartmentCode(): string {
    return `DPT-${Date.now()}`;
  }

  static createDesignationCode(): string {
    return `DSG-${Date.now()}`;
  }

  static createBranchCode(): string {
    return `BRN-${Date.now()}`;
  }

  static createPhoneNumber(): string {
    return `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  }

  static createRandomName(): { firstName: string; lastName: string } {
    return {
      firstName: `First${Date.now()}`,
      lastName: `Last${Math.floor(Math.random() * 1000)}`,
    };
  }
}
