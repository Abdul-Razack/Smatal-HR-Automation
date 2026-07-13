import { PrismaService } from '../../src/infrastructure/database/prisma.service';

export class TestDatabase {
  constructor(private readonly prisma: PrismaService) {}

  async getSeedCompany() {
    return this.prisma.company.findFirst();
  }

  async getSeedDepartment(companyId: string) {
    return this.prisma.department.findFirst({ where: { companyId } });
  }

  async getSeedDesignation(companyId: string) {
    return this.prisma.designation.findFirst({ where: { companyId } });
  }

  async getSeedBranch(companyId: string) {
    return this.prisma.branch.findFirst({ where: { companyId } });
  }

  async getWorkflowDefinition(businessId: string) {
    return this.prisma.workflowDefinition.findFirst({ where: { businessId } });
  }

  async getWorkflowStages(workflowDefinitionId: string) {
    return this.prisma.workflowStage.findMany({
      where: { workflowDefinitionId },
      orderBy: { displayOrder: 'asc' },
    });
  }
}
