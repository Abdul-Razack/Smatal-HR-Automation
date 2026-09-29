import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';
import { PlaceholderMetadata } from '../models/PlaceholderMetadata';

@Injectable()
export class PlaceholderRegistryService {
  private readonly logger = new Logger(PlaceholderRegistryService.name);

  constructor(private readonly prisma: PrismaService) {}

  public async getPlaceholders(
    companyId: string,
    search?: string,
    entityFilter?: string,
  ): Promise<PlaceholderMetadata[]> {
    const allPlaceholders: PlaceholderMetadata[] = [];

    // 1. Add System Placeholders
    allPlaceholders.push(...this.getSystemPlaceholders());

    // 2. Fetch Dynamic Fields from DB
    const dynamicFields = await this.prisma.fieldDefinition.findMany({
      where: {
        companyId,
        isDeleted: false,
        isActive: true,
      },
    });

    for (const field of dynamicFields) {
      allPlaceholders.push({
        key: `custom.${field.machineKey}`,
        label: field.displayName,
        entity: field.entityType,
        dataType: field.dataType,
        isRequired: field.isRequired,
        description: field.description,
        exampleValue: field.defaultValue,
        source: 'CUSTOM',
      });
    }

    // 3. Filter
    let filtered = allPlaceholders;
    if (entityFilter) {
      filtered = filtered.filter(
        (p) => p.entity.toUpperCase() === entityFilter.toUpperCase(),
      );
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.key.toLowerCase().includes(lowerSearch) ||
          p.label.toLowerCase().includes(lowerSearch) ||
          (p.description && p.description.toLowerCase().includes(lowerSearch)),
      );
    }

    // 4. Sort
    filtered.sort((a, b) => a.key.localeCompare(b.key));

