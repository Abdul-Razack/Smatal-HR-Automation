import { Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetEmploymentHistoryQuery } from './GetEmploymentHistoryQuery';
import { PrismaService } from '../../../../../../infrastructure/database/prisma.service';

@QueryHandler(GetEmploymentHistoryQuery)
@Injectable()
export class GetEmploymentHistoryHandler implements IQueryHandler<GetEmploymentHistoryQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetEmploymentHistoryQuery): Promise<any[]> {
    const history = await this.prisma.employmentHistory.findMany({
      where: {
        employeeId: query.employeeId,
        companyId: query.companyId,
      },
      orderBy: { createdAt: 'desc' },
    });

    // We fetch the basic profile for the createdBy to return name if needed
    // But since createdBy is just a UUID, for simplicity we just return records
    
    // Format to DTO
    return history.map(h => ({
      id: h.id,
      changeType: h.changeType,
      previousValue: h.previousValue,
      newValue: h.newValue,
      effectiveDate: h.effectiveDate,
      notes: h.notes,
      createdAt: h.createdAt,
      createdBy: h.createdBy,
    }));
  }
}
