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
      {
        key: 'employee.firstName',
        label: 'Employee First Name',
        entity: 'EMPLOYEE',
        dataType: 'TEXT',
        isRequired: true,
        description: 'First name of the employee',
        exampleValue: 'John',
        source: 'SYSTEM',
      },
      {
        key: 'employee.lastName',
        label: 'Employee Last Name',
        entity: 'EMPLOYEE',
        dataType: 'TEXT',
        isRequired: true,
        description: 'Last name of the employee',
        exampleValue: 'Doe',
        source: 'SYSTEM',
      },
      {
        key: 'employee.fullName',
        label: 'Employee Full Name',
        entity: 'EMPLOYEE',
        dataType: 'TEXT',
        isRequired: true,
        description: 'Full name of the employee',
        exampleValue: 'John Doe',
        source: 'SYSTEM',
      },
      {
        key: 'employee.department',
        label: 'Employee Department',
        entity: 'EMPLOYEE',
        dataType: 'TEXT',
        isRequired: false,
        description: 'Department of the employee',
        exampleValue: 'Engineering',
        source: 'SYSTEM',
      },
      {
        key: 'candidate.firstName',
        label: 'Candidate First Name',
        entity: 'CANDIDATE',
        dataType: 'TEXT',
        isRequired: true,
        description: 'First name of the candidate',
        exampleValue: 'Jane',
        source: 'SYSTEM',
      },
      {
        key: 'employee.employeeId',
        label: 'Employee ID',
        entity: 'EMPLOYEE',
        dataType: 'TEXT',
        isRequired: true,
        description: 'Unique identifier of the employee',
        exampleValue: 'EMP-001',
        source: 'SYSTEM',
      },
      {
        key: 'employee.address',
        label: 'Employee Address',
        entity: 'EMPLOYEE',
        dataType: 'TEXT',
        isRequired: true,
        description: 'Full address of the employee',
        exampleValue: '123 Main St, NY',
        source: 'SYSTEM',
      },
      {
        key: 'employee.offerSalary',
        label: 'Offer Salary',
        entity: 'EMPLOYEE',
        dataType: 'TEXT',
        isRequired: true,
        description: 'Offered Salary / CTC',
        exampleValue: '$100,000',
        source: 'SYSTEM',
      },
      {
        key: 'candidate.lastName',
        label: 'Candidate Last Name',
        entity: 'CANDIDATE',
        dataType: 'TEXT',
        isRequired: true,
        description: 'Last name of the candidate',
        exampleValue: 'Smith',
        source: 'SYSTEM',
      },
      {
        key: 'candidate.fullName',
        label: 'Candidate Full Name',
        entity: 'CANDIDATE',
        dataType: 'TEXT',
        isRequired: true,
        description: 'Full name of the candidate',
        exampleValue: 'Jane Smith',
        source: 'SYSTEM',
      },
      {
        key: 'leave.startDate',
        label: 'Leave Start Date',
        entity: 'LEAVE',
        dataType: 'DATE',
        isRequired: false,
        description: 'Start date of the leave',
        exampleValue: '2023-10-01',
        source: 'SYSTEM',
      },
      {
        key: 'company.name',
        label: 'Company Name',
        entity: 'COMPANY',
        dataType: 'TEXT',
        isRequired: true,
        description: 'Name of the company',
        exampleValue: 'Smatal HR',
        source: 'SYSTEM',
      },
      {
        key: 'system.currentDate',
        label: 'Current Date',
        entity: 'SYSTEM',
        dataType: 'DATE',
        isRequired: true,
        description: 'Current system date',
        exampleValue: '2023-10-01',
        source: 'SYSTEM',
      },
      {
        key: 'system.currentUser',
        label: 'Current User',
        entity: 'SYSTEM',
        dataType: 'TEXT',
        isRequired: true,
        description: 'Name of the user generating the document',
        exampleValue: 'Admin User',
        source: 'SYSTEM',
      },
    ];
  }
}
