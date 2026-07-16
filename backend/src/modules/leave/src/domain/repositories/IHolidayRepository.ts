import { IRepository } from '../../../../../kernel/repositories/repository.contracts';
import { Holiday } from '../entities/Holiday';

export interface IHolidayRepository extends IRepository<Holiday> {
  findByCompanyId(companyId: string, year: number): Promise<Holiday[]>;
  findByDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date,
    branchId?: string,
  ): Promise<Holiday[]>;
}
