import { Injectable } from '@nestjs/common';
import { IEntityDataProvider, EntityDataQuery } from '../../domain/ports/IEntityDataProvider';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';

/** Human-readable date formatter for HR documents */
function formatDate(d: Date | null | undefined): string {
  if (!d) return '';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/** Format Decimal salary from Prisma as a readable string */
function formatSalary(val: any): string {
  if (val == null) return '';
  const n = typeof val === 'object' && 'toNumber' in val ? val.toNumber() : Number(val);
  if (isNaN(n)) return String(val);
  return `₹${n.toLocaleString('en-IN')} per annum`;
}

@Injectable()
export class PrismaEntityDataProvider implements IEntityDataProvider {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ──────────────────────────────────────────────────────────────

  private async fetchEmployee(employeeId: string) {
    return this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        profile: true,
        department: true,
        designation: true,
      },
    });
  }

  // ── Company ───────────────────────────────────────────────────────────────

  async getCompanyName(query: EntityDataQuery): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: query.companyId },
      select: { name: true },
    });
    return company?.name || '';
  }

  async getCompanyWebsite(query: EntityDataQuery): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: query.companyId },
      select: { website: true },
    });
    return company?.website || '';
  }

  async getCompanyAddress(query: EntityDataQuery): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: query.companyId },
      select: { address: true },
    });
    if (company?.address) return company.address;

    const branch = await this.prisma.branch.findFirst({
      where: { companyId: query.companyId, isHeadquarters: true },
      select: { address: true, city: true, state: true, country: true },
    });
    if (!branch) return '';
    return [branch.address, branch.city, branch.state, branch.country]
      .filter(Boolean)
      .join(', ');
  }

  async getCompanyPhone(query: EntityDataQuery): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: query.companyId },
      select: { phone: true },
    });
    return company?.phone || '';
  }

  async getCompanyEmail(query: EntityDataQuery): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: query.companyId },
      select: { email: true },
    });
    return company?.email || '';
  }

  async getCompanyAuthorizedPerson(query: EntityDataQuery): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: query.companyId },
      select: { authorizedPerson: true },
    });
    return company?.authorizedPerson || '';
  }

  async getCompanyAuthorizedPersonDesignation(query: EntityDataQuery): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: query.companyId },
      select: { authorizedPersonDesignation: true },
    });
    return company?.authorizedPersonDesignation || '';
  }

  async getCompanyLogo(query: EntityDataQuery): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: query.companyId },
      select: { logoUrl: true },
    });
    return company?.logoUrl || '';
  }

  async getCompanySignature(query: EntityDataQuery): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: query.companyId },
      select: { signatureUrl: true },
    });
    return company?.signatureUrl || '';
  }

  // ── Employee Identity ─────────────────────────────────────────────────────

  async getEmployeeFirstName(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.fetchEmployee(query.employeeId);
    return emp?.profile?.firstName || '';
  }

  async getEmployeeLastName(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.fetchEmployee(query.employeeId);
    return emp?.profile?.lastName || '';
  }

  async getEmployeeFullName(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.fetchEmployee(query.employeeId);
    if (!emp?.profile) return '';
    return `${emp.profile.firstName} ${emp.profile.lastName}`.trim();
  }

  async getEmployeeId(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      select: { businessId: true },
    });
    return emp?.businessId || '';
  }

  async getEmployeeNumber(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      select: { employeeNumber: true },
    });
    return emp?.employeeNumber || '';
  }

  // ── Employment ─────────────────────────────────────────────────────────────

  async getEmployeeDesignation(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.fetchEmployee(query.employeeId);
    return emp?.designation?.name || '';
  }

  async getEmployeeDepartment(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.fetchEmployee(query.employeeId);
    return emp?.department?.name || '';
  }

  async getEmployeeEmploymentType(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      select: { employmentType: true },
    });
    return emp?.employmentType || '';
  }

  async getEmployeeJoiningDate(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      select: { joinedDate: true },
    });
    return formatDate(emp?.joinedDate);
  }

  async getEmployeeProbationEndDate(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      select: { probationEndDate: true },
    });
    return formatDate(emp?.probationEndDate);
  }

  async getEmployeeConfirmationDate(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      select: { confirmationDate: true },
    });
    return formatDate(emp?.confirmationDate);
  }

  async getEmployeeResignationDate(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      select: { resignationDate: true },
    });
    return formatDate(emp?.resignationDate);
  }

  async getEmployeeLastWorkingDate(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      select: { lastWorkingDate: true },
    });
    return formatDate(emp?.lastWorkingDate);
  }

  async getEmployeeSalary(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      select: { salary: true },
    });
    return formatSalary(emp?.salary);
  }

  async getEmployeeOfferSalary(query: EntityDataQuery): Promise<string> {
    // Offer salary is also the `salary` field — same as current salary at offer time
    return this.getEmployeeSalary(query);
  }

  // ── Personal ──────────────────────────────────────────────────────────────

  async getEmployeePersonalEmail(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      include: { profile: true },
    });
    return emp?.profile?.personalEmail || '';
  }

  async getEmployeePhone(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      include: { profile: true },
    });
    return emp?.profile?.phone || '';
  }

  async getEmployeeDateOfBirth(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      include: { profile: true },
    });
    return formatDate(emp?.profile?.dateOfBirth);
  }

  async getEmployeeGender(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      include: { profile: true },
    });
    return emp?.profile?.gender || '';
  }

  async getEmployeeAddress(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      include: { profile: true },
    });
    return emp?.profile?.address || '';
  }

  // ── Candidate ─────────────────────────────────────────────────────────────

  async getCandidateFirstName(query: EntityDataQuery): Promise<string> {
    if (!query.candidateId) return '';
    const cand = await this.prisma.candidate.findUnique({
      where: { id: query.candidateId },
      include: { profile: true },
    });
    return cand?.profile?.firstName || '';
  }

  async getCandidateLastName(query: EntityDataQuery): Promise<string> {
    if (!query.candidateId) return '';
    const cand = await this.prisma.candidate.findUnique({
      where: { id: query.candidateId },
      include: { profile: true },
    });
    return cand?.profile?.lastName || '';
  }

  // ── Custom Fields ─────────────────────────────────────────────────────────

  async getCustomFieldValue(machineKey: string, query: EntityDataQuery): Promise<string> {
    const fieldDef = await this.prisma.fieldDefinition.findUnique({
      where: {
        machineKey_companyId: { machineKey, companyId: query.companyId },
      },
      select: { id: true },
    });

    if (!fieldDef) return '';

    const orConditions: any[] = [];
    if (query.profileId) orConditions.push({ profileId: query.profileId });
    if (query.candidateId) orConditions.push({ candidateId: query.candidateId });
    if (query.employeeId) orConditions.push({ employeeId: query.employeeId });

    if (orConditions.length === 0) return '';

    const fieldValue = await this.prisma.fieldValue.findFirst({
      where: {
        companyId: query.companyId,
        fieldDefinitionId: fieldDef.id,
        OR: orConditions,
      },
    });

    if (!fieldValue || !fieldValue.valueData) return '';

    const data: any = fieldValue.valueData;
    return typeof data === 'object'
      ? (data.value ?? data.text ?? '')
      : String(data);
  }
}
