import { Injectable } from '@nestjs/common';
import { IEntityDataProvider, EntityDataQuery } from '../../domain/ports/IEntityDataProvider';
import { PrismaService } from '../../../../../infrastructure/database/prisma.service';

@Injectable()
export class PrismaEntityDataProvider implements IEntityDataProvider {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanyName(query: EntityDataQuery): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: { id: query.companyId },
      select: { name: true },
    });
    return company?.name || '';
  }

  async getEmployeeFirstName(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      include: { profile: true },
    });
    return emp?.profile?.firstName || '';
  }

  async getEmployeeLastName(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      include: { profile: true },
    });
    return emp?.profile?.lastName || '';
  }

  async getEmployeeDepartment(query: EntityDataQuery): Promise<string> {
    if (!query.employeeId) return '';
    const emp = await this.prisma.employee.findUnique({
      where: { id: query.employeeId },
      include: { department: true },
    });
    return emp?.department?.name || '';
  }

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
