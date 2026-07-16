import { Injectable, Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListHolidaysQuery } from './ListHolidaysQuery';
import { IHolidayRepository } from '../../../domain/repositories/IHolidayRepository';
import { HolidayResponseDto } from '../../dto/responses/LeaveResponses';
import { HolidayMapper } from '../../../infrastructure/mappers/HolidayMapper';

@QueryHandler(ListHolidaysQuery)
@Injectable()
export class ListHolidaysHandler implements IQueryHandler<ListHolidaysQuery> {
  constructor(
    @Inject('IHolidayRepository')
    private readonly holidayRepository: IHolidayRepository,
    private readonly holidayMapper: HolidayMapper,
  ) {}

  async execute(query: ListHolidaysQuery): Promise<HolidayResponseDto[]> {
    const holidays = await this.holidayRepository.findByCompanyId(
      query.companyId,
      query.year,
    );
    return holidays.map((h) => this.holidayMapper.toResponseDto(h));
  }
}