    return filtered;
  }

  private getSystemPlaceholders(): PlaceholderMetadata[] {
    return [
      // ── Employee Identity ───────────────────────────────────────────────
      { key: 'employee.firstName', label: 'Employee First Name', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: true, description: 'First name of the employee', exampleValue: 'John', source: 'SYSTEM' },
      { key: 'employee.lastName', label: 'Employee Last Name', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: true, description: 'Last name of the employee', exampleValue: 'Doe', source: 'SYSTEM' },
      { key: 'employee.fullName', label: 'Employee Full Name', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: true, description: 'Full name of the employee', exampleValue: 'John Doe', source: 'SYSTEM' },
      { key: 'employee.employeeId', label: 'Employee ID', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: true, description: 'System-generated business ID (e.g. EMP-001)', exampleValue: 'EMP-001', source: 'SYSTEM' },
      { key: 'employee.employeeNumber', label: 'Employee Number', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: false, description: 'HR-assigned employee number', exampleValue: 'EMP0042', source: 'SYSTEM' },
      // ── Employment Details ──────────────────────────────────────────────
      { key: 'employee.designation', label: 'Designation', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: false, description: 'Job title / designation', exampleValue: 'Software Engineer', source: 'SYSTEM' },
      { key: 'employee.department', label: 'Department', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: false, description: 'Department the employee belongs to', exampleValue: 'Engineering', source: 'SYSTEM' },
      { key: 'employee.employmentType', label: 'Employment Type', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: false, description: 'Full-time, Part-time, Contract, etc.', exampleValue: 'Full-time', source: 'SYSTEM' },
      { key: 'employee.joiningDate', label: 'Joining Date', entity: 'EMPLOYEE', dataType: 'DATE', isRequired: false, description: 'Date the employee joined', exampleValue: '01 January 2024', source: 'SYSTEM' },
      { key: 'employee.probationEndDate', label: 'Probation End Date', entity: 'EMPLOYEE', dataType: 'DATE', isRequired: false, description: 'Date the probation period ends', exampleValue: '01 April 2024', source: 'SYSTEM' },
      { key: 'employee.confirmationDate', label: 'Confirmation Date', entity: 'EMPLOYEE', dataType: 'DATE', isRequired: false, description: 'Date the employee was confirmed', exampleValue: '01 April 2024', source: 'SYSTEM' },
      { key: 'employee.resignationDate', label: 'Resignation Date', entity: 'EMPLOYEE', dataType: 'DATE', isRequired: false, description: 'Date resignation was submitted', exampleValue: '01 October 2024', source: 'SYSTEM' },
      { key: 'employee.lastWorkingDate', label: 'Last Working Date', entity: 'EMPLOYEE', dataType: 'DATE', isRequired: false, description: 'Last date of employment', exampleValue: '31 October 2024', source: 'SYSTEM' },
      { key: 'employee.salary', label: 'Salary / CTC', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: false, description: 'Employee salary or CTC', exampleValue: '₹12,00,000 per annum', source: 'SYSTEM' },
      { key: 'employee.offerSalary', label: 'Offer Salary', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: false, description: 'Salary offered at time of offer letter', exampleValue: '₹12,00,000 per annum', source: 'SYSTEM' },
      // ── Personal Details ────────────────────────────────────────────────
      { key: 'employee.personalEmail', label: 'Personal Email', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: false, description: 'Personal email address', exampleValue: 'john.doe@gmail.com', source: 'SYSTEM' },
      { key: 'employee.phone', label: 'Phone', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: false, description: 'Phone number', exampleValue: '+91 9876543210', source: 'SYSTEM' },
      { key: 'employee.dateOfBirth', label: 'Date of Birth', entity: 'EMPLOYEE', dataType: 'DATE', isRequired: false, description: 'Date of birth', exampleValue: '01 January 1990', source: 'SYSTEM' },
      { key: 'employee.gender', label: 'Gender', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: false, description: 'Gender', exampleValue: 'Male', source: 'SYSTEM' },
      { key: 'employee.address', label: 'Address', entity: 'EMPLOYEE', dataType: 'TEXT', isRequired: false, description: 'Residential address', exampleValue: '123 Main Street, Chennai - 600001', source: 'SYSTEM' },
      // ── Company ─────────────────────────────────────────────────────────
      { key: 'company.name', label: 'Company Name', entity: 'COMPANY', dataType: 'TEXT', isRequired: true, description: 'Name of the company', exampleValue: 'Smatal Technologies Pvt. Ltd.', source: 'SYSTEM' },
      { key: 'company.website', label: 'Company Website', entity: 'COMPANY', dataType: 'TEXT', isRequired: false, description: 'Company website URL', exampleValue: 'https://smatal.com', source: 'SYSTEM' },
      { key: 'company.address', label: 'Company Address', entity: 'COMPANY', dataType: 'TEXT', isRequired: false, description: 'Registered company address', exampleValue: '1st Floor, Tech Park, Chennai - 600001', source: 'SYSTEM' },
      { key: 'company.phone', label: 'Company Phone', entity: 'COMPANY', dataType: 'TEXT', isRequired: false, description: 'Official company contact number', exampleValue: '+91 44 1234 5678', source: 'SYSTEM' },
      { key: 'company.email', label: 'Company Email', entity: 'COMPANY', dataType: 'TEXT', isRequired: false, description: 'Official company email address', exampleValue: 'hr@smatal.com', source: 'SYSTEM' },
      { key: 'company.authorizedPerson', label: 'Authorized Person', entity: 'COMPANY', dataType: 'TEXT', isRequired: false, description: 'Authorized signatory name', exampleValue: 'Ravi Kumar', source: 'SYSTEM' },
      { key: 'company.authorizedPersonDesignation', label: 'Authorized Person Designation', entity: 'COMPANY', dataType: 'TEXT', isRequired: false, description: 'Authorized signatory designation', exampleValue: 'HR Manager', source: 'SYSTEM' },
      { key: 'company.logo', label: 'Company Logo', entity: 'COMPANY', dataType: 'IMAGE', isRequired: false, description: 'Company logo URL', exampleValue: 'https://smatal.com/logo.png', source: 'SYSTEM' },
      { key: 'company.signature', label: 'Authorized Signature', entity: 'COMPANY', dataType: 'IMAGE', isRequired: false, description: 'Authorized person digital signature URL', exampleValue: 'https://smatal.com/signature.png', source: 'SYSTEM' },
      // ── Candidate (ATS compatibility) ───────────────────────────────────
      { key: 'candidate.firstName', label: 'Candidate First Name', entity: 'CANDIDATE', dataType: 'TEXT', isRequired: false, description: 'First name of the candidate', exampleValue: 'Jane', source: 'SYSTEM' },
      { key: 'candidate.lastName', label: 'Candidate Last Name', entity: 'CANDIDATE', dataType: 'TEXT', isRequired: false, description: 'Last name of the candidate', exampleValue: 'Smith', source: 'SYSTEM' },
      { key: 'candidate.fullName', label: 'Candidate Full Name', entity: 'CANDIDATE', dataType: 'TEXT', isRequired: false, description: 'Full name of the candidate', exampleValue: 'Jane Smith', source: 'SYSTEM' },
      // ── System ──────────────────────────────────────────────────────────
      { key: 'system.currentDate', label: 'Current Date', entity: 'SYSTEM', dataType: 'DATE', isRequired: true, description: 'Current date when document is generated', exampleValue: '23 September 2024', source: 'SYSTEM' },
      { key: 'system.currentUser', label: 'Current User', entity: 'SYSTEM', dataType: 'TEXT', isRequired: false, description: 'User generating the document', exampleValue: 'Admin User', source: 'SYSTEM' },
      // ── Leave (workflow compatibility) ────────────────────────────────────
      { key: 'leave.startDate', label: 'Leave Start Date', entity: 'LEAVE', dataType: 'DATE', isRequired: false, description: 'Start date of the leave', exampleValue: '01 October 2024', source: 'SYSTEM' },
    ];
  }
}
